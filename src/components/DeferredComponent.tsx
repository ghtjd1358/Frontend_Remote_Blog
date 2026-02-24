import React, { useState, useEffect, ReactNode } from 'react';

interface DeferredComponentProps {
  children: ReactNode;
  delay?: number;
}

const DeferredComponent: React.FC<DeferredComponentProps> = ({
  children,
  delay = 200
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return null;

  return <>{children}</>;
};

export { DeferredComponent };
