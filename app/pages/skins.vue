<template>
	<div>
		<FilterBar />

		<!-- Loading state -->
		<div v-if="store.loading" class="py-12 flex flex-col items-center justify-center gap-3">
			<UIcon name="i-lucide-loader-circle" class="h-10 w-10 animate-spin text-neutral-400" />
			<p class="text-sm text-neutral-400">Loading skins...</p>
		</div>

		<!-- Skins grid -->
		<div v-else-if="total > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 px-9">
			<div v-for="skin in paginatedSkins" :key="skin.id" class="flex flex-col">
				<div
					role="button"
					tabindex="0"
					class="cursor-pointer focus:outline-none"
					@click="openPreview(skin)"
					@keyup.enter="openPreview(skin)"
					@keyup.space.prevent="openPreview(skin)"
				>
					<SkinCard :skin="skin" />
				</div>
			</div>
		</div>

		<!-- No results when search is active -->
		<div
			v-else-if="store.filters.search && total === 0"
			class="py-12 flex flex-col items-center justify-center gap-3 text-center px-6"
		>
			<UIcon name="i-lucide-alert-triangle" class="h-10 w-10 text-neutral-400 mb-2" />
			<h3 class="text-lg font-semibold text-white">No results found</h3>
			<p class="text-sm text-neutral-400">Try adjusting your search or filters.</p>
		</div>

		<div v-if="total > perPage" class="m-6 flex flex-col items-center gap-2">
			<UPagination
				v-model:page="page"
				:items-per-page="perPage"
				:total="total"
				active-variant="outline"
			/>
		</div>
		<SkinModal
			:open="modalOpen"
			:skins="modalSkins"
			:skin-index="modalSkinIndex"
			@update:open="modalOpen = $event"
			@update:skin-index="modalSkinIndex = $event"
		/>
	</div>
</template>

<script setup lang="ts">
import { useSkinsStore } from '~/stores/skins'
import { useLoadingStore } from '~/stores/loading'
import SkinModal from '~/components/SkinModal.vue'
import type { Skin } from '~/types/skin'
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

const store = useSkinsStore()
const loadingStore = useLoadingStore()

// Start loading immediately when this script runs (including navigation)
loadingStore.startLoading()

// If skins haven't been loaded yet, also show store loading
if (store.skins.length === 0) {
	store.loading = true
}

try {
	await callOnce('content-tiers', () => store.fetchContentTiers())

	await Promise.all([
		callOnce('collections', () => store.fetchSkinCollections()),
		callOnce('weapons', () => store.fetchWeapons())
	])

	await callOnce('skins', () => store.fetchSkins())
} finally {
	// Stop loading after data is ready
	loadingStore.stopLoading()
	store.loading = false
}

const { filteredSkins } = storeToRefs(store)

// Pagination (20 items per page)
const perPage = 20
const page = ref(1)
const total = computed(() => filteredSkins.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage)))

const paginatedSkins = computed(() => {
	const start = (page.value - 1) * perPage
	return filteredSkins.value.slice(start, start + perPage)
})

// Modal state for previewing skins
const modalOpen = ref(false)
const modalSkins = ref<Skin[]>([])
const modalSkinIndex = ref(0)

function openPreview(skin: Skin) {
	// Open modal over all filtered results so arrows navigate across filters
	const list = filteredSkins.value || []
	modalSkins.value = list.slice()
	const idx = modalSkins.value.findIndex((s) => s.id === skin.id)
	modalSkinIndex.value = idx >= 0 ? idx : 0
	modalOpen.value = true
}

// Reset or clamp page when filters change or total shrinks
watch(filteredSkins, () => {
	page.value = 1
})
watch(total, () => {
	if (page.value > totalPages.value) page.value = totalPages.value
})
</script>
