import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { TaskInput } from './components/TaskInput';
import { ScheduleDisplay } from './components/ScheduleDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import type { WeeklySchedule, Task, StructuredTask, FixedTask } from './types';
import { generateSchedule } from './services/geminiService';

const App: React.FC = () => {
  const [taskList, setTaskList] = useState<StructuredTask[]>([]);
  const [fixedTaskList, setFixedTaskList] = useState<FixedTask[]>([]);
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<{ dayIndex: number; taskIndex: number } | null>(null);

  const serializeTasksToString = (tasks: StructuredTask[], fixedTasks: FixedTask[]): string => {
    const priorityMap = {
      'low': 'کم',
      'medium': 'متوسط',
      'high': 'مهم',
      'very-high': 'خیلی مهم'
    };
    const unitMap = {
      'minutes': 'دقیقه',
      'hours': 'ساعت'
    };

    const regularTasksString = tasks.map(task => {
      let description = `"${task.title}" به مدت ${task.duration} ${unitMap[task.durationUnit]} با اولویت ${priorityMap[task.priority]}`;
      if (task.deadline) {
        description += ` و مهلت تا ${task.deadline}`;
      }
      if (task.isDeepWork) {
        description += " (نیازمند کار عمیق)";
      }
      return description;
    }).join('؛ ');

    let fixedTaskString = '';
    if (fixedTasks.length > 0) {
      fixedTaskString = "\n\nعلاوه بر این، کارهای ثابت زیر باید دقیقاً در زمان و روز مشخص شده قرار گیرند و غیرقابل جابجایی هستند: ";
      const descriptions = fixedTasks.map(ft => {
        return `"${ft.title}" در روزهای ${ft.days.join(' و ')} از ساعت ${ft.startTime} تا ${ft.endTime}`;
      });
      fixedTaskString += descriptions.join('؛ ');
    }

    return `لیست وظایف انعطاف‌پذیر من: ${regularTasksString}${fixedTaskString}`;
  };


  const handleGeneratePlan = useCallback(async () => {
    if (taskList.length === 0 && fixedTaskList.length === 0) {
      setError('لطفاً حداقل یک وظیفه برای برنامه‌ریزی اضافه کنید.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSchedule(null);
    try {
      const userInputString = serializeTasksToString(taskList, fixedTaskList);
      const generatedPlan = await generateSchedule(userInputString);
      setSchedule(generatedPlan);
    } catch (err) {
      console.error(err);
      setError('خطایی در ایجاد برنامه رخ داد. لطفاً دوباره تلاش کنید. ممکن است مشکل از کلید API باشد.');
    } finally {
      setIsLoading(false);
    }
  }, [taskList, fixedTaskList]);

  const handleAddTask = useCallback((task: Omit<StructuredTask, 'id'>) => {
    const newTask = { ...task, id: Date.now().toString() };
    setTaskList(prev => [...prev, newTask]);
  }, []);

  const handleRemoveTask = useCallback((taskId: string) => {
    setTaskList(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const handleAddFixedTask = useCallback((task: Omit<FixedTask, 'id'>) => {
    const newTask = { ...task, id: Date.now().toString() };
    setFixedTaskList(prev => [...prev, newTask]);
  }, []);

  const handleRemoveFixedTask = useCallback((taskId: string) => {
    setFixedTaskList(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const handleTaskToggle = useCallback((dayIndex: number, taskIndex: number) => {
    setSchedule(prevSchedule => {
      if (!prevSchedule) return null;
      
      const newWeeklyPlan = [...prevSchedule.weeklyPlan];
      const dayToUpdate = { ...newWeeklyPlan[dayIndex] };
      const tasksToUpdate = [...dayToUpdate.tasks];
      const taskToToggle = { ...tasksToUpdate[taskIndex] };

      taskToToggle.isCompleted = !taskToToggle.isCompleted;
      tasksToUpdate[taskIndex] = taskToToggle;
      dayToUpdate.tasks = tasksToUpdate;
      newWeeklyPlan[dayIndex] = dayToUpdate;

      return {
        ...prevSchedule,
        weeklyPlan: newWeeklyPlan,
      };
    });
  }, []);

  const handleStartEdit = useCallback((dayIndex: number, taskIndex: number) => {
    setEditingTask({ dayIndex, taskIndex });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingTask(null);
  }, []);

  const handleUpdateTask = useCallback((dayIndex: number, taskIndex: number, updatedTask: Task) => {
    setSchedule(prevSchedule => {
      if (!prevSchedule) return null;

      const newWeeklyPlan = [...prevSchedule.weeklyPlan];
      const dayToUpdate = { ...newWeeklyPlan[dayIndex] };
      const tasksToUpdate = [...dayToUpdate.tasks];
      
      tasksToUpdate[taskIndex] = updatedTask;
      dayToUpdate.tasks = tasksToUpdate;

      // Recalculate total minutes for the day
      dayToUpdate.totalMinutes = tasksToUpdate.reduce((total, task) => {
        try {
            const start = new Date(`1970-01-01T${task.startTime}:00`);
            const end = new Date(`1970-01-01T${task.endTime}:00`);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) return total;
            
            const duration = (end.getTime() - start.getTime()) / (1000 * 60);
            return total + (duration > 0 ? duration : 0);
        } catch(e) {
            console.error("Could not parse time for task", task, e);
            return total;
        }
      }, 0);

      newWeeklyPlan[dayIndex] = dayToUpdate;

      return {
        ...prevSchedule,
        weeklyPlan: newWeeklyPlan,
      };
    });
    setEditingTask(null); // Exit editing mode
  }, []);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8">
          <TaskInput
            tasks={taskList}
            fixedTasks={fixedTaskList}
            onAddTask={handleAddTask}
            onRemoveTask={handleRemoveTask}
            onAddFixedTask={handleAddFixedTask}
            onRemoveFixedTask={handleRemoveFixedTask}
            onGenerate={handleGeneratePlan}
            isLoading={isLoading}
          />

          {error && (
            <div className="mt-6 bg-red-800/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg text-center">
              <p>{error}</p>
            </div>
          )}

          {isLoading && <LoadingSpinner />}

          {schedule && !isLoading && (
            <div className="mt-8">
              <ScheduleDisplay 
                schedule={schedule} 
                onTaskToggle={handleTaskToggle}
                editingTask={editingTask}
                onStartEdit={handleStartEdit}
                onUpdateTask={handleUpdateTask}
                onCancelEdit={handleCancelEdit}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
