
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type ColorScheme = 'lavender' | 'mint' | 'peach' | 'sky' | 'lemon';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  backgroundImage: string | null;
  setBackgroundImage: (image: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('clarity-theme');
    return (storedTheme as Theme) || 'light';
  });
  
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    const storedScheme = localStorage.getItem('clarity-color-scheme');
    return (storedScheme as ColorScheme) || 'lavender';
  });
  
  const [backgroundImage, setBackgroundImageState] = useState<string | null>(() => {
    return localStorage.getItem('clarity-bg-image');
  });

  // Update localStorage and DOM when theme changes
  useEffect(() => {
    localStorage.setItem('clarity-theme', theme);
    
    // Update the document class for dark mode
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Update localStorage and data attribute when color scheme changes
  useEffect(() => {
    localStorage.setItem('clarity-color-scheme', colorScheme);
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
  }, [colorScheme]);

  // Update localStorage when background image changes
  useEffect(() => {
    if (backgroundImage) {
      localStorage.setItem('clarity-bg-image', backgroundImage);
    } else {
      localStorage.removeItem('clarity-bg-image');
    }
  }, [backgroundImage]);

  // Check system preference on mount
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (!localStorage.getItem('clarity-theme')) {
      setThemeState(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setColorScheme = (newScheme: ColorScheme) => {
    setColorSchemeState(newScheme);
  };

  const setBackgroundImage = (image: string | null) => {
    setBackgroundImageState(image);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        colorScheme,
        setColorScheme,
        backgroundImage,
        setBackgroundImage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
