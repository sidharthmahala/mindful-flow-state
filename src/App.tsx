
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

// Apply the current theme and color scheme as classes on document.documentElement
const ThemeInitializer = () => {
  useEffect(() => {
    // Set initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem('clarity-theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    document.documentElement.classList.add(savedTheme);
    
    // Set initial color scheme
    const savedColorScheme = localStorage.getItem('clarity-color-scheme') || 'mint';
    document.documentElement.setAttribute('data-color-scheme', savedColorScheme);
    
    return () => {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.removeAttribute('data-color-scheme');
    };
  }, []);
  
  return null;
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen flex items-center justify-center">
      <div className="w-10 h-10 animate-pulse-light bg-primary/80 rounded-full"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Auth callback handler
const AuthCallback = () => {
  const { loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen flex items-center justify-center">
      <div className="w-10 h-10 animate-pulse-light bg-primary/80 rounded-full"></div>
    </div>;
  }
  
  return <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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
