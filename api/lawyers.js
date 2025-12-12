import pool from './db.js';

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { id, location, specialty } = req.query;

      if (id) {
        // Get single lawyer with packages
        const lawyerRes = await pool.query('SELECT * FROM lawyers WHERE id = $1', [id]);
        if (lawyerRes.rows.length === 0) return res.status(404).json({ error: 'Lawyer not found' });
        
        const lawyer = lawyerRes.rows[0];
        const pkgRes = await pool.query('SELECT * FROM packages WHERE lawyer_id = $1', [id]);
        lawyer.packages = pkgRes.rows;
        
        return res.status(200).json(lawyer);
      } else {
        // Search/List lawyers
        let query = 'SELECT * FROM lawyers WHERE 1=1';
        let params = [];
        let paramCount = 1;

        if (location) {
          query += ` AND LOWER(location) LIKE $${paramCount}`;
          params.push(`%${location.toLowerCase()}%`);
          paramCount++;
        }

        if (specialty) {
          // Check if specialty exists in the array
          query += ` AND EXISTS (SELECT 1 FROM unnest(specialties) s WHERE LOWER(s) LIKE $${paramCount})`;
          params.push(`%${specialty.toLowerCase()}%`);
          paramCount++;
        }

        const result = await pool.query(query, params);
        
        // Fetch packages for these lawyers (n+1 problem, but simple for MVP)
        const lawyers = await Promise.all(result.rows.map(async (l) => {
          const p = await pool.query('SELECT * FROM packages WHERE lawyer_id = $1', [l.id]);
          return { ...l, packages: p.rows };
        }));

        return res.status(200).json(lawyers);
      }
    } 
    
    else if (method === 'POST') {
      // Register new lawyer
      const { id, name, location, specialties, bio, imageUrl } = req.body;
      
      await pool.query(
        `INSERT INTO lawyers (id, name, location, specialties, bio, image_url, rating, review_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE 
         SET name = EXCLUDED.name, location = EXCLUDED.location`,
        [id, name, location, specialties, bio, imageUrl, 5.0, 0]
      );
      
      return res.status(200).json({ success: true });
    }

    else if (method === 'PUT') {
      // Update profile
      const { id, name, location, specialties, bio, imageUrl } = req.body;
      
      // Dynamic update query
      // For simplicity in MVP, we update everything passed
      const query = `
        UPDATE lawyers 
        SET name = COALESCE($2, name),
            location = COALESCE($3, location),
            specialties = COALESCE($4, specialties),
            bio = COALESCE($5, bio),
            image_url = COALESCE($6, image_url)
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await pool.query(query, [id, name, location, specialties, bio, imageUrl]);
      return res.status(200).json(result.rows[0]);
    }

    else if (method === 'DELETE') {
      // Delete lawyer
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Lawyer ID is required' });
      }

      // First delete packages associated with this lawyer
      await pool.query('DELETE FROM packages WHERE lawyer_id = $1', [id]);
      
      // Then delete the lawyer
      const result = await pool.query('DELETE FROM lawyers WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Lawyer not found' });
      }
      
      return res.status(200).json({ success: true, deleted: result.rows[0] });
    }

    else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}