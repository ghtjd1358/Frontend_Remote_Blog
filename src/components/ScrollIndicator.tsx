import React from 'react';

interface ScrollIndicatorProps {
  className?: string;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ className = '' }) => {
  return (
    <div className={`hero-scroll-indicator ${className}`.trim()}>
      <div className="scroll-mouse">
        <span className="scroll-wheel" />
      </div>
      <div className="scroll-arrow">
        <span />
      </div>
    </div>
  );
};

export { ScrollIndicator };
