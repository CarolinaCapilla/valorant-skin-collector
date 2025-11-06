import { defineStore } from 'pinia'
import type { Skin } from '@/types/skin'

export const useFiltersStore = defineStore('filters', {
	state: () => ({
		weapon: '' as string,
		collection: '' as string,
		tier: '' as string,
		search: '' as string
	}),

	getters: {
		hasActiveFilters(): boolean {
			return !!(this.weapon || this.collection || this.tier || this.search)
		},

		applyFilters(): (skins: Skin[]) => Skin[] {
			const { weapon, collection, tier, search } = this
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
		clearAll() {
			this.$reset()
		},
		setFilter(key: 'weapon' | 'collection' | 'tier' | 'search', value: string) {
			this[key] = value
		}
	}
})
