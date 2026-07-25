<script lang="ts">
	import { onMount } from 'svelte';
	import type { SceneApi } from '$lib/game/three/scene';
	import { tileResources, type HexTile } from '$lib/game/hexmap';
	import ResourceIcon from '$lib/components/ResourceIcon.svelte';

	let canvas: HTMLCanvasElement;
	let api: SceneApi | undefined;
	let seed = $state(Math.floor(Math.random() * 90000) + 10000);
	let selected: HexTile | null = $state(null);

	onMount(() => {
		let disposed = false;
		void import('$lib/game/three/scene').then(({ createScene }) => {
			if (disposed) return;
			api = createScene(canvas, {
				onSelect(tile) {
					selected = tile;
				}
			});
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
			<div class="flex gap-2">
				<a href="/sandbox" class="hud-pill hud-btn pointer-events-auto font-semibold">
					biome sandbox
				</a>
				<button class="hud-pill hud-btn pointer-events-auto font-semibold" onclick={newWorld}>
					↻ new world
				</button>
			</div>
		</div>

		<div class="flex items-end justify-between gap-3">
			<!-- Tile inspector -->
			{#if selected}
				<div class="hud-pill !items-start flex-col gap-2 !rounded-3xl !px-5 !py-4">
					<div class="flex items-baseline gap-3">
						<span class="font-semibold">Hex {selected.q},{selected.r}</span>
						<span class="hud-label">{selected.biomes.join(' + ')}</span>
					</div>
					<div class="flex flex-wrap gap-1.5">
						{#each tileResources(selected) as res}
							<span
								class="flex items-center gap-1.5 rounded-full bg-sky px-2.5 py-1 font-mono text-[0.65rem] tracking-[0.08em] text-ink"
							>
								<ResourceIcon name={res} class="h-3.5 w-3.5" />
								{res}
							</span>
						{/each}
					</div>
				</div>
			{:else}
				<span class="hud-pill hud-label">tap a hex to inspect it</span>
			{/if}
			<span class="hud-pill hud-label hidden sm:inline-flex">drag to orbit · right-drag to travel · scroll to zoom</span>
		</div>
	</div>
</div>
