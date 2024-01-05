<script lang="ts">
	import type { ImageOptions } from '$lib/types'

	export let src: string
	export let alt: string
	export let options: ImageOptions | null = null
</script>

<img
	data-svelte-pdf-kit-type="image"
	data-svelte-pdf-kit-options={options && JSON.stringify(options)}
	{src}
	{alt}
	{...options}
/>
