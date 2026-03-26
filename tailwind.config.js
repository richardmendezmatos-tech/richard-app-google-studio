/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'brand-cyan': '#00e5ff',
                'brand-cyan-strong': '#00b8cc',
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "#00aed9",
                    foreground: "#ffffff"
                }
            },
            fontFamily: {
                editorial: ['Cormorant Garamond', 'serif'],
                tech: ['Sora', 'sans-serif'],
            },
            spacing: {
                'board-header': '50px',
                'board-column-lg': '300px',
                'board-column-md': '200px',
                'board-column-sm': '150px',
            },
            height: {
                'board-header': '50px',
            },
            animation: {
                'bounce-slow': 'bounce-slow 4s ease-in-out infinite',
                'gradient-x': 'gradientX 8s ease infinite',
                'spin-slow': 'spinSlow 32s linear infinite',
                'neural-pulse': 'neural-pulse 15s ease-in-out infinite alternate',
                'scan': 'scan 3s linear infinite',
            },
            keyframes: {
                'bounce-slow': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                gradientX: {
                    '0%, 100%': { 'background-position': '0% 50%' },
                    '50%': { 'background-position': '100% 50%' },
                },
                spinSlow: {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' },
                },
                'neural-pulse': {
                    '0%': { transform: 'scale(1) translate(0, 0)', opacity: '0.5' },
                    '50%': { transform: 'scale(1.1) translate(2%, 2%)', opacity: '0.8' },
                    '100%': { transform: 'scale(1) translate(-2%, -2%)', opacity: '0.5' },
                },
                scan: {
                    '0%': { top: '0%', opacity: '0' },
                    '50%': { opacity: '1' },
                    '100%': { top: '100%', opacity: '0' },
                },
            }
        }
    },
    plugins: [],
}
