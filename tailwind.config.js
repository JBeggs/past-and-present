/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        'playfair': ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
      colors: {
        // Vintage/Second-Hand Section Colors
        vintage: {
          primary: '#2C5F2D',      // Olive Green
          'primary-dark': '#1E4620',
          background: '#FAF5E9',   // Cream
          accent: '#B85042',       // Terracotta
          'accent-dark': '#8B3D32',
        },
        // New Products Section Colors
        modern: {
          primary: '#002349',      // Navy Blue
          'primary-dark': '#001830',
          background: '#F1F1F2',   // Light Gray
          accent: '#D4AF37',       // Gold
          'accent-dark': '#B8962F',
        },
        // Shared Colors
        text: {
          DEFAULT: '#333333',
          light: '#666666',
          muted: '#999999',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
