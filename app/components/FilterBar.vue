<template>
	<div class="flex flex-wrap items-center gap-3 p-4 m-6 rounded-lg">
		<USelect
			v-model="filters.weapon"
			:items="weaponOptions"
			placeholder="Weapon Type"
			:ui="{
				placeholder: 'text-neutral-50',
				value: 'text-white font-semibold',
				trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
			}"
			class="w-32"
		/>

		<USelect
			v-model="filters.collection"
			:items="collectionOptions"
			placeholder="Collection"
			:ui="{
				placeholder: 'text-neutral-50',
				value: 'text-white font-semibold',
				trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
			}"
			class="w-32"
		/>

		<USelect
			v-model="filters.tier"
			:items="tierOptions"
			placeholder="Skin Tier"
			:ui="{
				placeholder: 'text-neutral-50',
				value: 'text-white font-semibold',
				trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200'
			}"
			class="w-32"
		/>

		<UInput
			v-model="filters.search"
			icon="i-heroicons-magnifying-glass"
			placeholder="Search skins..."
			class="ml-auto"
		/>
	</div>
</template>

<script setup lang="ts">
const filters = reactive({
	weapon: '',
	collection: '',
	tier: '',
	search: ''
})

const weaponOptions = ref(['Vandal', 'Phantom', 'Operator', 'Classic'])
const collectionOptions = ref(['Prime', 'RGX 11z Pro', 'Elderflame'])
const tierOptions = ref(['Select', 'Deluxe', 'Premium', 'Ultra'])
</script>
