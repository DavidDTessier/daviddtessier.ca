/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
			  hoverColor: "#ffaa17",
			},
			fontFamily: {
				'mono': [...defaultTheme.fontFamily.mono],
				'poppins': ['poppins', 'sans-serif']
			}
		},
	},
	darkMode: "class",
	plugins: [
		require("@tailwindcss/typography")
	],
}
