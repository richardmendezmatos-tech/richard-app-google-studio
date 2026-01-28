import { routeLoader$ } from '@builder.io/qwik-city';
import { createClient } from '@supabase/supabase-js';

import { ENV } from '../env';

// Initialize Supabase Client (Ensure these env vars are set in Vercel)
const supabaseUrl = ENV.SUPABASE_URL || '';
const supabaseKey = ENV.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface Car {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    image_url: string;
    specs: Record<string, any>;
}

// Server-Side Loader to fetch cars
// This runs on the Edge (Vercel) before rendering
export const useCarCatalog = routeLoader$(async (requestEvent) => {
    console.log('Fetching cars from Supabase...');

    const { data, error } = await supabase
        .from('cars')
        .select('*')
        .limit(10); // Simple pagination example

    if (error) {
        console.error('Supabase Error:', error);
        return [];
    }

    return data as Car[];
});
