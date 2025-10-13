export type ValorantApiResponse<T> = {
	status: number
	data: T
}

export type ValorantSkinItem = {
	uuid?: string
	displayName?: string
	displayIcon?: string | null
	levels?: Array<{ displayIcon?: string | null }>
	weaponUuid?: string
	themeUuid?: string
	contentTierUuid?: string | null
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
