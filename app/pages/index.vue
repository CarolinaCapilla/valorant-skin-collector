<template>
	<section class="relative overflow-hidden min-h-[90vh] flex items-center">
		<!-- Background grid + energy lines -->
		<div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
			<!-- Grid background using repeating gradients -->
			<div class="grid-bg absolute inset-0"></div>
			<!-- Energy lines (client-only to avoid SSR mismatch) -->
			<ClientOnly>
				<div class="energy-layer absolute inset-0 pointer-events-none">
					<div
						v-for="line in energyLines"
						:key="line.id"
						class="energy-line absolute"
						:class="line.orientation === 'h' ? 'h' : 'v'"
						:style="lineStyle(line)"
						:data-id="line.id"
					/>
				</div>
			</ClientOnly>
		</div>

		<div class="relative max-w-screen-xl mx-auto px-6 py-16 text-center flex flex-col items-center">
			<NuxtImg
				width="250px"
				height="250px"
				src="/valorant_skin_collector_logo.png"
				alt="Valorant logo"
				priority
			/>
			<h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
				Valorant Skin Collector
			</h1>
			<p class="mt-4 text-neutral-300 text-2xl max-w-2xl mx-auto">
				<span class="block">Browse and track every Valorant weapon skin with ease.</span>
				<span class="block">Discover, collect, and wishlist — all for free, all in one place.</span>
			</p>
			<div class="mt-8 flex items-center justify-center gap-3">
				<NuxtLink to="/skins">
					<UButton size="xl" class="btn-sweep w-auto min-w-[10rem] mt-6"> Explore Skins </UButton>
				</NuxtLink>
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, onActivated, onDeactivated, nextTick, ref } from 'vue'

type Orientation = 'h' | 'v'
interface EnergyLine {
	id: string
	orientation: Orientation
	x: number
	y: number
	length: number
	duration: number
	delay: number
}

const { $anime } = useNuxtApp()
const energyLines = ref<EnergyLine[]>([])
let resizeHandler: ((this: Window, ev: UIEvent) => void) | null = null
let gridResizeObserver: ResizeObserver | null = null

function lineStyle(line: EnergyLine) {
	return {
		left: `${line.x}px`,
		top: `${line.y}px`,
		'--len': `${line.length}px`
	} as Record<string, string>
}

function generateLines() {
	energyLines.value = []
	// Read gap from CSS to avoid drift with design tokens
	const grid = document.querySelector<HTMLElement>('.grid-bg')
	const gapStr = grid ? getComputedStyle(grid).getPropertyValue('--gap') : '80px'
	const GAP = Number.parseFloat(gapStr) || 80
	// Read adjustable vertical offset for horizontal lines (in px, negative moves lines up)
	const yOffStr = grid ? getComputedStyle(grid).getPropertyValue('--energy-y-offset') : '-1.5px'
	const YOFF = Number.parseFloat(yOffStr) || -1.5
	// Use the grid container size, not the window, to match section height
	const rect = grid?.getBoundingClientRect()
	const vw = rect?.width ?? window.innerWidth
	const vh = rect?.height ?? window.innerHeight
	const cols = Math.ceil(vw / GAP)
	const rows = Math.ceil(vh / GAP)

	const pickRange = (n: number, min: number, max: number) => {
		// inclusive [min, max]
		const set = new Set<number>()
		const span = Math.max(0, max - min + 1)
		while (set.size < Math.min(n, span)) set.add(min + Math.floor(Math.random() * span))
		return Array.from(set)
	}

	// Choose random grid lines to energize
	// Keep horizontal count stable, scale verticals with columns to maintain visual density
	const H_COUNT = 6
	const density = H_COUNT / Math.max(1, rows) // proportion of horizontal lines per available rows
	const V_COUNT = Math.min(cols + 1, Math.max(4, Math.round(cols * density))) // at least 4
	const hIdx = pickRange(H_COUNT, 1, rows)
	const vIdx = pickRange(V_COUNT, 0, cols)

	const lines: EnergyLine[] = []
	// Only show horizontal lines on screens wider than 768px (tablet and above)
	const showHorizontal = vw > 768
	if (showHorizontal) {
		for (const r of hIdx) {
			lines.push({
				id: `h-${r}`,
				orientation: 'h',
				x: -Math.round(vw * 0.3),
				// Base position from grid with tweakable offset
				y: r * GAP + YOFF,
				length: Math.round(vw * (0.18 + Math.random() * 0.18)),
				duration: 6000 + Math.floor(Math.random() * 4000),
				delay: Math.floor(Math.random() * 1000)
			})
		}
	}
	for (const c of vIdx) {
		lines.push({
			id: `v-${c}`,
			orientation: 'v',
			x: c * GAP - 1,
			y: -Math.round(vh * 0.3),
			length: Math.round(vh * (0.18 + Math.random() * 0.18)),
			duration: 7000 + Math.floor(Math.random() * 4000),
			delay: Math.floor(Math.random() * 1000)
		})
	}
	energyLines.value = lines
}

function startAnimation() {
	// Respect reduced motion
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		console.log('Animation disabled: prefers-reduced-motion is active')
		return
	}

	// Check if anime is available
	if (!$anime) {
		console.error('Anime.js is not available')
		return
	}

	$anime.remove('.energy-line')

	// Use the grid container size for travel distances
	const grid = document.querySelector<HTMLElement>('.grid-bg')
	const rect = grid?.getBoundingClientRect()
	const width = rect?.width ?? window.innerWidth
	const height = rect?.height ?? window.innerHeight

	console.log('Starting animation with dimensions:', {
		width,
		height,
		lineCount: energyLines.value.length,
		anime: typeof $anime
	})

	for (const line of energyLines.value) {
		const selector = `[data-id="${line.id}"]`
		const element = document.querySelector(selector)

		if (!element) {
			console.warn(`Element not found for selector: ${selector}`)
			continue
		}

		console.log(`Animating ${selector}:`, { element, line })

		if (line.orientation === 'h') {
			$anime({
				targets: element,
				translateX: [0, width * 1.4],
				opacity: [
					{ value: 0.2, duration: 300 },
					{ value: 0.6, duration: 600 },
					{ value: 0.2, duration: 300 }
				],
				duration: line.duration,
				delay: line.delay,
				easing: 'linear',
				loop: true
			})
		} else {
			$anime({
				targets: element,
				translateY: [0, height * 1.4],
				opacity: [
					{ value: 0.2, duration: 300 },
					{ value: 0.6, duration: 600 },
					{ value: 0.2, duration: 300 }
				],
				duration: line.duration,
				delay: line.delay,
				easing: 'linear',
				loop: true
			})
		}
	}
}

function stopAnimation() {
	$anime.remove('.energy-line')
}

onMounted(async () => {
	await nextTick()
	generateLines()
	await nextTick()
	startAnimation()
	// Optional: re-generate on resize (lightweight debounce)
	let t: number | undefined
	resizeHandler = () => {
		if (t) window.clearTimeout(t)
		t = window.setTimeout(() => {
			generateLines()
			startAnimation()
		}, 150)
	}
	window.addEventListener('resize', resizeHandler)

	// Observe grid container size changes to adjust lines to section height changes
	const grid = document.querySelector<HTMLElement>('.grid-bg')
	if (grid && 'ResizeObserver' in window) {
		gridResizeObserver = new ResizeObserver(() => {
			generateLines()
			startAnimation()
		})
		gridResizeObserver.observe(grid)
	}
})

onActivated(() => {
	startAnimation()
})

onDeactivated(() => {
	stopAnimation()
})

onBeforeUnmount(() => {
	stopAnimation()
	if (resizeHandler) window.removeEventListener('resize', resizeHandler)
	if (gridResizeObserver) gridResizeObserver.disconnect()
})
</script>

<style scoped>
/* Grid background */
.grid-bg {
	--gap: 64px;
	/* Adjust this to nudge horizontal energy lines up/down */
	--energy-y-offset: -37px;
	/* Thickness controls (tweak these to make lines thicker/thinner) */
	--energy-h-thickness: 3px;
	--energy-v-thickness: 3px;
	z-index: 0;
	background-image:
		repeating-linear-gradient(
			0deg,
			rgba(255, 255, 255, 0) 0,
			rgba(255, 255, 255, 0) calc(var(--gap) - 1px),
			rgba(255, 255, 255, 0.06) calc(var(--gap) - 1px),
			rgba(255, 255, 255, 0.06) var(--gap)
		),
		repeating-linear-gradient(
			90deg,
			rgba(255, 255, 255, 0) 0,
			rgba(255, 255, 255, 0) calc(var(--gap) - 1px),
			rgba(255, 255, 255, 0.06) calc(var(--gap) - 1px),
			rgba(255, 255, 255, 0.06) var(--gap)
		);
}

.energy-layer {
	z-index: 1;
}

/* Ensure energy lines render above grid visually */
.energy-line.h {
	height: var(--energy-h-thickness, 2px);
	width: var(--len, 300px);
	background: linear-gradient(to right, transparent, rgba(255, 70, 85, 1), transparent);
	filter: drop-shadow(0 0 12px rgba(255, 70, 85, 0.8));
}
.energy-line.v {
	width: var(--energy-v-thickness, 2px);
	height: var(--len, 300px);
	background: linear-gradient(to bottom, transparent, rgba(255, 70, 85, 1), transparent);
	filter: drop-shadow(0 0 12px rgba(255, 70, 85, 0.8));
}

@media (prefers-reduced-motion: reduce) {
	.energy-line {
		display: none;
	}
}
</style>
