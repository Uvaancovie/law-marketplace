import { Lawyer, User } from '../types';
import { AuthService } from './auth';

// The service now fetches from the relative /api path (handled by Vercel)
export const db = {
  getLawyers: async (filter?: { location?: string; specialty?: string }): Promise<Lawyer[]> => {
    try {
      const params = new URLSearchParams();
      if (filter?.location) params.append('location', filter.location);
      if (filter?.specialty) params.append('specialty', filter.specialty);
      
      const res = await fetch(`/api/lawyers?${params.toString()}`, {
        headers: AuthService.getAuthHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch lawyers');
      
      const data = await res.json();
      
      // Map DB snake_case to TS camelCase if necessary, 
      // but our SQL uses image_url vs imageUrl. We need to map it.
      return data.map((l: any) => ({
        ...l,
        imageUrl: l.image_url,
        reviewCount: l.review_count,
        packages: l.packages ? l.packages.map((p: any) => ({ ...p, imageUrl: p.image_url })) : []
      }));
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getLawyerById: async (id: string): Promise<Lawyer | undefined> => {
    try {
      const res = await fetch(`/api/lawyers?id=${id}`, {
        headers: AuthService.getAuthHeaders()
      });
      if (!res.ok) return undefined;
      const data = await res.json();
      return {
        ...data,
        imageUrl: data.image_url,
        reviewCount: data.review_count,
        packages: data.packages ? data.packages.map((p: any) => ({ ...p, imageUrl: p.image_url })) : []
      };
    } catch (e) {
      console.error(e);
      return undefined;
    }
  },

  addPackage: async (lawyerId: string, pkg: { title: string, description: string, price: number }) => {
    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders()
        },
        body: JSON.stringify({ lawyerId, ...pkg, imageUrl: (pkg as any).imageUrl || null })
      });
      if (res.ok) {
        const pkg = await res.json();
        pkg.imageUrl = pkg.image_url || pkg.imageUrl;
        return pkg;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  },
  
  updateLawyer: async (id: string, data: Partial<Lawyer>) => {
    try {
      // Map camelCase to snake_case for DB if needed, or handle in API
      // We are sending what we have, API handles it.
      const payload = {
        ...data,
        imageUrl: data.imageUrl // Ensure this is passed if present
      };
      
      const res = await fetch('/api/lawyers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders()
        },
        body: JSON.stringify({ id, ...payload })
      });
      
      if (res.ok) {
         const updated = await res.json();
         return {
             ...updated,
             imageUrl: updated.image_url,
             reviewCount: updated.review_count
         };
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  },
  
  registerLawyer: async (user: User, lawyerData: Partial<Lawyer>) => {
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0284c7&color=fff&size=200`;
    
    const payload = {
      id: user.id,
      name: user.name,
      location: lawyerData.location || 'Unknown',
      specialties: lawyerData.specialties || [],
      bio: lawyerData.bio || 'Professional Lawyer on JustiFind SA.',
      imageUrl: avatarUrl
    };

    try {
      await fetch('/api/lawyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });
      
      return { ...payload, rating: 5.0, reviewCount: 0, packages: [] } as Lawyer;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  deleteLawyer: async (id: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/lawyers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders()
        },
        body: JSON.stringify({ id })
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};