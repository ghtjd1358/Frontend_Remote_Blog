import React from 'react';

interface HeaderProps {
  isStandalone?: boolean;
}

// 네비게이션은 App.tsx에서 inline으로 렌더링됨
export const Header: React.FC<HeaderProps> = () => {
  return null;
};
