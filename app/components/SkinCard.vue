<template>
	<UCard
		role="button"
		tabindex="0"
		class="skin-card relative overflow-hidden border border-neutral-700 transition-all duration-200 rounded-lg shadow-lg cursor-pointer focus:outline-none"
		@click="onPreview"
		@keyup.enter.stop="onPreview"
		@keyup.space.prevent.stop="onPreview"
	>
		<NuxtImg
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
				<NuxtImg
					v-if="skin.tier.image_url"
					:src="skin.tier.image_url"
					:alt="`${skin.tier.name} icon`"
					class="h-4 w-4 object-contain"
				/>
				<span class="font-medium">{{ skin.tier.name }}</span>
			</div>

			<!-- <UButton
				:label="owned ? 'Remove from Collection' : 'Add to Collection'"
				:class="['mt-3 w-full', owned ? 'btn-sweep-inverse' : 'btn-sweep']"
			/>
			<UButton
				:label="wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'"
				:class="['mt-3 w-full', wishlisted ? 'btn-sweep-inverse' : 'btn-sweep']"
			/> -->
		</div>
	</UCard>
</template>

<script setup lang="ts">
import type { Skin } from '~/data/skin'
import { onMounted } from 'vue'

const { $anime } = useNuxtApp()

const props = defineProps<{
	skin: Skin
	owned?: boolean
	wishlisted?: boolean
}>()

const emit = defineEmits<{
	(e: 'preview', skin: Skin): void
}>()

function onPreview() {
	emit('preview', props.skin)
}

onMounted(async () => {
	// 🔸 Skin card reveal animation
	// $anime({
	// 	targets: '.skin-card',
	// 	opacity: [0, 1],
	// 	translateY: [40, 0],
	// 	delay: $anime.stagger(120, { start: 400 }),
	// 	duration: 800,
	// 	easing: 'easeOutExpo'
	// })

	// 🔸 Hover glow
	const cards = document.querySelectorAll('.skin-card')
	cards.forEach((card) => {
		card.addEventListener('mouseenter', () => {
			$anime({
				targets: card,
				scale: 1.05,
				boxShadow: '0 0 25px 2px rgba(255,70,85,0.6)',
				duration: 300,
				easing: 'easeOutQuad'
			})
		})
		card.addEventListener('mouseleave', () => {
			$anime({
				targets: card,
				scale: 1,
				boxShadow: '0 0 0px rgba(0,0,0,0)',
				duration: 300,
				easing: 'easeOutQuad'
			})
		})
	})
})
</script>
