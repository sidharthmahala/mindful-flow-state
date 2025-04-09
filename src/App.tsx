
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useEffect } from "react";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeInitializer />
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
