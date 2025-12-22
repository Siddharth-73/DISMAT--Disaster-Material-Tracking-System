export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0E14',
        'obsidian-foreground': '#1A1D24',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(255, 255, 255, 0.1)',
        'inner-glow': 'inset 0 0 20px 0 rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
