<script lang="ts">
	import Wordmark from '$lib/components/Wordmark.svelte';

	const domeTypes = [
		{
			name: 'LIVING',
			what: 'Housing with integrated permaculture — the gardens are part of the architecture.',
			produces: 'Always FOOD, plus homes for citizens (rent).'
		},
		{
			name: 'FACTORY',
			what: 'A production hall running exactly one recipe from the city recipe book.',
			produces: "The recipe's output resource, batch by batch."
		},
		{
			name: 'VENUE',
			what: 'Community buildings — stadium, theatre, bathhouse, academy.',
			produces: 'JOY, the culture resource, and bonuses for neighbouring domes.'
		}
	];

	const verticals = [
		{ name: 'Speed', effect: '+1 production batch per day' },
		{ name: 'Efficiency', effect: '−10% recipe inputs per level — cheaper production' },
		{ name: 'Scale', effect: 'More capacity: workers, residents, audience' }
	];

	const tuning = [
		{ p: 'Game day', v: '1 real minute' },
		{ p: 'Heart income', v: '24 ♥ / day — universal, equal' },
		{ p: 'Cost of living', v: '12 ♥ / day (FOOD 6 + HOME 6)' },
		{ p: 'Spark goal', v: '240 ♥ within 7 days' },
		{ p: 'SPARKminds', v: '1 ♥ invested = 1 SPARKmind' },
		{ p: 'Founder stake', v: 'min 24 ♥ — skin in the game' },
		{ p: 'Dome upkeep', v: '6 ♥ / day, burned' },
		{ p: 'Freedom', v: 'dividends ≥ living costs, 7 days straight' }
	];

	const questions = [
		'How harsh is the rat race — how much of the daily 24 ♥ stays free to invest?',
		'Founder economics: flat pro-rata, or a founder bonus before the split?',
		'VENUE mechanics: adjacency bonus, a JOY need, or both?',
		'Treasury governance: auto-pay funded sparks, or city votes with hearts?',
		'Heart expiry: keep the 7-day use-it-or-lose-it, or is upkeep sink enough?',
		'Fixed prices mean shortages become queues — is waiting-list gameplay fun?',
		'Offline: cap the heart buffer at 3 days (72 ♥)?'
	];
</script>

<svelte:head>
	<title>avenCITY — living concept paper</title>
	<meta
		name="description"
		content="The avenCITY game concept: hexagons, domes, sparks and SPARKminds. One currency, fixed prices, JSON recipes. Draft v0.2 — for discussion."
	/>
</svelte:head>

<div class="mx-auto max-w-4xl px-6 py-16 md:px-12 md:py-24">
	<header class="flex flex-wrap items-center justify-between gap-4">
		<a href="/"><Wordmark class="text-3xl" /></a>
		<a href="/" class="label text-ink-soft transition-colors hover:text-amber-deep">
			← Back to the city
		</a>
	</header>

	<div class="mt-16 flex flex-wrap items-center gap-3">
		<span class="chip label">
			<span class="pulse-dot" aria-hidden="true"></span>
			Living concept paper
		</span>
		<span class="chip label">Draft v0.2 — for discussion</span>
	</div>

	<h1 class="mt-6 text-display">
		Hexagons, domes, sparks —<br />
		<em class="italic">and the minds that own them.</em>
	</h1>
	<p class="mt-6 max-w-2xl text-lead font-light text-ink-soft">
		The whole game is hexagons on a map. One currency, fixed prices, recipes as data.
		Radically simple on purpose — depth comes from composition, not simulation complexity.
	</p>

	<!-- 01 · The board -->
	<section class="mt-20">
		<h2 class="label text-amber-deep">01 — The board</h2>
		<p class="mt-4 max-w-2xl text-body text-ink-soft">
			The city is a hex map, and the map is the whole UI. Every hex is a parcel: wild
			nature until a spark develops it, then a dome producing every day. The city grows one
			funded spark at a time — <strong class="font-medium text-ink"
				>every dome on the map is a business somebody believed in.</strong
			> The map is the cap table of the city.
		</p>
		<div class="well mt-6 overflow-x-auto px-6 py-5">
			<code class="font-mono text-meta whitespace-nowrap text-ink">
				WILD ──(spark funded + built)──▶ DOME ──(upgrades)──▶ DOME LV.2–5
			</code>
		</div>
	</section>

	<!-- 02 · Domes -->
	<section class="mt-16">
		<h2 class="label text-amber-deep">02 — Three kinds of dome</h2>
		<div class="mt-6 grid gap-6 md:grid-cols-3">
			{#each domeTypes as dome}
				<div class="panel p-7">
					<span class="pill-ink label">{dome.name}</span>
					<p class="mt-4 text-body text-ink-soft">{dome.what}</p>
					<p class="mt-3 text-body font-medium text-ink">{dome.produces}</p>
				</div>
			{/each}
		</div>
		<p class="mt-5 max-w-2xl text-meta text-ink-faint">
			Living domes make the city self-feeding by construction — food is never an industry
			someone forgot to build. Venues make community a first-class investment, not
			decoration.
		</p>
	</section>

	<!-- 03 · Sparks & SPARKminds -->
	<section class="mt-16">
		<h2 class="label text-amber-deep">03 — Sparks &amp; SPARKminds</h2>
		<p class="mt-4 max-w-2xl text-body text-ink-soft">
			A spark is a proposal to develop a hex: which parcel, which dome, which recipe.
			Players invest hearts; investors receive <strong class="font-medium text-ink"
				>SPARKminds</strong
			> — pro-rata shares of that dome, 1 ♥ = 1 SPARKmind. The hearts themselves flow into
			the City Treasury and become the city's working currency: it pays the build cost by
			buying materials from the city's own factories.
		</p>
		<div class="well mt-6 overflow-x-auto px-6 py-5">
			<pre class="font-mono text-meta leading-relaxed text-ink">{`founder pitches a SPARK on a wild hex
     │
     ▼
players invest HEARTS ────▶ investors receive SPARKminds
     │                       (pro-rata shares of the dome)
     ▼
HEARTS pool in the CITY TREASURY
     │
     ▼
goal reached in time?
  ├─ NO  → every heart refunded
  └─ YES → treasury pays the build → the dome rises
           → dividends flow to SPARKmind holders, daily`}</pre>
		</div>
	</section>

	<!-- 04 · Recipes -->
	<section class="mt-16">
		<h2 class="label text-amber-deep">04 — One recipe engine, everything is data</h2>
		<p class="mt-4 max-w-2xl text-body text-ink-soft">
			Minecraft-style composition: a handful of base resources recombine into higher-order
			goods through a universal recipe engine. Recipes, prices and build costs are all
			pre-configured JSON — no open market, no price discovery. Scarcity shows as waiting
			time, not price spikes.
		</p>
		<div class="mt-6 grid gap-6 md:grid-cols-2">
			<div class="well overflow-x-auto px-6 py-5">
				<pre class="font-mono text-meta leading-relaxed text-ink">{`// recipes.json
{
  "id": "bake_bread",
  "inputs": { "FLOUR": 2, "WATER": 1 },
  "output": { "BREAD": 1 },
  "minutesPerBatch": 1,
  "domeType": "FACTORY"
}`}</pre>
			</div>
			<div class="well overflow-x-auto px-6 py-5">
				<pre class="font-mono text-meta leading-relaxed text-ink">{`// prices.json — fixed
{
  "GRAIN": 1,
  "WATER": 1,
  "FLOUR": 2,
  "POWER": 2,
  "BREAD": 6
}`}</pre>
			</div>
		</div>
	</section>

	<!-- 05 · Upgrades -->
	<section class="mt-16">
		<h2 class="label text-amber-deep">05 — Upgrade verticals</h2>
		<p class="mt-4 max-w-2xl text-body text-ink-soft">
			Every dome levels LV.1 → LV.5 along independent tracks. An upgrade raise re-opens the
			spark: new hearts in, new SPARKminds issued — every level is a fresh "would you still
			invest?" moment.
		</p>
		<div class="panel mt-6 divide-y divide-hairline">
			{#each verticals as v}
				<div class="flex flex-col gap-1 px-7 py-5 sm:flex-row sm:items-baseline sm:gap-8">
					<span class="label w-32 shrink-0 text-ink">{v.name}</span>
					<span class="text-body text-ink-soft">{v.effect}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- 06 · The rat race -->
	<section class="mt-16">
		<h2 class="label text-amber-deep">06 — Citizens, needs, freedom</h2>
		<p class="mt-4 max-w-2xl text-body text-ink-soft">
			Every citizen receives 24 ♥ a day and pays ~12 ♥ for needs — food and home. What's
			left is investable attention. Your Aven can work the commons for +12 ♥ when you're
			overextended, but wages never scale. <strong class="font-medium text-ink"
				>Freedom is the win:</strong
			> when dividends cover your cost of living for 7 straight days, you're out of the rat
			race — and the city's score is its Freedom Rate: the share of citizens who made it out.
		</p>
	</section>

	<!-- 07 · Tuning -->
	<section class="mt-16">
		<h2 class="label text-amber-deep">07 — Tuning table</h2>
		<div class="panel mt-6 divide-y divide-hairline">
			{#each tuning as row}
				<div class="flex items-baseline justify-between gap-6 px-7 py-4">
					<span class="label text-ink-faint">{row.p}</span>
					<span class="font-mono text-meta text-ink">{row.v}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- 08 · Open questions -->
	<section class="mt-16 mb-24">
		<h2 class="label text-amber-deep">08 — Open questions</h2>
		<div class="plate mt-6 p-8">
			<ol class="list-decimal space-y-3 pl-5">
				{#each questions as q}
					<li class="text-body text-ink-soft">{q}</li>
				{/each}
			</ol>
			<p class="mt-6 text-meta text-ink-faint">
				This is a living paper — settled answers move up into the spec, and the queue
				renumbers. Argue freely.
			</p>
		</div>
	</section>
</div>
