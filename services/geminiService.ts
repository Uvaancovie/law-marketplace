import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
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
  private ai: GoogleGenAI;
  private modelName = 'gemini-2.5-flash';

  constructor() {
    // We assume the key is available. In a real app, handle missing key gracefully.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async createChat() {
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
}

export const geminiService = new GeminiService();