import type { SkinLevel, SkinChroma } from './skin'

export type ValorantApiResponse<T> = {
	status: number
	data: T
}

export type ValorantSkinItem = {
	uuid?: string
	displayName?: string
	displayIcon?: string | null
	weaponUuid?: string
	themeUuid?: string
	contentTierUuid?: string | null
	chromas?: Array<{
		uuid?: string
		displayName?: string | null
		displayIcon?: string | null
		fullRender?: string | null
		swatch?: string | null
		streamedVideo?: string | null
	}>
	levels?: Array<{
		uuid?: string
		displayName?: string | null
		displayIcon?: string | null
		streamedVideo?: string | null
		levelItem?: string | null
	}>
}

export type ValorantContentTier = {
	uuid?: string
	displayName?: string
	displayIcon?: string | null
	rank?: number
}

export type ValorantSkinCollection = {
	uuid?: string
	displayName?: string
	displayIcon?: string | null
}

export type ValorantWeapon = {
	uuid?: string
	displayName?: string
	displayIcon?: string | null
	category?: string
	skins?: Array<{
		uuid?: string
		displayName?: string
	}>
}

// Backend DTO for a skin — mirrors a subset of the UI `Skin` shape
export type BackendSkin = {
	uuid?: string
	name?: string
	image_url?: string
	image?: string
	weapon?: string
	collection?: string
	tier?: { name: string; image_url: string } | null
	tier_id?: string
	levels?: SkinLevel[]
	chromas?: SkinChroma[]
}
