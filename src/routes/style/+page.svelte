<script lang="ts">
	import cityDome from '$lib/assets/images/maia-city-dome.jpg';
	import Wordmark from '$lib/components/Wordmark.svelte';

	/** Swatches mirror the @theme tokens in src/lib/styles/tokens.css. */
	const palettes = [
		{
			name: 'Paradise — the primary',
			note: 'The water. The most recognisable thing in the renders and the one colour that is unmistakably this city, so it carries every primary action, link and live state.',
			swatches: [
				{ token: 'paradise-deep', hex: '#0E5A6E', class: 'bg-paradise-deep' },
				{ token: 'paradise', hex: '#26A5C9', class: 'bg-paradise' },
				{ token: 'paradise-bright', hex: '#5AB4D8', class: 'bg-paradise-bright' }
			]
		},
		{
			name: 'Ground — deep water-ink',
			note: 'The floor of the lagoon. Cool and near-black, so photographs sit on it without being tinted. This is the page floor, never a green.',
			swatches: [
				{ token: 'deep', hex: '#071C22', class: 'bg-deep' },
				{ token: 'deep-soft', hex: '#0E2A33', class: 'bg-deep-soft' },
				{ token: 'surface', hex: '#163A44', class: 'bg-surface' }
			]
		},
		{
			name: 'Foliage — supporting only',
			note: 'Accents, never a background and never a scrim. An earlier pass made green the ground and everything went murky.',
			swatches: [
				{ token: 'moss', hex: '#4F8A5B', class: 'bg-moss' },
				{ token: 'frond', hex: '#9FC08C', class: 'bg-frond' }
			]
		},
		{
			name: 'Bamboo & stone',
			note: 'The built warmth — struts and masonry. The human register: quotes, secondary marks.',
			swatches: [
				{ token: 'stone', hex: '#8D8577', class: 'bg-stone' },
				{ token: 'bamboo', hex: '#C9A87C', class: 'bg-bamboo' },
				{ token: 'bamboo-bright', hex: '#DDC39B', class: 'bg-bamboo-bright' }
			]
		},
		{
			name: 'Sky & bone',
			note: 'The light. Text colours and pale surfaces — never pure white. Sky is sampled straight from above the dome.',
			swatches: [
				{ token: 'sky', hex: '#7DA1C5', class: 'bg-sky' },
				{ token: 'bone', hex: '#F2EBDD', class: 'bg-bone' },
				{ token: 'chalk', hex: '#FBF8F1', class: 'bg-chalk' },
				{ token: 'chalk-muted', hex: '#D5DDE0', class: 'bg-chalk-muted' },
				{ token: 'chalk-faint', hex: '#93A5AC', class: 'bg-chalk-faint' }
			]
		},
		{
			name: 'Status',
			note: 'Reserved for state. Never decorative.',
			swatches: [
				{ token: 'ok', hex: '#5BC98C', class: 'bg-ok' },
				{ token: 'warn', hex: '#E0A83F', class: 'bg-warn' },
				{ token: 'fail', hex: '#D9644A', class: 'bg-fail' }
			]
		}
	];

	const typeScale = [
		{ token: 'text-hero', use: 'Hero headline only. One per page.', class: 'text-hero' },
		{ token: 'text-display', use: 'Section headings.', class: 'text-display' },
		{ token: 'text-title', use: 'Card titles, spec figures.', class: 'text-title' },
		{ token: 'text-lead', use: 'Standfirst, pull quotes.', class: 'text-lead' },
		{ token: 'text-body', use: 'Body copy. The default.', class: 'text-body' },
		{ token: 'text-meta', use: 'Captions, timestamps.', class: 'text-meta' }
	];
</script>

<svelte:head>
	<title>avenCITY — design system</title>
	<meta name="description" content="The avenCITY corporate identity: liquid glass on living nature." />
</svelte:head>

<!-- The whole page sits on the city render, because every glass token in this
     system is meaningless without a photograph behind it. Fixed attachment so
     panes slide over the image as you scroll — the effect IS the spec.

     `transform-gpu` on the two fixed layers is NOT cosmetic. Without it,
     Chromium fails to repaint text inside backdrop-filter panes while they
     scroll over a position:fixed backdrop — panes render as empty boxes.
     Promoting the backdrop to its own compositing layer fixes it. -->
<div class="relative isolate min-h-svh">
	<img
		src={cityDome}
		alt=""
		aria-hidden="true"
		class="fixed inset-0 -z-20 h-full w-full transform-gpu object-cover will-change-transform"
	/>
	<div class="fixed inset-0 -z-10 transform-gpu bg-deep/60"></div>
	<!-- The header and intro are the only copy on this page without a glass pane
	     behind them, and they land on the sunlit dome. A graded top band gives
	     them contrast without darkening the render everywhere else. -->
	<div
		class="fixed inset-x-0 top-0 -z-10 h-[28rem] transform-gpu bg-gradient-to-b from-deep/75 via-deep/40 to-transparent"
	></div>

	<div class="mx-auto max-w-6xl px-6 py-16 md:px-12 md:py-24">
		<header class="flex flex-wrap items-center justify-between gap-4">
			<a href="/"><Wordmark class="text-2xl text-chalk" /></a>
			<a href="/" class="label text-chalk-muted transition-colors hover:text-paradise-bright">
				← Back to the city
			</a>
		</header>

		<h1 class="mt-16 text-display text-chalk">
			<span class="font-light">Liquid glass on</span>
			<span class="font-bold">living nature.</span>
		</h1>
		<p class="mt-6 max-w-2xl text-lead font-light text-chalk-muted">
			Maia City is glass domes standing in a jungle, so the identity is exactly that. The
			photograph is the ground layer; everything we say floats on glass above it. Every colour
			below is sampled from the renders — the UI wears the photograph's own palette.
		</p>

		<!-- Colour -->
		<section class="mt-20">
			<h2 class="label text-paradise-bright">01 — Colour</h2>
			<div class="mt-8 space-y-6">
				{#each palettes as palette}
					<div class="glass p-8">
						<h3 class="text-title font-light text-chalk">{palette.name}</h3>
						<p class="mt-2 max-w-2xl text-meta text-chalk-muted">{palette.note}</p>
						<div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
							{#each palette.swatches as swatch}
								<div>
									<div
										class="h-20 w-full rounded-[var(--radius-panel)] border border-white/15 {swatch.class}"
									></div>
									<p class="label mt-3 text-chalk">{swatch.token}</p>
									<p class="mt-1 font-mono text-meta text-chalk-faint">{swatch.hex}</p>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Type -->
		<section class="mt-20">
			<h2 class="label text-paradise-bright">02 — Type</h2>
			<div class="mt-8 grid gap-6 md:grid-cols-2">
				<div class="glass p-8">
					<p class="label text-chalk-faint">Display + body</p>
					<p class="mt-3 font-display text-display font-light text-chalk">Chillax</p>
					<p class="mt-4 text-body text-chalk-muted">
						The organic voice. Soft geometric sans with rounded terminals — nature, not
						machinery. Headlines run Light (300) with tight negative tracking; Bold (700)
						is reserved for the wordmark and the one line in a heading that carries the
						claim.
					</p>
				</div>
				<div class="glass p-8">
					<p class="label text-chalk-faint">Labels + specs</p>
					<p class="mt-3 font-mono text-display font-light text-chalk">Azeret Mono</p>
					<p class="mt-4 text-body text-chalk-muted">
						The technical voice. Used only for small uppercase labels, eyebrows, spec
						figures and meta — the engineering annotation on the blueprint. Never for
						body copy, never for headlines.
					</p>
				</div>
			</div>

			<div class="glass mt-6 divide-y divide-white/10 p-8">
				{#each typeScale as step}
					<div class="flex flex-col gap-3 py-6 first:pt-0 last:pb-0 md:flex-row md:items-baseline md:gap-8">
						<div class="md:w-48 md:shrink-0">
							<p class="label text-paradise-bright">{step.token}</p>
							<p class="mt-1 text-meta text-chalk-faint">{step.use}</p>
						</div>
						<p class="{step.class} font-light text-chalk">The impossible becomes possible</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Glass -->
		<section class="mt-20">
			<h2 class="label text-paradise-bright">03 — Glass</h2>
			<p class="mt-4 max-w-2xl text-body text-chalk-muted">
				A convincing pane needs four layers together — tint, blurred and saturated backdrop,
				a light hairline edge, and an inset top gleam. Drop any one and it becomes a grey
				box. Opaque surfaces are off-brand: the jungle must keep showing through whatever we
				build on it.
			</p>
			<div class="mt-8 grid gap-6 md:grid-cols-3">
				<div class="glass p-8">
					<p class="label text-paradise-bright">.glass</p>
					<p class="mt-3 text-body text-chalk-muted">
						The default pane. 20px blur, subtle tint. Use for cards and most content.
					</p>
				</div>
				<div class="glass-lens p-8">
					<p class="label text-paradise-bright">.glass-lens</p>
					<p class="mt-3 text-body text-chalk-muted">
						Hero scale — deeper blur, stronger edge, bigger lift. One per viewport, or
						the depth hierarchy flattens.
					</p>
				</div>
				<div class="glass-shade p-8">
					<p class="label text-paradise-bright">.glass-shade</p>
					<p class="mt-3 text-body text-chalk-muted">
						Darker tint for when text must win over a bright patch of photograph. Still
						translucent.
					</p>
				</div>
			</div>
		</section>

		<!-- Components -->
		<section class="mt-20 mb-24">
			<h2 class="label text-paradise-bright">04 — Components</h2>
			<div class="glass mt-8 space-y-10 p-8">
				<div>
					<p class="label text-chalk-faint">Buttons</p>
					<div class="mt-4 flex flex-wrap items-center gap-4">
						<button class="btn btn-primary">Primary — paradise</button>
						<button class="btn btn-glass">Secondary — glass</button>
					</div>
					<p class="mt-4 max-w-2xl text-meta text-chalk-muted">
						The water is the call to action. One primary per view; glass carries
						everything secondary so it never competes.
					</p>
				</div>

				<div>
					<p class="label text-chalk-faint">Chips &amp; labels</p>
					<div class="mt-4 flex flex-wrap items-center gap-4">
						<span class="chip label">
							<span class="pulse-dot" aria-hidden="true"></span>
							Day 001 / 5423
						</span>
						<span class="chip label">150 m diameter</span>
						<span class="label text-chalk-muted">Bare label — no chip</span>
					</div>
					<p class="mt-4 max-w-2xl text-meta text-chalk-muted">
						Labels are always mono, uppercase and tracked to 0.16em. The pulsing dot marks
						something happening right now — a day in progress, MAIA writing.
					</p>
				</div>

				<div>
					<p class="label text-chalk-faint">Wordmark</p>
					<div class="mt-4">
						<Wordmark class="text-5xl text-chalk" />
					</div>
					<p class="mt-4 max-w-2xl text-meta text-chalk-muted">
						<code class="font-mono text-chalk">aven</code> light and lowercase,
						<code class="font-mono text-chalk">CITY</code> bold and uppercase. The weight
						jump inside one word is the whole mark.
					</p>
				</div>
			</div>
		</section>
	</div>
</div>
