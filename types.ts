export interface Task {
  startTime: string;
  endTime: string;
  title: string;
  isDeepWork: boolean;
  isCompleted: boolean;
}

export interface DailyPlan {
  dayName: string;
  jalaliDate: string;
  tasks: Task[];
  totalMinutes: number;
  motivationalTip: string;
}

export interface DeferredTask {
  title: string;
  reason: string;
}

export interface WeeklySchedule {
  weeklyPlan: DailyPlan[];
  deferredTasks: DeferredTask[];
  notesAndSuggestions: string;
}

export interface StructuredTask {
  id: string;
  title: string;
  duration: number;
  durationUnit: 'minutes' | 'hours';
  priority: 'low' | 'medium' | 'high' | 'very-high';
  deadline: string;
  isDeepWork: boolean;
}

export interface FixedTask {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  days: string[];
}
