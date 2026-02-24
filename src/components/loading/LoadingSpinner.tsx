import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = '로딩 중...',
  className = '',
  fullPage = false,
}) => {
  const baseClass = fullPage ? 'loading-fullpage' : 'loading-container';

  return (
    <div className={`${baseClass} ${className}`.trim()}>
      <div className="loading-spinner" />
      {message && <p>{message}</p>}
    </div>
  );
};

export { LoadingSpinner };
