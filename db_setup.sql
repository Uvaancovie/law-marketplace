-- JustiFind SA: DB Schema + Seed Data
-- Run with: npm run seed (requires env var POSTGRES_URL set)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS lawyers CASCADE;

CREATE TABLE lawyers (
  id text PRIMARY KEY,
  name text NOT NULL,
  location text NOT NULL,
  specialties text[] DEFAULT ARRAY[]::text[],
  bio text,
  image_url text,
  rating numeric(3,2) DEFAULT 5.0,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE packages (
  id serial PRIMARY KEY,
  lawyer_id text REFERENCES lawyers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  price numeric(10,2) NOT NULL DEFAULT 0
);

-- Seed sample South African law firms/agencies
INSERT INTO lawyers (id, name, location, specialties, bio, image_url, rating, review_count)
VALUES
('laws-jhb-1', 'Moyo & Co. Attorneys', 'Johannesburg (Sandton)', ARRAY['Family Law','Divorce'], 'Top family law practice in Sandton.', 'https://i.pravatar.cc/150?img=32', 4.9, 28),
('laws-jhb-2', 'Pretorius Legal', 'Johannesburg', ARRAY['Property','Conveyancing','Commercial Law'], 'Trusted property and commercial lawyers in Johannesburg.', 'https://i.pravatar.cc/150?img=14', 4.7, 41),
('laws-cpt-1', 'Van Der Merwe Attorneys', 'Cape Town', ARRAY['Property','Labor','Employment'], 'Cape Town based practice specialising in employment and property law.', 'https://i.pravatar.cc/150?img=12', 4.8, 31),
('laws-dbn-1', 'Khumalo Legal', 'Durban', ARRAY['Labor','CCMA','Family Law'], 'Durban-based firm focusing on labor and CCMA matters.', 'https://i.pravatar.cc/150?img=27', 4.6, 16)
ON CONFLICT (id) DO NOTHING;

INSERT INTO packages (lawyer_id, title, description, image_url, price) VALUES
('laws-jhb-1', '30 Minute Consultation', 'Quick call to discuss your family law case and next steps.', 'https://images.unsplash.com/photo-1559056199-ee5e5fc96b3b?auto=format&fit=crop&w=800&q=60', 500.00),
('laws-jhb-1', 'Full Representation (Divorce)', 'Full legal representation for divorce proceedings.', 'https://images.unsplash.com/photo-1546525848-3ce03ca516f6?auto=format&fit=crop&w=800&q=60', 8000.00),
('laws-jhb-2', 'Property Conveyancing', 'Handle your property transfer and registrations.', 'https://images.unsplash.com/photo-1520975924551-9cc907a33e60?auto=format&fit=crop&w=800&q=60', 3500.00),
('laws-cpt-1', 'Employment Review', 'Employment contract review and CCMA preparation.', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60', 1200.00),
('laws-dbn-1', 'CCMA Representation', 'Representation for CCMA hearings and negotiation.', 'https://images.unsplash.com/photo-1616401788893-6c2ce3ff40f9?auto=format&fit=crop&w=800&q=60', 2500.00)
ON CONFLICT DO NOTHING;
