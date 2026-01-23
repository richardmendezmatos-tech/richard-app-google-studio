import { BehaviorSubject } from 'rxjs';

export interface FrameworkState {
    globalCount: number;
    lastAction: string;
    source: 'React' | 'Vue' | 'Angular' | 'jQuery' | 'PHP' | 'System';
    timestamp: number;
}

const initialState: FrameworkState = {
    globalCount: 0,
    lastAction: 'Framework Initialized',
    source: 'System',
    timestamp: Date.now()
};

// Singleton State using RxJS
class FrameworkService {
    private state$ = new BehaviorSubject<FrameworkState>(initialState);

    // Observable for subscribers
    getState() {
        return this.state$.asObservable();
    }

    // Get current value snapshot
    getCurrentState() {
        return this.state$.getValue();
    }

    // Actions
    increment(source: 'React' | 'Vue' | 'Angular') {
        const current = this.state$.getValue();
        this.state$.next({
            ...current,
            globalCount: current.globalCount + 1,
            lastAction: 'Incremented Count',
            source,
            timestamp: Date.now()
        });
    }

    reset(source: 'React' | 'Vue' | 'Angular') {
        this.state$.next({
            ...initialState,
            lastAction: 'Reset State',
            source,
            timestamp: Date.now()
        });
    }

    updateAction(action: string, source: 'React' | 'Vue' | 'Angular') {
        const current = this.state$.getValue();
        this.state$.next({
            ...current,
            lastAction: action,
            source,
            timestamp: Date.now()
        });
    }
}

export const frameworkService = new FrameworkService();
