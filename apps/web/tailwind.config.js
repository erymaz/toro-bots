module.exports = {
  // Uncomment the line below to enable the experimental Just-in-Time ("JIT") mode.
  // https://tailwindcss.com/docs/just-in-time-mode
  // mode: "jit",
  theme: {
    extend: {
      zIndex: {
        '-1': '-1',
       },
    },
    minHeight: {
      400: '400px'
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      blue: {
        light: '#85d7ff',
        DEFAULT: '#1fb6ff',
        dark: '#009eeb',
      },
      pink: {
        light: '#ff7ce5',
        DEFAULT: '#ff49db',
        dark: '#ff16d1',
      },
      gray: {
        darkest: '#1d1d1d6e',
        dark: '#393c45',              // in use
        DEFAULT: '#c0ccda',
        light: '#e0e6ed',             // in use
        lightest: '#f9fafc',
      },
      green: {
        dark: '#06751d',
        DEFAULT: '#19e042',
        light: '#b6f0c2',
      },
      red: {
        dark: '#fc9292',
        DEFAULT: '#ff0000',
        light: '#540303',
      },
      yellow: {
        dark: '#f8fa84',
        DEFAULT: '#fbff00',
        light: '#67690c',
      }
    }
  },
  variants: {},
  plugins: [],
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
};
