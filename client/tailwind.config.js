/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
];

export const theme = {
  extend: {
    fontFamily: {
      'sans': ['Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      'serif': ['Roboto Slab', 'Georgia', 'serif'],
      'mono': ['Roboto Mono', 'Monaco', 'monospace'],
    },
  },
};

export const plugins = [];

