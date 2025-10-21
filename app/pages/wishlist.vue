<template>
	<div>
		<div class="px-6 md:px-9 py-6">
			<h1 class="text-2xl font-bold text-white">My Wishlist</h1>
			<p class="mt-1 text-sm text-neutral-400">{{ wishlistCount }} skins in wishlist</p>

			<div v-if="wishlistCount === 0" class="mt-4">
				<div class="rounded-md border border-neutral-700 bg-neutral-900/50 p-4 text-neutral-300">
					You haven't added any skins to your wishlist yet.
					<NuxtLink to="/skins" class="ml-1 text-primary hover:underline"> Browse skins </NuxtLink>
				</div>
			</div>
		</div>

		<section v-for="group in groupedWeapons" :key="group.name" class="px-6 md:px-9 py-4">
			<h2 class="mb-3 text-lg font-semibold text-neutral-200">{{ group.name }}</h2>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
				<UCard
					v-for="weapon in group.weapons"
					:key="weapon.uuid"
					class="relative overflow-hidden border border-neutral-700 rounded-lg shadow-lg"
				>
					<div class="flex items-center gap-3 p-3 border-b border-neutral-800/70">
						<NuxtImg
							v-if="weapon.displayIcon"
							:src="weapon.displayIcon || undefined"
							:alt="weapon.displayName || 'Weapon'"
							class="h-6 w-6 object-contain"
						/>
						<h3 class="font-medium text-neutral-200">{{ weapon.displayName }}</h3>
						<span class="ml-auto text-xs text-neutral-500">
							{{ wishlistForWeapon(weapon.uuid).length }} in wishlist
						</span>
					</div>

					<div class="p-3">
						<!-- Main preview with Carousel (clickable to open modal) -->
						<div
							class="group relative h-48 flex items-center justify-center bg-black/20 rounded-md cursor-pointer"
							role="button"
							tabindex="0"
							@click="openModal(weapon.uuid)"
							@keyup.enter="openModal(weapon.uuid)"
							@keyup.space="openModal(weapon.uuid)"
						>
							<template v-if="wishlistForWeapon(weapon.uuid).length">
								<UCarousel
									v-slot="{ item }"
									:items="carouselImagesForWeapon(weapon.uuid)"
									class="w-full h-full flex items-center justify-center"
									@select="(i) => handleCarouselSelect(weapon.uuid, i)"
								>
									<div class="flex flex-col items-center justify-center py-2 px-3">
										<NuxtImg
											:src="String(item)"
											alt="Skin preview"
											class="max-h-36 object-contain"
										/>
										<div class="mt-2 text-center text-sm text-neutral-200 truncate max-w-full">
											{{ nameByImage(weapon.uuid, item) }}
										</div>
									</div>
								</UCarousel>
							</template>
							<template v-else>
								<span class="text-sm text-neutral-400">No wishlist skins for this weapon</span>
							</template>

							<!-- Visual affordances: chevrons + swipe hint -->
							<div
								class="pointer-events-none absolute inset-0 hidden sm:flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
							>
								<UButton
									size="xs"
									color="neutral"
									variant="ghost"
									class="pointer-events-none"
									icon="i-lucide-arrow-left"
								/>
								<UButton
									size="xs"
									color="neutral"
									variant="ghost"
									class="pointer-events-none"
									icon="i-lucide-arrow-right"
								/>
							</div>
							<div
								class="pointer-events-none absolute bottom-1 left-2 right-2 flex items-center justify-between text-[11px] text-neutral-300/80"
							>
								<span>Swipe for next</span>
								<span>{{ wishlistForWeapon(weapon.uuid).length }} skins</span>
							</div>
						</div>

						<!-- Manage link -->
						<div class="mt-3 flex items-center justify-end gap-3">
							<UButton size="xs" color="primary" variant="outline" @click="openModal(weapon.uuid)">
								View
							</UButton>
						</div>
					</div>
				</UCard>
			</div>
		</section>

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
import type { ValorantWeapon } from '~/types/api'
import type { Skin } from '~/types/skin'

const store = useSkinsStore()

// Ensure data is available
await callOnce('wishlist:content-tiers', () => store.fetchContentTiers())
await Promise.all([
	callOnce('wishlist:skin-collections', () => store.fetchSkinCollections()),
	callOnce('wishlist:weapons', () => store.fetchWeapons()),
	callOnce('wishlist:skins', () => store.fetchSkins())
])

// Wait a tick to ensure reactive state is updated
await nextTick()
await store.fetchUserWishlist()

const wishlistCount = computed(() => store.wishlist.length)
// helper: normalize API categories to nice labels + order
const categoryLabel = (raw?: string) => {
	switch (raw) {
		case 'EEquippableCategory::Sidearm':
			return 'Sidearms'
		case 'EEquippableCategory::SMG':
			return 'SMGs'
		case 'EEquippableCategory::Shotgun':
			return 'Shotguns'
		case 'EEquippableCategory::Rifle':
			return 'Rifles'
		case 'EEquippableCategory::Sniper':
			return 'Snipers'
		case 'EEquippableCategory::Heavy':
			return 'Heavy Weapons'
		case 'EEquippableCategory::Melee':
			return 'Melee'
		default:
			return raw || 'Other'
	}
}

const categoryOrder = [
	'Sidearms',
	'SMGs',
	'Shotguns',
	'Rifles',
	'Snipers',
	'Heavy Weapons',
	'Melee'
]

const groupedWeapons = computed(() => {
	const groups = new Map<string, ValorantWeapon[]>()
	for (const w of store.weapons) {
		const label = categoryLabel(w.category)
		if (!groups.has(label)) groups.set(label, [])
		groups.get(label)!.push(w)
	}
	const result = Array.from(groups.entries()).map(([name, weapons]) => ({ name, weapons }))
	// sort by our desired order
	result.sort((a, b) => categoryOrder.indexOf(a.name) - categoryOrder.indexOf(b.name))
	return result
})

// Build wishlist skins by weapon map for quick lookup
const wishlistByWeapon = computed(() => {
	const map: Record<string, Skin[]> = {}
	for (const s of store.wishlist) {
		const wid = s.weapon || ''
		if (!wid) continue
		if (!map[wid]) map[wid] = []
		map[wid]!.push(s)
	}
	// keep stable order by name
	for (const wid of Object.keys(map)) {
		const arr = map[wid]!
		arr.sort((a, b) => a.name.localeCompare(b.name))
	}
	return map
})

const wishlistForWeapon = (weaponId?: string) => {
	if (!weaponId) return []
	return wishlistByWeapon.value[weaponId] || []
}

// Carousel helpers - use favorite chroma image if available
const carouselImagesForWeapon = (weaponId?: string): string[] =>
	wishlistForWeapon(weaponId)
		.map((skin) => {
			// Check if this skin has a favorite chroma
			const favoriteChromaUuid = store.wishlistFavoriteChromas[skin.uuid || '']
			if (favoriteChromaUuid && skin.chromas) {
				// Find the favorite chroma and use its image
				const favoriteChroma = skin.chromas.find((c) => c.uuid === favoriteChromaUuid)
				if (favoriteChroma?.displayIcon) {
					return favoriteChroma.displayIcon
				}
			}
			// Default: use the base skin image
			return skin.image_url || ''
		})
		.filter(Boolean)

const nameByImage = (weaponId: string | undefined, item: unknown): string => {
	const src = String(item || '')
	if (!src) return ''
	const found = wishlistForWeapon(weaponId).find((skin) => {
		// Check if image matches base skin
		if (skin.image_url === src) return true
		// Check if image matches any chroma
		if (skin.chromas) {
			return skin.chromas.some((c) => c.displayIcon === src)
		}
		return false
	})
	if (!found) return ''

	// If this is a chroma image, find which chroma and return its name
	if (found.chromas) {
		const matchingChroma = found.chromas.find((c) => c.displayIcon === src)
		if (matchingChroma?.displayName) {
			return matchingChroma.displayName
		}
	}

	return found.name ?? ''
}

// Modal state and helpers
const modalOpen = ref(false)
const modalWeaponId = ref<string | null>(null)
const modalSkinIndex = ref(0)

const modalSkins = computed(() => wishlistForWeapon(modalWeaponId.value || undefined))

// Track current carousel index per weapon so modal can open on visible skin
const carouselIndex = reactive<Record<string, number>>({})

const openModal = (weaponId?: string) => {
	if (!weaponId) return
	modalWeaponId.value = weaponId
	// Use tracked carousel index for this weapon (default 0)
	modalSkinIndex.value = carouselIndex[weaponId] || 0
	modalOpen.value = true
}

function handleCarouselSelect(weaponId: string | undefined, index: number) {
	if (!weaponId) return
	carouselIndex[weaponId] = index
}
</script>
