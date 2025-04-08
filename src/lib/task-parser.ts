
import { TaskPriority, TaskProject, TaskLabel } from "@/types/task";

interface ParsedTaskInfo {
  text: string;
  date?: string;
  dueDate?: string;
  priority?: TaskPriority;
  project?: TaskProject;
  label?: TaskLabel;
  recurring?: 'daily' | 'weekly' | 'monthly' | null;
}

export const parseTaskText = (text: string): ParsedTaskInfo => {
  const result: ParsedTaskInfo = {
    text: text,
  };

  // Extract priority
  if (text.includes('!important') || text.includes('!must')) {
    result.priority = 'must';
    result.text = result.text.replace(/!important|!must/g, '').trim();
  } else if (text.includes('!should')) {
    result.priority = 'should';
    result.text = result.text.replace(/!should/g, '').trim();
  } else if (text.includes('!nice')) {
    result.priority = 'nice';
    result.text = result.text.replace(/!nice/g, '').trim();
  }

  // Extract project
  const projectMatch = text.match(/@(work|personal|side-hustle)/i);
  if (projectMatch) {
    result.project = projectMatch[1].toLowerCase() as TaskProject;
    result.text = result.text.replace(projectMatch[0], '').trim();
  }

  // Extract label
  const labelMatch = text.match(/#(deep-work|errands|quick-win|focus)/i);
  if (labelMatch) {
    result.label = labelMatch[1].toLowerCase() as TaskLabel;
    result.text = result.text.replace(labelMatch[0], '').trim();
  }

  // Extract dates
  // "by tomorrow" or "by Friday" pattern
  const byDateMatch = text.match(/by\s(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (byDateMatch) {
    result.dueDate = convertRelativeDate(byDateMatch[1]);
    result.text = result.text.replace(byDateMatch[0], '').trim();
  }

  // "tomorrow" or "next Friday" pattern
  const dateMatch = text.match(/(today|tomorrow|next\s+monday|next\s+tuesday|next\s+wednesday|next\s+thursday|next\s+friday|next\s+saturday|next\s+sunday)/i);
  if (dateMatch) {
    result.date = convertRelativeDate(dateMatch[1]);
    result.text = result.text.replace(dateMatch[0], '').trim();
  }

  // "every day" / "daily" pattern
  const recurringMatch = text.match(/(every day|daily|weekly|monthly|every week|every month)/i);
  if (recurringMatch) {
    const pattern = recurringMatch[1].toLowerCase();
    if (pattern === 'every day' || pattern === 'daily') {
      result.recurring = 'daily';
    } else if (pattern === 'every week' || pattern === 'weekly') {
      result.recurring = 'weekly';
    } else if (pattern === 'every month' || pattern === 'monthly') {
      result.recurring = 'monthly';
    }
    result.text = result.text.replace(recurringMatch[0], '').trim();
  }

  return result;
};

const convertRelativeDate = (relativeDate: string): string => {
  const today = new Date();
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  relativeDate = relativeDate.toLowerCase();
  
  if (relativeDate === 'today') {
    return today.toISOString().split('T')[0];
  }
  
  if (relativeDate === 'tomorrow') {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  // Handle "next X" format
  if (relativeDate.startsWith('next ')) {
    const dayName = relativeDate.replace('next ', '');
    const targetDayIndex = daysOfWeek.indexOf(dayName);
    if (targetDayIndex !== -1) {
      const currentDayIndex = today.getDay();
      let daysToAdd = targetDayIndex - currentDayIndex;
      if (daysToAdd <= 0) daysToAdd += 7; // If the day has passed this week, get next week's occurrence
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysToAdd);
      return targetDate.toISOString().split('T')[0];
    }
  }
  
  // Handle day name directly
  const dayIndex = daysOfWeek.indexOf(relativeDate);
  if (dayIndex !== -1) {
    const currentDayIndex = today.getDay();
    let daysToAdd = dayIndex - currentDayIndex;
    if (daysToAdd <= 0) daysToAdd += 7; // If the day has passed this week, get next week's occurrence
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    return targetDate.toISOString().split('T')[0];
  }
  
  return today.toISOString().split('T')[0]; // Default to today if parsing fails
};
