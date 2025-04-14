import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';

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
    if (!user?.id) {
      console.log("No user ID available for profile refresh");
      return;
    }
    
    try {
      console.log("Refreshing profile for user:", user.id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileData) {
        console.log("Found profile in user_profiles:", profileData);
        
        const isComplete = profileData.is_complete === true || profileData.is_complete === true;
        
        setUserProfile({
          fullName: profileData.full_name as string,
          age: profileData.age as number | null,
          gender: null, // For backward compatibility
          role: profileData.role as string | null,
          dateOfBirth: profileData.date_of_birth as string | null,
          isComplete: isComplete
        });
        
        console.log("Profile set with isComplete:", isComplete);
        return;
      } else {
        console.log("No profile found in user_profiles, error:", profileError);
      }
      
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
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Error in profile fetch:', error);
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          console.log("User authenticated, refreshing profile");
          setTimeout(() => {
            refreshProfile();
          }, 0);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
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
      console.log("Attempting to sign in with email:", email);
      
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();
      
      if (userError) {
        console.log("Error checking if user exists:", userError);
      }
      
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Login error:", error.message);
        
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed') ||
            error.message.toLowerCase().includes('user not found')) {
          
          sonnerToast.error("Login Failed", {
            description: "Invalid email or password. Please try again.",
          });
          
          return { error };
        }
        
        sonnerToast.error("Login Failed", {
          description: error.message || "An error occurred during login.",
        });
        
        return { error };
      }
      
      sonnerToast.success("Login Successful", {
        description: "You are now logged in.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("Unexpected error during login:", error);
      
      sonnerToast.error("Login Failed", {
        description: error.message || "An unexpected error occurred",
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
      console.log("Attempting signup for email:", email);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: userData.fullName
          }
        }
      });
      
      if (signUpError) {
        console.error("Signup error:", signUpError);
        sonnerToast.error("Sign up Failed", {
          description: signUpError.message || "Failed to create account.",
        });
        return { error: signUpError };
      }
      
      if (data?.user) {
        console.log("User created, saving profile data for:", data.user.id);
        
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
          sonnerToast.error("Profile Creation Error", {
            description: "Your account was created but we couldn't save your profile details.",
          });
        } else {
          sonnerToast.success("Sign up Successful", {
            description: "Account created successfully. You can now log in.",
          });
        }
      }
      
      return { error: null };
    } catch (error: any) {
      console.error("Unexpected signup error:", error);
      sonnerToast.error("Sign up Failed", {
        description: error.message || "An unexpected error occurred",
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
