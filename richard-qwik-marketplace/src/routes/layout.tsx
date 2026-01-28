import { component$, Slot } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

export const useServerTimeLoader = routeLoader$(() => {
    return {
        date: new Date().toISOString(),
    };
});

export default component$(() => {
    return (
        <div class="page min-h-screen bg-slate-900 text-white">
            <main>
                <Slot />
            </main>
            <footer class="p-4 text-center text-slate-500">
                <p>Powered by Qwik City & Supabase</p>
            </footer>
        </div>
    );
});
