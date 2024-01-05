<script lang="ts">
	import type { TextOptions, FontStyle, FontWeight } from '$lib/types'
	import { FONT_WEIGHTS } from '$lib/types'

	export let options: TextOptions | null = null
	export let font: string | null = null
	export let style: FontStyle | null = null
	export let weight: FontWeight | null = null
</script>

<p
	data-svelte-pdf-kit-type="text"
	data-svelte-pdf-kit-options={options && JSON.stringify(options)}
	data-svelte-pdf-kit-font={font}
	data-svelte-pdf-kit-font-style={style}
	data-svelte-pdf-kit-font-weight={weight}
	style="font-family: {font}; font-style: {style}; font-weight: {typeof weight ===
	'string'
		? FONT_WEIGHTS[weight]
		: weight};"
>
	<slot />
</p>
