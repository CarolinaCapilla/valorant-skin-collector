<template>
	<div>
		<AppHeader v-if="!authStore.loading" />

		<UMain>
			<slot />
		</UMain>

		<AppFooter v-if="!authStore.loading" />
	</div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
</script>
