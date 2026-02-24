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
            spacing: {
                'board-header': '50px',
                'board-column-lg': '300px',
                'board-column-md': '200px',
                'board-column-sm': '150px',
            },
            height: {
                'board-header': '50px',
            }
        }
    },
    plugins: [],
}
