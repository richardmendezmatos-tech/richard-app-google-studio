
/**
 * Strategic 2026 Reactive Primitive: Signals
 * Optimized for low-memory overhead and zero-dependency architectures.
 */

let activeEffect = null;

export class Signal {
    #value;
    #subscribers = new Set();

    constructor(initialValue) {
        this.#value = initialValue;
    }

    get value() {
        if (activeEffect) {
            this.#subscribers.add(activeEffect);
        }
        return this.#value;
    }

    set value(newValue) {
        if (this.#value === newValue) return;
        this.#value = newValue;
        this.#notify();
    }

    #notify() {
        // High-Perf: Notify subscribers in the next microtask to batch updates
        queueMicrotask(() => {
            for (const subscriber of this.#subscribers) {
                subscriber();
            }
        });
    }

    peek() {
        return this.#value;
    }
}

export function effect(fn) {
    const run = () => {
        activeEffect = run;
        try {
            fn();
        } finally {
            activeEffect = null;
        }
    };
    run();
}

export function signal(value) {
    return new Signal(value);
}
