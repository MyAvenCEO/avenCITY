<script lang="ts">
	import { onMount } from 'svelte';
	import type { SceneApi } from '$lib/game/three/scene';

	let canvas: HTMLCanvasElement;
	let api: SceneApi | undefined;
	let seed = $state(Math.floor(Math.random() * 90000) + 10000);

	onMount(() => {
		let disposed = false;
		void import('$lib/game/three/scene').then(({ createScene }) => {
			if (disposed) return;
			api = createScene(canvas);
			api.setWorld(seed);
		});
		return () => {
			disposed = true;
			api?.dispose();
		};
	});

	function newWorld(): void {
		seed = Math.floor(Math.random() * 90000) + 10000;
		api?.setWorld(seed);
	}
</script>

<svelte:head>
	<title>avenCITY — world {seed}</title>
	<meta name="description" content="A procedurally generated clay hex world." />
</svelte:head>

<div class="fixed inset-0">
	<canvas bind:this={canvas} class="block h-full w-full"></canvas>

	<!-- HUD -->
	<div class="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 md:p-7">
		<div class="flex items-start justify-between gap-3">
			<div class="hud-pill">
				<span class="font-semibold">avenCITY</span>
				<span class="hud-label">world {seed}</span>
			</div>
			<button class="hud-pill hud-btn pointer-events-auto font-semibold" onclick={newWorld}>
				↻ new world
			</button>
		</div>
		<div class="flex justify-center">
			<span class="hud-pill hud-label">drag to orbit · scroll to zoom</span>
		</div>
	</div>
</div>
