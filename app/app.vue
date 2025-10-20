<template>
	<UApp :toaster="toaster" class="min-h-screen font-sans">
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</UApp>
</template>

<script setup lang="ts">
const toaster = { position: 'top-right' as const }
</script>
