import { Lawyer, User, UserRole } from '../types';

// Mock Data - South African Context
const MOCK_LAWYERS: Lawyer[] = [
  {
    id: 'l1',
    name: 'Thabo Nkosi',
    location: 'Sandton, Johannesburg',
    specialties: ['Labor Law', 'CCMA Disputes'],
    bio: 'Experienced labor law attorney helping employees and employers navigate CCMA disputes and employment contracts in Gauteng.',
    imageUrl: 'https://ui-avatars.com/api/?name=Thabo+Nkosi&background=0284c7&color=fff&size=200',
    rating: 4.8,
    reviewCount: 124,
    packages: [
      { id: 'p1', title: 'CCMA Representation', description: 'Preparation and representation for arbitration.', price: 2500 },
      { id: 'p2', title: 'Employment Contract Review', description: 'Detailed review of standard employment contract.', price: 850 }
    ]
  },
  {
    id: 'l2',
    name: 'Sarah van der Merwe',
    location: 'Cape Town City Centre',
    specialties: ['Property Law', 'Conveyancing'],
    bio: 'Specialist in Western Cape property transactions, lease agreements, and sectional title disputes.',
    imageUrl: 'https://ui-avatars.com/api/?name=Sarah+VanDerMerwe&background=e11d48&color=fff&size=200',
    rating: 4.9,
    reviewCount: 45,
    packages: [
      { id: 'p3', title: 'Lease Agreement Draft', description: 'CPA compliant residential lease agreement.', price: 1200 },
      { id: 'p4', title: 'Offer to Purchase Review', description: 'Legal review of property purchase documents.', price: 950 }
    ]
  },
  {
    id: 'l3',
    name: 'Prevan Naidoo',
    location: 'Umhlanga, Durban',
    specialties: ['Family Law', 'Divorce'],
    bio: 'Compassionate family lawyer serving the greater Durban area. Focused on mediation and amicable settlements.',
    imageUrl: 'https://ui-avatars.com/api/?name=Prevan+Naidoo&background=059669&color=fff&size=200',
    rating: 4.7,
    reviewCount: 89,
    packages: [
      { id: 'p5', title: 'Uncontested Divorce', description: 'Drafting of settlement agreement and summons.', price: 4500 }
    ]
  },
  {
    id: 'l4',
    name: 'Lerato Khumalo',
    location: 'Rosebank, Johannesburg',
    specialties: ['Commercial Law', 'Startups'],
    bio: 'Helping South African entrepreneurs structure their businesses correctly. CIPC registration and shareholder agreements.',
    imageUrl: 'https://ui-avatars.com/api/?name=Lerato+Khumalo&background=7c3aed&color=fff&size=200',
    rating: 5.0,
    reviewCount: 210,
    packages: [
      { id: 'p6', title: 'Startup Legal Pack', description: 'CIPC Reg, MOI, and Shareholders Agreement.', price: 5500 },
      { id: 'p7', title: 'Consultation (1 Hour)', description: 'General legal advice for your business.', price: 1200 }
    ]
  }
];

const STORAGE_KEY = 'justifind_lawyers_v2_sa';

// Helper to load/save
const loadLawyers = (): Lawyer[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load lawyers from storage", e);
  }
  return [...MOCK_LAWYERS];
};

const saveLawyers = (data: Lawyer[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save lawyers", e);
  }
};

// In-memory "Database" initialized from Storage or Mock
let lawyers = loadLawyers();

export const db = {
  getLawyers: async (filter?: { location?: string; specialty?: string }): Promise<Lawyer[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Always reload from storage to ensure we have the latest data if multiple tabs are used
    lawyers = loadLawyers();

    let results = lawyers;
    if (filter?.location) {
      const loc = filter.location.toLowerCase();
      results = results.filter(l => l.location.toLowerCase().includes(loc));
    }
    if (filter?.specialty) {
      const spec = filter.specialty.toLowerCase();
      results = results.filter(l => l.specialties.some(s => s.toLowerCase().includes(spec)));
    }
    return results;
  },

  getLawyerById: (id: string) => {
    // Ensure we have latest data
    lawyers = loadLawyers();
    return lawyers.find(l => l.id === id);
  },

  addPackage: (lawyerId: string, pkg: any) => {
    const lawyerIndex = lawyers.findIndex(l => l.id === lawyerId);
    if (lawyerIndex > -1) {
      const newPkg = { ...pkg, id: Math.random().toString(36).substr(2, 9) };
      lawyers[lawyerIndex].packages.push(newPkg);
      saveLawyers(lawyers);
      return newPkg;
    }
    return null;
  },
  
  updateLawyer: (id: string, data: Partial<Lawyer>) => {
    const index = lawyers.findIndex(l => l.id === id);
    if (index > -1) {
      lawyers[index] = { ...lawyers[index], ...data };
      saveLawyers(lawyers);
      return lawyers[index];
    }
    return null;
  },
  
  registerLawyer: (user: User, lawyerData: Partial<Lawyer>) => {
    // Generate a nice avatar based on name
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0284c7&color=fff&size=200`;

    const newLawyer: Lawyer = {
      id: user.id, // Link ID
      name: user.name,
      location: lawyerData.location || 'Unknown',
      specialties: lawyerData.specialties || [],
      bio: lawyerData.bio || 'Professional Lawyer on JustiFind SA.',
      imageUrl: avatarUrl,
      rating: 5.0, // Start with 5 stars for encouragement
      reviewCount: 0,
      packages: []
    };
    
    // Check if exists
    const existingIndex = lawyers.findIndex(l => l.id === user.id);
    if (existingIndex > -1) {
        // Update existing if re-registering
        lawyers[existingIndex] = { ...lawyers[existingIndex], ...newLawyer };
    } else {
        lawyers.push(newLawyer);
    }
    
    saveLawyers(lawyers);
    return newLawyer;
  }
};