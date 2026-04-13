/**
 * Firebase Universal Bridge
 * Logic to dynamically load server or client instances to avoid build-time errors in Next.js
 */

export const getDb = async () => {
  if (typeof window === 'undefined') {
    const { db } = await import('./server');
    return db;
  } else {
    const { db } = await import('./client');
    return db;
  }
};

export const getAuth = async () => {
  if (typeof window === 'undefined') {
    const { auth } = await import('./server');
    return auth;
  } else {
    const { auth } = await import('./client');
    return auth;
  }
};

export const getFunctions = async () => {
  if (typeof window === 'undefined') {
    const { functions } = await import('./server');
    return functions;
  } else {
    const { functions } = await import('./client');
    return functions;
  }
};

export const getApp = async () => {
  if (typeof window === 'undefined') {
    const { app } = await import('./server');
    return app;
  } else {
    const { app } = await import('./client');
    return app;
  }
};
