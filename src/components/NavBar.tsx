
import { Leaf, PanelLeft } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { useSidebar } from './ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full border-b border-border/50 bg-background/80 backdrop-blur-sm fixed top-0 z-50">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-2 h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground flex items-center">
            <Leaf className="mr-2 text-[#64d8a3] w-5 h-5" />
            <span>Clarity</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {!user && (
            <Button 
              size="sm" 
              onClick={() => navigate('/auth')}
              className="bg-[#64d8a3] hover:bg-[#50c090]"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
