/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2563eb',
                secondary: '#475569',
                accent: '#06b6d4',
                background: '#f8fafc',
                surface: '#ffffff',
            }
        },
    },
    plugins: [],
}
