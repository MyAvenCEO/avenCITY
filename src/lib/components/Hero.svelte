<script lang="ts">
	import { tagline, pitch, resources, overview } from '$lib/brand';
	import Wordmark from './Wordmark.svelte';
	import cityDome from '$lib/assets/images/maia-city-dome.jpg';
</script>

<!--
	The hero is an editorial atlas spread: huge serif headline with an inline
	amber glyph (the magazine trick), an arch-framed plate of a dome district
	(the botanical-plate arch from the refs), sparkle ornaments, and one thin
	amber route-line flowing through the composition. Below, the resource
	ledger grounds it all in the game's economy.
-->
<section class="relative overflow-hidden">
	<!-- The route-line: one thin amber curve, as drawn on the map. Decorative,
	     desktop only — on mobile it would crowd the type. -->
	<svg
		class="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
		viewBox="0 0 1200 800"
		fill="none"
		preserveAspectRatio="xMidYMid slice"
		aria-hidden="true"
	>
		<path
			d="M -40 620 C 240 560, 400 640, 620 520 S 980 260, 1240 300"
			stroke="var(--color-amber)"
			stroke-width="1.5"
			stroke-dasharray="1 0"
			opacity="0.55"
		/>
		<path
			d="M -40 660 C 260 620, 460 700, 700 580"
			stroke="var(--color-amber)"
			stroke-width="1"
			stroke-dasharray="4 6"
			opacity="0.35"
		/>
	</svg>

	<div class="relative mx-auto max-w-6xl px-6 pt-10 pb-16 md:px-12 md:pb-24">
		<!-- Top bar: wordmark + season chip, like the game's header -->
		<header class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<Wordmark class="text-3xl" />
				<p class="label mt-2 text-ink-faint">{tagline}</p>
			</div>
			<div class="flex items-center gap-3">
				<a href="/style" class="label text-ink-soft transition-colors hover:text-amber-deep">
					Design system
				</a>
				<span class="chip label">
					<span class="pulse-dot" aria-hidden="true"></span>
					Year {overview.year} · {overview.season}
				</span>
			</div>
		</header>

		<!-- Editorial spread: headline left, arch plate right -->
		<div class="mt-16 grid items-center gap-12 md:mt-20 lg:grid-cols-[1fr_minmax(300px,380px)]">
			<div class="relative">
				<span
					class="pointer-events-none absolute -top-10 right-8 hidden font-display text-2xl text-ink lg:block"
					aria-hidden="true">✦</span
				>
				<p class="label text-amber-deep">The founder's city simulator</p>
				<h1 class="mt-5 text-hero">
					Go all in <span class="align-middle text-[0.55em] text-amber" aria-hidden="true"
						>✦</span
					> on your idea.<br />
					<em class="font-display italic">The risk stays in the game.</em>
				</h1>
				<p class="mt-7 max-w-xl text-lead font-light text-ink-soft">
					{pitch}
				</p>
				<div class="mt-9 flex flex-wrap items-center gap-3">
					<a href="#gameplay" class="btn btn-primary">Found your venture</a>
					<a href="#streams" class="btn btn-line">See the income streams</a>
				</div>
			</div>

			<!-- The arch plate: a district framed like a figure in an old atlas -->
			<figure class="relative mx-auto w-full max-w-[380px]">
				<div
					class="overflow-hidden rounded-t-full rounded-b-[var(--radius-panel)] border border-hairline shadow-[var(--panel-shadow-raised)]"
				>
					<img
						src={cityDome}
						alt="A glass dome district above a turquoise river"
						class="aspect-[3/4] w-full object-cover object-[46%_center] [filter:sepia(0.14)_saturate(0.9)]"
						fetchpriority="high"
					/>
				</div>
				<span
					class="pointer-events-none absolute -top-3 -right-4 font-display text-xl text-amber"
					aria-hidden="true">✦</span
				>
				<figcaption
					class="pill-ink label absolute bottom-5 left-1/2 -translate-x-1/2 shadow-[var(--panel-shadow)]"
				>
					Avenhall · LV. 5
				</figcaption>
			</figure>
		</div>

		<!-- Resource ledger: the game's top bar as a ruled paper strip -->
		<div class="panel relative mt-16 md:mt-20">
			<dl class="grid grid-cols-2 divide-hairline sm:grid-cols-3 lg:grid-cols-5 lg:divide-x">
				{#each resources as r}
					<div class="px-6 py-5">
						<dt class="label text-ink-faint">{r.label}</dt>
						<dd class="mt-2 font-mono text-title font-medium text-ink">{r.value}</dd>
						<dd class="mt-1 font-mono text-meta text-ok">{r.rate}</dd>
					</div>
				{/each}
			</dl>
		</div>
	</div>
</section>
