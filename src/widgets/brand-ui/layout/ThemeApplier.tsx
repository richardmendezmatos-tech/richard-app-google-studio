'use client';

import { useContext, useEffect } from 'react';
import { ThemeContext } from '@/shared/ui/providers/ThemeProvider';

export function ThemeApplier() {
  const { theme } = useContext(ThemeContext);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);
  return null;
}
