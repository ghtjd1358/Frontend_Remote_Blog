import React from 'react';
import { DeferredComponent } from '@/components/DeferredComponent';

interface LoadingSpinnerProps {
  message?: string;
  delay?: number;
  className?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = '로딩 중...',
  delay = 200,
  className = '',
  fullPage = false,
}) => {
  const baseClass = fullPage ? 'loading-fullpage' : 'loading-container';

  return (
    <DeferredComponent delay={delay}>
      <div className={`${baseClass} ${className}`.trim()}>
        <div className="loading-spinner" />
        {message && <p>{message}</p>}
      </div>
    </DeferredComponent>
  );
};

export { LoadingSpinner };
