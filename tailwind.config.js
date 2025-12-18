import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx', // This line is crucial, it scans your React components for class names
    ],

    theme: {
        extend: {
            fontFamily: {
                // We are using the professional 'Inter' font we used in the HTML mockups
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            // THIS IS THE NEW SECTION WE ARE ADDING
            colors: {
                'brand-dark': '#0a2540',      // Your primary dark navy
                'brand-blue': '#007bff',      // Your bright, primary accent blue
                'brand-orange': '#fd7e14',     // A vibrant orange accent for buttons or highlights
                'brand-light': '#f0f2f5',     // The main light grey page background
                'brand-white': '#ffffff',     // Pure white for cards and modals
                'brand-blue': '#144E8A', // A slightly deeper blue for gradients
                'brand-orange': '#ff6b35',
                'brand-text': '#1d2d3e',      // The primary text color, almost black
                'brand-secondary': '#6c757d',  // Secondary text color for subtitles
            },
        },
    },

    plugins: [forms],
};