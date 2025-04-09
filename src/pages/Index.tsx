
import { useState, useEffect } from 'react';
import { TaskProvider } from '@/contexts/TaskContext';
import TaskInput from '@/components/TaskInput';
import TaskList from '@/components/TaskList';
import UpcomingView from '@/components/UpcomingView';
import EnhancedMindDump from '@/components/EnhancedMindDump';
import NavBar from '@/components/NavBar';
import AppSidebar from '@/components/AppSidebar';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { TaskCategory } from '@/types/task';
import { useTheme } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/components/ui/sidebar';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState<string>('today');
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();
  const { backgroundImage } = useTheme();

  // Animation control to ensure components only animate after initial mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Welcome message on first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('clarity-visited');
    
    if (!hasVisitedBefore) {
      setTimeout(() => {
        toast({
          title: "Welcome to Clarity",
          description: "Your mindful productivity companion. Add your first task to get started.",
          duration: 5000,
        });
        localStorage.setItem('clarity-visited', 'true');
      }, 1000);
    }
  }, [toast]);

  const getTabContent = () => {
    if (activeTab === 'upcoming') {
      return (
        <motion.div
          key="upcoming"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <UpcomingView />
        </motion.div>
      );
    }
    
    if (activeTab === 'notes') {
      return (
        <motion.div
          key="notes"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <EnhancedMindDump />
        </motion.div>
      );
    }
    
    // Default for today, rituals, and someday
    const category = activeTab as TaskCategory;
    return (
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6"
      >
        <TaskInput category={category} />
        <TaskList category={category} />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!mounted ? (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="w-10 h-10 animate-pulse-light bg-primary/80 rounded-full"></div>
        </div>
      ) : (
        <SidebarProvider defaultOpen={true}>
          <div className="flex w-full min-h-screen">
            <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <div className="flex-1 flex flex-col">
              <NavBar />
              
              <div className="flex-1 container max-w-3xl px-4 py-6">
                {/* Tab Title */}
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h2>
                
                {getTabContent()}
                
                <footer className="mt-auto pt-10 pb-4 text-center text-xs text-muted-foreground">
                  <p>
                    "Small steps, taken consistently, create lasting change."
                  </p>
                </footer>
              </div>
            </div>
          </div>
          
          {backgroundImage && (
            <div 
              className="fixed inset-0 -z-10 opacity-25 dark:opacity-15" 
              style={{ 
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }} 
            />
          )}
        </SidebarProvider>
      )}
    </div>
  );
};

const Index = () => {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
};

export default Index;
