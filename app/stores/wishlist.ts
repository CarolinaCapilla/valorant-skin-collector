import { defineStore } from 'pinia'
import type { Skin } from '@/types/skin'
import { useCatalogStore } from '@/stores/catalog'

// Map of skin UUID to favorite chroma UUID
type FavoriteChromaMap = Record<string, string | undefined>

export const useWishlistStore = defineStore('wishlist', {
	state: () => ({
		wishlist: [] as Skin[],
		favoriteChromas: {} as FavoriteChromaMap
	}),

	getters: {
		wishlistCount(): number {
			return this.wishlist.length
		},

		hasSkin: (state) => (uuid: string) => {
			return state.wishlist.some((s) => s.uuid === uuid)
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
		addToWishlist(skin: Skin) {
			if (!this.wishlist.find((s) => s.id === skin.id)) this.wishlist.push(skin)
		},
		removeFromWishlist(id: number) {
			this.wishlist = this.wishlist.filter((s) => s.id !== id)
		},
		async fetchWishlist(): Promise<void> {
			try {
				const BACKEND_BASE_URL = this._getBackendUrl()
				const catalogStore = useCatalogStore()

				const res = await $fetch<{
					data?: Array<{
						skin_uuid: string
						metadata?: { favorite_chroma_uuid?: string } | null
					}>
				}>(`${BACKEND_BASE_URL}/api/v1/user/collection?wishlist=1`)

				const wishlistSkins = res?.data || []

				// Map backend skin_uuids to our Skin objects
				this.wishlist = catalogStore.skins.filter((skin) =>
					wishlistSkins.some((ws) => ws.skin_uuid === skin.uuid)
				)

				// Fix weapon field if empty by looking up in skinToWeaponBySkinId map
				this.wishlist.forEach((skin) => {
					if (!skin.weapon && skin.uuid) {
						const weaponId = catalogStore.skinToWeaponBySkinId[skin.uuid]
						if (weaponId) {
							skin.weapon = weaponId
						}
					}
				})

				// Extract favorite chromas
				this.favoriteChromas = {}
				wishlistSkins.forEach((ws) => {
					if (ws.metadata?.favorite_chroma_uuid) {
						this.favoriteChromas[ws.skin_uuid] = ws.metadata.favorite_chroma_uuid
					}
				})
			} catch (error) {
				console.error('Failed to fetch user wishlist', error)
				this.wishlist = []
				this.favoriteChromas = {}
			}
		},

		/**
		 * Add skin to user's wishlist
		 */
		async addSkin(skinUuid: string, favoriteChromaUuid?: string): Promise<void> {
			try {
				const BACKEND_BASE_URL = this._getBackendUrl()
				const catalogStore = useCatalogStore()

				await $fetch(`${BACKEND_BASE_URL}/api/v1/user/wishlist`, {
					method: 'POST',
					body: {
						skin_uuid: skinUuid,
						favorite_chroma_uuid: favoriteChromaUuid || undefined
					}
				})

				// Update local state
				const skin = catalogStore.skins.find((s) => s.uuid === skinUuid)
				if (skin && !this.wishlist.find((s) => s.uuid === skinUuid)) {
					this.wishlist.push(skin)
				}

				// Update favorite chroma if provided
				if (favoriteChromaUuid) {
					this.favoriteChromas[skinUuid] = favoriteChromaUuid
				}
			} catch (error) {
				console.error('Failed to add skin to wishlist', error)
				throw error
			}
		},

		/**
		 * Remove skin from user's wishlist
		 */
		async removeSkin(skinUuid: string): Promise<void> {
			try {
				const BACKEND_BASE_URL = this._getBackendUrl()

				const url = `${BACKEND_BASE_URL}/api/v1/user/wishlist/skin`

				await $fetch(url, {
					method: 'DELETE',
					query: {
						skin_uuid: skinUuid
					}
				})

				// Update local state
				this.wishlist = this.wishlist.filter((s) => s.uuid !== skinUuid)
				// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
				delete this.favoriteChromas[skinUuid]
			} catch (error) {
				console.error('Failed to remove skin from wishlist', error)
				throw error
			}
		}
	}
})
