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
                primary: '#2563eb',
                secondary: '#475569',
                accent: '#06b6d4',
                background: '#f8fafc',
                surface: '#ffffff',
                // Dark mode colors
                'dark-bg': '#0f172a',
                'dark-surface': '#1e293b',
                'dark-border': '#334155',
                'dark-text': '#f1f5f9',
            }
        },
    },
    plugins: [],
}
