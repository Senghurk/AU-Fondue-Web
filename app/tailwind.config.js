module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}', // For pages directory
      './components/**/*.{js,ts,jsx,tsx}', // For components directory
    ],
    theme: {
      extend: {
        colors: {
          primary: '#1DA1F2', // Custom primary color
          secondary: '#14171A', // Custom secondary color
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'], // Custom font
        },
      },
    },
    plugins: [],
  };
  