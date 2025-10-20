import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'
import type { User, LoginCredentials, RegisterCredentials } from '~/types/auth'

export const useAuthStore = defineStore('auth', {
	state: () => ({
		user: null as User | null,
		isAuthenticated: false,
		loading: false,
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
		 * Initialize auth state from session/localStorage
		 */
		async initAuth(): Promise<void> {
			try {
				this.loading = true
				const runtime = useRuntimeConfig()
				const BACKEND_BASE_URL = runtime.public?.backendBaseUrl ?? 'http://localhost:8000'

				// Check if user is authenticated by fetching current user
				const response = await $fetch<{ user: User }>(`${BACKEND_BASE_URL}/api/user`, {
					credentials: 'include'
				})

				if (response.user) {
					this.user = response.user
					this.isAuthenticated = true
				}
			} catch (error) {
				// User is not authenticated
				this.user = null
				this.isAuthenticated = false
				console.log('User not authenticated:', error)
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
				const BACKEND_BASE_URL = runtime.public?.backendBaseUrl ?? 'http://localhost:8000'

				// Login
				const response = await $fetch<{ user: User }>(`${BACKEND_BASE_URL}/api/v1/login`, {
					method: 'POST',
					body: credentials,
					credentials: 'include'
				})

				if (response.user) {
					this.user = response.user
					this.isAuthenticated = true
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
				const BACKEND_BASE_URL = runtime.public?.backendBaseUrl ?? 'http://localhost:8000'

				// Register
				const response = await $fetch<{ user: User }>(`${BACKEND_BASE_URL}/api/v1/register`, {
					method: 'POST',
					body: credentials,
					credentials: 'include'
				})

				if (response.user) {
					this.user = response.user
					this.isAuthenticated = true
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
				const BACKEND_BASE_URL = runtime.public?.backendBaseUrl ?? 'http://localhost:8000'

				// Call logout endpoint
				await $fetch(`${BACKEND_BASE_URL}/api/v1/logout`, {
					method: 'POST',
					credentials: 'include'
				})
			} catch (error) {
				console.error('Logout error:', error)
			} finally {
				// Always clear local state regardless of API response
				this.user = null
				this.isAuthenticated = false
				this.loading = false
			}
		},

		/**
		 * Redirect to OAuth provider (GitHub, Google)
		 */
		redirectToOAuthProvider(provider: 'github' | 'google'): void {
			const runtime = useRuntimeConfig()
			const BACKEND_BASE_URL = runtime.public?.backendBaseUrl ?? 'http://localhost:8000'

			console.log('[Auth Store] Redirecting to OAuth provider:', provider)
			console.log('[Auth Store] Backend URL:', BACKEND_BASE_URL)

			const redirectUrl = `${BACKEND_BASE_URL}/auth/${provider}/redirect`
			console.log('[Auth Store] Full redirect URL:', redirectUrl)

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
