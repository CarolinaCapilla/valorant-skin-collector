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
			<UButton
				icon="i-lucide-log-in"
				color="neutral"
				variant="ghost"
				to="/login"
				class="lg:hidden"
			/>
			<UButton
				label="Sign in"
				color="neutral"
				variant="outline"
				to="/login"
				class="hidden lg:inline-flex"
			/>
			<UButton
				label="Sign up"
				color="neutral"
				trailing-icon="i-lucide-arrow-right"
				class="hidden lg:inline-flex"
				to="/signup"
			/>
		</template>

		<template #body>
			<UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
			<USeparator class="my-6" />
			<UButton label="Sign in" color="neutral" variant="subtle" to="/login" block class="mb-3" />
			<UButton label="Sign up" color="neutral" to="/signup" block />
		</template>
	</UHeader>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const items = computed(() => [
	{ label: 'Home', to: '/' },
	{ label: 'Skins', to: '/skins' },
	{ label: 'Collection', to: '/collection' },
	{ label: 'Wishlist (Coming Soon)', to: '/wishlist', disabled: true }
])
</script>
