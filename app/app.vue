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
useSeoMeta({
	title: 'Valorant Skin Collector - Browse & Track Your Valorant Skins',
	description:
		'Browse and track every Valorant weapon skin with ease. Discover, collect, and wishlist — all for free, all in one place.',
	ogTitle: 'Valorant Skin Collector',
	ogDescription:
		'Browse and track every Valorant weapon skin with ease. Discover, collect, and wishlist — all for free, all in one place.',
	ogImage: `${config.public.siteUrl}/valorant_skin_collector_main.png`,
	ogImageWidth: '2614',
	ogImageHeight: '1398',
	ogUrl: config.public.siteUrl,
	ogType: 'website',
	twitterCard: 'summary_large_image',
	twitterTitle: 'Valorant Skin Collector',
	twitterDescription:
		'Browse and track every Valorant weapon skin with ease. Discover, collect, and wishlist — all for free, all in one place.',
	twitterImage: `${config.public.siteUrl}/valorant_skin_collector_main.png`
})

// Computed to show loading if either auth or global loading is active
const showLoading = computed(() => authStore.loading || loadingStore.isLoading)

// Initialize auth state on app mount - this runs once when the app loads
onMounted(async () => {
	await authStore.initAuth()
})
</script>
