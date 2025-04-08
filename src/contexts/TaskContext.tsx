
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, TaskCategory, TaskMood, TaskPriority, TaskProject, TaskLabel } from '@/types/task';
import { useToast } from '@/hooks/use-toast';
import { parseTaskText } from '@/lib/task-parser';

interface TaskContextType {
  tasks: Task[];
  addTask: (text: string, category: TaskCategory, why?: string, priority?: TaskPriority, project?: TaskProject, label?: TaskLabel, date?: string, recurring?: 'daily' | 'weekly' | 'monthly' | null) => void;
  completeTask: (id: string, mood?: TaskMood) => void;
  uncompleteTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  getTasksByCategory: (category: TaskCategory) => Task[];
  getTasksByProject: (project: TaskProject) => Task[];
  getTasksByLabel: (label: TaskLabel) => Task[];
  getTasksByPriority: (priority: TaskPriority) => Task[];
  getTasksByDate: (date: string) => Task[];
  getOverdueTasks: () => Task[];
  moveTasksToToday: (taskIds: string[]) => void;
  getRecurringTasks: () => Task[];
  getConsistencyStreak: () => number;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('clarity-tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Failed to parse tasks from localStorage:', e);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('clarity-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Check for overdue tasks
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.dueDate && task.dueDate < today && !task.completed) {
          return { ...task, isOverdue: true };
        }
        return task;
      })
    );
  }, []);

  const addTask = (
    text: string, 
    category: TaskCategory, 
    why?: string, 
    priority?: TaskPriority, 
    project?: TaskProject, 
    label?: TaskLabel,
    date?: string,
    recurring?: 'daily' | 'weekly' | 'monthly' | null
  ) => {
    if (!text.trim()) return;
    
    // Parse the task text for dates, priorities, etc.
    const parsedInfo = parseTaskText(text);
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: parsedInfo.text || text.trim(),
      why: why?.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      category,
      date: parsedInfo.date || date,
      dueDate: parsedInfo.dueDate,
      priority: parsedInfo.priority || priority,
      project: parsedInfo.project || project,
      label: parsedInfo.label || label,
      recurring: parsedInfo.recurring || recurring,
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
    
    toast({
      title: "Task added",
      description: "Your intention has been captured.",
      duration: 2000,
    });
  };

  const completeTask = (id: string, mood?: TaskMood) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === id) {
          // Handle recurring tasks
          if (task.recurring) {
            const completedTask = { 
              ...task, 
              completed: true, 
              completedAt: new Date().toISOString(), 
              mood 
            };
            
            // Create next occurrence of recurring task
            const nextDate = getNextRecurringDate(task.date, task.recurring);
            const nextDueDate = task.dueDate ? getNextRecurringDate(task.dueDate, task.recurring) : undefined;
            
            const newRecurringTask = {
              ...task,
              id: crypto.randomUUID(),
              completed: false,
              completedAt: undefined,
              mood: undefined,
              date: nextDate,
              dueDate: nextDueDate,
              isOverdue: false
            };
            
            // Add the new recurring task
            setTimeout(() => {
              setTasks(prev => [...prev, newRecurringTask]);
            }, 500);
            
            return completedTask;
          }
          
          return { 
            ...task, 
            completed: true, 
            completedAt: new Date().toISOString(), 
            mood 
          };
        }
        return task;
      })
    );

    toast({
      title: "Task completed",
      description: "Well done on making progress.",
      duration: 2000,
    });
  };

  const uncompleteTask = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id
          ? { ...task, completed: false, completedAt: undefined, mood: undefined }
          : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    
    toast({
      title: "Task removed",
      description: "The task has been removed from your list.",
      duration: 2000,
    });
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  const getTasksByCategory = (category: TaskCategory) => {
    return tasks.filter((task) => task.category === category);
  };

  const getTasksByProject = (project: TaskProject) => {
    return tasks.filter((task) => task.project === project);
  };

  const getTasksByLabel = (label: TaskLabel) => {
    return tasks.filter((task) => task.label === label);
  };

  const getTasksByPriority = (priority: TaskPriority) => {
    return tasks.filter((task) => task.priority === priority);
  };

  const getTasksByDate = (date: string) => {
    return tasks.filter((task) => task.date === date || task.dueDate === date);
  };

  const getOverdueTasks = () => {
    return tasks.filter((task) => task.isOverdue && !task.completed);
  };

  const moveTasksToToday = (taskIds: string[]) => {
    const today = new Date().toISOString().split('T')[0];
    
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        taskIds.includes(task.id)
          ? { ...task, date: today, category: 'today', isOverdue: false }
          : task
      )
    );
    
    toast({
      title: "Tasks moved to today",
      description: `${taskIds.length} ${taskIds.length === 1 ? 'task has' : 'tasks have'} been moved to today.`,
      duration: 2000,
    });
  };

  const getRecurringTasks = () => {
    return tasks.filter((task) => task.recurring !== null && task.recurring !== undefined);
  };

  const getConsistencyStreak = () => {
    // Logic to calculate streak based on completed tasks
    const sortedCompletedTasks = tasks
      .filter(task => task.completed && task.completedAt)
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());

    if (sortedCompletedTasks.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date(sortedCompletedTasks[sortedCompletedTasks.length - 1].completedAt!);
    currentDate.setHours(0, 0, 0, 0);

    for (let i = sortedCompletedTasks.length - 2; i >= 0; i--) {
      const taskDate = new Date(sortedCompletedTasks[i].completedAt!);
      taskDate.setHours(0, 0, 0, 0);
      
      const daysBetween = Math.floor((currentDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysBetween === 1) {
        streak++;
        currentDate = taskDate;
      } else if (daysBetween > 1) {
        break;
      }
    }

    return streak;
  };

  // Helper function to calculate next recurring date
  const getNextRecurringDate = (dateStr: string | undefined, recurrence: 'daily' | 'weekly' | 'monthly') => {
    if (!dateStr) return undefined;
    
    const date = new Date(dateStr);
    
    if (recurrence === 'daily') {
      date.setDate(date.getDate() + 1);
    } else if (recurrence === 'weekly') {
      date.setDate(date.getDate() + 7);
    } else if (recurrence === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    }
    
    return date.toISOString().split('T')[0];
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        completeTask,
        uncompleteTask,
        deleteTask,
        updateTask,
        getTasksByCategory,
        getTasksByProject,
        getTasksByLabel,
        getTasksByPriority,
        getTasksByDate,
        getOverdueTasks,
        moveTasksToToday,
        getRecurringTasks,
        getConsistencyStreak
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
