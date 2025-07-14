import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallback to valid placeholder values
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use valid placeholder values if env vars are missing or contain placeholder text
const supabaseUrl = (envUrl && 
                    !envUrl.includes('your_supabase_project_url') && 
                    !envUrl.includes('your-project-id') &&
                    envUrl.startsWith('http')) 
                    ? envUrl 
                    : 'https://placeholder.supabase.co';

const supabaseAnonKey = (envKey && 
                        !envKey.includes('your_supabase_anon_key') && 
                        !envKey.includes('your-anon') &&
                        envKey.length > 20) 
                        ? envKey 
                        : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder';

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return envUrl && 
         envKey && 
         envUrl !== 'https://placeholder.supabase.co' &&
         envKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.placeholder' &&
         !envUrl.includes('your-project-id') &&
         !envUrl.includes('your_supabase_project_url') &&
         !envKey.includes('your-anon') &&
         !envKey.includes('your_supabase_anon_key') &&
         envUrl.length > 20 &&
         envKey.length > 20 &&
         envUrl.includes('.supabase.co') &&
         envUrl.startsWith('http');
};

// Validate environment variables
if (!isSupabaseConfigured()) {
  console.warn('Supabase configuration missing. Some features may not work properly.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  },
  global: {
    fetch: (url, options = {}) => {
      // If Supabase is not configured, return a rejected promise immediately
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, skipping request to:', url);
        return Promise.resolve(new Response(JSON.stringify({ data: null, error: { message: 'Supabase not configured' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      return fetch(url, {
        ...options,
        signal: controller.signal
      }).catch(error => {
        clearTimeout(timeoutId);
        
        // Handle different types of fetch errors more gracefully
        if (error.name === 'AbortError') {
          console.warn('Supabase request aborted:', error.message);
          return Promise.resolve(new Response(JSON.stringify({ data: null, error: { message: 'Request timeout' } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.warn('Network connectivity issue with Supabase:', error.message);
          return Promise.resolve(new Response(JSON.stringify({ data: null, error: { message: 'Network error' } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }
        
        console.warn('Supabase fetch error:', error.message);
        return Promise.resolve(new Response(JSON.stringify({ data: null, error: { message: error.message } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }));
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    }
  }
});

// Helper function to handle Supabase errors gracefully
export const handleSupabaseError = (error: any) => {
  if (!error) return { data: null, error: null };
  
  console.warn('Supabase error:', error.message || error);
  
  // Check if Supabase is not configured
  if (error?.message?.includes('Supabase is not configured')) {
    console.error('Supabase configuration error. Please check your .env file.');
    return { 
      data: null, 
      error: { 
        ...error, 
        message: 'Database connection not configured. Please contact support.' 
      } 
    };
  }
  
  // Check if it's a network error
  if (error?.message?.includes('Failed to fetch') || 
      error?.message?.includes('Unable to connect to Supabase') ||
      error?.name === 'TypeError' || 
      error?.name === 'AbortError') {
    console.warn('Network connectivity issue with Supabase:', error.message);
    return { 
      data: null, 
      error: { 
        ...error, 
        message: 'Unable to connect to the database. Please check your internet connection and try again.' 
      } 
    };
  }
  
  return { data: null, error };
};

export type FormSubmission = {
  id: string;
  company_name: string;
  user_name: string;
  phone: string;
  company_types: string[];
  source_url: string;
  submitted_at: string;
  status: 'pending' | 'processing' | 'completed' | 'invalid';
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type NewsArticle = {
  id: string;
  title: string;
  category: string;
  publish_time: string;
  image_url?: string;
  summary?: string;
  content?: string;
  views: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomerCase = {
  id: string;
  company_name: string;
  company_logo: string;
  industry: string;
  description: string;
  results: string;
  metrics: Record<string, any>;
  is_featured: boolean;
  sort_order: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

export type CaseConfiguration = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  company_name: string;
  company_logo: string;
  stock_code?: string;
  image_url?: string;
  link_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type AdminUser = {
  id: string;
  email: string;
  created_at: string;
};