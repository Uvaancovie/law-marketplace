export enum UserRole {
  CONSUMER = 'CONSUMER',
  LAWYER = 'LAWYER'
}

export interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
}

export interface Lawyer {
  id: string;
  name: string;
  location: string;
  specialties: string[];
  bio: string;
  packages: Package[];
  imageUrl: string;
  rating: number;
  reviewCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lawyerProfileId?: string; // If user is a lawyer
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}
