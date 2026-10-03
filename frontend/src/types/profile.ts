export type Gender = 'Female' | 'Male' | 'Non-binary' | 'Prefer not to say';

export type ProfileStatus = 'Active' | 'Inactive' | 'Pending';

export interface UserProfile {
  id: string;
  fullName: string;
  age: number | '';
  email: string;
  contactNumber: string;
  gender: Gender;
  address: string;
  status: ProfileStatus;
  avatarUrl: string;
  createdAt: string;
  updatedAt?: string;
}

export type ProfileFormData = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>;

export interface FormErrors {
  fullName?: string;
  age?: string;
  email?: string;
  contactNumber?: string;
  gender?: string;
  address?: string;
  status?: string;
  avatarUrl?: string;
}
