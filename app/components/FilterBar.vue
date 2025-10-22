<template>
	<div
		class="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 p-4 m-6 rounded-lg"
	>
		<!-- Filter dropdowns only on mobile, dropdowns + clear button on desktop -->
		<div class="flex flex-wrap items-center gap-3 flex-1">
			<USelect
				v-model="weapon"
				:items="weaponDictionary"
				placeholder="Weapon Type"
				:ui="{
					placeholder: 'text-neutral-50',
					value: 'text-white font-semibold',
					trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
				}"
				class="w-38"
			/>

			<USelect
				v-model="collection"
				:items="collectionDictionary"
				placeholder="Collection"
				:ui="{
					placeholder: 'text-neutral-50',
					value: 'text-white font-semibold',
					trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
				}"
				class="w-38"
			/>
			<USelect
				v-model="tier"
				:items="contentTierDictionary"
				placeholder="Skin Tier"
				:ui="{
					placeholder: 'text-neutral-50',
					value: 'text-white font-semibold',
					trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
				}"
				class="w-38"
			/>
			<!-- Clear button only visible on desktop -->
			<UButton
				class="ml-2 hidden sm:block"
				label="Clear filters"
				color="neutral"
				variant="soft"
				:disabled="!isDirty"
				:ui="{
					leadingIcon: 'text-primary'
				}"
				:loading="isClearingFilters"
				@click="clearCurrentFilters()"
			/>
		</div>

		<!-- Search bar - same width as filters on mobile, right aligned on desktop -->
		<UInput
			v-model="search"
			placeholder="Search skins..."
			class="w-38 sm:w-48 sm:ml-auto"
			:ui="{ trailing: 'pe-1' }"
		>
			<template v-if="search?.length" #trailing>
				<UButton
					v-if="search"
					icon="i-lucide-circle-x"
					variant="link"
					size="xs"
					color="neutral"
					aria-label="Clear search"
					:ui="{
						leadingIcon: 'text-primary'
					}"
					:loading="isClearingQuery"
					@click.stop="clearSearchQuery()"
				/>
			</template>
		</UInput>

		<!-- Clear filters button only visible on mobile - same width as filters -->
		<UButton
			class="sm:hidden w-38"
			label="Clear filters"
			color="neutral"
			variant="soft"
			:disabled="!isDirty"
			:ui="{
				leadingIcon: 'text-primary'
			}"
			:loading="isClearingFilters"
			@click="clearCurrentFilters()"
		/>
	</div>
</template>

<script setup lang="ts">
import { useSkinsStore } from '~/stores/skins'
import { toRef, computed, ref } from 'vue'

const store = useSkinsStore()
const { collectionDictionary, contentTierDictionary, weaponDictionary } = storeToRefs(store)

const weapon = toRef(store.filters, 'weapon')
const collection = toRef(store.filters, 'collection')
const tier = toRef(store.filters, 'tier')
const search = toRef(store.filters, 'search')

const isClearingFilters = ref(false)
const isClearingQuery = ref(false)

const isDirty = computed(() => !!weapon.value || !!collection.value || !!tier.value)

const clearCurrentFilters = async () => {
	isClearingFilters.value = true

	await new Promise((r) => setTimeout(r, 100))

	store.clearFilters()

	isClearingFilters.value = false
}

const clearSearchQuery = async () => {
	if (!search.value) return

	isClearingQuery.value = true

	await new Promise((r) => setTimeout(r, 100))

	store.filters.search = ''

	isClearingQuery.value = false
}
</script>
