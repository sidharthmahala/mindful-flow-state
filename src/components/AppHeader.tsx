
import { Sun, Moon, Calendar, Leaf, ListChecks } from 'lucide-react';

interface AppHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-semibold text-foreground flex items-center mb-6">
        <Leaf className="mr-2 text-zen w-6 h-6" />
        <span>ZenDo</span>
      </h1>
      
      <nav className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex items-center py-3 px-4 text-sm font-medium -mb-px transition-all ${
            activeTab === 'today'
              ? 'text-zen border-b-2 border-zen'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sun className="w-4 h-4 mr-2" />
          Today
        </button>
        
        <button
          onClick={() => setActiveTab('rituals')}
          className={`flex items-center py-3 px-4 text-sm font-medium -mb-px transition-all ${
            activeTab === 'rituals'
              ? 'text-zen border-b-2 border-zen'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ListChecks className="w-4 h-4 mr-2" />
          Daily Rituals
        </button>
        
        <button
          onClick={() => setActiveTab('someday')}
          className={`flex items-center py-3 px-4 text-sm font-medium -mb-px transition-all ${
            activeTab === 'someday'
              ? 'text-zen border-b-2 border-zen'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Someday/Maybe
        </button>
      </nav>
    </header>
  );
};

export default AppHeader;
