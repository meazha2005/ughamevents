export interface College {
  id: number;
  name: string;
  city?: string;
  state?: string;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface EventItem {
  id: number;
  title: string;
  slug: string;
  category_name: string;
  description: string;
  short_description?: string;
  event_date: string;
  end_date?: string;
  registration_deadline?: string;
  venue: string;
  mode: 'Offline' | 'Online' | 'Hybrid';
  poster_url?: string;
  max_participants: number;
  fee: number;
  organizer_name?: string;
  organizer_contact?: string;
  status: 'published' | 'draft' | 'cancelled' | 'completed';
  created_at?: string;
  updated_at?: string;
  registered_count?: number;
  is_registered?: boolean;
}

export interface StudentUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  college_id?: number;
  college_name: string;
  profile_pic?: string;
  role: 'student' | 'admin';
  created_at?: string;
}

export interface Registration {
  id: number;
  event_id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_college: string;
  status: 'registered' | 'attended' | 'cancelled';
  notes?: string;
  registered_at: string;
  event_title?: string;
  event_date?: string;
}
