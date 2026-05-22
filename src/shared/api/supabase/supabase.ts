import { createServerSupabaseClient } from './serverClient';

let instance: ReturnType<typeof createServerSupabaseClient> | null = null;

function getInstance() {
  if (!instance) {
    instance = createServerSupabaseClient();
  }
  return instance;
}

const supabaseProxy = new Proxy({} as ReturnType<typeof createServerSupabaseClient>, {
  get(_, prop) {
    const target = getInstance();
    const value = target[prop as keyof typeof target];
    if (typeof value === 'function') {
      return value.bind(target);
    }
    return value;
  },
});

export { supabaseProxy as supabase };
