import { useEffect, useRef } from 'react';
import { bootstrapApplication } from '@angular/platform-browser';
import { TestAngularComponent } from './TestAngular.component';

const AngularWrapper = () => {
    const angularRef = useRef<HTMLDivElement>(null);
    const appInstance = useRef<any>(null);

    useEffect(() => {
        if (angularRef.current && !appInstance.current) {
            // Bootstrap the Angular component
            bootstrapApplication(TestAngularComponent, {
                providers: []
            }).then(app => {
                appInstance.current = app;
                // Move the component's host element into our ref
                const hostElement = document.querySelector('app-test-angular');
                if (hostElement && angularRef.current) {
                    angularRef.current.appendChild(hostElement);
                }
            }).catch(err => console.error(err));
        }

        // Cleanup on unmount
        return () => {
            if (appInstance.current) {
                appInstance.current.destroy();
                appInstance.current = null;
            }
        };
    }, []);

    return (
        <div className="my-8">
            <div ref={angularRef}>
                <app-test-angular></app-test-angular>
            </div>
        </div>
    );
};

export default AngularWrapper;
