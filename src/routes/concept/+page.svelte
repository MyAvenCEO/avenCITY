<script lang="ts">
	import Wordmark from '$lib/components/Wordmark.svelte';

	const biomes = [
		{ name: 'RIVER', resources: 'WATER · CLAY' },
		{ name: 'FOREST', resources: 'WOOD · HERBS' },
		{ name: 'MOUNTAIN', resources: 'STONE · ORE' },
		{ name: 'MEADOW', resources: 'GRAIN · FIBER' },
		{ name: 'DUNES', resources: 'SAND · SUN' }
	];

	const domeTypes = [
		{
			name: 'LIVING',
			what: 'Housing with integrated permaculture — the gardens are part of the architecture.',
			produces: 'GRAIN + HERBS daily, plus homes for citizens (rent).'
		},
		{
			name: 'FACTORY',
			what: 'Extraction or production, running exactly one recipe from the city recipe book.',
			produces: "The recipe's output, batch by batch."
		},
		{
			name: 'VENUE',
			what: 'Community buildings — stadium, theatre, bathhouse, academy.',
			produces: 'JOY, the culture resource, and bonuses for neighbouring domes.'
		}
	];

	const starterSparks = [
		{ n: 1, name: 'The Well', hex: 'RIVER', why: 'WATER — citizens drink daily' },
		{ n: 2, name: 'First Hearth (LIVING)', hex: 'MEADOW', why: 'grain, herbs, homes for 6' },
		{ n: 3, name: 'Forestry', hex: 'FOREST', why: 'WOOD — fuel and construction' },
		{ n: 4, name: 'The Mill', hex: 'any', why: 'FLOUR = 2 GRAIN — first composition' },
		{ n: 5, name: 'The Bakery', hex: 'any', why: 'BREAD = FLOUR + WATER + WOOD — closes the food loop' },
		{ n: 6, name: 'Sawmill · Kiln · Glassworks', hex: 'FOREST · RIVER · DUNES', why: 'PLANK, BRICK, GLASS — building the next domes' }
	];

	const verticals = [
		{ name: 'Speed', effect: '+1 batch per game day — throughput' },
		{ name: 'Efficiency', effect: '−10% recipe inputs per level — cheaper production' },
		{ name: 'Margin', effect: '+10% revenue per unit — quality and brand premium' }
	];

	const tuning = [
		{ p: 'Time', v: '1 real day = 24 game days' },
		{ p: 'Heart income', v: '24 ♥ / game day — universal, equal' },
		{ p: 'Demurrage', v: '7% per game day on held hearts' },
		{ p: 'Wages', v: 'none — income is UBI + dividends only' },
		{ p: 'Cost of living', v: '~12 ♥ / day at seed prices' },
		{ p: 'Spark goal', v: '240 ♥ within 7 game days' },
		{ p: 'SPARKminds', v: '1 ♥ invested = 1 SPARKmind' },
		{ p: 'Dividends', v: 'stream in real time, × level' },
		{ p: 'Dome build LV.1', v: '8 PLANK + 6 BRICK + 4 GLASS' },
		{ p: 'Market', v: 'open — damped daily, clamped 0.5×–3× base' },
		{ p: 'Freedom', v: 'dividends ≥ living costs, 7 days straight' }
	];

	const questions = [
		'Rat-race dial: ~half of daily hearts free to invest — right for launch?',
		'Founder economics: flat pro-rata, or a founder bonus before the split?',
		'VENUE mechanics: adjacency bonus, a JOY need, or both?',
		'Treasury governance: auto-pay funded sparks, or city votes with hearts?',
		'Is 7%/day demurrage enough pressure, or also pause minting above a wallet cap?',
		'Biome balance: should some hexes be resource-poor on purpose — pure real-estate plays?',
		'Offline: overnight ≈ 8 game days of melting hearts — is a standing "auto-invest" Aven directive the fix?'
	];
</script>

<svelte:head>
	<title>avenCITY — living concept paper</title>
	<meta
		name="description"
		content="The avenCITY game concept v0.3: biome hexes, domes, sparks and SPARKminds. One melting currency, open market, JSON recipes, zero wages."
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
		<span class="chip label">Draft v0.3 — for discussion</span>
	</div>

	<h1 class="mt-6 text-display">
		Hexagons, domes, sparks —<br />
		<em class="italic">and the minds that own them.</em>
	</h1>
	<p class="mt-6 max-w-2xl text-lead font-light text-ink-soft">
		The whole game is hexagons on a map. One melting currency, an open market, recipes as
		data, zero wages. Radically simple on purpose — depth comes from composition and
		ownership, not simulation complexity.
	</p>

	<!-- 01 · The board -->
	<section class="mt-20">
		<h2 class="label text-amber-deep">01 — The board: hexes &amp; biomes</h2>
		<p class="mt-4 max-w-2xl text-body text-ink-soft">
			The city is a hex map, and the map is the whole UI. <strong
				class="font-medium text-ink">Every hex is composed of 1 or 2 biomes</strong
			>, and biomes carry the natural resources — five biomes cover all ten base resources.
			A RIVER + FOREST hex offers four resources; hex value is its biome combination. You
			cannot found a waterworks on a dune.
		</p>
		<div class="panel mt-6 divide-y divide-hairline">
			{#each biomes as b}
				<div class="flex items-baseline justify-between gap-6 px-7 py-4">
					<span class="pill-ink label">{b.name}</span>
					<span class="font-mono text-meta text-ink">{b.resources}</span>
				</div>
			{/each}
		</div>
		<div class="well mt-6 overflow-x-auto px-6 py-5">
			<code class="font-mono text-meta whitespace-nowrap text-ink">
				WILD (biomes visible) ──(spark funded + built)──▶ DOME ──(upgrades)──▶ LV.2–5
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
	</section>

	<!-- 03 · Sparks & SPARKminds -->
	<section class="mt-16">
		<h2 class="label text-amber-deep">03 — Sparks, SPARKminds &amp; live dividends</h2>
		<p class="mt-4 max-w-2xl text-body text-ink-soft">
			A spark proposes: which hex, which dome, which recipe. Investors' hearts mint
			<strong class="font-medium text-ink">SPARKminds 1:1</strong> — pro-rata shares of that
			dome — while the hearts pool in the City Treasury, which pays construction by buying
			materials from the city's own factories at market price.
			<strong class="font-medium text-ink">Dividends stream in real time</strong>, scaled by
			the spark's level: your hearts tick upward live. Watching a stream you own flow is the
			core dopamine of the game.
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
  └─ YES → treasury buys materials → the dome rises
           → dividends STREAM to SPARKmind holders, live`}</pre>
		</div>
	</section>

	<!-- 04 · Hearts & demurrage -->
	<section class="mt-16">
		<h2 class="label text-amber-deep">04 — Hearts: minted daily, melting slowly</h2>
		<p class="mt-4 max-w-2xl text-body text-ink-soft">
			Everyone mints <strong class="font-medium text-ink">24 ♥ per game day</strong> — one
			real day is 24 game days. Held hearts melt at
			<strong class="font-medium text-ink">7% demurrage per game day</strong>: attention
			can't be hoarded, an idle wallet plateaus around 343 ♥ no matter how long you wait.
			Invested hearts don't melt — <em class="italic"
				>the only way to store attention is to own something with it.</em
			> And there are zero wages in this world: income is your UBI and your dividend streams.
			Nothing else exists.
		</p>
	</section>

	<!-- 05 · Recipes & market -->
	<section class="mt-16">
		<h2 class="label text-amber-deep">05 — Configured recipes, discovered prices</h2>
		<p class="mt-4 max-w-2xl text-body text-ink-soft">
			Only the composition layer is pre-configured: what goes in, what comes out, which
			dome can run it — Minecraft-style, all JSON. What things <em class="italic">cost</em>
			is discovered on one open market, lightly damped so prices move but never whipsaw.
			High prices are the founding signal: GLASS at 2.6× base means the city needs a
			glassworks — and someone will spark one.
		</p>
		<div class="mt-6 grid gap-6 md:grid-cols-2">
			<div class="well overflow-x-auto px-6 py-5">
				<pre class="font-mono text-meta leading-relaxed text-ink">{`// recipes.json
{
  "id": "bake_bread",
  "dome": "FACTORY",
  "inputs": {
    "FLOUR": 1,
    "WATER": 1,
    "WOOD":  1
  },
  "output": { "BREAD": 2 }
}`}</pre>
			</div>
			<div class="well overflow-x-auto px-6 py-5">
				<pre class="font-mono text-meta leading-relaxed text-ink">{`// market: open, damped
price(tomorrow) =
  price(today)
  × (demand / supply)^0.5

clamped 0.5× – 3× base
repriced every game day`}</pre>
			</div>
		</div>
	</section>

	<!-- 06 · Survival start -->
	<section class="mt-16">
		<h2 class="label text-amber-deep">06 — The survival start</h2>
		<p class="mt-4 max-w-2xl text-body text-ink-soft">
			Ten base resources — <span class="font-mono text-meta"
				>WATER · WOOD · STONE · ORE · SAND · CLAY · GRAIN · FIBER · HERBS · SUN</span
			> — a small commons, seven wild hexes, and needs that must be met from zero. The
			founding sequence is the tutorial, and the tutorial is the economy bootstrapping
			itself:
		</p>
		<div class="panel mt-6 divide-y divide-hairline">
			{#each starterSparks as s}
				<div class="grid gap-2 px-7 py-4 sm:grid-cols-[2rem_minmax(10rem,14rem)_8rem_1fr] sm:items-baseline sm:gap-4">
					<span class="font-display text-title text-hairline">{s.n}</span>
					<span class="text-body font-medium text-ink">{s.name}</span>
					<span class="label text-ink-faint">{s.hex}</span>
					<span class="text-meta text-ink-soft">{s.why}</span>
				</div>
			{/each}
		</div>
		<p class="mt-5 max-w-2xl text-meta text-ink-faint">
			Dome construction costs are recipes too — LV.1 needs 8 PLANK + 6 BRICK + 4 GLASS —
			so the construction chain is what turns a survival camp into a growing city.
		</p>
	</section>

	<!-- 07 · Upgrades -->
	<section class="mt-16">
		<h2 class="label text-amber-deep">07 — Upgrade verticals</h2>
		<p class="mt-4 max-w-2xl text-body text-ink-soft">
			Every dome levels LV.1 → LV.5 along three independent tracks. Upgrades are paid from
			the dome treasury or a fresh SPARKmind raise — new hearts in, new shares issued,
			every level a fresh "would you still invest?". Level multiplies the dividend stream.
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

	<!-- 08 · Freedom -->
	<section class="mt-16">
		<h2 class="label text-amber-deep">08 — The rat race &amp; freedom</h2>
		<p class="mt-4 max-w-2xl text-body text-ink-soft">
			Needs — water, food, home — cost about half your daily hearts at seed prices; the
			other half is investable attention. <strong class="font-medium text-ink"
				>Freedom is the win:</strong
			> when your dividend streams cover your cost of living for 7 straight days, your whole
			UBI becomes free capital. The city's score is its Freedom Rate — the share of citizens
			who own their way out.
		</p>
	</section>

	<!-- 09 · Tuning -->
	<section class="mt-16">
		<h2 class="label text-amber-deep">09 — Tuning table</h2>
		<div class="panel mt-6 divide-y divide-hairline">
			{#each tuning as row}
				<div class="flex items-baseline justify-between gap-6 px-7 py-4">
					<span class="label text-ink-faint">{row.p}</span>
					<span class="text-right font-mono text-meta text-ink">{row.v}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- 10 · Open questions -->
	<section class="mt-16 mb-24">
		<h2 class="label text-amber-deep">10 — Open questions</h2>
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
