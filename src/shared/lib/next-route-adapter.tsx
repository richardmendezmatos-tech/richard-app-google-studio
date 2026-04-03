'use client';

import React from 'react';
import NextLink from 'next/link';
import { useRouter as useNextRouter, usePathname, useSearchParams, useParams as useNextParams } from 'next/navigation';

/**
 * Next.js Route Adapter for FSD (React Router v6 style)
 * Provides compatibility layers for codebase migration.
 */

export const useNavigate = () => {
  const router = useNextRouter();
  return (to: any, options?: { replace?: boolean, state?: any }) => {
    if (typeof to === 'number') {
      router.back();
      return;
    }

    if (options?.state && typeof window !== 'undefined') {
      sessionStorage.setItem('next_route_state', JSON.stringify(options.state));
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
  
  const state = React.useMemo(() => {
    if (typeof window === 'undefined') return null;
    const s = sessionStorage.getItem('next_route_state');
    if (s) {
      try {
        const parsed = JSON.parse(s);
        // Consumir el estado (opcional: podrías no borrarlo si quieres persistencia en refresh)
        // sessionStorage.removeItem('next_route_state'); 
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  }, []);

  const search = React.useMemo(() => {
    return searchParams?.toString() ? `?${searchParams.toString()}` : '';
  }, [searchParams]);

  return {
    pathname,
    search,
    hash: '',
    state,
    key: 'default',
  };
};

export const useParams = <T extends Record<string, string | string[]> = Record<string, string>>(): T => {
  return useNextParams() as T;
};
export const useOutletContext = <T,>(): T => ({} as T);

export const Link: React.FC<any> = ({ to, ...props }) => (
  <NextLink href={to || '#'} {...props} />
);

export const NavLink: React.FC<any> = ({ to, ...props }) => (
  <NextLink href={to || '#'} {...props} />
);

// --- Compatibility Mocks for <Routes>, <Route>, and <Outlet> ---
export const Routes: React.FC<any> = ({ children }) => <>{children}</>;
export const Route: React.FC<any> = ({ element, children }) => <>{element}{children}</>;
export const Outlet: React.FC<any> = () => null;

export const Navigate: React.FC<{ to: string; replace?: boolean; state?: any }> = ({ to, replace }) => {
  const router = useNextRouter();
  React.useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [to, replace, router]);
  return null;
};

export { useNextRouter };
