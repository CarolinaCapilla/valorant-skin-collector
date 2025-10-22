import { defineStore } from 'pinia'
import type { Skin, SkinLevel, SkinChroma } from '~/types/skin'
import type {
	ValorantApiResponse,
	ValorantContentTier,
	ValorantSkinCollection,
	ValorantWeapon,
	BackendSkin
} from '~/types/api'

// Map of skin UUID to favorite chroma UUID
type FavoriteChromaMap = Record<string, string | undefined>

export const useSkinsStore = defineStore('skins', {
	state: () => ({
		skins: [] as Skin[],
		owned: [] as Skin[],
		wishlist: [] as Skin[],
		ownedFavoriteChromas: {} as FavoriteChromaMap,
		wishlistFavoriteChromas: {} as FavoriteChromaMap,
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
			return this._applyFilters(this.skins)
		},
		filteredOwned(): Skin[] {
			return this._applyFilters(this.owned)
		},
		filteredWishlist(): Skin[] {
			return this._applyFilters(this.wishlist)
		},
		_applyFilters(): (skins: Skin[]) => Skin[] {
			const { weapon, collection, tier, search } = this.filters
			const query = search.toLowerCase().trim()

			return (skins: Skin[]) =>
				skins.filter((s) => {
					if (weapon && s.weapon !== weapon) return false
					if (collection && s.collection !== collection) return false
					if (tier && s.tier_id !== tier) return false
					if (query && !s.name.toLowerCase().includes(query)) return false
					return true
				})
		}
	},

	actions: {
		_getBackendUrl(): string {
			const runtime = useRuntimeConfig()
			return runtime.public?.apiBaseUrl ?? 'http://localhost:8000'
		},

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
				await this.fetchSkinsFromApi()
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
				const BACKEND_BASE_URL = runtime.public?.apiBaseUrl ?? 'http://localhost:8000'

				// Fetch and display in batches for better UX
				const BATCH_SIZE = 300
				let allTransformed: Skin[] = []
				let page = 1
				let hasMore = true
				let globalIndex = 0

				while (hasMore) {
					const url = `${BACKEND_BASE_URL}/api/v1/skins?perPage=${BATCH_SIZE}&page=${page}`
					const res = await $fetch<{
						data?: BackendSkin[]
						meta?: { total: number; page: number; perPage: number; totalPages: number }
					}>(url)

					const items = Array.isArray(res?.data) ? res.data : []

					// Transform this batch and do post-processing immediately
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
					this.skins = allTransformed
					// Check if there are more pages
					const meta = res?.meta
					if (meta && meta.page < meta.totalPages) {
						page++
					} else {
						hasMore = false
					}
				}
			} catch (error) {
				console.error('Failed to fetch skins from API', error)
			}
		},

		clearFilters(): void {
			this.filters.weapon = ''
			this.filters.collection = ''
			this.filters.tier = ''
			this.filters.search = ''
		},

		/**
		 * Fetch user's collection from backend
		 */
		async fetchUserCollection(): Promise<void> {
			try {
				const runtime = useRuntimeConfig()
				const BACKEND_BASE_URL = runtime.public?.apiBaseUrl ?? 'http://localhost:8000'

				const res = await $fetch<{
					data?: Array<{
						skin_uuid: string
						metadata?: { favorite_chroma_uuid?: string } | null
					}>
				}>(`${BACKEND_BASE_URL}/api/v1/user/collection`)

				const userSkins = res?.data || []

				// Map backend skin_uuids to our Skin objects
				this.owned = this.skins.filter((skin) => userSkins.some((us) => us.skin_uuid === skin.uuid))

				// Fix weapon field if empty by looking up in skinToWeaponBySkinId map
				this.owned.forEach((skin) => {
					if (!skin.weapon && skin.uuid) {
						const weaponId = this.skinToWeaponBySkinId[skin.uuid]
						if (weaponId) {
							skin.weapon = weaponId
						}
					}
				})

				// Extract favorite chromas
				this.ownedFavoriteChromas = {}
				userSkins.forEach((us) => {
					if (us.metadata?.favorite_chroma_uuid) {
						this.ownedFavoriteChromas[us.skin_uuid] = us.metadata.favorite_chroma_uuid
					}
				})
			} catch (error) {
				console.error('Failed to fetch user collection', error)
				this.owned = []
				this.ownedFavoriteChromas = {}
			}
		},

		/**
		 * Add skin to user's collection
		 */
		async addSkinToCollection(skinUuid: string, favoriteChromaUuid?: string): Promise<void> {
			try {
				const runtime = useRuntimeConfig()
				const BACKEND_BASE_URL = runtime.public?.apiBaseUrl ?? 'http://localhost:8000'

				const body: {
					skin_uuid: string
					owned: boolean
					favorite_chroma_uuid?: string
				} = {
					skin_uuid: skinUuid,
					owned: true
				}

				if (favoriteChromaUuid) {
					body.favorite_chroma_uuid = favoriteChromaUuid
				}

				await $fetch(`${BACKEND_BASE_URL}/api/v1/user/collection`, {
					method: 'POST',
					body
				})

				// Update local state
				const skin = this.skins.find((s) => s.uuid === skinUuid)
				if (skin && !this.owned.find((s) => s.uuid === skinUuid)) {
					this.owned.push(skin)
				}

				// Update favorite chroma if provided
				if (favoriteChromaUuid) {
					this.ownedFavoriteChromas[skinUuid] = favoriteChromaUuid
				}

				// Automatically remove from wishlist if present
				const isInWishlist = this.wishlist.find((s) => s.uuid === skinUuid)
				if (isInWishlist) {
					await this.removeSkinFromWishlist(skinUuid)
				}
			} catch (error) {
				console.error('Failed to add skin to collection', error)
				throw error
			}
		},

		/**
		 * Remove skin from user's collection
		 */
		async removeSkinFromCollection(skinUuid: string): Promise<void> {
			try {
				const runtime = useRuntimeConfig()
				const BACKEND_BASE_URL = runtime.public?.apiBaseUrl ?? 'http://localhost:8000'

				const url = `${BACKEND_BASE_URL}/api/v1/user/collection/skin`

				await $fetch(url, {
					method: 'DELETE',
					query: {
						skin_uuid: skinUuid
					}
				})

				// Update local state
				this.owned = this.owned.filter((s) => s.uuid !== skinUuid)
			} catch (error) {
				console.error('Failed to remove skin from collection', error)
				throw error
			}
		},

		/**
		 * Update favorite chroma for an owned skin
		 */
		async updateFavoriteChroma(skinUuid: string, favoriteChromaUuid: string): Promise<void> {
			try {
				const runtime = useRuntimeConfig()
				const BACKEND_BASE_URL = runtime.public?.apiBaseUrl ?? 'http://localhost:8000'

				await $fetch(`${BACKEND_BASE_URL}/api/v1/user/collection/favorite-chroma`, {
					method: 'PATCH',
					body: {
						skin_uuid: skinUuid,
						favorite_chroma_uuid: favoriteChromaUuid
					}
				})

				// Update local state
				this.ownedFavoriteChromas[skinUuid] = favoriteChromaUuid
			} catch (error) {
				console.error('Failed to update favorite chroma', error)
				throw error
			}
		},

		/**
		 * Fetch user's wishlist from backend
		 */
		async fetchUserWishlist(): Promise<void> {
			try {
				const runtime = useRuntimeConfig()
				const BACKEND_BASE_URL = runtime.public?.apiBaseUrl ?? 'http://localhost:8000'

				const res = await $fetch<{
					data?: Array<{
						skin_uuid: string
						metadata?: { favorite_chroma_uuid?: string } | null
					}>
				}>(`${BACKEND_BASE_URL}/api/v1/user/collection?wishlist=1`)

				const wishlistSkins = res?.data || []

				// Map backend skin_uuids to our Skin objects
				this.wishlist = this.skins.filter((skin) =>
					wishlistSkins.some((ws) => ws.skin_uuid === skin.uuid)
				)

				// Fix weapon field if empty by looking up in skinToWeaponBySkinId map
				this.wishlist.forEach((skin) => {
					if (!skin.weapon && skin.uuid) {
						const weaponId = this.skinToWeaponBySkinId[skin.uuid]
						if (weaponId) {
							skin.weapon = weaponId
						}
					}
				})

				// Extract favorite chromas
				this.wishlistFavoriteChromas = {}
				wishlistSkins.forEach((ws) => {
					if (ws.metadata?.favorite_chroma_uuid) {
						this.wishlistFavoriteChromas[ws.skin_uuid] = ws.metadata.favorite_chroma_uuid
					}
				})
			} catch (error) {
				console.error('Failed to fetch user wishlist', error)
				this.wishlist = []
				this.wishlistFavoriteChromas = {}
			}
		},

		/**
		 * Add skin to user's wishlist
		 */
		async addSkinToWishlist(skinUuid: string, favoriteChromaUuid?: string): Promise<void> {
			try {
				const runtime = useRuntimeConfig()
				const BACKEND_BASE_URL = runtime.public?.apiBaseUrl ?? 'http://localhost:8000'

				await $fetch(`${BACKEND_BASE_URL}/api/v1/user/wishlist`, {
					method: 'POST',
					body: {
						skin_uuid: skinUuid,
						favorite_chroma_uuid: favoriteChromaUuid || undefined
					}
				})

				// Update local state
				const skin = this.skins.find((s) => s.uuid === skinUuid)
				if (skin && !this.wishlist.find((s) => s.uuid === skinUuid)) {
					this.wishlist.push(skin)
				}

				// Update favorite chroma if provided
				if (favoriteChromaUuid) {
					this.wishlistFavoriteChromas[skinUuid] = favoriteChromaUuid
				}
			} catch (error) {
				console.error('Failed to add skin to wishlist', error)
				throw error
			}
		},

		/**
		 * Remove skin from user's wishlist
		 */
		async removeSkinFromWishlist(skinUuid: string): Promise<void> {
			try {
				const runtime = useRuntimeConfig()
				const BACKEND_BASE_URL = runtime.public?.apiBaseUrl ?? 'http://localhost:8000'

				const url = `${BACKEND_BASE_URL}/api/v1/user/wishlist/skin`

				await $fetch(url, {
					method: 'DELETE',
					query: {
						skin_uuid: skinUuid
					}
				})

				// Update local state
				this.wishlist = this.wishlist.filter((s) => s.uuid !== skinUuid)
			} catch (error) {
				console.error('Failed to remove skin from wishlist', error)
				throw error
			}
		}
	}
})
