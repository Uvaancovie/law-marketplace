import pool from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { lawyerId, title, description, price } = req.body;
    const id = Math.random().toString(36).substr(2, 9); // Simple ID gen

    const result = await pool.query(
      'INSERT INTO packages (id, lawyer_id, title, description, price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, lawyerId, title, description, price]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}