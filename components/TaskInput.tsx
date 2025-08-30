import React, { useState } from 'react';
import type { StructuredTask, FixedTask } from '../types';
import { BrainIcon, RepeatIcon } from './IconComponents';

interface TaskInputProps {
  tasks: StructuredTask[];
  fixedTasks: FixedTask[];
  onAddTask: (task: Omit<StructuredTask, 'id'>) => void;
  onRemoveTask: (taskId: string) => void;
  onAddFixedTask: (task: Omit<FixedTask, 'id'>) => void;
  onRemoveFixedTask: (taskId: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const WEEK_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

const VariableTaskForm: React.FC<{ onAddTask: TaskInputProps['onAddTask']; isLoading: boolean }> = ({ onAddTask, isLoading }) => {
    // ... existing form for variable tasks ...
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState<number | ''>('');
    const [durationUnit, setDurationUnit] = useState<'minutes' | 'hours'>('hours');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'very-high'>('medium');
    const [deadline, setDeadline] = useState('');
    const [isDeepWork, setIsDeepWork] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !duration) {
            setError('لطفاً عنوان و مدت زمان وظیفه را مشخص کنید.');
            return;
        }
        if (duration <= 0) {
            setError('مدت زمان باید یک عدد مثبت باشد.');
            return;
        }
        setError('');
        onAddTask({ title, duration, durationUnit, priority, deadline, isDeepWork });
        setTitle('');
        setDuration('');
        setDurationUnit('hours');
        setPriority('medium');
        setDeadline('');
        setIsDeepWork(false);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label htmlFor="task-title" className="block text-lg font-medium text-gray-200 mb-2">
                    افزودن وظیفه جدید (انعطاف‌پذیر)
                </label>
                <input
                    id="task-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="عنوان وظیفه (مثلاً: نوشتن گزارش فصلنامه)"
                    className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder-gray-500"
                    disabled={isLoading} required
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="task-duration" className="block text-sm font-medium text-gray-400 mb-1">مدت زمان</label>
                    <div className="flex">
                        <input id="task-duration" type="number" value={duration}
                            onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value, 10) : '')} min="1"
                            className="w-2/3 bg-gray-900/70 border border-gray-600 rounded-r-lg p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            disabled={isLoading} required
                        />
                        <select value={durationUnit} onChange={(e) => setDurationUnit(e.target.value as 'minutes' | 'hours')}
                            className="w-1/3 bg-gray-700 border border-l-0 border-gray-600 rounded-l-lg p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                            disabled={isLoading}
                        >
                            <option value="hours">ساعت</option>
                            <option value="minutes">دقیقه</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="task-priority" className="block text-sm font-medium text-gray-400 mb-1">اولویت</label>
                    <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                        disabled={isLoading}
                    >
                        <option value="low">کم</option>
                        <option value="medium">متوسط</option>
                        <option value="high">مهم</option>
                        <option value="very-high">خیلی مهم</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="task-deadline" className="block text-sm font-medium text-gray-400 mb-1">مهلت (اختیاری)</label>
                    <select id="task-deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                        className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                        disabled={isLoading}
                    >
                        <option value="">ندارد</option>
                        {WEEK_DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                </div>
            </div>
            <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer select-none">
                    <input type="checkbox" checked={isDeepWork} onChange={(e) => setIsDeepWork(e.target.checked)}
                        className="form-checkbox h-4 w-4 rounded bg-gray-800 border-gray-600 text-purple-400 focus:ring-purple-500" disabled={isLoading}
                    />
                    <BrainIcon className="w-5 h-5 text-purple-400" />
                    علامت‌گذاری به عنوان کار عمیق
                </label>
                <button type="submit" disabled={isLoading}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-5 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    افزودن وظیفه
                </button>
            </div>
            {error && <p className="text-red-400 text-sm text-left">{error}</p>}
        </form>
    );
};

const FixedTaskSection: React.FC<{ onAddFixedTask: TaskInputProps['onAddFixedTask']; isLoading: boolean }> = ({ onAddFixedTask, isLoading }) => {
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [days, setDays] = useState<string[]>([]);
    const [error, setError] = useState('');

    const toggleDay = (day: string) => {
        setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !startTime || !endTime || days.length === 0) {
            setError('لطفاً تمام فیلدها را پر کرده و حداقل یک روز را انتخاب کنید.');
            return;
        }
        if (startTime >= endTime) {
            setError('ساعت پایان باید بعد از ساعت شروع باشد.');
            return;
        }
        setError('');
        onAddFixedTask({ title, startTime, endTime, days });
        setTitle('');
        setStartTime('');
        setEndTime('');
        setDays([]);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-gray-800">
             <h3 className="text-lg font-medium text-gray-200">افزودن کار ثابت هفتگی</h3>
             <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان کار ثابت (مثلاً: جلسه هفتگی)"
                className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-500"
                disabled={isLoading} required
            />
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="start-time" className="block text-sm font-medium text-gray-400 mb-1">ساعت شروع</label>
                    <input id="start-time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                        className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-2 text-gray-200 focus:ring-1 focus:ring-indigo-500" disabled={isLoading} required />
                </div>
                <div>
                    <label htmlFor="end-time" className="block text-sm font-medium text-gray-400 mb-1">ساعت پایان</label>
                    <input id="end-time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                        className="w-full bg-gray-900/70 border border-gray-600 rounded-lg p-2 text-gray-200 focus:ring-1 focus:ring-indigo-500" disabled={isLoading} required />
                </div>
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-400 mb-2">انتخاب روزها</label>
                 <div className="flex flex-wrap gap-2">
                    {WEEK_DAYS.map(day => (
                        <button key={day} type="button" onClick={() => toggleDay(day)} disabled={isLoading}
                            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${days.includes(day) ? 'bg-indigo-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                            {day}
                        </button>
                    ))}
                 </div>
            </div>
            <div className="flex justify-end">
                 <button type="submit" disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg transition-colors disabled:opacity-50">
                    افزودن کار ثابت
                </button>
            </div>
            {error && <p className="text-red-400 text-sm text-left">{error}</p>}
        </form>
    )
}

const TaskLists: React.FC<{
    tasks: StructuredTask[],
    fixedTasks: FixedTask[],
    onRemoveTask: (id: string) => void,
    onRemoveFixedTask: (id: string) => void,
    isLoading: boolean
}> = ({ tasks, fixedTasks, onRemoveTask, onRemoveFixedTask, isLoading }) => {
    const priorityMap = { 'low': { text: 'کم', color: 'bg-gray-500' }, 'medium': { text: 'متوسط', color: 'bg-blue-500' }, 'high': { text: 'مهم', color: 'bg-yellow-500' }, 'very-high': { text: 'خیلی مهم', color: 'bg-red-500' } };
    const unitMap = { 'minutes': 'دقیقه', 'hours': 'ساعت' };

    const hasTasks = tasks.length > 0 || fixedTasks.length > 0;

    if (!hasTasks) {
         return (
            <div className="text-center py-8 text-gray-500">
                <p>لیست وظایف شما خالی است.</p>
                <p className="text-sm">با استفاده از فرم‌های بالا، وظایف خود را اضافه کنید.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-4 p-4 max-h-80 overflow-y-auto">
            {fixedTasks.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-indigo-300 mb-2">کارهای ثابت</h4>
                    {fixedTasks.map(task => (
                        <div key={task.id} className="bg-gray-800 border-l-4 border-indigo-500 p-3 rounded-lg flex items-center justify-between animate-fade-in-fast mb-2">
                             <div>
                                <p className="font-semibold text-gray-100">{task.title}</p>
                                <div className="flex items-center gap-x-3 text-xs text-gray-400 mt-1 flex-wrap">
                                    <span>{task.startTime} - {task.endTime}</span>
                                    <span className="font-mono">{task.days.join(', ')}</span>
                                </div>
                            </div>
                            <button onClick={() => onRemoveFixedTask(task.id)} disabled={isLoading} aria-label={`حذف ${task.title}`}
                                className="text-gray-500 hover:text-red-400 p-2 rounded-full transition-colors disabled:opacity-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {tasks.length > 0 && (
                 <div>
                    <h4 className="text-sm font-semibold text-cyan-300 mb-2">کارهای انعطاف‌پذیر</h4>
                    {tasks.map(task => (
                        <div key={task.id} className="bg-gray-800 p-3 rounded-lg flex items-center justify-between animate-fade-in-fast mb-2">
                            <div>
                                <p className="font-semibold text-gray-100">{task.title}</p>
                                <div className="flex items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1 flex-wrap">
                                    <span>مدت: {task.duration} {unitMap[task.durationUnit]}</span>
                                    <span className="flex items-center gap-1.5">اولویت: <span className={`px-2 py-0.5 rounded-full text-white text-[10px] ${priorityMap[task.priority].color}`}>{priorityMap[task.priority].text}</span></span>
                                    {task.deadline && <span>مهلت: {task.deadline}</span>}
                                    {task.isDeepWork && <span className="flex items-center gap-1 text-purple-400"><BrainIcon className="w-4 h-4" /> کار عمیق</span>}
                                </div>
                            </div>
                            <button onClick={() => onRemoveTask(task.id)} disabled={isLoading} aria-label={`حذف ${task.title}`}
                                className="text-gray-500 hover:text-red-400 p-2 rounded-full transition-colors disabled:opacity-50">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export const TaskInput: React.FC<TaskInputProps> = ({ tasks, fixedTasks, onAddTask, onRemoveTask, onAddFixedTask, onRemoveFixedTask, onGenerate, isLoading }) => {
  const [showFixedTaskForm, setShowFixedTaskForm] = useState(false);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700">
      <div className="border-b border-gray-700">
        <VariableTaskForm onAddTask={onAddTask} isLoading={isLoading} />
      </div>

      <div className="p-4">
        <button onClick={() => setShowFixedTaskForm(prev => !prev)} className="w-full flex items-center justify-center gap-2 text-sm text-indigo-300 hover:text-indigo-200 bg-gray-900/40 hover:bg-gray-900/70 p-2 rounded-lg transition-colors">
            <RepeatIcon className="w-5 h-5" />
            <span>{showFixedTaskForm ? 'پنهان کردن بخش کارهای ثابت' : 'افزودن کارهای ثابت هفتگی'}</span>
        </button>
      </div>

      {showFixedTaskForm && (
        <div className="border-y border-gray-700 animate-fade-in-fast">
             <FixedTaskSection onAddFixedTask={onAddFixedTask} isLoading={isLoading} />
        </div>
      )}
      
      <div className="bg-gray-900/50">
        <TaskLists tasks={tasks} fixedTasks={fixedTasks} onRemoveTask={onRemoveTask} onRemoveFixedTask={onRemoveFixedTask} isLoading={isLoading} />
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
            onClick={onGenerate}
            disabled={isLoading || (tasks.length === 0 && fixedTasks.length === 0)}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-400"
        >
            {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>در حال ایجاد برنامه...</span>
            </>
            ) : (
            'ایجاد برنامه هفتگی'
            )}
        </button>
      </div>
    </div>
  );
};
