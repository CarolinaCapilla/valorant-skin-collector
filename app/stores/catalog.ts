import { defineStore } from 'pinia'
import type { Skin, SkinLevel, SkinChroma } from '@/types/skin'
import type {
	ValorantApiResponse,
	ValorantContentTier,
	ValorantSkinCollection,
	ValorantWeapon,
	BackendSkin
} from '@/types/api'

export const useCatalogStore = defineStore('catalog', {
	state: () => ({
		skins: [] as Skin[],
		loading: false,
		// Valorant API metadata
		contentTiers: [] as ValorantContentTier[],
		contentTierById: {} as Record<string, { name: string; image_url: string }>,
		skinCollections: [] as ValorantSkinCollection[],
		skinCollectionById: {} as Record<string, string>,
		weapons: [] as ValorantWeapon[],
		weaponsById: {} as Record<string, string>,
		// Map skin uuid -> weapon uuid to support weapon filtering
		skinToWeaponBySkinId: {} as Record<string, string>
	}),

	getters: {
		totalSkins(): number {
			return this.skins.length
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
		getSkinByUuid: (state) => (uuid: string) => {
			return state.skins.find((s) => s.uuid === uuid)
		}
	},

	actions: {
		async fetchSkins(onFirstBatchLoaded?: () => void): Promise<void> {
			try {
				this.loading = true
				await this.fetchSkinsFromApi(onFirstBatchLoaded)
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
		async fetchSkinsFromApi(onFirstBatchLoaded?: () => void): Promise<void> {
			try {
				const runtime = useRuntimeConfig()
				const BACKEND_BASE_URL = runtime.public?.apiBaseUrl ?? 'http://localhost:8000'

				// Fetch and display in batches for better UX
				const BATCH_SIZE = 300
				let allTransformed: Skin[] = []
				let page = 1
				let hasMore = true
				let globalIndex = 0
				let isFirstBatch = true

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

					// Signal that first batch is ready (stop loading overlay)
					if (isFirstBatch && onFirstBatchLoaded) {
						onFirstBatchLoaded()
						isFirstBatch = false
					}

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
		}
	}
})
