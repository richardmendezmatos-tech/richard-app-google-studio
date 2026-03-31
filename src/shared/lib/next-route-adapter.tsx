'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

/**
 * Adapter to maintain compatibility with react-router-dom hooks
 * while running on Next.js App Router.
 */

export const useNavigate = () => {
  const router = useRouter();
  
  return (to: any, options?: { replace?: boolean }) => {
    if (typeof to === 'number') {
      if (to < 0) router.back();
      else router.forward();
      return;
    }
    
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
};

export const useLocation = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  return {
    pathname: pathname || '/',
    search: searchParams?.toString() ? `?${searchParams.toString()}` : '',
    hash: '',
    state: null,
    key: 'next-adapter',
  };
};

import NextLink from 'next/link';
import { useParams as nextUseParams, redirect } from 'next/navigation';
import { useEffect } from 'react';

export const Link = ({ to, ...props }: any) => {
  return <NextLink href={to} {...props} />;
};

export const useParams = () => {
  return nextUseParams() || {}; 
};

export const Navigate = ({ to, replace }: { to: string; replace?: boolean }) => {
  useEffect(() => {
    if (replace) {
      window.location.replace(to);
    } else {
      window.location.assign(to);
    }
  }, [to, replace]);
  return null;
};
