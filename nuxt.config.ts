export default defineNuxtConfig({
	modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxt/eslint', '@hypernym/nuxt-anime', '@nuxt/image'],
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
	runtimeConfig: {
		public: {
			// API base URL - override with env var in production
			apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
			backendFetchSize: 500
		}
	},
	compatibilityDate: '2025-10-10',
	anime: {
		provide: true
	},
	eslint: {
		config: {
			stylistic: {
				commaDangle: 'never',
				braceStyle: '1tbs'
			}
		}
	}
})
