<template>
	<UModal
		title="Skin preview"
		:close="{ color: 'primary', variant: 'outline', class: 'rounded-full' }"
		:open="openProxy"
		@update:open="$emit('update:open', $event)"
	>
		<template #body>
			<div class="p-2">
				<div v-if="currentSkin" class="space-y-4">
					<!-- Media area: prefer video, fallback to placeholder -->
					<div
						class="w-full max-w-5xl mx-auto relative"
						tabindex="0"
						@keyup.left.prevent="prevSkin"
						@keyup.right.prevent="nextSkin"
					>
						<video
							v-if="activeStream"
							:key="activeStream || 'stream'"
							class="w-full rounded-lg"
							:src="activeStream || undefined"
							controls
						></video>
						<div
							v-else
							class="flex flex-col items-center justify-center h-[252px] w-[448px] bg-black/30 rounded-lg text-neutral-300 mx-auto"
						>
							<UIcon name="i-lucide-alert-triangle" class="h-10 w-10 text-neutral-400 mb-2" />
							<p>No video available</p>
						</div>
					</div>

					<!-- Level pills on left, chroma swatches on right -->
					<div class="flex items-center justify-between gap-3">
						<div class="flex items-center gap-2">
							<UButton
								v-for="(lvl, idx) in currentSkin.levels || []"
								:key="lvl.uuid || idx"
								size="xs"
								:color="idx === levelIndex ? 'primary' : 'neutral'"
								variant="outline"
								class="min-w-8"
								:disabled="!isDefaultChromaSelected"
								@click="setLevel(idx)"
							>
								{{ roman(idx + 1) }}
							</UButton>
						</div>
						<div class="flex items-center gap-2">
							<UButton
								v-for="(ch, cidx) in filteredChromas"
								:key="ch.uuid || cidx"
								variant="ghost"
								color="neutral"
								size="xs"
								class="h-8 w-8 p-0 rounded shadow-inner border !bg-cover !bg-center"
								:class="
									cidx === chromaIndex
										? 'border-primary-500 ring-1 ring-primary-500'
										: 'border-neutral-700'
								"
								:style="{ backgroundImage: `url(${ch.swatch})` }"
								:aria-label="ch.displayName || 'Chroma'"
								@click="setChroma(cidx)"
							/>
						</div>
					</div>

					<!-- Details with arrows and small icon -->
					<div class="text-center space-y-2">
						<div class="flex items-center justify-center gap-3">
							<UButton
								size="xs"
								color="neutral"
								variant="ghost"
								icon="i-lucide-arrow-left"
								:disabled="!canPrev"
								@click="prevSkin"
							>
							</UButton>
							<NuxtImg
								v-if="headerImageUrl"
								:src="headerImageUrl"
								alt="Chroma image"
								class="h-12 object-contain"
							/>
							<div v-else class="h-12 w-12" />
							<UButton
								size="xs"
								color="neutral"
								variant="ghost"
								icon="i-lucide-arrow-right"
								:disabled="!canNext"
								@click="nextSkin"
							>
							</UButton>
						</div>
						<h3 class="text-xl font-semibold text-white">
							{{ (activeChroma && activeChroma.displayName) || currentSkin.name }}
						</h3>
						<div
							v-if="currentSkin.tier?.name"
							class="flex items-center justify-center gap-2 text-neutral-300 text-sm"
						>
							<NuxtImg
								v-if="currentSkin.tier?.image_url"
								:src="currentSkin.tier.image_url"
								alt="Tier"
								class="h-4 w-4 object-contain"
							/>
							<span>{{ currentSkin.tier?.name }}</span>
						</div>
					</div>

					<!-- Actions: -->
					<!-- :class="['mt-3 w-full', owned ? 'btn-sweep-inverse' : 'btn-sweep']" -->

					<div class="flex items-center justify-center">
						<UButton
							v-if="isOwned"
							size="sm"
							color="error"
							variant="outline"
							@click="removeFromCollection"
						>
							Remove from collection
						</UButton>
						<UButton
							v-if="!isOwned"
							size="sm"
							color="error"
							variant="outline"
							@click="addToCollection"
						>
							Add to collection
						</UButton>
					</div>
				</div>

				<div v-else class="text-neutral-400 text-sm">No skins to preview.</div>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { Skin } from '~/types/skin'
import { computed, ref, watch } from 'vue'
import { useSkinsStore } from '~/stores/skins'

const store = useSkinsStore()

const props = defineProps<{
	open: boolean
	skins: Skin[]
	skinIndex: number
}>()

const emit = defineEmits<{
	(e: 'update:open', value: boolean): void
	(e: 'update:skinIndex', value: number): void
}>()

const openProxy = computed({
	get: () => props.open,
	set: (v: boolean) => emit('update:open', v)
})

const chromaIndex = ref(0)
const levelIndex = ref(0)

const currentSkin = computed(() => props.skins?.[props.skinIndex] || null)

const activeLevel = computed(() => currentSkin.value?.levels?.[levelIndex.value] || null)

// Only chromas with swatch
const filteredChromas = computed(() => {
	const chromas = currentSkin.value?.chromas || []
	return chromas.filter((c) => Boolean(c?.swatch))
})

const activeChroma = computed(() => {
	const fromFiltered = filteredChromas.value[chromaIndex.value]
	if (fromFiltered) return fromFiltered
	const rawFirst = currentSkin.value?.chromas?.[0]
	return rawFirst || null
})

const activeStream = computed<string | null>(() => {
	return (
		(activeChroma.value && activeChroma.value.streamedVideo) ||
		(activeLevel.value && activeLevel.value.streamedVideo) ||
		null
	)
})

// Header image: if chroma has swatch, show displayIcon; else fullRender
const headerImageUrl = computed(() => {
	if (!activeChroma.value) return ''
	if (activeChroma.value.swatch) return activeChroma.value.displayIcon || ''
	return activeChroma.value.fullRender || ''
})

watch(filteredChromas, (list) => {
	if (chromaIndex.value >= list.length) chromaIndex.value = 0
})

watch(currentSkin, () => {
	chromaIndex.value = 0
	levelIndex.value = 0
})

const canPrev = computed(() => props.skinIndex > 0)
const canNext = computed(() => props.skinIndex < Math.max(0, (props.skins?.length || 0) - 1))

function prevSkin() {
	if (!canPrev.value) return
	emit('update:skinIndex', props.skinIndex - 1)
}
function nextSkin() {
	if (!canNext.value) return
	emit('update:skinIndex', props.skinIndex + 1)
}

function setChroma(idx: number) {
	chromaIndex.value = idx
}
function setLevel(idx: number) {
	if (!isDefaultChromaSelected.value) return
	levelIndex.value = idx
}

// Remove currently viewed skin from the collection (respect chroma selection)
const isOwned = computed(() => {
	const baseUuid = currentSkin.value?.uuid
	if (!baseUuid) return false
	return store.owned.some((s) => s.uuid === baseUuid)
})

function addToCollection() {
	if (!currentSkin.value) return
	const baseUuid = currentSkin.value.uuid
	if (!baseUuid) return

	const found = store.owned.find((s) => s.uuid === baseUuid)
	if (found) return
	store.addOwned(currentSkin.value)
	// close modal
	openProxy.value = false
}

function removeFromCollection() {
	if (!currentSkin.value) return
	const baseUuid = currentSkin.value.uuid
	if (!baseUuid) return

	const found = store.owned.find((s) => s.uuid === baseUuid)
	if (!found) return
	store.removeOwned(found.id)
	// close modal
	openProxy.value = false
}

const isDefaultChromaSelected = computed(() => chromaIndex.value === 0)

function roman(n: number): string {
	// Only levels 1-4 are possible; map directly
	const map = ['I', 'II', 'III', 'IV']
	const idx = Math.max(1, Math.floor(n)) - 1
	return map[idx] ?? 'I'
}
</script>
