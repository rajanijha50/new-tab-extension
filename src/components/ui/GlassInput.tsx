import React from 'react';
import clsx from 'clsx';

type GlassInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          'glass w-full px-4 py-2.5 rounded-xl border border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/10 focus:bg-white/25 dark:focus:bg-black/25 text-current placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-primary/45 transition-all duration-200',
          className
        )}
        {...props}
      />
    );
  }
);
GlassInput.displayName = 'GlassInput';

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const GlassSelect = React.forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={clsx(
          'glass w-full px-4 py-2.5 rounded-xl border border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/10 text-current focus:outline-none focus:ring-2 focus:ring-accent-primary/45 transition-all duration-200 cursor-pointer [&>option]:bg-gray-100 dark:[&>option]:bg-gray-900 [&>option]:text-gray-900 dark:[&>option]:text-gray-100',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
GlassSelect.displayName = 'GlassSelect';

export default GlassInput;
