module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // 3. Add your custom fonts (if you imported them in index.css)
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Montserrat", "sans-serif"],
      },
      // 4. Add custom border radius for those soft nail-salon vibes
      borderRadius: {
        blob: "30% 70% 70% 30% / 30% 30% 70% 70%",
      },
      boxShadow: {
        "pinkGlow": "0 0 25px rgba(255, 0, 127, 0.45)",
        "pink-glow-lg": "0 0 45px rgba(255, 0, 127, 0.65)",
        "dark-card": "0 20px 50px rgba(0, 0, 0, 0.8)",
      },
    },
  },
  plugins: [],
};
