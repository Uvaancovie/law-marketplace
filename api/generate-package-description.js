import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, price } = req.body;

    if (!title || !price) {
      return res.status(400).json({ error: 'Title and price are required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate a compelling, professional description for a legal service package titled "${title}" priced at R${price}.

Requirements:
- Keep it under 200 words
- Highlight the value and benefits
- Use professional legal language
- Make it persuasive and trustworthy
- Focus on the specific legal service mentioned in the title

Description:`;

    const result = await model.generateContent(prompt);
    const description = result.response.text().trim();

    res.status(200).json({ description });
  } catch (error) {
    console.error('Error generating package description:', error);
    res.status(500).json({ error: 'Failed to generate description' });
  }
}