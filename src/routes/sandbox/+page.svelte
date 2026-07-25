<script lang="ts">
	import { onMount } from 'svelte';
	import { BIOME_IDS, BIOME_RESOURCES, type BiomeId } from '$lib/game/hexmap';
	import type { SandboxApi } from '$lib/game/three/sandboxScene';
	import ResourceIcon from '$lib/components/ResourceIcon.svelte';

	let canvas: HTMLCanvasElement;
	let api: SandboxApi | undefined;
	let biome: BiomeId = $state('MEADOW');
	let seed = $state(Math.floor(Math.random() * 90000) + 10000);
	// LV.0 = the natural biome. LV.1+ adds the first production building
	// (dome/extractor) and upgrade styling variants — coming soon.
	let level = $state(0);

	onMount(() => {
		let disposed = false;
		void import('$lib/game/three/sandboxScene').then(({ createSandbox }) => {
			if (disposed) return;
			api = createSandbox(canvas);
			api.show(biome, seed);
		});
		return () => {
			disposed = true;
			api?.dispose();
		};
	});

	function pick(b: BiomeId): void {
		biome = b;
		api?.show(biome, seed);
	}

	function reroll(): void {
		seed = Math.floor(Math.random() * 90000) + 10000;
		api?.show(biome, seed);
	}
</script>

<svelte:head>
	<title>avenCITY — biome sandbox</title>
	<meta name="description" content="One specimen tile per biome — the styling workbench." />
</svelte:head>

<div class="fixed inset-0">
	<canvas bind:this={canvas} class="block h-full w-full"></canvas>

	<div class="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 md:p-7">
		<!-- top bar -->
		<div class="flex items-start justify-between gap-3">
			<div class="hud-pill">
				<span class="font-semibold">avenCITY</span>
				<span class="hud-label">biome sandbox</span>
			</div>
			<a href="/" class="hud-pill hud-btn pointer-events-auto font-semibold">← back to the world</a>
		</div>

		<!-- left rail: biome picker -->
		<div
			class="pointer-events-auto absolute top-1/2 left-5 flex max-h-[70vh] -translate-y-1/2 flex-col gap-1.5 overflow-y-auto md:left-7"
		>
			{#each BIOME_IDS as b}
				<button
					class="hud-pill hud-btn !justify-start !gap-2 !py-2 text-[0.8rem] font-semibold
						{b === biome ? '' : 'opacity-60'}"
					onclick={() => pick(b)}
				>
					<ResourceIcon name={BIOME_RESOURCES[b][0]} class="h-4 w-4" />
					<span>{b}</span>
					<span class="hud-label !text-[0.6rem]">{BIOME_RESOURCES[b][0]}</span>
				</button>
			{/each}
		</div>

		<!-- bottom bar: seed reroll + level variants (future) -->
		<div class="flex items-end justify-between gap-3">
			<button class="hud-pill hud-btn pointer-events-auto font-semibold" onclick={reroll}>
				↻ reroll specimen
				<span class="hud-label">{seed}</span>
			</button>
			<div class="hud-pill pointer-events-auto !gap-1.5">
				<span class="hud-label mr-1">style level</span>
				{#each [0, 1, 2, 3, 4, 5] as lv}
					<button
						class="rounded-full px-2.5 py-1 font-mono text-[0.7rem] font-semibold transition-colors
							{lv === level ? 'bg-ink text-cloud' : 'text-ink-soft'}
							{lv > 0 ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}"
						disabled={lv > 0}
						title={lv > 0 ? 'LV.1+ adds the first production building — coming soon' : 'natural state'}
						onclick={() => (level = lv)}
					>
						LV.{lv}
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>
