import daisyui from "daisyui";
import type { Config } from "tailwindcss";
const config: Config = {
	darkMode: ["selector", '[data-theme="dark"]'],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		screens: {
			mobile: {
				max: "639px",
			},
			sm: "640px",
			// => @media (min-width: 640px) { ... }

			md: "768px",
			// => @media (min-width: 768px) { ... }

			lg: "1024px",
			// => @media (min-width: 1024px) { ... }

			xl: "1440px",
			// => @media (min-width: 1440px) { ... }
		},
		extend: {
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
			},
		},
	},
	plugins: [daisyui],
	// daisyUI config (optional - here are the default values)
	daisyui: {
		themes: ["emerald", "dark"], // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
		darkTheme: "dark", // name of one of the included themes for dark mode
		base: true, // applies background color and foreground color for root element by default
		styled: true, // include daisyUI colors and design decisions for all components
		utils: true, // adds responsive and modifier utility classes
		prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
		logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
		themeRoot: ":root", // The element that receives theme color CSS variables
	},
	// https://medium.com/@achronus/solving-a-niche-frontend-problem-dynamic-tailwind-css-classes-in-react-da5f513ecf6a
	safelist: [
		"toast",
		"toast-top",
		"toast-center",
		"alert",
		"alert-error",
		"alert-success",
		"alert-warning",
		"alert-info",
		"z-50",
	],
};
export default config;
