<template>
	<UAuthForm
		:fields="fields"
		:schema="schema"
		:providers="providers"
		title="Welcome back"
		icon="i-lucide-lock"
		@submit="onSubmit"
	>
		<template #description>
			Don't have an account?
			<ULink to="/auth/signup" class="text-primary font-medium">Sign up</ULink>.
		</template>

		<template #password-hint>
			<ULink to="/" class="text-primary font-medium" tabindex="-1">Forgot password?</ULink>
		</template>

		<template #footer>
			By signing in, you agree to our
			<ULink to="/" class="text-primary font-medium">Terms of Service</ULink>.
		</template>
	</UAuthForm>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
	layout: 'auth'
})

useSeoMeta({
	title: 'Login',
	description: 'Login to your account to continue'
})

const notify = useNotification()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Check for OAuth error in query params
onMounted(() => {
	const error = route.query.error as string | undefined
	if (error) {
		const errorMessages: Record<string, string> = {
			authentication_failed: 'Authentication failed. Please try again.',
			unsupported_provider: 'Unsupported authentication provider.'
		}
		notify.error('Error', errorMessages[error] || 'An error occurred during authentication')

		// Clean up the URL by removing the error param
		router.replace({ query: {} })
	}
})

const fields = [
	{
		name: 'email',
		type: 'text' as const,
		label: 'Email',
		placeholder: 'Enter your email',
		required: true
	},
	{
		name: 'password',
		label: 'Password',
		type: 'password' as const,
		placeholder: 'Enter your password'
	},
	{
		name: 'remember',
		label: 'Remember me',
		type: 'checkbox' as const
	}
]

const providers = [
	{
		label: 'Google',
		icon: 'i-simple-icons-google',
		onClick: () => {
			authStore.redirectToOAuthProvider('google')
		}
	},
	{
		label: 'GitHub',
		icon: 'i-simple-icons-github',
		onClick: () => {
			authStore.redirectToOAuthProvider('github')
		}
	}
]

const schema = z.object({
	email: z.string().email('Invalid email'),
	password: z.string().min(8, 'Must be at least 8 characters'),
	remember: z.boolean().optional()
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
	try {
		await authStore.login({
			email: payload.data.email,
			password: payload.data.password,
			remember: payload.data.remember
		})

		notify.success('Success', 'Logged in successfully')

		// Redirect to home or dashboard
		router.push('/')
	} catch (error) {
		const errorMessage =
			error && typeof error === 'object' && 'data' in error
				? (error.data as { message?: string })?.message
				: 'Login failed. Please check your credentials.'

		notify.error('Error', errorMessage)
	}
}
</script>
