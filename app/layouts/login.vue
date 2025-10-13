<template>
	<div class="min-h-screen bg-neutral-900 text-white">
		<!-- Minimal layout for auth pages (no global header) -->
		<main class="container mx-auto max-w-md px-6 py-10">
			<slot />
		</main>
	</div>
</template>

<script setup lang="ts"></script>
