
import { useState, useEffect } from 'react';
import { TaskProvider } from '@/contexts/TaskContext';
import TaskInput from '@/components/TaskInput';
import TaskList from '@/components/TaskList';
import UpcomingView from '@/components/UpcomingView';
import MindDump from '@/components/MindDump';
import AppHeader from '@/components/AppHeader';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Leaf } from 'lucide-react';
import { TaskCategory } from '@/types/task';

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>('today');
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

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
          <MindDump />
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
    <TaskProvider>
      <div className="min-h-screen flex flex-col items-center bg-background">
        {!mounted ? (
          <div className="fixed inset-0 flex items-center justify-center">
            <Leaf className="w-10 h-10 text-zen animate-pulse-light" />
          </div>
        ) : (
          <div className="container max-w-md px-4 py-8">
            <AppHeader 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              appName="Clarity"
              tabs={[
                { id: 'today', label: 'Today' },
                { id: 'rituals', label: 'Rituals' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'someday', label: 'Someday' },
                { id: 'notes', label: 'Notes' }
              ]}
            />
            {getTabContent()}

            <footer className="mt-auto pt-10 pb-4 text-center text-xs text-muted-foreground">
              <p>
                "Small steps, taken consistently, create lasting change."
              </p>
            </footer>
          </div>
        )}
      </div>
    </TaskProvider>
  );
};

export default Index;
