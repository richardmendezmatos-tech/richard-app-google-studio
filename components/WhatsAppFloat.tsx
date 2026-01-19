
import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFloat: React.FC = () => {
    // Configurable phone number (should match your Twilio/Business number)
    const phoneNumber = "17875550123";
    const message = "Hola, me gustaría más información sobre su inventario.";

    return (
        <a
            href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-24 right-5 z-50 p-4 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-lg hover:scale-110 transition-all duration-300 animate-bounce-slow flex items-center justify-center group"
            title="Chat en WhatsApp"
        >
            <MessageCircle size={28} fill="white" />
            <span className="absolute right-full mr-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Habla con Richard IA
            </span>
        </a>
    );
};
