export interface SkinLevel {
	uuid?: string
	displayName?: string | null
	displayIcon?: string | null
	streamedVideo?: string | null
	levelItem?: string | null
}

export interface SkinChroma {
	uuid?: string
	displayName?: string | null
	displayIcon?: string | null
	fullRender?: string | null
	swatch?: string | null
	streamedVideo?: string | null
}

export interface Skin {
	id: number
	uuid?: string
	name: string
	image_url: string
	weapon: string
	collection: string
	tier: {
		name: string
		image_url: string
	} | null
	tier_id?: string
	levels?: SkinLevel[]
	chromas?: SkinChroma[]
}
