/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary
        primary: {
          DEFAULT: '#2D3748',
          light: '#4A5568',
        },
        accent: {
          DEFAULT: '#48BB78',
          light: '#68D391',
        },
        // Status
        urgent: '#FC8181',
        warning: '#F6AD55',
        fresh: '#48BB78',
        expired: '#A0AEC0',
        // Background
        bg: {
          primary: '#FFFFFF',
          secondary: '#F7FAFC',
          card: '#FFFFFF',
        },
        // Text
        text: {
          primary: '#1A202C',
          secondary: '#4A5568',
          tertiary: '#A0AEC0',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-geist-sans)',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        // Heading
        'h1': ['32px', { lineHeight: '1.4', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h2': ['24px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '-0.01em' }],
        'h3': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'h4': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        // Body
        'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400', letterSpacing: '0.01em' }],
        'body-md': ['14px', { lineHeight: '1.6', fontWeight: '400', letterSpacing: '0.01em' }],
        'body-sm': ['12px', { lineHeight: '1.5', fontWeight: '400', letterSpacing: '0.02em' }],
        // Button
        'btn-lg': ['16px', { fontWeight: '600' }],
        'btn-md': ['14px', { fontWeight: '500' }],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0,0,0,0.05)',
        'md': '0 2px 8px rgba(0,0,0,0.06)',
        'lg': '0 8px 24px rgba(0,0,0,0.12)',
        'xl': '0 16px 48px rgba(0,0,0,0.16)',
      },
    },
  },
  plugins: [],
}
