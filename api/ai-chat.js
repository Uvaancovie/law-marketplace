import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from './db.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Tool function to search lawyers
async function searchLawyers(location, specialty) {
  try {
    let query = 'SELECT * FROM lawyers WHERE 1=1';
    let params = [];
    let paramCount = 1;

    if (location) {
      query += ` AND LOWER(location) LIKE $${paramCount}`;
      params.push(`%${location.toLowerCase()}%`);
      paramCount++;
    }

    if (specialty) {
      query += ` AND LOWER(specialties) LIKE $${paramCount}`;
      params.push(`%${specialty.toLowerCase()}%`);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return result.rows.map(lawyer => ({
      id: lawyer.id,
      name: lawyer.name,
      location: lawyer.location,
      specialties: lawyer.specialties,
      rating: lawyer.rating,
      review_count: lawyer.review_count,
      bio: lawyer.bio
    }));
  } catch (error) {
    console.error('Error searching lawyers:', error);
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      tools: [{
        functionDeclarations: [{
          name: 'searchLawyers',
          description: 'Search for lawyers in South Africa based on location and specialty.',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The South African city to search in (e.g., "Johannesburg", "Cape Town", "Durban").'
              },
              specialty: {
                type: 'string',
                description: 'The type of law or issue (e.g., "Divorce", "CCMA", "Labor", "Property").'
              }
            }
          }
        }]
      }]
    });

    // Convert history to proper format
    const chatHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: chatHistory
    });

    const result = await chat.sendMessage(message);
    const response = result.response;

    let responseText = '';
    let toolCalls = [];

    // Handle text response
    if (response.text()) {
      responseText = response.text();
    }

    // Handle function calls
    if (response.functionCalls && response.functionCalls.length > 0) {
      for (const call of response.functionCalls) {
        if (call.name === 'searchLawyers') {
          const args = call.args;
          const lawyers = await searchLawyers(args.location, args.specialty);

          // Send function response back to continue the conversation
          const functionResponse = await chat.sendMessage([{
            functionResponse: {
              name: 'searchLawyers',
              response: { lawyers }
            }
          }]);

          responseText = functionResponse.response.text();
          toolCalls.push({
            name: 'searchLawyers',
            args,
            result: lawyers
          });
        }
      }
    }

    res.status(200).json({
      response: responseText,
      toolCalls
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
}