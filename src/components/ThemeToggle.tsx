
import { MoonStar, SunMoon, Palette } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle = () => {
  const { setTheme, theme, colorScheme, setColorScheme } = useTheme();
  
  const colorOptions = [
    { name: 'Lavender', value: 'lavender' as const },
    { name: 'Mint', value: 'mint' as const },
    { name: 'Peach', value: 'peach' as const },
    { name: 'Sky', value: 'sky' as const },
    { name: 'Lemon', value: 'lemon' as const },
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
            <Palette className="w-3 h-3 mr-1 text-[#64d8a3]" />
            Color Scheme
          </div>
          <div className="grid grid-cols-5 gap-1">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                className={`w-6 h-6 rounded-full ${getColorClass(color.value)} ${
                  colorScheme === color.value ? 'ring-2 ring-offset-2 ring-[#64d8a3]' : ''
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
    case 'lavender': return 'bg-purple-200 dark:bg-purple-300';
    case 'mint': return 'bg-green-200 dark:bg-green-300';
    case 'peach': return 'bg-orange-200 dark:bg-orange-300';
    case 'sky': return 'bg-blue-200 dark:bg-blue-300';
    case 'lemon': return 'bg-yellow-200 dark:bg-yellow-300';
    default: return 'bg-purple-200 dark:bg-purple-300';
  }
}
