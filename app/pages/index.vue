<template>
	<div>
		<FilterBar />
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 px-9">
			<SkinCard v-for="skin in filteredSkins" :key="skin.id" :skin="skin" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { useSkinsStore } from '~/stores/skins'

const store = useSkinsStore()

await callOnce('content-tiers', () => store.fetchContentTiers())

await Promise.all([
	callOnce('collections', () => store.fetchSkinCollections()),
	callOnce('weapons', () => store.fetchWeapons())
])

await callOnce('skins', () => store.fetchSkins())
const { filteredSkins } = storeToRefs(store)
</script>
