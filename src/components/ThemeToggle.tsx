
import { useState, useEffect } from 'react';
import { MoonStar, SunMoon, Palette } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle = () => {
  const { setTheme, theme, colorScheme, setColorScheme } = useTheme();
  
  const colorOptions = [
    { name: 'Calm', value: 'calm' as const },
    { name: 'Ocean', value: 'ocean' as const },
    { name: 'Forest', value: 'forest' as const },
    { name: 'Lavender', value: 'lavender' as const },
    { name: 'Sunset', value: 'sunset' as const },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 px-0">
          {theme === 'dark' ? <MoonStar className="h-[1.2rem] w-[1.2rem]" /> : <SunMoon className="h-[1.2rem] w-[1.2rem]" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <SunMoon className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <MoonStar className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <div className="px-2 py-2">
          <div className="text-xs text-muted-foreground mb-2 flex items-center">
            <Palette className="w-3 h-3 mr-1" />
            Color Scheme
          </div>
          <div className="grid grid-cols-5 gap-1">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                className={`w-6 h-6 rounded-full ${getColorClass(color.value)} ${
                  colorScheme === color.value ? 'ring-2 ring-offset-2 ring-ring' : ''
                }`}
                onClick={() => setColorScheme(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

function getColorClass(scheme: string): string {
  switch (scheme) {
    case 'calm': return 'bg-zen';
    case 'ocean': return 'bg-blue-400';
    case 'forest': return 'bg-green-500';
    case 'lavender': return 'bg-purple-400';
    case 'sunset': return 'bg-amber-400';
    default: return 'bg-zen';
  }
}
