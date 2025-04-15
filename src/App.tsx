import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import CompleteProfile from "./pages/CompleteProfile";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

// Apply the current theme and color scheme as classes on document.documentElement
const ThemeInitializer = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('clarity-theme') || 'light';
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add(savedTheme);
    
    const savedColorScheme = localStorage.getItem('clarity-color-scheme') || 'mint';
    document.documentElement.setAttribute('data-color-scheme', savedColorScheme);
    
    return () => {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.removeAttribute('data-color-scheme');
    };
  }, []);
  
  return null;
};

// Improved Protected route component with enhanced profile check
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, userProfile, loading, refreshProfile } = useAuth();
  
  // Effect to refresh profile when component mounts
  useEffect(() => {
    if (user && !userProfile) {
      console.log("Protected route: user exists but no profile, refreshing profile");
      refreshProfile();
    }
  }, [user, userProfile, refreshProfile]);
  
  if (loading) {
    return <div className="h-screen flex items-center justify-center">
      <div className="w-10 h-10 animate-pulse-light bg-primary/80 rounded-full"></div>
    </div>;
  }
  
  if (!user) {
    console.log("No user, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }
  
  // Fixed profile check - removed redundant comparison
  const profileComplete = userProfile && userProfile.isComplete === true;
  
  console.log("Profile check:", { 
    exists: Boolean(userProfile), 
    isComplete: userProfile?.isComplete, 
    isCompleteBool: Boolean(userProfile?.isComplete),
    complete: profileComplete,
    typeOf: typeof userProfile?.isComplete
  });
  
  if (!profileComplete) {
    console.log("Profile incomplete, redirecting to /complete-profile");
    return <Navigate to="/complete-profile" replace />;
  }
  
  console.log("Profile complete, rendering protected content");
  return <>{children}</>;
};

// Auth callback handler with improved logging
const AuthCallback = () => {
  const { user, userProfile, loading, refreshProfile } = useAuth();
  
  // Refresh profile on mount to ensure we have the latest data
  useEffect(() => {
    if (user) {
      console.log("Auth callback: refreshing user profile");
      refreshProfile();
    }
  }, [user, refreshProfile]);
  
  console.log("Auth callback check:", { 
    user: Boolean(user), 
    profile: Boolean(userProfile), 
    isComplete: userProfile?.isComplete 
  });
  
  if (loading) {
    return <div className="h-screen flex items-center justify-center">
      <div className="w-10 h-10 animate-pulse-light bg-primary/80 rounded-full"></div>
    </div>;
  }
  
  if (!user) {
    console.log("Callback: No user, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }
  
  // Fixed profile completion check - removed redundant comparison
  const profileComplete = userProfile && userProfile.isComplete === true;
    
  if (!profileComplete) {
    console.log("Callback: Profile incomplete, redirecting to /complete-profile");
    return <Navigate to="/complete-profile" replace />;
  }
  
  console.log("Callback: All checks passed, redirecting to home");
  return <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/auth/reset-password" element={<AuthCallback />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeInitializer />
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
