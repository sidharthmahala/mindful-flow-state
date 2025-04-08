
import { useState } from 'react';
import { Task, TaskMood } from '@/types/task';
import { useTaskContext } from '@/contexts/TaskContext';
import { Check, X, Coffee, Star, AlertCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const moodIcons = {
  great: <Star className="w-4 h-4 text-amber-400" />,
  good: <Check className="w-4 h-4 text-green-500" />,
  neutral: <Coffee className="w-4 h-4 text-blue-400" />,
  difficult: <AlertCircle className="w-4 h-4 text-orange-400" />,
  challenging: <X className="w-4 h-4 text-red-400" />
};

const moodLabels = {
  great: "Great",
  good: "Good",
  neutral: "Neutral",
  difficult: "Difficult",
  challenging: "Challenging"
};

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { completeTask, uncompleteTask, deleteTask } = useTaskContext();
  const [expanded, setExpanded] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [isBeingRemoved, setIsBeingRemoved] = useState(false);

  const handleComplete = () => {
    if (task.completed) {
      uncompleteTask(task.id);
    } else {
      setShowMoodSelector(true);
    }
  };

  const handleMoodSelect = (mood: TaskMood) => {
    completeTask(task.id, mood);
    setShowMoodSelector(false);
  };

  const handleDelete = () => {
    setIsBeingRemoved(true);
    // Delay actual deletion to allow animation to complete
    setTimeout(() => {
      deleteTask(task.id);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isBeingRemoved ? 0 : 1, y: isBeingRemoved ? 10 : 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "zen-card mb-3 overflow-hidden",
        task.completed ? "border-zen-secondary bg-zen-light/30" : ""
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <button
            onClick={handleComplete}
            className={cn(
              "mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 mr-3 zen-micro-animate",
              task.completed 
                ? "bg-zen border-zen" 
                : "border-zen hover:border-zen-focus"
            )}
          >
            {task.completed && task.mood && moodIcons[task.mood]}
          </button>
          
          <div className="flex-grow">
            <p 
              className={cn(
                "text-md leading-tight font-medium mb-1",
                task.completed ? "line-through text-muted-foreground" : ""
              )}
            >
              {task.text}
            </p>
            
            {task.completed && task.mood && (
              <div className="text-xs flex items-center text-muted-foreground">
                <span>Completed • Felt: {moodLabels[task.mood]}</span>
              </div>
            )}
            
            {task.why && (
              <div className="mt-1">
                <button 
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {expanded ? (
                    <>Hide why <ChevronUp className="w-3 h-3 ml-1" /></>
                  ) : (
                    <>Show why <ChevronDown className="w-3 h-3 ml-1" /></>
                  )}
                </button>
                
                {expanded && (
                  <div className="mt-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded animate-fade-in">
                    {task.why}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {!showMoodSelector && (
            <button
              onClick={handleDelete}
              className="text-muted-foreground hover:text-destructive transition-colors ml-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {showMoodSelector && (
          <div className="mt-3 animate-fade-in">
            <p className="text-sm mb-2">How did completing this task feel?</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-amber-500 border-amber-200 hover:bg-amber-50"
                onClick={() => handleMoodSelect('great')}
              >
                <Star className="w-3 h-3 mr-1" /> Great
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-green-500 border-green-200 hover:bg-green-50"
                onClick={() => handleMoodSelect('good')}
              >
                <Check className="w-3 h-3 mr-1" /> Good
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-blue-400 border-blue-200 hover:bg-blue-50"
                onClick={() => handleMoodSelect('neutral')}
              >
                <Coffee className="w-3 h-3 mr-1" /> Neutral
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-orange-400 border-orange-200 hover:bg-orange-50"
                onClick={() => handleMoodSelect('difficult')}
              >
                <AlertCircle className="w-3 h-3 mr-1" /> Difficult
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-400 border-red-200 hover:bg-red-50"
                onClick={() => handleMoodSelect('challenging')}
              >
                <X className="w-3 h-3 mr-1" /> Challenging
              </Button>
            </div>
            <div className="mt-2 text-right">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowMoodSelector(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TaskItem;
