'use client';

import React from 'react';
import BlogPage from '@/pages/blog/ui/BlogPage';

/**
 * Next.js App Router entry point for /blog
 * Bridges to the FSD Pages layer component.
 */
export default function BlogRoute() {
  return (
    <div className="min-h-screen bg-slate-950 pt-20">
      <BlogPage />
    </div>
  );
}
