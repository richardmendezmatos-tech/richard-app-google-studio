
declare module './vanilla/HyperList' {
    export function createHyperList(containerId: string, itemCount?: number): {
        updateBatchStatus: (ids: number[], newStatus: 'active' | 'idle') => void;
        theme: any;
        listData: any;
    };
}
