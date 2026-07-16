import React from 'react';
import clsx from 'clsx';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'default';
  icon?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'default',
  icon,
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-97';
  
  const variants = {
    primary: 'bg-accent-primary hover:bg-accent-primary/85 text-white focus:ring-accent-primary/50 shadow-md shadow-accent-primary/20',
    secondary: 'bg-accent-secondary hover:bg-accent-secondary/85 text-white focus:ring-accent-secondary/50 shadow-md shadow-accent-secondary/20',
    danger: 'bg-accent-danger hover:bg-accent-danger/85 text-white focus:ring-accent-danger/50 shadow-md shadow-accent-danger/20',
    default: 'glass bg-white/20 dark:bg-white/5 hover:bg-white/35 dark:hover:bg-white/10 text-current border-white/25 dark:border-white/10 focus:ring-white/30',
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        icon && <span className="text-lg flex items-center justify-center">{icon}</span>
      )}
      {children}
    </button>
  );
};
export default GlassButton;
