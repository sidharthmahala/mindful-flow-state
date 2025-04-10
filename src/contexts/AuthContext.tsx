
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type UserProfile = {
  fullName: string;
  age: number | null;
  gender: string | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; isNewUser?: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, userData: UserProfile) => Promise<{ error: any }>;
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data) {
        setUserProfile({
          fullName: data.full_name as string,
          age: data.age as number | null,
          gender: data.gender as string | null
        });
      }
    } catch (error) {
      console.error('Error in profile fetch:', error);
    }
  };

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        if (currentSession?.user) {
          // Use setTimeout to avoid deadlock with Supabase auth
          setTimeout(() => {
            refreshProfile();
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
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
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        // Check if the error is because user doesn't exist
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed') ||
            error.message.toLowerCase().includes('user not found')) {
          
          // We'll check if the user exists by trying to sign them up
          // and checking the response - this is a more reliable method
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password: 'temporary-check-password', // We're just checking if the email exists
          });
          
          // If we get an error that the user already exists, they exist but password was wrong
          // If we don't get that specific error, the user likely doesn't exist
          const isNewUser = !signUpError || 
            !signUpError.message.includes('already registered');
          
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
          description: error.message,
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
          redirectTo: `${window.location.origin}/auth/callback`
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

  const signUp = async (email: string, password: string, userData: UserProfile) => {
    try {
      // First, check if email already exists
      const { error: checkError } = await supabase.auth.signUp({
        email,
        password: 'temp-password-for-check',
      });
      
      // If the error indicates email is already registered, return early
      if (checkError && checkError.message.includes('already registered')) {
        toast({
          title: "Sign up Failed",
          description: "This email is already registered. Please log in instead.",
          variant: "destructive",
        });
        return { error: checkError };
      }
      
      // Proceed with actual signup
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
        // If signup successful, store additional profile data
        if (data?.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ 
              id: data.user.id,
              full_name: userData.fullName,
              age: userData.age,
              gender: userData.gender,
              updated_at: new Date()
            } as any);
          
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
