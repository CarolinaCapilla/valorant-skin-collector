import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'
import type { Skin, SkinLevel, SkinChroma } from '~/types/skin'
import type {
	ValorantApiResponse,
	ValorantContentTier,
	ValorantSkinCollection,
	ValorantWeapon,
	BackendSkin
} from '~/types/api'
// NOTE: Do not call composables like `useRuntimeConfig()` at module top-level.
// We'll read runtime config inside actions where Vue/Nuxt setup context is available.

export const useSkinsStore = defineStore('skins', {
	state: () => ({
		skins: [] as Skin[],
		owned: [] as Skin[],
		wishlist: [] as Skin[],
		loading: false,
		// filter selections (UUIDs)
		filters: {
			weapon: '' as string,
			collection: '' as string,
			tier: '' as string,
			search: '' as string
		},
		contentTiers: [] as ValorantContentTier[],
		contentTierById: {} as Record<string, { name: string; image_url: string }>,
		skinCollections: [] as ValorantSkinCollection[],
		skinCollectionById: {} as Record<string, string>,
		weapons: [] as ValorantWeapon[],
		weaponsById: {} as Record<string, string>,
		// map skin uuid -> weapon uuid to support weapon filtering
		skinToWeaponBySkinId: {} as Record<string, string>
	}),

	getters: {
		ownedCount(): number {
			return this.owned.length
		},
		wishlistCount(): number {
			return this.wishlist.length
		},
		// value/label pairs with UUIDs for filtering
		collectionDictionary(): Array<{ value: string; label: string }> {
			return Object.keys(this.skinCollectionById)
				.map((uuid) => ({ value: uuid, label: this.skinCollectionById[uuid] ?? 'Unknown' }))
				.filter((o) => o.label.length > 0)
				.sort((a, b) => a.label.localeCompare(b.label))
		},
		contentTierDictionary(): Array<{ value: string; label: string }> {
			return this.contentTiers
				.map((t) => ({ value: t.uuid ?? '', label: (t.displayName ?? 'Unknown').trim() }))
				.filter((o) => !!o.value && !!o.label)
				.sort((a, b) => a.label.localeCompare(b.label))
		},
		weaponDictionary(): Array<{ value: string; label: string }> {
			return this.weapons
				.map((w) => ({ value: w.uuid ?? '', label: (w.displayName ?? 'Unknown').trim() }))
				.filter((o) => !!o.value && !!o.label)
				.sort((a, b) => a.label.localeCompare(b.label))
		},
		filteredSkins(): Skin[] {
			console.log('[filteredSkins] Computing filtered skins...')
			const weapon = this.filters.weapon
			const collection = this.filters.collection
			const tier = this.filters.tier
			const query = this.filters.search.toLowerCase().trim()

			const result = this.skins.filter((s) => {
				if (weapon && s.weapon !== weapon) return false
				if (collection && s.collection !== collection) return false
				if (tier && s.tier_id !== tier) return false
				if (query && !s.name.toLowerCase().includes(query)) return false
				return true
			})
			console.log('[filteredSkins] Filtered result count:', result.length)
			return result
		},
		filteredOwned(): Skin[] {
			const weapon = this.filters.weapon
			const collection = this.filters.collection
			const tier = this.filters.tier
			const query = this.filters.search.toLowerCase().trim()

			return this.owned.filter((s) => {
				if (weapon && s.weapon !== weapon) return false
				if (collection && s.collection !== collection) return false
				if (tier && s.tier_id !== tier) return false
				if (query && !s.name.toLowerCase().includes(query)) return false
				return true
			})
		},
		filteredWishlist(): Skin[] {
			const weapon = this.filters.weapon
			const collection = this.filters.collection
			const tier = this.filters.tier
			const query = this.filters.search.toLowerCase().trim()

			return this.wishlist.filter((s) => {
				if (weapon && s.weapon !== weapon) return false
				if (collection && s.collection !== collection) return false
				if (tier && s.tier_id !== tier) return false
				if (query && !s.name.toLowerCase().includes(query)) return false
				return true
			})
		}
	},

	actions: {
		addOwned(skin: Skin) {
			if (!this.owned.find((s) => s.id === skin.id)) this.owned.push(skin)
		},
		removeOwned(id: number) {
			this.owned = this.owned.filter((s) => s.id !== id)
		},
		addToWishlist(skin: Skin) {
			if (!this.wishlist.find((s) => s.id === skin.id)) this.wishlist.push(skin)
		},
		removeFromWishlist(id: number) {
			this.wishlist = this.wishlist.filter((s) => s.id !== id)
		},
		async fetchSkins(): Promise<void> {
			try {
				this.loading = true
				console.log('[fetchSkins] Starting fetch...')
				await this.fetchSkinsFromApi()
				console.log('[fetchSkins] Fetch complete (post-processing done inline)')
			} catch (error) {
				console.error('Failed to fetch skins', error)
				this.skins = []
			} finally {
				this.loading = false
			}
		},
		async fetchContentTiers(): Promise<void> {
			try {
				const res = await $fetch<ValorantApiResponse<ValorantContentTier[]>>(
					'https://valorant-api.com/v1/contenttiers'
				)
				const tiers = Array.isArray(res?.data) ? res.data : []
				this.contentTiers = tiers
				this.contentTierById = tiers.reduce(
					(acc, t) => {
						const id = t.uuid ?? ''
						if (id) acc[id] = { name: t.displayName ?? 'Unknown', image_url: t.displayIcon ?? '' }
						return acc
					},
					{} as Record<string, { name: string; image_url: string }>
				)
			} catch (error) {
				console.error('Failed to fetch content tiers', error)
			}
		},
		async fetchSkinCollections(): Promise<void> {
			try {
				const res = await $fetch<ValorantApiResponse<ValorantSkinCollection[]>>(
					'https://valorant-api.com/v1/themes'
				)
				const collections = Array.isArray(res?.data) ? res.data : []
				this.skinCollections = collections
				this.skinCollectionById = collections.reduce(
					(acc, t) => {
						const id = t.uuid ?? ''
						const name = t.displayName ?? 'Unknown'
						if (id) acc[id] = name
						return acc
					},
					{} as Record<string, string>
				)
			} catch (error) {
				console.error('Failed to fetch skin themes', error)
			}
		},
		async fetchWeapons(): Promise<void> {
			try {
				const res = await $fetch<ValorantApiResponse<ValorantWeapon[]>>(
					'https://valorant-api.com/v1/weapons'
				)
				const weapons = Array.isArray(res?.data) ? res.data : []
				this.weapons = weapons
				this.weaponsById = weapons.reduce(
					(acc, w) => {
						const id = w.uuid ?? ''
						const name = w.displayName ?? 'Unknown'
						if (id) acc[id] = name
						return acc
					},
					{} as Record<string, string>
				)
				// Build reverse map: skin uuid -> weapon uuid
				this.skinToWeaponBySkinId = weapons.reduce(
					(acc, w) => {
						const wid = w.uuid ?? ''
						if (!wid) return acc
						w.skins?.forEach((s) => {
							const sid = s.uuid ?? ''
							if (sid) acc[sid] = wid
						})
						return acc
					},
					{} as Record<string, string>
				)
			} catch (error) {
				console.error('Failed to fetch weapons', error)
			}
		},

		async fetchSkinsFromApi(): Promise<void> {
			try {
				const runtime = useRuntimeConfig()
				const BACKEND_BASE_URL = runtime.public?.backendBaseUrl ?? 'http://localhost:8000'

				// Fetch and display in batches for better UX
				const BATCH_SIZE = 300
				let allTransformed: Skin[] = []
				let page = 1
				let hasMore = true
				let globalIndex = 0

				while (hasMore) {
					const url = `${BACKEND_BASE_URL}/api/v1/skins?perPage=${BATCH_SIZE}&page=${page}`
					console.log(`[fetchSkinsFromApi] Fetching batch ${page} from:`, url)
					const res = await $fetch<{
						data?: BackendSkin[]
						meta?: { total: number; page: number; perPage: number; totalPages: number }
					}>(url)
					console.log(`[fetchSkinsFromApi] Batch ${page} response received`)

					const items = Array.isArray(res?.data) ? res.data : []

					// Transform this batch and do post-processing immediately
					console.log(`[fetchSkinsFromApi] Transforming batch ${page} (${items.length} items)...`)
					const batchTransformed: Skin[] = []
					for (let i = 0; i < items.length; i++) {
						const it = items[i]
						if (!it) continue

						const skinUuid = it.uuid ?? ''
						let weapon = it.weapon ?? ''
						let tier = it.tier ?? null
						const tierId = it.tier_id ?? ''

						// Fill weapon from reverse map when missing (post-processing inline)
						if (!weapon && skinUuid) {
							const fromMap = this.skinToWeaponBySkinId[skinUuid]
							if (fromMap) weapon = fromMap
						}

						// Fill tier meta from contentTierById when absent (post-processing inline)
						if ((!tier || !tier?.name) && tierId) {
							const tierMeta = this.contentTierById[tierId]
							if (tierMeta) tier = { name: tierMeta.name, image_url: tierMeta.image_url }
						}

						batchTransformed.push({
							id: globalIndex++,
							uuid: skinUuid,
							name: it.name ?? 'Unknown',
							image_url: it.image_url ?? it.image ?? '',
							weapon: weapon,
							collection: it.collection ?? '',
							tier: tier,
							tier_id: tierId,
							levels: (it.levels ?? []).map((lv: SkinLevel) => ({
								uuid: lv.uuid,
								displayName: lv.displayName ?? null,
								displayIcon: lv.displayIcon ?? null,
								streamedVideo: lv.streamedVideo ?? null,
								levelItem: lv.levelItem ?? null
							})),
							chromas: (it.chromas ?? []).map((ch: SkinChroma) => ({
								uuid: ch.uuid,
								displayName: ch.displayName ?? null,
								displayIcon: ch.displayIcon ?? null,
								fullRender: ch.fullRender ?? null,
								swatch: ch.swatch ?? null,
								streamedVideo: ch.streamedVideo ?? null
							}))
						})
					}

					// Add to accumulated results
					allTransformed = allTransformed.concat(batchTransformed)

					// Update UI with current batch (progressive loading)
					console.log(`[fetchSkinsFromApi] Updating UI with ${allTransformed.length} total skins...`)
					this.skins = allTransformed
					console.log(`[fetchSkinsFromApi] UI updated`)

					// Check if there are more pages
					const meta = res?.meta
					if (meta && meta.page < meta.totalPages) {
						page++
					} else {
						hasMore = false
					}
				}

				console.log('[fetchSkinsFromApi] All batches loaded. Total:', allTransformed.length)
			} catch (error) {
				console.error('Failed to fetch skins from API', error)
			}
		},

		clearFilters(): void {
			this.filters.weapon = ''
			this.filters.collection = ''
			this.filters.tier = ''
			this.filters.search = ''
		}
	}
})
