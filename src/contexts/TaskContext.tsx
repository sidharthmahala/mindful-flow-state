
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, TaskCategory, TaskMood } from '@/types/task';
import { useToast } from '@/hooks/use-toast';

interface TaskContextType {
  tasks: Task[];
  addTask: (text: string, category: TaskCategory, why?: string) => void;
  completeTask: (id: string, mood?: TaskMood) => void;
  uncompleteTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  getTasksByCategory: (category: TaskCategory) => Task[];
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
    const savedTasks = localStorage.getItem('zendo-tasks');
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
    localStorage.setItem('zendo-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text: string, category: TaskCategory, why?: string) => {
    if (!text.trim()) return;
  
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      why: why?.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      category
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
      prevTasks.map((task) =>
        task.id === id
          ? { ...task, completed: true, completedAt: new Date().toISOString(), mood }
          : task
      )
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

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        completeTask,
        uncompleteTask,
        deleteTask,
        updateTask,
        getTasksByCategory
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
