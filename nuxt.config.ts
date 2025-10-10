export default defineNuxtConfig({
	modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxt/eslint'],
	devtools: {
		enabled: true
	},
	css: ['~/assets/css/main.css'],
	ui: {
		theme: {
			// Register additional semantic color names (strings), not objects
			// If you only use the defaults, you can remove this block entirely.
			colors: ['primary', 'secondary', 'tertiary', 'info', 'success', 'warning', 'error']
		}
	},
	compatibilityDate: '2025-10-10',
	eslint: {
		config: {
			stylistic: {
				commaDangle: 'never',
				braceStyle: '1tbs'
			}
		}
	}
})
