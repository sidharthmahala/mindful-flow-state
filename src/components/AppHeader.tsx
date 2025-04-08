
import { Sun, Moon, Calendar, Leaf, ListChecks } from 'lucide-react';

interface AppHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appName?: string;
  tabs?: Array<{ id: string; label: string }>;
}

const AppHeader: React.FC<AppHeaderProps> = ({ activeTab, setActiveTab, appName = 'ZenDo', tabs }) => {
  const defaultTabs = [
    { id: 'today', label: 'Today', icon: Sun },
    { id: 'rituals', label: 'Daily Rituals', icon: ListChecks },
    { id: 'someday', label: 'Someday/Maybe', icon: Calendar }
  ];

  const navTabs = tabs || defaultTabs;
  
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-semibold text-foreground flex items-center mb-6">
        <Leaf className="mr-2 text-zen w-6 h-6" />
        <span>{appName}</span>
      </h1>
      
      <nav className="flex border-b border-border">
        {navTabs.map(tab => {
          const Icon = tab.icon || (
            tab.id === 'today' ? Sun :
            tab.id === 'rituals' ? ListChecks :
            tab.id === 'upcoming' ? Calendar :
            tab.id === 'someday' ? Calendar :
            tab.id === 'notes' ? Moon : Sun
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
