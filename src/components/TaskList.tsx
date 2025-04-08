
import { useTaskContext } from '@/contexts/TaskContext';
import TaskItem from './TaskItem';
import { TaskCategory } from '@/types/task';
import { Button } from '@/components/ui/button';
import { CalendarDays, ArrowUpCircle } from 'lucide-react';
import PlantGrowth from './PlantGrowth';
import { useState } from 'react';

interface TaskListProps {
  category: TaskCategory;
}

const TaskList: React.FC<TaskListProps> = ({ category }) => {
  const { getTasksByCategory, getConsistencyStreak, getOverdueTasks, moveTasksToToday } = useTaskContext();
  const [showCompleted, setShowCompleted] = useState(false);
  
  const tasks = getTasksByCategory(category);
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const consistencyStreak = getConsistencyStreak();
  const overdueTasks = getOverdueTasks();
  
  const handleMoveOverdueTasks = () => {
    moveTasksToToday(overdueTasks.map(task => task.id));
  };

  if (tasks.length === 0 && overdueTasks.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p className="mb-2">No {category === 'rituals' ? 'rituals' : 'tasks'} yet</p>
        <p className="text-sm">
          {category === 'today' && "What's one small thing you can do today?"}
          {category === 'rituals' && "Add daily rituals to build consistent habits"}
          {category === 'someday' && "Capture ideas for the future without pressure"}
        </p>
      </div>
    );
  }

  return (
    <div>
      {consistencyStreak > 1 && category === 'today' && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/30 text-green-700 dark:text-green-300 flex items-center justify-between">
          <div className="flex items-center">
            <CalendarDays className="w-5 h-5 mr-2 text-green-500 dark:text-green-400" />
            <span>
              You've been consistent for <strong>{consistencyStreak} days</strong>. That's growth! 🌱
            </span>
          </div>
        </div>
      )}
      
      {overdueTasks.length > 0 && category === 'today' && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800/30 text-amber-700 dark:text-amber-300">
          <p className="mb-2 font-medium flex items-center">
            <ArrowUpCircle className="w-4 h-4 mr-2" />
            You have {overdueTasks.length} {overdueTasks.length === 1 ? 'task' : 'tasks'} from earlier days
          </p>
          <Button 
            variant="outline" 
            size="sm"
            className="border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/30"
            onClick={handleMoveOverdueTasks}
          >
            Move to Today
          </Button>
        </div>
      )}
      
      {category === 'today' && (
        <PlantGrowth />
      )}
      
      {activeTasks.length > 0 && (
        <div className="mb-6">
          {activeTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <button 
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center mb-3"
          >
            {showCompleted ? "Hide completed" : "Show completed"} • {completedTasks.length}
          </button>
          
          {showCompleted && (
            <div className="space-y-3 opacity-80">
              {completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskList;
