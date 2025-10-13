<template>
	<!-- <USeparator icon="i-simple-icons-nuxtdotjs" type="solid" class="h-px" /> -->

	<UFooter class="bg-primary">
		<template #left>
			<p class="text-white font-semibold">Copyright © {{ new Date().getFullYear() }}</p>
		</template>

		<template #right>
			<UButton
				icon="i-simple-icons-linkedin"
				color="secondary"
				variant="ghost"
				to="https://www.linkedin.com/in/carolina-capilla/"
				target="_blank"
				aria-label="linkedin"
				:ui="{
					base: 'text-white'
				}"
				class="hover:bg-secondary-100 tracking-wide hover:shadow-md shadow-secondary-50 transition-all duration-150"
			/>
			<UButton
				icon="i-simple-icons-github"
				color="secondary"
				variant="ghost"
				to="https://github.com/CarolinaCapilla"
				target="_blank"
				aria-label="GitHub"
				:ui="{
					base: 'text-white'
				}"
				class="hover:bg-secondary-100 tracking-wide hover:shadow-md shadow-secondary-50 transition-all duration-150"
			/>
		</template>
	</UFooter>
</template>

<script setup lang="ts">
defineOptions({ name: 'AppFooter' })
</script>
