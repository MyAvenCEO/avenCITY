<script lang="ts">
	import cityDome from '$lib/assets/images/maia-city-dome.jpg';
	import { mission, recap, links } from '$lib/brand';
	import Wordmark from './Wordmark.svelte';

	const day = String(mission.day).padStart(3, '0');
</script>

<!--
	The hero is the design system's argument in one screen: a living photograph
	of the city, with everything we say floating on glass above it.

	Two rules keep it honest, and both were learned the hard way:

	1. THE CARD MUST NOT EAT THE CITY. The pane is capped at max-w-xl and sits in
	   the left column so the dome stays visible in its own right. A glass panel
	   that covers the photograph is just a dark box — the identity dies.
	2. THE SCRIM IS DIAGONAL, NOT FLAT. Heaviest bottom-left under the copy,
	   clearing to almost nothing top-right over the dome. That buys white-text
	   contrast where the words are without dimming the subject.
-->
<section class="relative isolate flex min-h-svh flex-col overflow-hidden">
	<img
		src={cityDome}
		alt="Maia City — a geodesic glass dome set in jungle above a turquoise paradise"
		class="absolute inset-0 -z-20 h-full w-full transform-gpu object-cover object-[38%_center]"
		fetchpriority="high"
	/>
	<div
		class="absolute inset-0 -z-10 bg-gradient-to-tr from-deep/80 via-deep/25 to-transparent"
	></div>
	<div class="absolute inset-0 -z-10 bg-gradient-to-t from-deep/60 to-transparent"></div>
	<!-- Targeted bands, not a heavier global scrim. The nav and the sponsor line
	     are the only text without a glass pane behind them, and the diagonal
	     above clears to nothing exactly where the nav sits (top right, over
	     bright sky). These two strips buy those bands their contrast back while
	     leaving the middle of the render untouched. -->
	<div
		class="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-deep/55 to-transparent"
	></div>

	<!-- Nav -->
	<header class="relative flex items-center justify-between gap-4 px-6 py-6 md:px-12">
		<Wordmark class="text-2xl text-chalk" />
		<nav class="flex items-center gap-3">
			<!-- Hidden on phones: at 375px the wordmark, this link and the day chip
			     fight for the same row and the link wraps to two lines. -->
			<a
				href="/style"
				class="label hidden text-chalk-muted transition-colors hover:text-paradise-bright sm:inline"
			>
				Design system
			</a>
			<div class="chip label">
				<span class="pulse-dot" aria-hidden="true"></span>
				Day {day} / {mission.totalDays}
			</div>
		</nav>
	</header>

	<!-- The glass lens -->
	<div class="relative flex flex-1 items-center px-6 py-10 md:px-12">
		<div class="glass-lens w-full max-w-xl p-8 md:p-10">
			<p class="label text-paradise-bright">The 5423-day challenge</p>

			<!-- Weight alternation is the house display rhythm: light lines carry
			     the sentence, the bold line carries the claim. -->
			<h1 class="mt-5 text-hero text-chalk">
				<span class="block font-light">A city built by</span>
				<span class="block font-bold">1 million founders</span>
				<span class="block font-light">in {mission.years} years.</span>
			</h1>

			<!-- The recap stanza: verbatim, every time. The zero-background on-ramp. -->
			<div class="mt-7 border-l-2 border-paradise/70 pl-5 font-light text-chalk-muted">
				{#each recap as line}
					<p class="text-lead">{line}</p>
				{/each}
				<p class="mt-3 font-medium text-paradise-bright">
					I am avenMAIA, and this is day {mission.day} of {mission.totalDays}.
				</p>
			</div>

			<div class="mt-8 flex flex-wrap items-center gap-3">
				<a href="#story" class="btn btn-primary">Read day {day}</a>
				<a href={links.sponsor} class="btn btn-glass">Get your Aven Founder</a>
			</div>
		</div>
	</div>

	<footer class="relative px-6 pb-8 md:px-12">
		<p class="label text-chalk-faint">
			This journey is sponsored by avenCEO — get your own Aven Founder now →
			<a href={links.sponsor} class="text-paradise-bright hover:text-paradise">aven.ceo/maia</a>
		</p>
	</footer>
</section>
