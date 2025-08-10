/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        crypto: {
          gold: '#FFD700',
          bitcoin: '#F7931A',
          ethereum: '#627EEA',
          solana: '#9945FF'
        },
        neon: {
          blue: '#00FFFF',
          green: '#39FF14',
          pink: '#FF10F0',
          purple: '#BF00FF'
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' }
        }
      },
      fontFamily: {
        'crypto': ['Orbitron', 'monospace'],
        'gaming': ['Press Start 2P', 'monospace']
      }
    }
  },
  plugins: []
};