import { lawyers as mockLawyers, packages as mockPackages } from './mockData.js';

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export default function createMockPool() {
  const lawyers = mockLawyers.map(clone);
  const packages = mockPackages.map(clone);

  return {
    async query(text, params) {
      const sql = text.trim().toLowerCase();

      if (sql.startsWith('select') && sql.includes('from lawyers') && sql.includes('where id =')) {
        const id = params[0];
        const l = lawyers.find(l => l.id === id);
        return { rows: l ? [clone(l)] : [] };
      }

      if (sql.startsWith('select') && sql.includes('from packages') && sql.includes('where lawyer_id =')) {
        const id = params[0];
        const rows = packages.filter(p => p.lawyer_id === id).map(clone);
        return { rows };
      }

      if (sql.startsWith('select') && sql.includes('from lawyers')) {
        // Support simple filters for location/specialty
        // If query contains 'lower(location) like $1' style
        let results = lawyers;
        if (sql.includes('lower(location) like')) {
          const term = (params[0] || '').toLowerCase().replace(/%/g, '');
          results = results.filter(l => l.location.toLowerCase().includes(term));
        }
        if (sql.includes('exists') && sql.includes('unnest')) {
          const term = (params[params.length - 1] || '').toLowerCase().replace(/%/g, '');
          results = results.filter(l => l.specialties.some(s => s.toLowerCase().includes(term)));
        }
        // Attach packages
        const enriched = results.map(r => ({ ...clone(r), packages: packages.filter(p => p.lawyer_id === r.id).map(clone) }));
        return { rows: enriched };
      }

      if (sql.startsWith('insert into lawyers')) {
        // Very basic parsing - read params
        const [id, name, location, specialties, bio, imageUrl] = params;
        const newLawyer = { id, name, location, specialties, bio, image_url: imageUrl, rating: 5.0, review_count: 0, packages: [] };
        lawyers.push(newLawyer);
        return { rows: [] };
      }

      if (sql.startsWith('insert into packages')) {
        // Insert package
        const [lawyerId, title, description, imageUrl, price] = params;
        const newPackage = { id: packages.length + 1, lawyer_id: lawyerId, title, description, image_url: imageUrl, price };
        packages.push(newPackage);
        return { rows: [newPackage] };
      }

      if (sql.startsWith('update lawyers')) {
        const [id, name, location, specialties, bio, imageUrl] = params;
        const l = lawyers.find(lw => lw.id === id);
        if (l) {
          l.name = name || l.name;
          l.location = location || l.location;
          l.specialties = specialties || l.specialties;
          l.bio = bio || l.bio;
          l.image_url = imageUrl || l.image_url;
          return { rows: [clone(l)] };
        }
        return { rows: [] };
      }

      // default fallback
      return { rows: [] };
    }
  };
}
