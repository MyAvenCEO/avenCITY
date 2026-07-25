<script lang="ts">
	import Wordmark from '$lib/components/Wordmark.svelte';

	/** Swatches mirror the @theme tokens in src/lib/styles/tokens.css. */
	const palettes = [
		{
			name: 'Paper — the board',
			note: 'The game is played on paper, not a screen. Page, panels and recessed wells are three steps of the same warm stock.',
			swatches: [
				{ token: 'paper', hex: '#F1ECDF', class: 'bg-paper' },
				{ token: 'paper-bright', hex: '#FAF7EE', class: 'bg-paper-bright' },
				{ token: 'paper-deep', hex: '#E7E0CE', class: 'bg-paper-deep' }
			]
		},
		{
			name: 'Ink — the engraving',
			note: 'Words, figures, the primary button, the district pills. Structure comes from the hairline, never from heavy shadows.',
			swatches: [
				{ token: 'ink', hex: '#29271F', class: 'bg-ink' },
				{ token: 'ink-soft', hex: '#57534A', class: 'bg-ink-soft' },
				{ token: 'ink-faint', hex: '#8A8474', class: 'bg-ink-faint' },
				{ token: 'hairline', hex: '#D8D0BC', class: 'bg-hairline' }
			]
		},
		{
			name: 'Moss — what you build',
			note: 'The dome glass and its gardens. Districts, growth, agriculture.',
			swatches: [
				{ token: 'moss-deep', hex: '#47523A', class: 'bg-moss-deep' },
				{ token: 'moss', hex: '#6C7A52', class: 'bg-moss' },
				{ token: 'moss-faint', hex: '#DFE3CF', class: 'bg-moss-faint' }
			]
		},
		{
			name: 'Amber & gold — what moves, what you earn',
			note: 'Amber is the accent: trade routes, energy, active states, links. Gold is reserved for yields and ratings.',
			swatches: [
				{ token: 'amber-deep', hex: '#A06A24', class: 'bg-amber-deep' },
				{ token: 'amber', hex: '#C98A3B', class: 'bg-amber' },
				{ token: 'amber-faint', hex: '#F3E2C8', class: 'bg-amber-faint' },
				{ token: 'gold', hex: '#B3892E', class: 'bg-gold' },
				{ token: 'water', hex: '#C7D6CB', class: 'bg-water' }
			]
		},
		{
			name: 'Status',
			note: 'Reserved for state — income up, warnings, failures. Never decorative.',
			swatches: [
				{ token: 'ok', hex: '#5F8A4E', class: 'bg-ok' },
				{ token: 'warn', hex: '#C98A3B', class: 'bg-warn' },
				{ token: 'fail', hex: '#B85C41', class: 'bg-fail' }
			]
		}
	];

	const typeScale = [
		{ token: 'text-hero', use: 'Hero headline only. One per page.', class: 'text-hero font-display' },
		{ token: 'text-display', use: 'Section headings.', class: 'text-display font-display' },
		{ token: 'text-title', use: 'Card titles, key figures.', class: 'text-title' },
		{ token: 'text-lead', use: 'Standfirst, pitch copy.', class: 'text-lead' },
		{ token: 'text-body', use: 'Body copy. The default.', class: 'text-body' },
		{ token: 'text-meta', use: 'Captions, rates, timestamps.', class: 'text-meta' }
	];
</script>

<svelte:head>
	<title>avenCITY — design system</title>
	<meta
		name="description"
		content="The avenCITY corporate identity: the founder's atlas — paper, ink, moss and amber."
	/>
</svelte:head>

<div class="mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-24">
	<header class="flex flex-wrap items-center justify-between gap-4">
		<a href="/"><Wordmark class="text-3xl" /></a>
		<a href="/" class="label text-ink-soft transition-colors hover:text-amber-deep">
			← Back to the city
		</a>
	</header>

	<h1 class="mt-16 text-display">
		The founder's atlas — <em class="italic">paper, ink, moss and amber.</em>
	</h1>
	<p class="mt-6 max-w-2xl text-lead font-light text-ink-soft">
		avenCITY's identity is the game board itself: a hand-drawn atlas. Warm paper for the
		board, engraved ink for words and figures, olive moss for what you build, amber for what
		moves. If a new colour is needed, it must plausibly exist on this map.
	</p>

	<!-- Colour -->
	<section class="mt-20">
		<h2 class="label text-amber-deep">01 — Colour</h2>
		<div class="mt-8 space-y-6">
			{#each palettes as palette}
				<div class="panel p-8">
					<h3 class="text-title">{palette.name}</h3>
					<p class="mt-2 max-w-2xl text-meta text-ink-soft">{palette.note}</p>
					<div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
						{#each palette.swatches as swatch}
							<div>
								<div
									class="h-20 w-full rounded-[var(--radius-panel)] border border-hairline {swatch.class}"
								></div>
								<p class="label mt-3 text-ink">{swatch.token}</p>
								<p class="mt-1 font-mono text-meta text-ink-faint">{swatch.hex}</p>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Type -->
	<section class="mt-20">
		<h2 class="label text-amber-deep">02 — Type</h2>
		<div class="mt-8 grid gap-6 md:grid-cols-3">
			<div class="panel p-8">
				<p class="label text-ink-faint">Display + wordmark</p>
				<p class="mt-3 font-display text-display">Playfair</p>
				<p class="mt-4 text-body text-ink-soft">
					The atlas voice. High-contrast serif for the wordmark and every display
					headline; italics for the counter-phrase inside a headline. Medium weight —
					the serif carries the contrast, never boldness.
				</p>
			</div>
			<div class="panel p-8">
				<p class="label text-ink-faint">Body</p>
				<p class="mt-3 font-sans text-display font-medium">Chillax</p>
				<p class="mt-4 text-body text-ink-soft">
					The body voice. Soft geometric sans for paragraphs and UI copy — warm enough
					to sit on paper without starching it.
				</p>
			</div>
			<div class="panel p-8">
				<p class="label text-ink-faint">Labels + figures</p>
				<p class="mt-3 font-mono text-display font-light">Azeret Mono</p>
				<p class="mt-4 text-body text-ink-soft">
					The ledger voice. Small tracked-out caps and every game figure — $ 4,290 /h
					belongs to the mono, always. Never body copy, never headlines.
				</p>
			</div>
		</div>

		<div class="panel mt-6 divide-y divide-hairline p-8">
			{#each typeScale as step}
				<div
					class="flex flex-col gap-3 py-6 first:pt-0 last:pb-0 md:flex-row md:items-baseline md:gap-8"
				>
					<div class="md:w-48 md:shrink-0">
						<p class="label text-amber-deep">{step.token}</p>
						<p class="mt-1 text-meta text-ink-faint">{step.use}</p>
					</div>
					<p class="{step.class} text-ink">Build. Invest. Connect. Prosper.</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- Paper & panels -->
	<section class="mt-20">
		<h2 class="label text-amber-deep">03 — Paper &amp; panels</h2>
		<p class="mt-4 max-w-2xl text-body text-ink-soft">
			The interface is built from three pieces of paper: the board, the panel, and the
			well. Structure comes from hairlines — a shadow you can point at is too big.
		</p>
		<div class="mt-8 grid gap-6 md:grid-cols-3">
			<div class="panel p-8">
				<p class="label text-amber-deep">.panel</p>
				<p class="mt-3 text-body text-ink-soft">
					Brighter paper on the board, one hairline, a whisper of lift. The default
					container for everything.
				</p>
			</div>
			<div class="plate p-8">
				<p class="label text-amber-deep">.plate</p>
				<p class="mt-3 text-body text-ink-soft">
					Hero scale — the map itself, a framed figure. Larger radius, slightly more
					lift, still hairlined.
				</p>
			</div>
			<div class="panel p-8">
				<p class="label text-amber-deep">.well</p>
				<div class="well mt-3 px-5 py-4">
					<p class="text-body text-ink-soft">
						Recessed paper inside a panel — totals, costs, create-actions.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Components -->
	<section class="mt-20 mb-24">
		<h2 class="label text-amber-deep">04 — Components</h2>
		<div class="panel mt-8 space-y-10 p-8">
			<div>
				<p class="label text-ink-faint">Buttons</p>
				<div class="mt-4 flex flex-wrap items-center gap-4">
					<button class="btn btn-primary">Primary — ink</button>
					<button class="btn btn-line">Secondary — ruled</button>
				</div>
				<p class="mt-4 max-w-2xl text-meta text-ink-soft">
					Primary is the ink stamp — one per view. Secondary is a hairlined capsule
					that stays quiet next to it.
				</p>
			</div>

			<div>
				<p class="label text-ink-faint">Chips &amp; pills</p>
				<div class="mt-4 flex flex-wrap items-center gap-4">
					<span class="chip label">
						<span class="pulse-dot" aria-hidden="true"></span>
						Year 24 · Autumn
					</span>
					<span class="chip label">$ 248,750</span>
					<span class="pill-ink label">Avenhall · LV. 5</span>
					<span class="pill-ink label">Riverdale · LV. 3</span>
				</div>
				<p class="mt-4 max-w-2xl text-meta text-ink-soft">
					Paper chips carry resources and live state — the amber dot marks income
					ticking right now. Ink pills are place-names, exactly as on the map.
				</p>
			</div>

			<div>
				<p class="label text-ink-faint">Wordmark</p>
				<div class="mt-4">
					<Wordmark class="text-6xl" />
				</div>
				<p class="mt-4 max-w-2xl text-meta text-ink-soft">
					One Playfair line: <code class="font-mono">aven</code> lowercase,
					<code class="font-mono">CITY</code> in caps. The case shift inside a single
					serif word is the whole mark.
				</p>
			</div>
		</div>
	</section>
</div>
