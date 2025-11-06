import { defineStore } from 'pinia'
import type { Skin } from '@/types/skin'
import { useCatalogStore } from '@/stores/catalog'

// Map of skin UUID to favorite chroma UUID
type FavoriteChromaMap = Record<string, string | undefined>

export const useCollectionStore = defineStore('collection', {
	state: () => ({
		owned: [] as Skin[],
		favoriteChromas: {} as FavoriteChromaMap
	}),

	getters: {
		ownedCount(): number {
			return this.owned.length
		},

		hasSkin: (state) => (uuid: string) => {
			return state.owned.some((s) => s.uuid === uuid)
		},

		getFavoriteChroma: (state) => (skinUuid: string) => {
			return state.favoriteChromas[skinUuid]
		}
	},

	actions: {
		_getBackendUrl(): string {
			const runtime = useRuntimeConfig()
			return runtime.public?.apiBaseUrl ?? 'http://localhost:8000'
		},

		async fetchCollection(): Promise<void> {
			try {
				const BACKEND_BASE_URL = this._getBackendUrl()
				const catalogStore = useCatalogStore()

				const res = await $fetch<{
					data?: Array<{
						skin_uuid: string
						metadata?: { favorite_chroma_uuid?: string } | null
					}>
				}>(`${BACKEND_BASE_URL}/api/v1/user/collection`)

				const userSkins = res?.data || []

				// Map backend skin_uuids to our Skin objects
				this.owned = catalogStore.skins.filter((skin) =>
					userSkins.some((us) => us.skin_uuid === skin.uuid)
				)

				// Fix weapon field if empty by looking up in skinToWeaponBySkinId map
				this.owned.forEach((skin) => {
					if (!skin.weapon && skin.uuid) {
						const weaponId = catalogStore.skinToWeaponBySkinId[skin.uuid]
						if (weaponId) {
							skin.weapon = weaponId
						}
					}
				})

				// Extract favorite chromas
				this.favoriteChromas = {}
				userSkins.forEach((us) => {
					if (us.metadata?.favorite_chroma_uuid) {
						this.favoriteChromas[us.skin_uuid] = us.metadata.favorite_chroma_uuid
					}
				})
			} catch (error) {
				console.error('Failed to fetch user collection', error)
				this.$reset()
			}
		},
		addOwned(skin: Skin) {
			if (!this.owned.find((s) => s.id === skin.id)) this.owned.push(skin)
		},
		removeOwned(id: number) {
			this.owned = this.owned.filter((s) => s.id !== id)
		},
		async addSkin(skinUuid: string, favoriteChromaUuid?: string): Promise<void> {
			try {
				const BACKEND_BASE_URL = this._getBackendUrl()
				const catalogStore = useCatalogStore()

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
				const skin = catalogStore.skins.find((s) => s.uuid === skinUuid)
				if (skin && !this.owned.find((s) => s.uuid === skinUuid)) {
					this.owned.push(skin)
				}

				// Update favorite chroma if provided
				if (favoriteChromaUuid) {
					this.favoriteChromas[skinUuid] = favoriteChromaUuid
				}

				// Automatically remove from wishlist if present
				const { useWishlistStore } = await import('@/stores/wishlist')
				const wishlistStore = useWishlistStore()
				if (wishlistStore.hasSkin(skinUuid)) {
					await wishlistStore.removeSkin(skinUuid)
				}
			} catch (error) {
				console.error('Failed to add skin to collection', error)
				throw error
			}
		},
		async removeSkin(skinUuid: string): Promise<void> {
			try {
				const BACKEND_BASE_URL = this._getBackendUrl()

				const url = `${BACKEND_BASE_URL}/api/v1/user/collection/skin`

				await $fetch(url, {
					method: 'DELETE',
					query: {
						skin_uuid: skinUuid
					}
				})

				// Update local state
				this.owned = this.owned.filter((s) => s.uuid !== skinUuid)
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete this.favoriteChromas[skinUuid]
			} catch (error) {
				console.error('Failed to remove skin from collection', error)
				throw error
			}
		},
		async updateFavoriteChroma(skinUuid: string, favoriteChromaUuid: string): Promise<void> {
			try {
				const BACKEND_BASE_URL = this._getBackendUrl()

				await $fetch(`${BACKEND_BASE_URL}/api/v1/user/collection/favorite-chroma`, {
					method: 'PATCH',
					body: {
						skin_uuid: skinUuid,
						favorite_chroma_uuid: favoriteChromaUuid
					}
				})

				// Update local state
				this.favoriteChromas[skinUuid] = favoriteChromaUuid
			} catch (error) {
				console.error('Failed to update favorite chroma', error)
				throw error
			}
		}
	}
})
