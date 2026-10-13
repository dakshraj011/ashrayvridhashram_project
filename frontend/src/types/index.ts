export type UserRole = 'user' | 'manager' | 'admin';

export interface User {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  role: UserRole;
  address?: string;
  is_active?: number;
  created_at?: string;
}

export interface HomeInfo {
  id: number;
  name: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  facilities: string[] | string;
  hero_image: string;
  about_images: string[] | string;
}

export interface Need {
  id: number;
  title: string;
  category: string;
  description: string;
  required_quantity: number;
  available_quantity: number;
  unit: string;
  photo_url?: string;
  status: 'सक्रिय' | 'पूर्ण' | 'लंबित';
  created_by?: number;
  created_at?: string;
}

export interface MealRequest {
  id: number;
  user_id: number;
  user_name: string;
  mobile: string;
  preferred_date: string;
  people_count: number;
  meal_type: string;
  items_distributed?: string;
  message?: string;
  status: 'लंबित' | 'स्वीकार किया गया' | 'अस्वीकार किया गया' | 'पूर्ण';
  admin_note?: string;
  created_at?: string;
}

export interface VolunteerRegistration {
  id: number;
  user_id: number;
  full_name: string;
  mobile: string;
  email?: string;
  address?: string;
  preferred_date: string;
  help_type: string;
  message?: string;
  status: 'लंबित' | 'स्वीकार किया गया' | 'अस्वीकार किया गया' | 'पूर्ण';
  admin_note?: string;
  created_at?: string;
}

export interface AssistanceRequest {
  id: number;
  user_id: number;
  elderly_name: string;
  elderly_age?: number;
  contact_number: string;
  address: string;
  assistance_type: string;
  description: string;
  photo_url?: string;
  assigned_manager_id?: number;
  manager_name?: string;
  status: 'लंबित' | 'प्रक्रिया में' | 'स्वीकार किया गया' | 'अस्वीकार किया गया' | 'पूर्ण';
  admin_note?: string;
  created_at?: string;
}

export interface Event {
  id: number;
  title: string;
  event_date: string;
  description: string;
  image_url?: string;
  is_published: number;
  created_at?: string;
}

export interface GalleryImage {
  id: number;
  event_id?: number;
  title: string;
  image_url: string;
  category: string;
  created_at?: string;
}

export interface ContactSubmission {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  subject?: string;
  message: string;
  status: 'अपठित' | 'पठित' | 'हल किया गया';
  created_at?: string;
}

export interface NotificationItem {
  id: number;
  user_id?: number;
  title: string;
  message: string;
  type: string;
  is_read: number;
  created_at?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalManagers: number;
  totalMealRequests: number;
  pendingMealRequests: number;
  totalVolunteers: number;
  pendingVolunteers: number;
  totalAssistanceRequests: number;
  pendingAssistanceRequests: number;
  totalContacts: number;
  activeNeeds: number;
  totalEvents: number;
}
