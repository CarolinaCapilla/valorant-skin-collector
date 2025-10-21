<template>
	<div class="min-h-screen flex items-center justify-center">
		<UCard class="w-full max-w-md">
			<template #header>
				<div class="flex items-center gap-3">
					<UIcon name="i-lucide-loader-circle" class="w-6 h-6 animate-spin" />
					<h2 class="text-xl font-semibold">Authenticating...</h2>
				</div>
			</template>

			<div class="space-y-4">
				<p class="text-gray-600 dark:text-gray-400">
					Please wait while we complete your authentication.
				</p>

				<UProgress v-if="loading" :value="undefined" animation="carousel" />

				<div v-if="error" class="text-red-600 dark:text-red-400">
					{{ error }}
				</div>
			</div>
		</UCard>
	</div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import type { User } from '~/types/auth'

definePageMeta({
	layout: 'auth'
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notify = useNotification()

const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
	try {
		// Check if there's an error from OAuth provider
		if (route.query.error) {
			console.error('[OAuth Callback] Error in query params:', route.query.error)
			error.value = 'Authentication was cancelled or failed'
			notify.error('Error', 'Authentication failed. Please try again.')

			// Redirect to login after 2 seconds
			setTimeout(() => {
				router.push('/auth/login')
			}, 2000)
			return
		}

		// Get user data from backend
		// The Laravel backend should have already set the session cookie
		const runtime = useRuntimeConfig()
		const BACKEND_BASE_URL = runtime.public?.backendBaseUrl ?? 'http://localhost:8000'

		const response = await $fetch<{ user: User }>(`${BACKEND_BASE_URL}/api/user`, {
			credentials: 'include'
		})

		if (response.user) {
			// Set user in store
			authStore.setUser(response.user)

			notify.success('Success', `Welcome back, ${response.user.name}!`)

			// Redirect to home
			router.push('/')
		} else {
			throw new Error('Failed to retrieve user information')
		}
	} catch (err) {
		console.error('[OAuth Callback] Error:', err)
		error.value = 'Failed to complete authentication'

		notify.error('Error', 'Failed to complete authentication. Please try again.')

		// Redirect to login after 2 seconds
		setTimeout(() => {
			router.push('/auth/login')
		}, 2000)
	} finally {
		loading.value = false
	}
})
</script>
