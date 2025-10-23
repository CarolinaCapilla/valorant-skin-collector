export default defineNuxtConfig({
	modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxt/eslint', '@hypernym/nuxt-anime', '@nuxt/image'],
	devtools: {
		enabled: true
	},
	app: {
		head: {
			htmlAttrs: {
				lang: 'en'
			},
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1',
			title: 'Valorant Skin Collector - Browse & Track Your Valorant Skins',
			meta: [
				{
					name: 'description',
					content:
						'Browse and track every Valorant weapon skin with ease. Discover, collect, and wishlist — all for free, all in one place.'
				},
				{
					name: 'keywords',
					content: 'Valorant, skins, weapon skins, collection, tracker, wishlist, gaming'
				}
			],
			link: [{ rel: 'icon', type: 'image/png', href: '/valorant_skin_collector_logo.png' }]
		}
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
			backendFetchSize: 500,
			// Site URL for OG images
			siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
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
