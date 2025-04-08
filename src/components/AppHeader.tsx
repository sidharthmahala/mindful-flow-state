
import { CheckCircle, Book, Calendar, Leaf, Star, Archive, MoonStar, SunMoon } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface AppHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appName?: string;
  tabs?: Array<{ id: string; label: string; icon?: React.ElementType }>;
}

const AppHeader: React.FC<AppHeaderProps> = ({ activeTab, setActiveTab, appName = 'ZenDo', tabs }) => {
  const defaultTabs = [
    { id: 'today', label: 'Today', icon: CheckCircle },
    { id: 'rituals', label: 'Daily Rituals', icon: Star },
    { id: 'someday', label: 'Someday/Maybe', icon: Archive }
  ];

  const navTabs = tabs || defaultTabs;
  
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
          <Leaf className="mr-2 text-zen w-6 h-6" />
          <span>{appName}</span>
        </h1>
        <ThemeToggle />
      </div>
      
      <nav className="flex border-b border-border">
        {navTabs.map(tab => {
          const Icon = tab.icon || (
            tab.id === 'today' ? CheckCircle :
            tab.id === 'rituals' ? Star :
            tab.id === 'upcoming' ? Calendar :
            tab.id === 'someday' ? Archive :
            tab.id === 'notes' ? Book : CheckCircle
          );
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-3 px-4 text-sm font-medium -mb-px transition-all ${
                activeTab === tab.id
                  ? 'text-zen border-b-2 border-zen'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};

export default AppHeader;
