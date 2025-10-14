<template>
	<UAvatar
		:src="logoUrl"
		alt="Valorant Skin Collector"
		size="lg"
		class="rounded-lg bg-transparent ring-0 shadow-none"
	/>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const config = useRuntimeConfig()
const logoUrl = computed(() => `${config.app.baseURL || '/'}valorant_skin_collector_logo.png`)
</script>
