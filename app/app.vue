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

// Computed to show loading if either auth or global loading is active
const showLoading = computed(() => authStore.loading || loadingStore.isLoading)

// Initialize auth state on app mount - this runs once when the app loads
onMounted(async () => {
	// Hide the initial loading screen once Vue is ready
	const loadingScreen = document.getElementById('loading-screen')
	if (loadingScreen) {
		loadingScreen.style.display = 'none'
	}

	await authStore.initAuth()
})
</script>
