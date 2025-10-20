<template>
	<UHeader :ui="{ title: 'text-white font-bold' }">
		<!-- NOTE: Avoid using <NuxtLink> directly inside the #title slot here.
		Using NuxtLink (or ULink wrapping it) caused hydration child-node
		mismatches between SSR and client -->
		<template #title>
			<div
				class="flex items-center gap-2 justify-center cursor-pointer select-none"
				role="link"
				tabindex="0"
				aria-label="Valorant Skin Collector"
				@click="$router.push('/')"
				@keyup.enter="$router.push('/')"
				@keyup.space.prevent="$router.push('/')"
			>
				<AppLogo />
				<span>Valorant Skin Collector</span>
			</div>
		</template>

		<UNavigationMenu :items="items" variant="link" />

		<template #right>
			<!-- Authenticated user -->
			<template v-if="authStore.isLoggedIn">
				<span
					class="hidden lg:inline-flex items-center text-sm text-gray-700 dark:text-gray-300 mr-2"
				>
					Welcome, <strong class="ml-1">{{ authStore.user?.name }}</strong>
				</span>
				<UButton
					icon="i-lucide-log-out"
					color="neutral"
					variant="ghost"
					@click="handleLogout"
					class="lg:hidden"
					:loading="loggingOut"
				/>
				<UButton
					label="Logout"
					icon="i-lucide-log-out"
					color="neutral"
					variant="outline"
					@click="handleLogout"
					class="hidden lg:inline-flex"
					:loading="loggingOut"
				/>
			</template>

			<!-- Unauthenticated user -->
			<template v-else>
				<UButton
					icon="i-lucide-log-in"
					color="neutral"
					variant="ghost"
					to="/auth/login"
					class="lg:hidden"
				/>
				<UButton
					label="Sign in"
					color="neutral"
					variant="outline"
					to="/auth/login"
					class="hidden lg:inline-flex"
				/>
				<UButton
					label="Sign up"
					color="neutral"
					trailing-icon="i-lucide-arrow-right"
					class="hidden lg:inline-flex"
					to="/auth/signup"
				/>
			</template>
		</template>

		<template #body>
			<UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
			<USeparator class="my-6" />

			<!-- Mobile menu - Authenticated -->
			<template v-if="authStore.isLoggedIn">
				<div class="mb-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
					<p class="text-sm text-gray-600 dark:text-gray-400">Signed in as</p>
					<p class="font-semibold text-gray-900 dark:text-white">{{ authStore.user?.name }}</p>
				</div>
				<UButton
					label="Logout"
					icon="i-lucide-log-out"
					color="neutral"
					variant="subtle"
					block
					:loading="loggingOut"
					@click="handleLogout"
				/>
			</template>

			<!-- Mobile menu - Unauthenticated -->
			<template v-else>
				<UButton label="Sign in" color="neutral" variant="subtle" to="/auth/login" block class="mb-3" />
				<UButton label="Sign up" color="neutral" to="/auth/signup" block />
			</template>
		</template>
	</UHeader>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const notify = useNotification()
const loggingOut = ref(false)

const items = computed(() => [
	{ label: 'Home', to: '/' },
	{ label: 'Skins', to: '/skins' },
	{ label: 'Collection', to: '/collection' },
	{ label: 'Wishlist (Coming Soon)', to: '/wishlist', disabled: true }
])

async function handleLogout() {
	try {
		loggingOut.value = true
		await authStore.logout()

		notify.success('Success', 'Logged out successfully')

		router.push('/')
	} catch {
		notify.error('Error', 'Failed to logout. Please try again.')
	} finally {
		loggingOut.value = false
	}
}

// Initialize auth state on component mount
onMounted(() => {
	authStore.initAuth()
})
</script>
