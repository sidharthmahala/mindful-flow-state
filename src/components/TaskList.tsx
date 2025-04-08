
import { useTaskContext } from '@/contexts/TaskContext';
import TaskItem from './TaskItem';
import { TaskCategory } from '@/types/task';

interface TaskListProps {
  category: TaskCategory;
}

const TaskList: React.FC<TaskListProps> = ({ category }) => {
  const { getTasksByCategory } = useTaskContext();
  
  const tasks = getTasksByCategory(category);
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  if (tasks.length === 0) {
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
