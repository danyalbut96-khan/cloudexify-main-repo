import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverEffect = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white border border-slate-100 rounded-xl p-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] transition-all duration-200',
        hoverEffect && 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] hover:border-slate-200 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h3
      className={cn('text-sm font-semibold text-slate-500 tracking-wide uppercase', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardValue: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p
      className={cn('text-2xl font-bold text-slate-900 tracking-tight mt-2', className)}
      {...props}
    >
      {children}
    </p>
  );
};
export default Card;
