/**
 * Nuxt plugin to automatically add Authorization header to API requests
 * This intercepts all $fetch calls and adds the Bearer token if available
 */
export default defineNuxtPlugin(() => {
	const apiFetch = $fetch.create({
		onRequest({ options }) {
			// Get token from localStorage (only on client side)
			const token = import.meta.client ? localStorage.getItem('auth_token') : null

			if (token) {
				// Add Authorization header to all API requests
				const headers: Record<string, string> = {}

				// Copy existing headers
				if (options.headers) {
					if (options.headers instanceof Headers) {
						options.headers.forEach((value, key) => {
							headers[key] = value
						})
					} else if (typeof options.headers === 'object') {
						Object.assign(headers, options.headers)
					}
				}

				// Add Authorization header
				headers.Authorization = `Bearer ${token}`
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				options.headers = headers as any
			}
		},
		onResponseError({ response }) {
			// If we get a 401 Unauthorized, clear the token and redirect to login
			if (response.status === 401 && import.meta.client) {
				localStorage.removeItem('auth_token')
				navigateTo('/auth/login')
			}
		}
	})

	// Override global $fetch
	globalThis.$fetch = apiFetch

	return {
		provide: {
			apiFetch
		}
	}
})
