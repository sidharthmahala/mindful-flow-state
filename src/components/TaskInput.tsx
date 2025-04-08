
import { useState, KeyboardEvent } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { TaskCategory, TaskPriority, TaskProject, TaskLabel } from '@/types/task';
import { PenLine, Info, Calendar, Tag, Briefcase, Repeat } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { parseTaskText } from '@/lib/task-parser';

interface TaskInputProps {
  category: TaskCategory;
}

const TaskInput: React.FC<TaskInputProps> = ({ category }) => {
  const [taskText, setTaskText] = useState('');
  const [taskWhy, setTaskWhy] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [priority, setPriority] = useState<TaskPriority>(null);
  const [project, setProject] = useState<TaskProject>(null);
  const [label, setLabel] = useState<TaskLabel>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [recurring, setRecurring] = useState<'daily' | 'weekly' | 'monthly' | null>(null);
  
  const { addTask } = useTaskContext();

  const handleSubmit = () => {
    if (taskText.trim()) {
      // Extract date string if set
      const dateString = date ? date.toISOString().split('T')[0] : undefined;
      
      addTask(
        taskText, 
        category, 
        taskWhy, 
        priority, 
        project, 
        label, 
        dateString, 
        recurring
      );
      
      // Reset form
      setTaskText('');
      setTaskWhy('');
      setPriority(null);
      setProject(null);
      setLabel(null);
      setDate(undefined);
      setRecurring(null);
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

  const handleTaskTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setTaskText(newText);
    
    // Parse the task text for natural language input
    if (newText.includes('!') || newText.includes('@') || newText.includes('#') || 
        newText.includes('today') || newText.includes('tomorrow') || 
        newText.includes('daily') || newText.includes('weekly')) {
      
      const parsedInfo = parseTaskText(newText);
      
      if (parsedInfo.priority) setPriority(parsedInfo.priority);
      if (parsedInfo.project) setProject(parsedInfo.project);
      if (parsedInfo.label) setLabel(parsedInfo.label);
      if (parsedInfo.date) {
        setDate(new Date(parsedInfo.date));
      }
      if (parsedInfo.recurring) setRecurring(parsedInfo.recurring);
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
          onChange={handleTaskTextChange}
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
          
          <div className="flex flex-wrap gap-2 mb-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={priority ? "border-primary" : ""}>
                  <Tag className="w-4 h-4 mr-1" />
                  {priority ? priorityLabels[priority] : "Priority"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Select Priority</h4>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn("justify-start", priority === 'must' ? "bg-red-50" : "")}
                      onClick={() => setPriority('must')}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                      Must Do
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn("justify-start", priority === 'should' ? "bg-amber-50" : "")}
                      onClick={() => setPriority('should')}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                      Should Do
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn("justify-start", priority === 'nice' ? "bg-green-50" : "")}
                      onClick={() => setPriority('nice')}
                    >
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                      Nice to Do
                    </Button>
                    {priority && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="justify-start text-muted-foreground"
                        onClick={() => setPriority(null)}
                      >
                        Clear Priority
                      </Button>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={project ? "border-primary" : ""}>
                  <Briefcase className="w-4 h-4 mr-1" />
                  {project || "Project"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Select Project</h4>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn("justify-start", project === 'work' ? "bg-blue-50" : "")}
                      onClick={() => setProject('work')}
                    >
                      Work
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn("justify-start", project === 'personal' ? "bg-blue-50" : "")}
                      onClick={() => setProject('personal')}
                    >
                      Personal
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn("justify-start", project === 'side-hustle' ? "bg-blue-50" : "")}
                      onClick={() => setProject('side-hustle')}
                    >
                      Side Hustle
                    </Button>
                    {project && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="justify-start text-muted-foreground"
                        onClick={() => setProject(null)}
                      >
                        Clear Project
                      </Button>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={label ? "border-primary" : ""}>
                  <Tag className="w-4 h-4 mr-1" />
                  {label || "Label"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Select Label</h4>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn("justify-start", label === 'deep-work' ? "bg-purple-50" : "")}
                      onClick={() => setLabel('deep-work')}
                    >
                      Deep Work
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn("justify-start", label === 'errands' ? "bg-purple-50" : "")}
                      onClick={() => setLabel('errands')}
                    >
                      Errands
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn("justify-start", label === 'quick-win' ? "bg-purple-50" : "")}
                      onClick={() => setLabel('quick-win')}
                    >
                      Quick Win
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn("justify-start", label === 'focus' ? "bg-purple-50" : "")}
                      onClick={() => setLabel('focus')}
                    >
                      Focus
                    </Button>
                    {label && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="justify-start text-muted-foreground"
                        onClick={() => setLabel(null)}
                      >
                        Clear Label
                      </Button>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={date ? "border-primary" : ""}>
                  <Calendar className="w-4 h-4 mr-1" />
                  {date ? date.toLocaleDateString() : "Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className={recurring ? "border-primary" : ""}>
                  <Repeat className="w-4 h-4 mr-1" />
                  {recurring ? `${recurring.charAt(0).toUpperCase() + recurring.slice(1)}` : "Recurring"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Repeat Pattern</h4>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn("justify-start", recurring === 'daily' ? "bg-teal-50" : "")}
                      onClick={() => setRecurring('daily')}
                    >
                      Daily
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn("justify-start", recurring === 'weekly' ? "bg-teal-50" : "")}
                      onClick={() => setRecurring('weekly')}
                    >
                      Weekly
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn("justify-start", recurring === 'monthly' ? "bg-teal-50" : "")}
                      onClick={() => setRecurring('monthly')}
                    >
                      Monthly
                    </Button>
                    {recurring && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="justify-start text-muted-foreground"
                        onClick={() => setRecurring(null)}
                      >
                        No Repetition
                      </Button>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="text-xs text-muted-foreground mb-3">
            <Info className="w-3 h-3 inline mr-1" />
            <span>Pro tip: Try natural language like "Submit report by Friday !important @work #deep-work"</span>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              className="text-sm"
              onClick={() => {
                setIsExpanded(false);
                setTaskText('');
                setTaskWhy('');
                setPriority(null);
                setProject(null);
                setLabel(null);
                setDate(undefined);
                setRecurring(null);
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

// Helper for conditional classNames
const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(' ');
};

// Priority labels for display
const priorityLabels: Record<TaskPriority, string> = {
  'must': 'Must Do',
  'should': 'Should Do',
  'nice': 'Nice to Do',
  'null': 'Priority'
};

export default TaskInput;
