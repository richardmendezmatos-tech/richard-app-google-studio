'use client';

import React from 'react';
import NextLink from 'next/link';
import { useRouter as useNextRouter, usePathname, useSearchParams } from 'next/navigation';

/**
 * Next.js Route Adapter for FSD (React Router v6 style)
 * Provides compatibility layers for codebase migration.
 */

export const useNavigate = () => {
  const router = useNextRouter();
  return (to: any, options?: { replace?: boolean }) => {
    if (typeof to === 'number') {
      router.back();
      return;
    }
    if (options?.replace) {
      router.replace(to as string);
    } else {
      router.push(to as string);
    }
  };
};

export const useLocation = () => {
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams();
  
  const search = React.useMemo(() => {
    return searchParams?.toString() ? `?${searchParams.toString()}` : '';
  }, [searchParams]);

  return {
    pathname,
    search,
    hash: '',
    state: null as any,
    key: 'default',
  };
};

export const useParams = () => ({});
export const useOutletContext = <T = any>(): T => ({} as T);

export const Link: React.FC<any> = ({ to, ...props }) => (
  <NextLink href={to || '#'} {...props} />
);

export const NavLink: React.FC<any> = ({ to, ...props }) => (
  <NextLink href={to || '#'} {...props} />
);

// --- Compatibility Mocks for <Routes> and <Route> ---
export const Routes: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
export const Route: React.FC<{ path: string; element: React.ReactNode }> = ({ element }) => <>{element}</>;

export const Navigate: React.FC<{ to: string; replace?: boolean; state?: any }> = ({ to, replace }) => {
  const router = useNextRouter();
  React.useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [to, replace, router]);
  return null;
};

export { useNextRouter };
