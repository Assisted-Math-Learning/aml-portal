module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: ['h-[3.75rem]', 'h-[6.25rem]', 'w-[3.75rem]', 'w-[6.25rem]'],
  theme: {
    extend: {
      colors: {
        primary: '#5988FF',
        disabled: '#D9D9D9',
        purple: '#b400ff',
        error: '#d32f2f',
        keyboardButtonActiveBg: '#6A6A6A',
        headingTextColor: '#333F61',
        digitTextColor: '#A5A5A5',
      },
      fontFamily: {
        quicksand: ['"Quicksand"', 'sans-serif'],
        publicSans: ['"Public Sans"', 'sans-serif'],
        roboto: ['"Roboto"', 'sans-serif'],
      },
      animation: {
        borderFadeIn: 'borderFadeIn 1s ease-in-out'
      }
    },
  },
};
