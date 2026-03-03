/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#c9a74a",
                "background-light": "#f8f7f6",
                "background-dark": "#0D0D0D",
                "surface": "#141414",
                "surface-light": "#1a1a1a",
                "surface-hover": "#222222",
            },
            fontFamily: {
                "display": ["Spline Sans", "sans-serif"],
                "serif": ["Cormorant Garamond", "serif"],
                "sora": ["Sora", "sans-serif"],
            },
            borderRadius: {
                "DEFAULT": "0.5rem",
                "lg": "0.75rem",
                "xl": "1rem",
                "2xl": "1.25rem",
                "full": "9999px",
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '88': '22rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
