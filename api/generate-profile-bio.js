import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, specialties, location } = req.body;

    if (!name || !specialties || !location) {
      return res.status(400).json({ error: 'Name, specialties, and location are required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const specialtiesStr = Array.isArray(specialties) ? specialties.join(', ') : specialties;

    const prompt = `Write a professional bio for a South African lawyer named ${name} practicing in ${location}.

Specialties: ${specialtiesStr}

Requirements:
- Keep it under 300 words
- Make it professional and trustworthy
- Highlight experience and expertise
- Include commitment to clients
- Mention South African legal context
- Sound approachable yet authoritative

Bio:`;

    const result = await model.generateContent(prompt);
    const bio = result.response.text().trim();

    res.status(200).json({ bio });
  } catch (error) {
    console.error('Error generating profile bio:', error);
    res.status(500).json({ error: 'Failed to generate bio' });
  }
}