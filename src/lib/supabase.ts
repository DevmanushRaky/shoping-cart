import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: number;
  name: string;
  price: number;
};

export type Order = {
  id: number;
  user_id: string;
  items: {
    product_id: number;
    quantity: number;
  }[];
  total: number;
  created_at: string;
};



export type Profile = {
  id: string;
  is_admin: boolean;
  created_at: string;
};