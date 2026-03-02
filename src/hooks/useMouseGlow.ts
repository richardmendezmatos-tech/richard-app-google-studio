import { useEffect, useRef } from 'react';

/**
 * Hook to track mouse position and update CSS variables --mouse-x and --mouse-y.
 * Used for dynamic glassmorphism and refraction effects.
 */
export const useMouseGlow = () => {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      containerRef.current.style.setProperty('--mouse-x', `${x}px`);
      containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return { containerRef };
};
