export default defineNuxtConfig({
	modules: [
		'@nuxt/ui',
		'@pinia/nuxt',
		'@nuxt/eslint',
		'@hypernym/nuxt-anime',
		'@nuxt/image',
		'@nuxtjs/color-mode'
	],
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

	colorMode: {
		preference: 'dark',
		fallback: 'dark',
		hid: 'nuxt-color-mode-script',
		globalName: '__NUXT_COLOR_MODE__',
		componentName: 'ColorScheme',
		classPrefix: '',
		classSuffix: '',
		storageKey: 'nuxt-color-mode'
	},

	ui: {
		theme: {
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
	nitro: {
		routeRules: {
			'/': { headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' } },
			'/**': { headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' } }
		}
	},
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
