<template>
	<div>
		<FilterBar />

		<div
			v-if="catalogStore.loading"
			class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 px-9"
		>
			<div v-for="i in perPage" :key="`skeleton-${i}`" class="flex flex-col">
				<UCard class="relative overflow-hidden border border-neutral-700 rounded-lg shadow-lg">
					<USkeleton class="w-full h-40" />
					<div class="p-3 text-center space-y-2">
						<USkeleton class="h-4 w-3/4 mx-auto" />
						<USkeleton class="h-3 w-1/2 mx-auto" />
					</div>
				</UCard>
			</div>
		</div>

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

		<div
			v-else-if="filtersStore.search && total === 0"
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
import { useCatalogStore } from '@/stores/catalog'
import { useFiltersStore } from '@/stores/filters'
import SkinModal from '@/components/SkinModal.vue'
import type { Skin } from '@/types/skin'
import { computed, ref, watch } from 'vue'

// SEO for skins page
useHead({
	title: 'Browse Skins - Valorant Skin Collector'
})

useSeoMeta({
	description:
		'Browse the complete collection of Valorant weapon skins. Filter by weapon, collection, or tier. Track your owned skins and create your wishlist.',
	ogTitle: 'Browse Skins - Valorant Skin Collector',
	ogDescription:
		'Browse the complete collection of Valorant weapon skins. Filter by weapon, collection, or tier.',
	ogUrl: `${useRuntimeConfig().public.siteUrl}/skins`,
	twitterTitle: 'Browse Skins - Valorant Skin Collector',
	twitterDescription:
		'Browse the complete collection of Valorant weapon skins. Filter by weapon, collection, or tier.'
})

const catalogStore = useCatalogStore()
const filtersStore = useFiltersStore()

try {
	await callOnce('content-tiers', () => catalogStore.fetchContentTiers())

	await Promise.all([
		callOnce('collections', () => catalogStore.fetchSkinCollections()),
		callOnce('weapons', () => catalogStore.fetchWeapons())
	])

	// Check if skins are already loaded (cached)
	if (catalogStore.skins.length > 0) {
		// Data already cached, stop loading immediately
		catalogStore.loading = false
	} else {
		// First time loading - show skeleton while loading
		catalogStore.loading = true

		// Don't await - let it load in background, callback will hide skeleton after first batch
		callOnce('skins', () =>
			catalogStore.fetchSkins(() => {
				// Hide skeleton after first batch loads (show content immediately)
				catalogStore.loading = false
			})
		)
	}
} catch (error) {
	console.error('Error loading page data:', error)
	catalogStore.loading = false
}

const filteredSkins = computed(() => filtersStore.applyFilters(catalogStore.skins))
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
