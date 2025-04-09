
import { Leaf } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const NavBar = () => {
  return (
    <header className="w-full border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-foreground flex items-center">
            <Leaf className="mr-2 text-[#64d8a3] w-5 h-5" />
            <span>Clarity</span>
          </h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default NavBar;
