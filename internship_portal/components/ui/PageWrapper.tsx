'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface PageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  actions?: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  title,
  actions,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex-1 flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto animate-fade-in transition-all duration-300',
        className
      )}
      {...props}
    >
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            {title && (
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>
            )}
          </div>
          {actions && <div className="flex items-center space-x-3">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
export default PageWrapper;
