'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, fullWidth = true, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-white/80 ml-0.5"
          >
            {label}
          </label>
        )}
        <div
          className={`relative flex items-center rounded-xl border backdrop-blur-md transition-all duration-200
            ${error
              ? 'border-red-400/60 bg-red-500/10 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-400/30'
              : 'border-white/20 bg-white/5 focus-within:border-blue-400/70 focus-within:ring-2 focus-within:ring-blue-400/30'
            }
            ${className}`}
        >
          {icon && (
            <span className="pl-3 text-white/50">{icon}</span>
          )}
          <input
            id={inputId}
            ref={ref}
            className="flex-1 bg-transparent px-3 py-2.5 text-white placeholder:text-white/40 focus:outline-none"
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs text-red-300 ml-0.5">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
