import React, { useEffect, useRef } from 'react';

interface ReadyPlayerMeCreatorProps {
    onAvatarExported: (url: string) => void;
    onCancel: () => void;
}

const ReadyPlayerMeCreator: React.FC<ReadyPlayerMeCreatorProps> = ({ onAvatarExported, onCancel }) => {
    const subdomain = 'demo'; // Or your custom subdomain if you have one
    const iframeUrl = `https://${subdomain}.readyplayer.me/avatar?frameApi`;
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const source = event.srcElement || event.source;
            if (source !== iframeRef.current?.contentWindow) return;

            // The data is usually a string, verify and parse it
            try {
                const json = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                // Ready Player Me events
                if (json?.source === 'readyplayerme') {
                    if (json.eventName === 'v1.avatar.exported') {
                        const url = json.data.url;
                        onAvatarExported(url);
                    }
                    if (json.eventName === 'v1.frame.ready') {
                        // Frame is ready
                    }
                }
            } catch (e) {
                // Ignore non-JSON messages
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onAvatarExported]);

    return (
        <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col">
            <div className="h-12 bg-black/80 flex items-center justify-between px-4 border-b border-white/10">
                <span className="text-sm font-bold text-white">Creador de Avatares</span>
                <button
                    onClick={onCancel}
                    className="text-slate-400 hover:text-white text-xs font-bold uppercase"
                >
                    Cancelar
                </button>
            </div>
            <iframe
                ref={iframeRef}
                src={iframeUrl}
                allow="camera *; microphone *"
                className="w-full h-full border-0"
                title="Ready Player Me Avatar Creator"
            />
        </div>
    );
};

export default ReadyPlayerMeCreator;
