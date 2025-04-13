import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type UserProfile = {
  fullName: string;
  age: number | null;
  gender: string | null;
  role: string | null;
  dateOfBirth: string | null;
  isComplete: boolean;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; isNewUser?: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, userData: { fullName: string; age: number; role?: string; dateOfBirth?: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshProfile = async () => {
    if (!user?.id) return;
    
    try {
      console.log("Refreshing profile for user:", user.id);
      
      // Try to fetch from user_profiles first (new table)
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileData) {
        console.log("Found profile in user_profiles:", profileData);
        setUserProfile({
          fullName: profileData.full_name as string,
          age: profileData.age as number | null,
          gender: null, // For backward compatibility
          role: profileData.role as string | null,
          dateOfBirth: profileData.date_of_birth as string | null,
          isComplete: profileData.is_complete as boolean || false
        });
        return;
      } else {
        console.log("No profile found in user_profiles, error:", profileError);
      }
      
      // Fall back to old 'profiles' table if user_profiles doesn't have data
      const { data: legacyData, error: legacyError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (legacyData) {
        console.log("Found profile in legacy profiles:", legacyData);
        setUserProfile({
          fullName: legacyData.full_name as string,
          age: legacyData.age as number | null,
          gender: legacyData.gender as string | null,
          role: legacyData.gender as string | null, // For backward compatibility
          dateOfBirth: null,
          isComplete: false
        });
      } else {
        console.log("No profile found in legacy table either:", legacyError);
        // No profile found in either table
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error in profile fetch:', error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        if (currentSession?.user) {
          console.log("User authenticated, refreshing profile");
          setTimeout(() => {
            refreshProfile();
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession?.user?.id ? "User logged in" : "No user");
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        refreshProfile();
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // First, try to sign in
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // If login fails, check if it's because the user doesn't exist
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed') ||
            error.message.toLowerCase().includes('user not found')) {
          
          // Try a sign-up attempt to see if user exists
          const { error: signUpCheckError } = await supabase.auth.signUp({
            email,
            password,
          });
          
          // If this error mentions already registered, user exists but password is wrong
          const isNewUser = !signUpCheckError || 
            !signUpCheckError.message.includes('already registered');
          
          if (isNewUser) {
            toast({
              title: "User not found",
              description: "No account found with this email. Please sign up.",
              variant: "destructive",
            });
            return { error, isNewUser: true };
          }
        }
        
        toast({
          title: "Login Failed",
          description: error.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
      
      return { error };
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account'
          }
        }
      });
      
      if (error) {
        toast({
          title: "Google Login Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Google Login Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const signUp = async (email: string, password: string, userData: { fullName: string; age: number; role?: string; dateOfBirth?: string }) => {
    try {
      const { error: checkError } = await supabase.auth.signUp({
        email,
        password: 'temp-password-for-check',
      });
      
      if (checkError && checkError.message.includes('already registered')) {
        toast({
          title: "Sign up Failed",
          description: "This email is already registered. Please log in instead.",
          variant: "destructive",
        });
        return { error: checkError };
      }
      
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: userData.fullName
          }
        }
      });
      
      if (error) {
        toast({
          title: "Sign up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        if (data?.user) {
          // Insert into user_profiles table
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({ 
              user_id: data.user.id,
              full_name: userData.fullName,
              age: userData.age,
              role: userData.role || null,
              date_of_birth: userData.dateOfBirth || null,
              is_complete: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (profileError) {
            console.error('Error saving profile data:', profileError);
          }
        }
        
        toast({
          title: "Sign up Successful",
          description: "Please check your email for verification.",
        });
      }
      
      return { error };
    } catch (error: any) {
      toast({
        title: "Sign up Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        toast({
          title: "Password Reset Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Reset Email Sent",
          description: "Check your email for a password reset link.",
        });
      }
      
      return { error };
    } catch (error: any) {
      toast({
        title: "Password Reset Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      userProfile,
      loading, 
      signIn, 
      signInWithGoogle,
      signUp, 
      signOut,
      resetPassword,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
