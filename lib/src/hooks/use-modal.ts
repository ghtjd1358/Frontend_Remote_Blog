/**
 * Modal Hooks - KOMCA 패턴
 * Alert, Confirm 모달 관리
 */

import { useCallback, useState } from 'react';

// 모달 옵션
export interface ModalOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

// Alert 모달 결과
export interface AlertModalResult {
  isOpen: boolean;
  options: ModalOptions | null;
  show: (options: ModalOptions | string) => Promise<void>;
  close: () => void;
}

// Confirm 모달 결과
export interface ConfirmModalResult {
  isOpen: boolean;
  options: ModalOptions | null;
  show: (options: ModalOptions | string) => Promise<boolean>;
  close: (confirmed: boolean) => void;
}

/**
 * Alert 모달 Hook
 */
export function useAlertModal(): AlertModalResult {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);
  const [resolver, setResolver] = useState<(() => void) | null>(null);

  const show = useCallback((opts: ModalOptions | string): Promise<void> => {
    const modalOptions: ModalOptions = typeof opts === 'string'
      ? { message: opts }
      : opts;

    setOptions(modalOptions);
    setIsOpen(true);

    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setOptions(null);
    if (resolver) {
      resolver();
      setResolver(null);
    }
  }, [resolver]);

  return { isOpen, options, show, close };
}

/**
 * Confirm 모달 Hook
 */
export function useConfirmModal(): ConfirmModalResult {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const show = useCallback((opts: ModalOptions | string): Promise<boolean> => {
    const modalOptions: ModalOptions = typeof opts === 'string'
      ? { message: opts, confirmText: '확인', cancelText: '취소' }
      : { confirmText: '확인', cancelText: '취소', ...opts };

    setOptions(modalOptions);
    setIsOpen(true);

    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const close = useCallback((confirmed: boolean) => {
    setIsOpen(false);
    setOptions(null);
    if (resolver) {
      resolver(confirmed);
      setResolver(null);
    }
  }, [resolver]);

  return { isOpen, options, show, close };
}

/**
 * 비동기 Alert 모달 - 간편 사용
 */
export function useAsyncAlertModal() {
  return useCallback((message: string, title?: string): Promise<void> => {
    return new Promise((resolve) => {
      // 브라우저 기본 alert 사용 (커스텀 모달로 교체 가능)
      alert(title ? `${title}\n\n${message}` : message);
      resolve();
    });
  }, []);
}

/**
 * 비동기 Confirm 모달 - 간편 사용
 */
export function useAsyncConfirmModal() {
  return useCallback((message: string, title?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // 브라우저 기본 confirm 사용 (커스텀 모달로 교체 가능)
      const result = confirm(title ? `${title}\n\n${message}` : message);
      resolve(result);
    });
  }, []);
}