import { useEffect, useRef } from 'react';
import { createApp } from 'vue';
import TestVue from './TestVue.vue';

const VueWrapper = () => {
    const vueRef = useRef<HTMLDivElement>(null);
    const appInstance = useRef<any>(null);

    useEffect(() => {
        if (vueRef.current && !appInstance.current) {
            // Create and mount the Vue app
            const app = createApp(TestVue);
            app.mount(vueRef.current);
            appInstance.current = app;
        }

        // Cleanup on unmount
        return () => {
            if (appInstance.current) {
                appInstance.current.unmount();
                appInstance.current = null;
            }
        };
    }, []);

    return (
        <div className="my-8">
            <div ref={vueRef}></div>
        </div>
    );
};

export default VueWrapper;
