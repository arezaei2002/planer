
import React, { useState, useEffect } from 'react';

const messages = [
  "در حال تحلیل وظایfف شما...",
  "بهینه‌سازی برنامه بر اساس سطح انرژی...",
  "اضافه کردن زمان بافر برای انعطاف‌پذیری...",
  "بررسی مهلت‌ها و اولویت‌ها...",
  "چیدمان نهایی برنامه هفتگی...",
];

export const LoadingSpinner: React.FC = () => {
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setMessage(messages[messageIndex]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center p-8 mt-6 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 flex flex-col items-center justify-center">
      <svg className="animate-spin h-10 w-10 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <h3 className="text-xl font-semibold text-white">لطفاً کمی صبر کنید...</h3>
      <p className="text-gray-400 mt-2 transition-opacity duration-500">{message}</p>
    </div>
  );
};
