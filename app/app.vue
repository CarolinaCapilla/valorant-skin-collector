<template>
	<UApp :toaster="toaster" class="min-h-screen font-sans">
		<!-- Full-screen loading overlay during auth initialization -->
		<Transition
			enter-active-class="transition-opacity duration-200"
			leave-active-class="transition-opacity duration-200"
			enter-from-class="opacity-0"
			leave-to-class="opacity-0"
		>
			<div
				v-if="authStore.loading"
				class="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900"
			>
				<UIcon name="i-lucide-loader-circle" class="h-8 w-8 animate-spin text-primary" />
			</div>
		</Transition>

		<!-- Main app content - always rendered -->
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const toaster = { position: 'top-right' as const }
const authStore = useAuthStore()

// Initialize auth state on app mount - this runs once when the app loads
onMounted(async () => {
	await authStore.initAuth()
})
</script>
