
export type TaskMood = 'great' | 'good' | 'neutral' | 'difficult' | 'challenging' | 'energizing' | 'draining' | 'creative';

export type TaskCategory = 'today' | 'rituals' | 'someday';

export type TaskPriority = 'must' | 'should' | 'nice' | null;

export type TaskProject = 'work' | 'personal' | 'side-hustle' | null;

export type TaskLabel = 'deep-work' | 'errands' | 'quick-win' | 'focus' | null;

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
  priority?: TaskPriority;
  project?: TaskProject;
  label?: TaskLabel;
  recurring?: 'daily' | 'weekly' | 'monthly' | null;
  section?: string;
  dueDate?: string; // ISO date string for deadline
  isOverdue?: boolean;
}
