import { Lawyer, User, Package } from '../types';
import { supabase } from '../utils/supabase';

// The service now fetches from Supabase directly
export const db = {
  rawClient: supabase, // Exporting raw client for flexible custom queries in MVP

  getLawyers: async (filter?: { location?: string; specialty?: string }): Promise<Lawyer[]> => {
    try {
      let query = supabase.from('lawyers').select(`*, packages(*)`);
      
      if (filter?.location) {
        query = query.ilike('location', `%${filter.location}%`);
      }
      if (filter?.specialty) {
        query = query.contains('specialties', [filter.specialty]);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data.map((l: any) => ({
        ...l,
        imageUrl: l.image_url,
        reviewCount: l.review_count,
        packages: l.packages || []
      }));
    } catch (e) {
      console.error('Error fetching lawyers:', e);
      return [];
    }
  },

  getLawyerById: async (id: string): Promise<Lawyer | undefined> => {
    try {
      const { data, error } = await supabase
        .from('lawyers')
        .select(`*, packages(*)`)
        .eq('id', id);
        
      if (error) {
        console.error('API Error:', error);
        return undefined;
      }
      
      if (!data || data.length === 0) {
         return undefined;
      }
      
      const singleLawyer = data[0];
      return {
        ...singleLawyer,
        imageUrl: singleLawyer.image_url,
        reviewCount: singleLawyer.review_count,
        packages: singleLawyer.packages || []
      };
    } catch (e) {
      console.error('Error fetching lawyer by id:', e);
      return undefined;
    }
  },

  addPackage: async (lawyerId: string, pkg: { title: string, description: string, price: number }) => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .insert([{ lawyer_id: lawyerId, ...pkg }])
        .select();
        
      if (error) {
        console.error('Insert Error:', error);
        throw error;
      }
      return data && data.length > 0 ? data[0] : null;
    } catch (e) {
      console.error('Error adding package:', e);
    }
    return null;
  },
  
  updateLawyer: async (id: string, data: Partial<Lawyer>) => {
    try {
      const payload: any = { ...data };
      if (payload.imageUrl) {
        payload.image_url = payload.imageUrl;
        delete payload.imageUrl;
      }
      if (payload.reviewCount !== undefined) {
        payload.review_count = payload.reviewCount;
        delete payload.reviewCount;
      }
      
      const { data: updated, error } = await supabase
        .from('lawyers')
        .update(payload)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      
      if (!updated || updated.length === 0) return null;
      const updatedLawyer = updated[0];
      
      return {
        ...updatedLawyer,
        imageUrl: updatedLawyer.image_url,
        reviewCount: updatedLawyer.review_count
      };
    } catch (e) {
      console.error('Error updating lawyer:', e);
    }
    return null;
  },
  
  registerLawyer: async (user: User, lawyerData: Partial<Lawyer>) => {
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0284c7&color=fff&size=200`;
    
    // Fallback ID to string so that it inserts correctly into the updated TEXT column
    const payload = {
      id: user.id || Math.random().toString(36).substr(2, 9),
      name: user.name,
      location: lawyerData.location || 'Unknown',
      specialties: lawyerData.specialties && lawyerData.specialties.length > 0 ? lawyerData.specialties : ['General Law'],
      bio: lawyerData.bio || 'Professional Lawyer on JustiFind SA.',
      image_url: avatarUrl,
      rating: 5.0,
      review_count: 0
    };

    try {
      // Use without .single() if we are inserting, or handle response carefully.
      const { data, error } = await supabase
        .from('lawyers')
        .insert([payload])
        .select();
        
      if (error) {
         console.error('Registration insertion error:', error);
         throw error;
      }
      
      const inserted = data[0];
      return { ...inserted, imageUrl: inserted.image_url, reviewCount: inserted.review_count, packages: [] } as Lawyer;
    } catch (e) {
      console.error('Error registering lawyer:', e);
      return null;
    }
  }
};