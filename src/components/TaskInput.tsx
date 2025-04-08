
import { useState, KeyboardEvent } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { TaskCategory } from '@/types/task';
import { PenLine } from 'lucide-react';

interface TaskInputProps {
  category: TaskCategory;
}

const TaskInput: React.FC<TaskInputProps> = ({ category }) => {
  const [taskText, setTaskText] = useState('');
  const [taskWhy, setTaskWhy] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { addTask } = useTaskContext();

  const handleSubmit = () => {
    if (taskText.trim()) {
      addTask(taskText, category, taskWhy);
      setTaskText('');
      setTaskWhy('');
      setIsExpanded(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isExpanded) {
        if (taskText.trim()) {
          handleSubmit();
        }
      } else {
        setIsExpanded(true);
      }
    }
  };

  return (
    <div 
      className={`task-input-container zen-card p-4 mb-4 ${
        isExpanded ? 'h-auto' : 'h-14'
      }`}
    >
      <div className="flex items-center">
        <input
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={`Add a ${category === 'rituals' ? 'ritual' : 'task'}...`}
          className="task-input"
          onFocus={() => setIsExpanded(true)}
        />
        {!isExpanded && (
          <PenLine className="text-muted-foreground w-4 h-4 mr-2" />
        )}
      </div>
      
      {isExpanded && (
        <div className="mt-3 animate-fade-in">
          <div className="mb-3">
            <textarea
              value={taskWhy}
              onChange={(e) => setTaskWhy(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Why does this matter to you? (optional)"
              className="task-input resize-none h-20 px-3 py-2 bg-muted/30 rounded-md w-full"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              className="text-sm"
              onClick={() => {
                setIsExpanded(false);
                setTaskText('');
                setTaskWhy('');
              }}
            >
              Cancel
            </Button>
            <Button 
              className="text-sm bg-zen hover:bg-zen-focus text-zen-foreground"
              onClick={handleSubmit}
            >
              Add {category === 'rituals' ? 'Ritual' : 'Task'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskInput;
