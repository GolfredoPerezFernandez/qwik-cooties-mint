/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}',
  './node_modules/flowbite/**/*.js' // add this line

],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin') // add this line

  ],
};
