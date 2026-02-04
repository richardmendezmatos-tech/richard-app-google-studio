
export class Signal<T> {
    constructor(initialValue: T);
    value: T;
    peek(): T;
}

export function effect(fn: () => void): void;
export function signal<T>(value: T): Signal<T>;
