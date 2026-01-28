
import { test, expect, bench } from 'vitest';

/**
 * STRATEGIC PERFORMANCE BENCHMARK
 * This script measures the impact of the Vite 2026 optimization
 * and the HyperList signal-based reactivity.
 */

test('Strategic: Memory Footprint Simulation', async () => {
    // Simulate high-frequency reactivity
    const start = performance.now();
    const { signal, effect } = await import('./components/vanilla/signals');

    const count = signal(0);
    let reactiveValue = 0;

    effect(() => {
        reactiveValue = count.value;
    });

    for (let i = 0; i < 10000; i++) {
        count.value = i;
    }

    const end = performance.now();
    console.log(`[PERF] 10,000 Reactivity Cycles: ${end - start}ms`);
    expect(reactiveValue).toBe(9999);
});

test('Strategic: DOM Fragment Insertion TTI', async () => {
    // Benchmarking the DocumentFragment strategy
    const start = performance.now();
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 10000; i++) {
        const el = document.createElement('div');
        el.textContent = `Item ${i}`;
        fragment.appendChild(el);
    }

    document.body.appendChild(fragment);
    const end = performance.now();
    console.log(`[PERF] 10,000 Node Insertion (Batch): ${end - start}ms`);
    expect(document.body.children.length).toBeGreaterThan(9999);
});
