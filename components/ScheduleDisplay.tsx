
import React, { useState } from 'react';
import type { WeeklySchedule, Task } from '../types';
import { BrainIcon, ClockIcon, PencilIcon } from './IconComponents';

interface ScheduleDisplayProps {
  schedule: WeeklySchedule;
  onTaskToggle: (dayIndex: number, taskIndex: number) => void;
  editingTask: { dayIndex: number; taskIndex: number } | null;
  onStartEdit: (dayIndex: number, taskIndex: number) => void;
  onUpdateTask: (dayIndex: number, taskIndex: number, updatedTask: Task) => void;
  onCancelEdit: () => void;
}

const TaskEditor: React.FC<{ task: Task; onSave: (updatedTask: Task) => void; onCancel: () => void; }> = ({ task, onSave, onCancel }) => {
    const [editedTask, setEditedTask] = useState<Task>(task);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedTask);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setEditedTask(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <form onSubmit={handleSave} className="bg-gray-700 p-3 rounded-lg space-y-3 animate-fade-in-fast">
            <input
                type="text"
                name="title"
                value={editedTask.title}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                required
            />
            <div className="flex gap-2">
                <input
                    type="time"
                    name="startTime"
                    value={editedTask.startTime}
                    onChange={handleChange}
                    className="w-1/2 bg-gray-800 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                    required
                />
                <input
                    type="time"
                    name="endTime"
                    value={editedTask.endTime}
                    onChange={handleChange}
                    className="w-1/2 bg-gray-800 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                    required
                />
            </div>
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        name="isDeepWork"
                        checked={editedTask.isDeepWork}
                        onChange={handleChange}
                        className="form-checkbox h-4 w-4 rounded bg-gray-800 border-gray-600 text-purple-400 focus:ring-purple-500"
                    />
                    کار عمیق
                </label>
                <div className="flex gap-2">
                    <button type="button" onClick={onCancel} className="text-gray-400 hover:text-white transition-colors text-sm px-3 py-1">لغو</button>
                    <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm py-1 px-3 rounded-md transition-colors">ذخیره</button>
                </div>
            </div>
        </form>
    );
};


const TaskItem: React.FC<{ 
    task: Task; 
    dayIndex: number; 
    taskIndex: number; 
    onTaskToggle: (dayIndex: number, taskIndex: number) => void;
    isEditing: boolean;
    onStartEdit: (dayIndex: number, taskIndex: number) => void;
    onUpdateTask: (dayIndex: number, taskIndex: number, updatedTask: Task) => void;
    onCancelEdit: () => void;
}> = ({ task, dayIndex, taskIndex, onTaskToggle, isEditing, onStartEdit, onUpdateTask, onCancelEdit }) => {
    
    if (isEditing) {
        return <TaskEditor 
            task={task} 
            onSave={(updatedTask) => onUpdateTask(dayIndex, taskIndex, updatedTask)} 
            onCancel={onCancelEdit}
        />;
    }

    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-300 ${task.isCompleted ? 'bg-green-900/30 text-gray-500' : 'bg-gray-800'}`}>
            <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() => onTaskToggle(dayIndex, taskIndex)}
                className="form-checkbox h-5 w-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-600 cursor-pointer"
            />
            <div className="flex-1">
                <label className={`block font-medium cursor-pointer ${task.isCompleted ? 'line-through' : ''}`}>
                    {task.title}
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{task.startTime} - {task.endTime}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {task.isDeepWork && (
                    <div className="tooltip" data-tip="کار عمیق">
                        <BrainIcon className="w-6 h-6 text-purple-400" />
                    </div>
                )}
                <button onClick={() => onStartEdit(dayIndex, taskIndex)} className="text-gray-500 hover:text-cyan-400 transition-colors p-1 rounded-full">
                    <PencilIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const WorkloadBar: React.FC<{ minutes: number }> = ({ minutes }) => {
    const maxMinutes = 360; // 6 hours
    const percentage = Math.min((minutes / maxMinutes) * 100, 100);
    let barColor = 'bg-green-500';
    if (percentage > 50) barColor = 'bg-yellow-500';
    if (percentage > 80) barColor = 'bg-red-500';

    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
                className={`${barColor} h-2.5 rounded-full transition-all duration-500`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

export const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({ schedule, onTaskToggle, editingTask, onStartEdit, onUpdateTask, onCancelEdit }) => {
  return (
    <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {schedule.weeklyPlan.map((day, dayIndex) => (
                <div key={day.jalaliDate} className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-5 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">{day.dayName}</h3>
                        <span className="text-sm text-gray-400">{day.jalaliDate}</span>
                    </div>
                    <div className="mb-4">
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                            <span>بار کاری</span>
                            <span>{Math.floor(day.totalMinutes / 60)} ساعت و {day.totalMinutes % 60} دقیقه</span>
                        </div>
                        <WorkloadBar minutes={day.totalMinutes} />
                    </div>
                    <div className="space-y-3 flex-grow">
                        {day.tasks.length > 0 ? (
                           day.tasks.map((task, taskIndex) => {
                             const isEditing = editingTask?.dayIndex === dayIndex && editingTask?.taskIndex === taskIndex;
                             return (
                                <TaskItem 
                                    key={taskIndex} 
                                    task={task} 
                                    dayIndex={dayIndex} 
                                    taskIndex={taskIndex} 
                                    onTaskToggle={onTaskToggle}
                                    isEditing={isEditing}
                                    onStartEdit={onStartEdit}
                                    onUpdateTask={onUpdateTask}
                                    onCancelEdit={onCancelEdit}
                                />
                             );
                           })
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 p-4 bg-gray-800 rounded-lg">
                                <span>روزی برای استراحت!</span>
                            </div>
                        )}
                    </div>
                     <p className="text-sm italic text-cyan-300/80 mt-5 pt-4 border-t border-gray-700">"{day.motivationalTip}"</p>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schedule.deferredTasks.length > 0 && (
                <div className="bg-yellow-900/50 border border-yellow-700 rounded-2xl p-5">
                    <h3 className="text-xl font-bold text-yellow-300 mb-3">کارهای معوق</h3>
                    <ul className="space-y-2">
                        {schedule.deferredTasks.map((task, index) => (
                            <li key={index} className="bg-yellow-900/60 p-3 rounded-lg">
                                <p className="font-semibold text-yellow-200">{task.title}</p>
                                <p className="text-sm text-yellow-400">{task.reason}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {schedule.notesAndSuggestions && (
                 <div className="bg-blue-900/50 border border-blue-700 rounded-2xl p-5">
                    <h3 className="text-xl font-bold text-blue-300 mb-3">یادداشت‌ها و پیشنهادات</h3>
                    <p className="text-blue-200 whitespace-pre-line">{schedule.notesAndSuggestions}</p>
                </div>
            )}
        </div>
    </div>
  );
};
