import React, { useState, useEffect } from 'react';

export const ClockWidget: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="flex flex-col items-center justify-center select-none py-4 transition-all duration-300 glass-panel px-15 rounded-lg">
      <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-slate-800 dark:text-white drop-shadow-sm font-mono">
        {hours}
      </h1>
      <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 mt-1 tracking-wide uppercase">
        {dateStr}
      </p>
    </div>
  );
};
