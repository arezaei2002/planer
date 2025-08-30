
import React from 'react';
import { CalendarIcon } from './IconComponents';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-4">
        <CalendarIcon className="w-10 h-10 text-cyan-400" />
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
          برنامه‌ریز حرفه‌ای جلالی
        </h1>
      </div>
      <p className="mt-3 text-lg text-gray-400">
        برنامه‌ی هفتگی خود را هوشمندانه و به زبان فارسی بسازید.
      </p>
    </header>
  );
};
