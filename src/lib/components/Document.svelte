<script lang="ts">
	import { onMount } from 'svelte'

	export let style: object

	export let cleanup = false

	onMount(() => {
		if (!cleanup) {
			return
		}

		// Remove data-svelte-pdf-kit attributes
		removeLibAttrs(thisEl)
		;[...thisEl.querySelectorAll('[data-svelte-pdf-kit-type]')].forEach((el) =>
			removeLibAttrs(el),
		)
	})

	function removeLibAttrs(el: Element) {
		;[...el.attributes].forEach((attr) => {
			if (attr.name.startsWith('data-svelte-pdf-kit')) {
				el.removeAttribute(attr.name)
			}
		})
	}

	let thisEl: HTMLDivElement
</script>

<div
	bind:this={thisEl}
	data-svelte-pdf-kit-type="document"
	data-svelte-pdf-kit-style={JSON.stringify(style)}
	style="font-family: Helvetica, sans-serif;"
>
	<slot />
</div>
