import { FunctionDeclaration, Type, Tool } from "@google/genai";
import type { GoogleGenAI } from "@google/genai";
import { db } from "./db";
import { Lawyer } from "../types";

// Tool Definition
const searchLawyersTool: FunctionDeclaration = {
  name: 'searchLawyers',
  description: 'Search for lawyers in South Africa based on location (JHB, Cape Town, Durban) and specialty.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: 'The South African city to search in (e.g., "Johannesburg", "Sandton", "Cape Town", "Durban").',
      },
      specialty: {
        type: Type.STRING,
        description: 'The type of law or issue (e.g., "Divorce", "CCMA", "Labor", "Property").',
      },
    },
    required: [],
  },
};

const tools: Tool[] = [{ functionDeclarations: [searchLawyersTool] }];

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private stubMode = false;
  private initPromise?: Promise<void>;

  private async initAI(apiKey: string) {
    try {
      const mod = await import('@google/genai');
      const GoogleGenAIClass = (mod as any).GoogleGenAI || (mod as any).default;
      // @ts-ignore - dynamic class
      this.ai = new GoogleGenAIClass({ apiKey });
    } catch (e) {
      console.error('GeminiService: initAI failed', e);
      this.ai = null;
    }
  }
  private modelName = 'gemini-2.5-flash';

  constructor() {
    // Initialize the AI only when an API key exists.
    // Avoid referencing `process` directly in the browser.
    const isNode = typeof window === 'undefined';
    const apiKey = isNode
      ? (process.env?.GEMINI_API_KEY || process.env?.API_KEY || process.env?.POSTGRES_URL)
      : ((import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined) || ((import.meta as any).env?.VITE_GEMINI_KEY as string | undefined);

    if (apiKey) {
      // Defer loading the SDK until needed (prevents bundlers from putting server-only SDKs in the client bundle)
      if (isNode) {
        this.initPromise = this.initAI(apiKey);
      } else {
        // In browser, prefer no SDK. Use stub mode if SDK can't be used in the client.
        this.stubMode = true;
      }
    } else {
      this.stubMode = true;
    }
  }

  async createChat() {
    if (this.initPromise) await this.initPromise;
    if (this.stubMode) {
      // Return a lightweight stub chat with sendMessage that returns functionCalls for location/specialty queries
      return {
        sendMessage: async ({ message }: { message: string }) => {
          const text = message;
          const locRegex = /\b(Johannesburg|Joburg|JHB|Sandton|Cape\s?Town|Durban)\b/i;
          const specRegex = /\b(Divorce|Family|CCMA|Labor|Employment|Property|Conveyancing)\b/i;
          const locationMatch = text.match(locRegex);
          const specMatch = text.match(specRegex);

          const functionCalls: any[] = [];
          if (locationMatch || specMatch) {
            functionCalls.push({
              name: 'searchLawyers',
              args: { location: locationMatch ? locationMatch[0] : undefined, specialty: specMatch ? specMatch[0] : undefined }
            });
          }

          const result: any = {
            text: functionCalls.length > 0 ? 'I found some lawyers — fetching details...' : 'I can help you find a lawyer. Where are you located and what service do you need?',
            functionCalls
          };
          return result;
        }
      };
    }
    if (!this.ai) throw new Error('AI client not initialized. Ensure you set VITE_GEMINI_API_KEY for the frontend or run server-side.');
    return this.ai.chats.create({
      model: this.modelName,
      config: {
        systemInstruction: `You are a helpful legal marketplace assistant for 'JustiFind SA'. 
        Your goal is to help users find affordable lawyers in South Africa, specifically in Johannesburg, Cape Town, and Durban.
        Prices are in South African Rand (R).
        Always use the 'searchLawyers' tool when the user mentions a location or legal issue.
        After searching, summarize the results found. If no results are found, suggest broadening the search to one of the main economic hubs.
        Be professional, concise, and empathetic.`,
        tools: tools,
      },
    });
  }
  
  // Helper to execute tool calls locally
  async handleToolCall(functionCall: any): Promise<any> {
    if (functionCall.name === 'searchLawyers') {
      const args = functionCall.args as { location?: string; specialty?: string };
      console.log("Executing tool searchLawyers with:", args);
      const lawyers = await db.getLawyers(args);
      // Return a simplified version to the model to save tokens
      return {
        count: lawyers.length,
        lawyers: lawyers.map(l => ({ name: l.name, location: l.location, specialties: l.specialties }))
      };
    }
    return { error: 'Function not found' };
  }

  async generatePackageDescription(title: string, price: number): Promise<string> {
    if (this.stubMode) {
      // Return a sample description in stub mode
      return `This comprehensive ${title.toLowerCase()} package includes initial consultation, document review, and expert legal advice tailored to your needs. Our experienced attorneys will guide you through the entire process, ensuring your rights are protected and your case is handled with the utmost professionalism. Price: R${price}.`;
    }

    if (!this.ai) throw new Error('AI client not initialized.');

    const chat = await this.ai.chats.create({
      model: this.modelName,
      config: {
        systemInstruction: `You are a helpful assistant for lawyers creating service packages on JustiFind SA.
        Generate compelling, professional descriptions for legal service packages.
        Keep descriptions concise (2-3 sentences), highlight benefits, and mention the price naturally.
        Focus on South African legal context where relevant.`,
      },
    });

    const response = await chat.sendMessage({
      message: `Generate a description for a legal service package titled "${title}" priced at R${price}.`
    });

    return response.text || 'Description generated.';
  }

  async generateProfileBio(name: string, specialties: string[], location: string): Promise<string> {
    if (this.stubMode) {
      // Return a sample bio in stub mode
      return `As a dedicated legal professional based in ${location}, I specialize in ${specialties.join(', ')}. With years of experience in South African law, I am committed to providing accessible, high-quality legal services to individuals and businesses. I believe in transparent communication and building strong relationships with my clients to achieve the best possible outcomes.`;
    }

    if (!this.ai) throw new Error('AI client not initialized.');

    const chat = await this.ai.chats.create({
      model: this.modelName,
      config: {
        systemInstruction: `You are a helpful assistant for lawyers writing professional bios on JustiFind SA.
        Generate authentic, professional bio descriptions that highlight experience, specialties, and commitment to clients.
        Keep bios concise (3-4 sentences), mention South African legal context, and sound approachable yet professional.`,
      },
    });

    const response = await chat.sendMessage({
      message: `Generate a professional bio for lawyer ${name} specializing in ${specialties.join(', ')} and based in ${location}, South Africa.`
    });

    return response.text || 'Bio generated.';
  }
}

export const geminiService = new GeminiService();