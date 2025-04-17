
import { Leaf, PanelLeft, User, Home } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { useSidebar } from './ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NavBar = () => {
  const { toggleSidebar } = useSidebar();
  const { user, userProfile, signOut } = useAuth();
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
          <Button
            variant="ghost"
            className="flex items-center"
            onClick={() => navigate('/')}
          >
            <Leaf className="mr-2 text-[#64d8a3] w-5 h-5" />
            <span className="text-xl font-semibold text-foreground">Clarity</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{userProfile?.fullName || user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/complete-profile')}>
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate('/auth')}
                className="bg-[#64d8a3] hover:bg-[#50c090]"
              >
                Login
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
