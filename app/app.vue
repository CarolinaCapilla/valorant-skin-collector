<template>
	<UApp :toaster="toaster" class="min-h-screen font-sans">
		<!-- Full-screen loading overlay for auth initialization and page navigation -->
		<Transition
			enter-active-class="transition-opacity duration-200"
			leave-active-class="transition-opacity duration-200"
			enter-from-class="opacity-0"
			leave-to-class="opacity-0"
		>
			<div
				v-if="showLoading"
				class="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900"
			>
				<div class="flex flex-col items-center gap-3">
					<UIcon name="i-lucide-loader-circle" class="h-8 w-8 animate-spin text-primary" />
				</div>
			</div>
		</Transition>

		<!-- Main app content - hidden during initial load to prevent FOUC -->
		<div v-show="!authStore.loading">
			<NuxtLayout>
				<NuxtPage />
			</NuxtLayout>
		</div>
	</UApp>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useLoadingStore } from '~/stores/loading'

const toaster = { position: 'top-right' as const }
const authStore = useAuthStore()
const loadingStore = useLoadingStore()
const config = useRuntimeConfig()

// SEO meta tags for social media sharing
const siteUrl = config.public.siteUrl
const ogImageUrl = `${siteUrl}/valorant_skin_collector_main.png`

useHead({
	meta: [
		// Open Graph / Facebook / WhatsApp
		{ property: 'og:type', content: 'website' },
		{ property: 'og:url', content: siteUrl },
		{ property: 'og:title', content: 'Valorant Skin Collector' },
		{
			property: 'og:description',
			content:
				'Browse and track every Valorant weapon skin with ease. Discover, collect, and wishlist — all for free, all in one place.'
		},
		{ property: 'og:image', content: ogImageUrl },
		{ property: 'og:image:secure_url', content: ogImageUrl },
		{ property: 'og:image:type', content: 'image/png' },
		{ property: 'og:image:width', content: '2614' },
		{ property: 'og:image:height', content: '1398' },
		{ property: 'og:image:alt', content: 'Valorant Skin Collector Preview' },
		{ property: 'og:site_name', content: 'Valorant Skin Collector' },
		// Twitter
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:title', content: 'Valorant Skin Collector' },
		{
			name: 'twitter:description',
			content:
				'Browse and track every Valorant weapon skin with ease. Discover, collect, and wishlist — all for free, all in one place.'
		},
		{ name: 'twitter:image', content: ogImageUrl },
		{ name: 'twitter:image:alt', content: 'Valorant Skin Collector Preview' }
	]
})

// Computed to show loading if either auth or global loading is active
const showLoading = computed(() => authStore.loading || loadingStore.isLoading)

// Initialize auth state on app mount - this runs once when the app loads
onMounted(async () => {
	await authStore.initAuth()
})
</script>
