// src/services/userService.ts

import { supabase } from '@/lib/supabase';

interface UserData {
  email: string;
  password: string;
  // Add other user fields as needed
}

interface UserProfile {
  id: string;
  user_id: string;
  is_admin: boolean;
  created_at: string;
  // Add other profile fields as needed
}

interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    profile?: UserProfile;
  };
  error?: string;
}

export const userService = {
  async loginUser(userData: UserData): Promise<LoginResponse> {
    try {
      // First, sign in the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });

      if (authError) throw authError;
      if (!authData.user?.id || !authData.user?.email) throw new Error('No user data returned');

      // Then fetch the user's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // We still return success if auth worked, but profile fetch failed
        return {
          success: true,
          user: {
            id: authData.user.id,
            email: authData.user.email,
          },
        };
      }

      return {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          profile: profileData,
        },
      };
    } catch (error: any) {
      console.error('Error in loginUser:', error);
      return {
        success: false,
        error: error.message || 'Failed to login user',
      };
    }
  },

  async registerUser(userData: UserData) {
    try {
      // Register the user with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      const user = data.user; // Extract user from data

      if (signUpError || !user) throw signUpError || new Error('User registration failed');

      // Create a profile for the new user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          user_id: user.id,
          // Add other profile fields as needed
        }]);

      if (profileError) throw new Error(profileError.message);

      return { success: true, user };
    } catch (error: any) {
      console.error('Error in registerUser:', error);
      return {
        success: false,
        error: error.message || 'Failed to register user',
      };
    }
  },

  async logoutUser(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error in logoutUser:', error);
      return {
        success: false,
        error: error.message || 'Failed to logout user',
      };
    }
  },
};