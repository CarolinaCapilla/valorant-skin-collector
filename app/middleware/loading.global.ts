import { useLoadingStore } from '~/stores/loading'

export default defineNuxtRouteMiddleware((to, from) => {
	// Only show loading when navigating TO the skins page FROM another page
	if (to.path === '/skins' && from.path !== '/skins') {
		const loadingStore = useLoadingStore()
		loadingStore.startLoading()
	}
})
