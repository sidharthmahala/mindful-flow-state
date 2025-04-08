
export type TaskMood = 'great' | 'good' | 'neutral' | 'difficult' | 'challenging';

export type TaskCategory = 'today' | 'rituals' | 'someday';

export interface Task {
  id: string;
  text: string;
  why?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  mood?: TaskMood;
  category: TaskCategory;
  date?: string; // ISO date string for scheduled tasks
}
