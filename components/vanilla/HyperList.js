
import { signal, effect } from './signals.js';

/**
 * HyperList Component (Vite 2026 Optimized)
 * Features:
 * - 10,000 Item Rendering
 * - DocumentFragment for batch insertion
 * - Layout Thrashing Prevention (Read/Write batching)
 * - Signals for granular reactivity
 */
export function createHyperList(containerId, itemCount = 10000) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Reactivity: Signal for the list data
    const listData = signal(Array.from({ length: itemCount }, (_, i) => ({
        id: i,
        label: `Item #${i + 1}`,
        status: 'idle'
    })));

    // Theme Signal
    const theme = signal('dark');

    // DOM Cache for batching
    const elementCache = new Map();

    /**
     * Initial Render using DocumentFragment
     */
    const renderInitial = () => {
        console.time('Strategic: Initial Render');
        const fragment = document.createDocumentFragment();

        const data = listData.peek();
        data.forEach(item => {
            const el = document.createElement('div');
            el.className = 'hyper-item p-2 border-b border-white/5 flex justify-between items-center';
            el.innerHTML = `
                <span class="text-xs font-mono text-slate-400">${item.label}</span>
                <span class="status-indicator w-2 h-2 rounded-full bg-slate-700"></span>
            `;
            elementCache.set(item.id, el);
            fragment.appendChild(el);
        });

        // Atomic write to DOM
        container.innerHTML = '';
        container.appendChild(fragment);
        console.timeEnd('Strategic: Initial Render');
    };

    /**
     * Strategy: Batching DOM Mutations
     * Separate Reads (Layout) from Writes (Mutations)
     */
    const updateBatchStatus = (ids, newStatus) => {
        // 1. PHASE: READ (Avoid Layout Thrashing)
        // In this simple case, we don't need heavily computed layout info, 
        // but if we did, we would read all offsets here.

        // 2. PHASE: WRITE (Atomic updates)
        requestAnimationFrame(() => {
            ids.forEach(id => {
                const el = elementCache.get(id);
                if (el) {
                    const indicator = el.querySelector('.status-indicator');
                    if (indicator) {
                        indicator.className = `status-indicator w-2 h-2 rounded-full ${newStatus === 'active' ? 'bg-[#00aed9] shadow-[0_0_8px_#00aed9]' : 'bg-slate-700'
                            }`;
                    }
                }
            });
        });
    };

    // Initialize list
    renderInitial();

    // Export public API for interactions
    return {
        updateBatchStatus,
        theme,
        listData
    };
}
