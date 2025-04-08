
import { useTaskContext } from '@/contexts/TaskContext';
import TaskItem from './TaskItem';
import { TaskCategory } from '@/types/task';
import { Button } from '@/components/ui/button';
import { CalendarDays, ArrowUpCircle } from 'lucide-react';

interface TaskListProps {
  category: TaskCategory;
}

const TaskList: React.FC<TaskListProps> = ({ category }) => {
  const { getTasksByCategory, getConsistencyStreak, getOverdueTasks, moveTasksToToday } = useTaskContext();
  
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
        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100 text-green-700 flex items-center justify-between">
          <div className="flex items-center">
            <CalendarDays className="w-5 h-5 mr-2 text-green-500" />
            <span>
              You've been consistent for <strong>{consistencyStreak} days</strong>. That's growth! 🌱
            </span>
          </div>
        </div>
      )}
      
      {overdueTasks.length > 0 && category === 'today' && (
        <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-700">
          <p className="mb-2 font-medium flex items-center">
            <ArrowUpCircle className="w-4 h-4 mr-2" />
            You have {overdueTasks.length} {overdueTasks.length === 1 ? 'task' : 'tasks'} from earlier days
          </p>
          <Button 
            variant="outline" 
            size="sm"
            className="border-amber-200 text-amber-700 hover:bg-amber-100"
            onClick={handleMoveOverdueTasks}
          >
            Move to Today
          </Button>
        </div>
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
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Completed • {completedTasks.length}
          </h3>
          {completedTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
