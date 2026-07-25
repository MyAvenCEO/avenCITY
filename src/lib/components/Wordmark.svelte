<script lang="ts">
	/**
	 * The avenCITY wordmark: `aven` light + lowercase, `CITY` bold + uppercase.
	 * The weight jump inside one word is the whole mark — it reads as the
	 * quiet company and the loud thing it is building, in one breath.
	 * Inherits its size from the parent so it works at nav scale and hero scale.
	 */
	let { class: className = '' }: { class?: string } = $props();
</script>

<span class="font-display leading-none tracking-[-0.04em] {className}">
	<span class="font-light lowercase">aven</span><span class="font-bold uppercase">CITY</span>
</span>
