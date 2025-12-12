import pool from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { lawyerId, title, description, price, imageUrl } = req.body;

    const result = await pool.query(
      'INSERT INTO packages (lawyer_id, title, description, image_url, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [lawyerId, title, description, imageUrl, price]
    );

    const row = result.rows[0];
    // normalize for frontend field names
    row.imageUrl = row.image_url;
    res.status(200).json(row);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}