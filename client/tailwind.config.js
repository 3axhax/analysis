/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
];

export const theme = {
  extend: {
    fontFamily: {
      'sofia': ['Sofia Sans', 'sans-serif'],
    },
    fontWeight: {
      'thin': 100,
      'extralight': 200,
      'light': 300,
      'normal': 400,
      'medium': 500,
      'semibold': 600,
      'bold': 700,
      'extrabold': 800,
      'black': 900,
    }
  },
};

export const plugins = [];

