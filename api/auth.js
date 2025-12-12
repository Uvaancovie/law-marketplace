import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === 'POST') {
      const { action, email, password, name, role, location, specialty } = req.body;

      if (action === 'login') {
        // Handle login
        let user = null;
        let userRole = 'CONSUMER';

        // Check for admin credentials
        if (email === 'admin@justifind.com' && password === 'admin123') {
          user = {
            id: 'admin-001',
            name: 'Admin User',
            email: 'admin@justifind.com',
            role: 'ADMIN'
          };
          userRole = 'ADMIN';
        } else {
          // Check if user exists as lawyer
          const lawyerResult = await pool.query('SELECT * FROM lawyers WHERE id = $1', [email]);
          if (lawyerResult.rows.length > 0) {
            user = {
              id: lawyerResult.rows[0].id,
              name: lawyerResult.rows[0].name,
              email: lawyerResult.rows[0].id, // Using ID as email for simplicity
              role: 'LAWYER'
            };
            userRole = 'LAWYER';
          } else {
            // Regular consumer login - just create a token
            user = {
              id: email,
              name: name || email.split('@')[0],
              email,
              role: 'CONSUMER'
            };
            userRole = 'CONSUMER';
          }
        }

        if (user) {
          const token = jwt.sign(
            { id: user.id, email: user.email, role: userRole },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

          return res.status(200).json({
            user: { ...user, role: userRole },
            token
          });
        } else {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

      } else if (action === 'register') {
        // Handle registration
        const userId = Math.random().toString(36).substr(2, 9);

        if (role === 'LAWYER') {
          // Register lawyer
          const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff&size=200`;

          await pool.query(
            `INSERT INTO lawyers (id, name, location, specialties, bio, image_url, rating, review_count)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [userId, name, location, [specialty], 'New lawyer to the platform.', avatarUrl, 5.0, 0]
          );
        }

        const token = jwt.sign(
          { id: userId, email: userId, role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        const user = {
          id: userId,
          name,
          email: userId,
          role
        };

        return res.status(200).json({ user, token });
      }
    }

    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Middleware to verify JWT tokens
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}