import { HTMLAttributes, FC } from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  // Additional props can be defined here
}

export const Container: FC<ContainerProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn(
        'container px-4 md:px-6 mx-auto max-w-7xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};