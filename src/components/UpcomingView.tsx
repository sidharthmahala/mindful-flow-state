
import { useTaskContext } from '@/contexts/TaskContext';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import TaskItem from './TaskItem';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';
import { DayContent } from 'react-day-picker';

const UpcomingView = () => {
  const { tasks } = useTaskContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<Task[]>([]);
  
  // Generate an array of dates that have tasks
  const datesWithTasks = tasks
    .filter(task => task.date || task.dueDate)
    .reduce((dates: string[], task) => {
      if (task.date && !dates.includes(task.date)) {
        dates.push(task.date);
      }
      if (task.dueDate && !dates.includes(task.dueDate)) {
        dates.push(task.dueDate);
      }
      return dates;
    }, []);
    
  // Find tasks for the selected date
  useEffect(() => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      const relevantTasks = tasks.filter(task => 
        (task.date === dateString || task.dueDate === dateString) && !task.completed
      );
      setTasksForSelectedDate(relevantTasks);
    } else {
      setTasksForSelectedDate([]);
    }
  }, [selectedDate, tasks]);
  
  // Helper to render different date views
  const renderCalendarDay = (day: Date) => {
    const dateString = day.toISOString().split('T')[0];
    const hasTask = datesWithTasks.includes(dateString);
    
    return (
      <div className={cn(
        "relative w-full h-full flex items-center justify-center",
        hasTask && "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full"
      )}>
        {day.getDate()}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-card dark:bg-card/70 rounded-xl shadow-sm p-4 border border-border/50">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="mx-auto pointer-events-auto"
          components={{
            Day: ({ date, ...props }) => (
              <Button
                {...props}
                variant="ghost"
                className={cn(
                  "h-9 w-9 p-0 font-normal",
                  datesWithTasks.includes(date.toISOString().split('T')[0]) &&
                  "bg-zen-light font-medium text-zen"
                )}
              >
                {renderCalendarDay(date)}
              </Button>
            )
          }}
        />
      </div>
      
      <div>
        {selectedDate && (
          <h2 className="text-lg font-medium mb-4">
            Tasks for {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
        )}
        
        {tasksForSelectedDate.length > 0 ? (
          <div className="space-y-3">
            {tasksForSelectedDate.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No tasks scheduled for this day</p>
            <p className="text-sm mt-1">Use "Add Task" to schedule something</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingView;
