<script lang="ts">
	/**
	 * The avenCITY wordmark: one Playfair line — `aven` lowercase, `CITY` in
	 * caps. The case shift inside a single serif word is the whole mark: the
	 * quiet studio and the monument it is building, in one breath.
	 * Inherits its size from the parent so it works at nav and hero scale.
	 */
	let { class: className = '' }: { class?: string } = $props();
</script>

<span class="font-display font-medium leading-none tracking-[-0.01em] {className}">
	<span class="lowercase">aven</span><span class="uppercase">CITY</span>
</span>
