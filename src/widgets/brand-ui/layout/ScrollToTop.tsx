'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    const main = document.getElementById('cinema-content');
    if (main) main.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
