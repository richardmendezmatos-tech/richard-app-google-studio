import React from 'react';

/**
 * Premium WhatsApp SVG Icon for Richard Automotive Brand UI.
 * Used in floating buttons, CTA menus, and contact sections.
 */
export const WhatsAppIcon = ({ size = 28, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M16 2C8.28 2 2 8.28 2 16c0 2.46.67 4.77 1.83 6.75L2 30l7.45-1.8A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2z"
      fill="currentColor"
    />
    <path
      d="M22.45 19.14c-.33-.17-1.97-.97-2.28-1.08-.3-.1-.52-.17-.74.17-.22.33-.85 1.08-1.04 1.3-.19.22-.38.25-.71.08-.33-.17-1.38-.51-2.63-1.62a9.85 9.85 0 0 1-1.82-2.27c-.19-.33-.02-.51.14-.67.15-.15.33-.38.5-.57.17-.19.22-.33.33-.55.11-.22.06-.42-.02-.58-.08-.17-.74-1.78-1.01-2.44-.27-.64-.54-.55-.74-.56l-.63-.01c-.22 0-.58.08-.88.42-.3.33-1.15 1.13-1.15 2.75 0 1.62 1.18 3.19 1.34 3.41.17.22 2.32 3.54 5.62 4.97.79.34 1.4.54 1.88.69.79.25 1.51.21 2.08.13.63-.09 1.97-.81 2.25-1.59.28-.78.28-1.44.2-1.58-.08-.14-.3-.22-.63-.38z"
      fill="white"
    />
  </svg>
);
