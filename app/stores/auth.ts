import { defineStore } from 'pinia'
import type { User, LoginCredentials, RegisterCredentials } from '~/types/auth'

export const useAuthStore = defineStore('auth', {
	state: () => ({
		user: null as User | null,
		token: null as string | null,
		isAuthenticated: false,
		loading: true, // Start with loading true to prevent flash on initial load
		error: null as string | null
	}),

	getters: {
		currentUser(): User | null {
			return this.user
		},
		isLoggedIn(): boolean {
			return this.isAuthenticated && this.user !== null
		}
	},

	actions: {
		/**
		 * Initialize auth state from localStorage token
		 */
		async initAuth(): Promise<void> {
			try {
				this.loading = true
				const runtime = useRuntimeConfig()
				const BACKEND_BASE_URL = runtime.public?.apiBaseUrl ?? 'http://localhost:8000'

				// Create a minimum delay promise (300ms) to ensure spinner is visible
				const minDelay = new Promise((resolve) => setTimeout(resolve, 300))

				// Check if token exists in localStorage
				const token = localStorage.getItem('auth_token')

				if (token) {
					this.token = token

					// Verify token by fetching current user
					const authPromise = $fetch<{ user: User }>(`${BACKEND_BASE_URL}/api/v1/me`)

					// Wait for both the auth check and minimum delay
					const [response] = await Promise.all([authPromise, minDelay])

					if (response.user) {
						this.user = response.user
						this.isAuthenticated = true
					}
				} else {
					// No token found, just wait for minimum delay
					await minDelay
				}
			} catch (error) {
				// Token is invalid or expired
				this.user = null
				this.token = null
				this.isAuthenticated = false
				localStorage.removeItem('auth_token')
				console.log('User not authenticated:', error)

				// Still need to wait for minimum delay even on error
				await new Promise((resolve) => setTimeout(resolve, 500))
			} finally {
				this.loading = false
			}
		},

		/**
		 * Login with email and password
		 */
		async login(credentials: LoginCredentials): Promise<void> {
			try {
				this.loading = true
				this.error = null
				const runtime = useRuntimeConfig()
				const BACKEND_BASE_URL = runtime.public?.apiBaseUrl ?? 'http://localhost:8000'

				// Login and get token
				const response = await $fetch<{ user: User; token: string }>(
					`${BACKEND_BASE_URL}/api/v1/login`,
					{
						method: 'POST',
						body: credentials
					}
				)

				if (response.user && response.token) {
					this.user = response.user
					this.token = response.token
					this.isAuthenticated = true

					// Store token in localStorage
					localStorage.setItem('auth_token', response.token)
				}
			} catch (error) {
				const errorMessage =
					error && typeof error === 'object' && 'data' in error && error.data
						? (error.data as { message?: string }).message
						: undefined
				this.error = errorMessage || 'Login failed'
				throw error
			} finally {
				this.loading = false
			}
		},

		/**
		 * Register new user
		 */
		async register(credentials: RegisterCredentials): Promise<void> {
			try {
				this.loading = true
				this.error = null
				const runtime = useRuntimeConfig()
				const BACKEND_BASE_URL = runtime.public?.apiBaseUrl ?? 'http://localhost:8000'

				// Register and get token
				const response = await $fetch<{ user: User; token: string }>(
					`${BACKEND_BASE_URL}/api/v1/register`,
					{
						method: 'POST',
						body: credentials
					}
				)

				if (response.user && response.token) {
					this.user = response.user
					this.token = response.token
					this.isAuthenticated = true

					// Store token in localStorage
					localStorage.setItem('auth_token', response.token)
				}
			} catch (error) {
				const errorMessage =
					error && typeof error === 'object' && 'data' in error && error.data
						? (error.data as { message?: string }).message
						: undefined
				this.error = errorMessage || 'Registration failed'
				throw error
			} finally {
				this.loading = false
			}
		},

		/**
		 * Logout current user
		 */
		async logout(): Promise<void> {
			try {
				this.loading = true
				const runtime = useRuntimeConfig()
				const BACKEND_BASE_URL = runtime.public?.apiBaseUrl ?? 'http://localhost:8000'

				// Call logout endpoint with token if available
				if (this.token) {
					await $fetch(`${BACKEND_BASE_URL}/api/v1/logout`, {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${this.token}`
						}
					})
				}
			} catch (error) {
				console.error('Logout error:', error)
			} finally {
				// Always clear local state regardless of API response
				this.user = null
				this.token = null
				this.isAuthenticated = false
				this.loading = false
				localStorage.removeItem('auth_token')
			}
		},

		/**
		 * Redirect to OAuth provider (GitHub, Google)
		 */
		redirectToOAuthProvider(provider: 'github' | 'google'): void {
			const runtime = useRuntimeConfig()
			const BACKEND_BASE_URL = runtime.public?.apiBaseUrl ?? 'http://localhost:8000'

			const redirectUrl = `${BACKEND_BASE_URL}/auth/${provider}/redirect`
			// Redirect to Laravel backend OAuth route
			window.location.href = redirectUrl
		},

		/**
		 * Handle OAuth callback - set user after successful OAuth login
		 */
		setUser(user: User): void {
			this.user = user
			this.isAuthenticated = true
		},

		/**
		 * Clear error message
		 */
		clearError(): void {
			this.error = null
		}
	}
})
