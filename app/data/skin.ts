export interface Skin {
	id: number
	name: string
	image_url: string
	weapon: string
	collection: string
	tier: {
		name: string
		image_url: string
	} | null
	tier_id?: string
}
