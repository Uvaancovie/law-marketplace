import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import lawyersHandler from './lawyers.js';
import packagesHandler from './packages.js';
import authHandler, { verifyToken } from './auth.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
app.use(express.json());

// Auth routes (public)
app.all('/api/auth', async (req, res) => {
  try {
    await authHandler(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected routes (require authentication)
app.all('/api/lawyers', async (req, res) => {
  try {
    await lawyersHandler(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.all('/api/packages', async (req, res) => {
  try {
    await packagesHandler(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.all('/api/packages', async (req, res) => {
  try {
    await packagesHandler(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => console.log(`API server listening on http://localhost:${PORT}`));
