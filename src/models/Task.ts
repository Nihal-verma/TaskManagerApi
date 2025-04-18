export interface Task {
  id: string|number;
  title: string;
  description: string;
  status: 'not started' | 'in progress' | 'done';
  dueDate: Date;
  priority: string;
  estimatedTime: number;
  attachmentPath: string | null;
  recurrence: 'daily' | 'weekly' | 'monthly' | null;
  recurrenceEndDate: Date | null;
  category: string;
  dependencies: string[];
  assignedTo: string | null;
}