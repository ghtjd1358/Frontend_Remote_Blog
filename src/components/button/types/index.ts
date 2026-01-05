export type ScrollTopButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ScrollTopButtonSize = 'sm' | 'md' | 'lg';

export interface ScrollTopButtonProps {
  className?: string;
  variant?: ScrollTopButtonVariant;
  size?: ScrollTopButtonSize;
  threshold?: number;
  title?: string;
}
