<template>
	<UCard
		class="relative overflow-hidden border border-neutral-700 hover:border-primary hover:scale-[1.02] transition-all duration-200 rounded-lg shadow-lg"
	>
		<img
			:src="skin.image_url"
			:alt="skin.name"
			class="w-full h-40 object-contain p-2 bg-black/20"
		/>
		<div class="p-3 text-center">
			<h3 class="font-bold text-neutral text-sm tracking-wide uppercase">
				{{ skin.name }}
			</h3>
			<div
				v-if="skin.tier"
				class="mt-1 flex items-center justify-center gap-2 text-xs text-neutral-300"
			>
				<img
					v-if="skin.tier.image_url"
					:src="skin.tier.image_url"
					:alt="`${skin.tier.name} icon`"
					class="h-4 w-4 object-contain"
				/>
				<span class="font-medium">{{ skin.tier.name }}</span>
			</div>

			<UButton
				:label="owned ? 'In Collection' : 'Add to Collection'"
				:color="owned ? 'neutral' : 'primary'"
				:variant="owned ? 'soft' : 'solid'"
				class="mt-3 w-full"
			/>
			<UButton
				:label="wishlisted ? 'In Wishlist' : 'Add to Wishlist'"
				:color="wishlisted ? 'neutral' : 'primary'"
				:variant="wishlisted ? 'soft' : 'outline'"
				class="mt-3 w-full"
			/>
		</div>
	</UCard>
</template>

<script setup lang="ts">
import type { Skin } from '~/data/skin'

defineProps<{
	skin: Skin
	owned?: boolean
	wishlisted?: boolean
}>()
</script>
