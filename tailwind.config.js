/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{jsx,tsx}'],
  theme: {
    colors: {
      white: 'white',
      black: 'black',
      green: {
        100: generateColorClass('green-100'),
      },
      primary: {
        900: generateColorClass('color-primary-900'),
      },
      secondary: {
        100: generateColorClass('color-secondary-100'),
        200: generateColorClass('color-secondary-200'),
        300: generateColorClass('color-secondary-300'),
        400: generateColorClass('color-secondary-400'),
        500: generateColorClass('color-secondary-500'),
        600: generateColorClass('color-secondary-600'),
      },
      tertiary: {
        900: generateColorClass('color-tertiary-900'),
      },
      danger: {
        600: generateColorClass('color-danger-600'),
        900: generateColorClass('color-danger-900'),
      },
      success: {
        900: generateColorClass('color-success-900'),
      },
      transparent: 'transparent',
    },
    fontFamily: {
      poppins: ['Poppins', 'serif'],
    },
    extend: {
      boxShadow: {
        primary: 'var(--box-shadow-primary)',
      },
      screens: {
        '2xl': '1400px',
        xs: '470px'
      },
      opacity: {
       '15': '0.15',
      }
    },
  },
  plugins: [],
};

function generateColorClass(variable) {
  return ({ opacityValue }) =>
    opacityValue
      ? `rgba(var(--${variable}), ${opacityValue})`
      : `rgb(var(--${variable}))`;
}
