export enum UserRole {
  DIETITIAN = 'dietitian',
  PATIENT = 'patient'
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export type Role = 'dietitian' | 'patient';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  photoURL?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  prakriti: 'Vata' | 'Pitta' | 'Kapha';
  vikriti: 'Vata' | 'Pitta' | 'Kapha';
  currentWeight: number;
  targetWeight: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
  dietitianId: string;
}

export interface ClinicalAnalysis {
  id: string;
  patientId: string;
  primaryPrakriti: 'Vata' | 'Pitta' | 'Kapha';
  symptoms: string;
  agni: string;
  koshtha: string;
  insight: string;
  createdAt: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron: number;
  calcium: number;
  rasa: string[];
  virya: string;
  vipaka: string;
  digestibility: string;
  doshaEffect: {
    vata: 'Pacifying' | 'Aggravating' | 'Neutral' | string;
    pitta: 'Pacifying' | 'Aggravating' | 'Neutral' | string;
    kapha: 'Pacifying' | 'Aggravating' | 'Neutral' | string;
  };
}

export interface Dish {
  id: string;
  name: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | string;
  suitableDosha: ('Vata' | 'Pitta' | 'Kapha' | string)[];
  season: string[];
  ingredients: {
    ingredientId: string;
    units: number;
  }[];
  // Keep some old fields for compatibility if needed, or update components
  calories?: number;
  protein?: number;
}

export interface DietPlan {
  id: string;
  patientId: string;
  weekOf: string;
  schedule: {
    [day: string]: {
      [slot: string]: Dish[];
    };
  };
  createdAt: string;
}
