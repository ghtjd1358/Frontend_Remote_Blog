import { useEffect, DependencyList } from 'react';

/**
 * 스크롤 시 요소에 애니메이션 클래스를 추가하는 훅
 * .animate-on-scroll 클래스를 가진 요소가 뷰포트에 들어오면
 * .animate-visible 클래스를 추가합니다.
 */
const useScrollAnimation = (deps: DependencyList = []) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, deps);
};

export { useScrollAnimation };
