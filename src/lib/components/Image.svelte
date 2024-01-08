<script lang="ts">
	import type { ImageOptions } from '$lib/types'

	// Custom options
	export let src: string
	export let alt: string

	// PDFKit options
	export let align: ImageOptions['align'] = undefined
	export let link: ImageOptions['link'] = undefined
	export let destination: ImageOptions['destination'] = undefined
	export let cover: ImageOptions['cover'] = undefined
	export let fit: ImageOptions['fit'] = undefined
	export let goTo: ImageOptions['goTo'] = undefined
	export let height: ImageOptions['height'] = undefined
	export let scale: ImageOptions['scale'] = undefined
	export let valign: ImageOptions['valign'] = undefined
	export let width: ImageOptions['width'] = undefined

	$: options = {
		align,
		link,
		destination,
		cover,
		fit,
		goTo,
		height,
		scale,
		valign,
		width,
	} satisfies ImageOptions
</script>

<img
	data-svelte-pdf-kit-type="image"
	data-svelte-pdf-kit-options={options && JSON.stringify(options)}
	{src}
	{alt}
	{...options}
/>
