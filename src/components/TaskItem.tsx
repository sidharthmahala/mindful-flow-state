
import { useState, useRef, useEffect } from 'react';
import { Task, TaskMood, TaskPriority } from '@/types/task';
import { useTaskContext } from '@/contexts/TaskContext';
import { Check, X, Coffee, Star, AlertCircle, ChevronDown, ChevronUp, Trash2, Calendar, Tag, Briefcase, Edit, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import LeafAnimation from './ui/leaf-animation';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const moodIcons = {
  great: <Star className="w-4 h-4 text-amber-400" />,
  good: <Check className="w-4 h-4 text-green-500" />,
  neutral: <Coffee className="w-4 h-4 text-blue-400" />,
  difficult: <AlertCircle className="w-4 h-4 text-orange-400" />,
  challenging: <X className="w-4 h-4 text-red-400" />,
  energizing: <Star className="w-4 h-4 text-lime-400" />,
  draining: <Coffee className="w-4 h-4 text-purple-400" />,
  creative: <Star className="w-4 h-4 text-cyan-400" />
};

const moodLabels = {
  great: "Great",
  good: "Good",
  neutral: "Neutral",
  difficult: "Difficult",
  challenging: "Challenging",
  energizing: "Energizing",
  draining: "Draining",
  creative: "Creative"
};

const priorityColors = {
  must: "bg-red-100 text-red-600 border-red-200",
  should: "bg-amber-100 text-amber-600 border-amber-200",
  nice: "bg-green-100 text-green-600 border-green-200"
};

const priorityLabels = {
  must: "Must Do",
  should: "Should Do",
  nice: "Nice to Do"
};

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { completeTask, uncompleteTask, deleteTask, updateTask } = useTaskContext();
  const [expanded, setExpanded] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [isBeingRemoved, setIsBeingRemoved] = useState(false);
  const [showLeafAnimation, setShowLeafAnimation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editWhy, setEditWhy] = useState(task.why || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleComplete = () => {
    if (task.completed) {
      uncompleteTask(task.id);
    } else {
      setShowMoodSelector(true);
    }
  };

  const handleMoodSelect = (mood: TaskMood) => {
    setShowLeafAnimation(true);
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(task.text);
    setEditWhy(task.why || '');
  };

  const handleSaveEdit = () => {
    if (editText.trim()) {
      updateTask(task.id, { 
        text: editText.trim(),
        why: editWhy.trim() || undefined
      });
      setIsEditing(false);
    }
  };

  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isBeingRemoved ? 0 : 1, y: isBeingRemoved ? 10 : 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "zen-card mb-3 overflow-hidden",
        task.completed ? "border-zen-secondary bg-zen-light/30" : "",
        task.isOverdue && !task.completed ? "border-red-300 bg-red-50/30" : ""
      )}
    >
      <LeafAnimation 
        startAnimation={showLeafAnimation} 
        onComplete={() => setShowLeafAnimation(false)} 
      />
      
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
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  ref={inputRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-1 rounded bg-white/50"
                  placeholder="Task text"
                />
                <Textarea
                  value={editWhy}
                  onChange={(e) => setEditWhy(e.target.value)}
                  className="w-full p-1 rounded bg-white/50 min-h-[60px] text-sm"
                  placeholder="Why is this important? (optional)"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleSaveEdit}
                  >
                    <Save className="w-3 h-3 mr-1" /> Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p 
                  className={cn(
                    "text-md leading-tight font-medium mb-2",
                    task.completed ? "line-through text-muted-foreground" : ""
                  )}
                >
                  {task.text}
                </p>
                
                {task.why && (
                  <div className="mt-1 mb-2">
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
                
                <div className="flex flex-wrap gap-1 mb-1">
                  {task.priority && (
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full border",
                      priorityColors[task.priority]
                    )}>
                      {priorityLabels[task.priority]}
                    </span>
                  )}
                  
                  {task.project && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 border border-blue-200 flex items-center">
                      <Briefcase className="w-3 h-3 mr-1" />
                      {task.project}
                    </span>
                  )}
                  
                  {task.label && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 border border-purple-200 flex items-center">
                      <Tag className="w-3 h-3 mr-1" />
                      {task.label}
                    </span>
                  )}
                  
                  {(task.date || task.dueDate) && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {getFormattedDate(task.dueDate) || getFormattedDate(task.date)}
                    </span>
                  )}
                  
                  {task.recurring && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-600 border border-teal-200">
                      {task.recurring}
                    </span>
                  )}
                </div>
                
                {task.completed && task.mood && (
                  <div className="text-xs flex items-center text-muted-foreground mt-1">
                    <span>Completed • Felt: {moodLabels[task.mood]}</span>
                  </div>
                )}
              </>
            )}
          </div>
          
          {!showMoodSelector && !isEditing && (
            <div className="flex gap-1">
              {!task.completed && (
                <button
                  onClick={handleEdit}
                  className="text-muted-foreground hover:text-primary transition-colors ml-2"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="text-muted-foreground hover:text-destructive transition-colors ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
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
              <Button
                size="sm"
                variant="outline"
                className="text-lime-400 border-lime-200 hover:bg-lime-50"
                onClick={() => handleMoodSelect('energizing')}
              >
                <Star className="w-3 h-3 mr-1" /> Energizing
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-purple-400 border-purple-200 hover:bg-purple-50"
                onClick={() => handleMoodSelect('draining')}
              >
                <Coffee className="w-3 h-3 mr-1" /> Draining
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-cyan-400 border-cyan-200 hover:bg-cyan-50"
                onClick={() => handleMoodSelect('creative')}
              >
                <Star className="w-3 h-3 mr-1" /> Creative
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
