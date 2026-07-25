<script lang="ts">
	import { sparks, incomeStreams, overview, districts, prize } from '$lib/brand';

	const loop = [
		{
			step: '01',
			title: 'Found your venture',
			copy: 'Claim a hex and raise a dome for your idea. Every venture starts as a single glasshouse — Avenhall grew into a Level 5 capital.'
		},
		{
			step: '02',
			title: 'Ignite sparks',
			copy: 'Go all in with simulated capital — industry, trade, tech, agriculture. Each spark starts paying you back by the hour, from the moment it lights.'
		},
		{
			step: '03',
			title: 'Connect & compound',
			copy: 'Draw routes between districts — partnerships, supply, trade. Connected ventures compound, multiplying the streams flowing back to you.'
		}
	];
</script>

<!--
	The gameplay loop and the two panels that prove it: the income-streams
	ledger (the payoff) and the city overview (the score). Laid out like the
	game board's side rails, on the same paper.
-->
<section id="gameplay" class="border-t border-hairline bg-paper-bright/60">
	<div class="mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-24">
		<p class="label text-amber-deep">How it plays</p>
		<h2 class="mt-4 max-w-2xl text-display">
			Three moves, one loop — <em class="italic">invest, connect, collect.</em>
		</h2>

		<div class="mt-12 grid gap-6 md:grid-cols-3">
			{#each loop as move}
				<div class="panel p-7">
					<p class="font-display text-display font-medium text-hairline">{move.step}</p>
					<h3 class="mt-3 text-title">{move.title}</h3>
					<p class="mt-3 text-body text-ink-soft">{move.copy}</p>
				</div>
			{/each}
		</div>

		<div id="streams" class="mt-16 grid gap-6 lg:grid-cols-5">
			<!-- Income streams: the ledger rail from the board -->
			<div class="panel p-7 lg:col-span-2">
				<h3 class="label text-ink-faint">Income streams</h3>
				<ul class="mt-4 divide-y divide-hairline">
					{#each incomeStreams.list as stream}
						<li class="flex items-baseline justify-between gap-4 py-3">
							<span class="text-body text-ink">{stream.sector}</span>
							<span class="font-mono text-meta text-ok">{stream.rate}</span>
						</li>
					{/each}
				</ul>
				<div class="well mt-5 flex items-baseline justify-between gap-4 px-5 py-4">
					<span class="label text-ink-soft">Total income</span>
					<span class="font-mono text-title font-medium text-ink">{incomeStreams.total}</span>
				</div>
			</div>

			<!-- Sparks: the investment rail -->
			<div class="panel p-7 lg:col-span-2">
				<div class="flex items-baseline justify-between gap-4">
					<h3 class="label text-ink-faint">Sparks</h3>
					<span class="label text-ink-soft">{sparks.active} active</span>
				</div>
				<ul class="mt-4 divide-y divide-hairline">
					{#each sparks.list as spark}
						<li class="flex items-baseline justify-between gap-4 py-3">
							<span class="text-body text-ink">{spark.name}</span>
							<span class="font-mono text-meta text-ok">{spark.rate}</span>
						</li>
					{/each}
				</ul>
				<div class="well mt-5 flex items-center justify-between gap-4 px-5 py-4">
					<span class="label text-ink-soft">Create spark</span>
					<span class="font-mono text-meta text-ink">Cost: {sparks.createCost}</span>
				</div>
			</div>

			<!-- City overview: the score card -->
			<div class="panel flex flex-col p-7">
				<h3 class="label text-ink-faint">City overview</h3>
				<dl class="mt-4 space-y-4">
					<div>
						<dt class="label text-ink-faint">City value</dt>
						<dd class="mt-1 font-mono text-title font-medium text-ink">
							{overview.cityValue}
						</dd>
					</div>
					<div>
						<dt class="label text-ink-faint">Population</dt>
						<dd class="mt-1 font-mono text-meta text-ink">{overview.population}</dd>
					</div>
					<div>
						<dt class="label text-ink-faint">Happiness</dt>
						<dd class="mt-1 font-mono text-meta text-ink">{overview.happiness}</dd>
					</div>
					<div>
						<dt class="label text-ink-faint">Rating</dt>
						<dd class="mt-1 font-mono text-meta text-gold">✦ {overview.rating}</dd>
					</div>
				</dl>
				<div class="mt-auto pt-6">
					<p class="label text-ink-faint">Districts</p>
					<div class="mt-3 flex flex-wrap gap-2">
						{#each districts as d}
							<span class="pill-ink label">{d.name} · LV. {d.level}</span>
						{/each}
					</div>
				</div>
			</div>
		</div>
		<!-- The prize: the one bridge from simulation to reality -->
		<div class="plate relative mt-16 overflow-hidden p-8 text-center md:p-14">
			<span
				class="pointer-events-none absolute top-6 left-8 font-display text-xl text-amber"
				aria-hidden="true">✦</span
			>
			<span
				class="pointer-events-none absolute right-8 bottom-6 font-display text-xl text-ink"
				aria-hidden="true">✦</span
			>
			<p class="label text-amber-deep">{prize.eyebrow}</p>
			<h2 class="mx-auto mt-4 max-w-2xl text-display">
				{prize.headline}
			</h2>
			<p class="mx-auto mt-5 max-w-2xl text-lead font-light text-ink-soft">
				{prize.copy}
			</p>
			<div class="mt-8 flex flex-wrap items-center justify-center gap-2">
				<span class="pill-ink label">Angel investment</span>
				<span class="pill-ink label">Strategic co-founding</span>
				<span class="pill-ink label">Incorporation support</span>
			</div>
		</div>
	</div>
</section>

<footer class="border-t border-hairline">
	<div
		class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 md:px-12"
	>
		<p class="label text-ink-faint">avenCITY — Build. Invest. Connect. Prosper.</p>
		<a href="/concept" class="label text-ink-soft transition-colors hover:text-amber-deep">
			Concept
		</a>
	</div>
</footer>
