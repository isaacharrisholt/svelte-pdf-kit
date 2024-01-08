<script lang="ts">
	import type { ImageOptions } from '$lib/types'

	// Custom options
	/**
	 * The source of the image. Will check the filesystem first, then the web.
	 */
	export let src: string
	/**
	 * The alternative text for the image.
	 */
	export let alt: string
	/**
	 * Display this element in this location on every page.
	 */
	// TODO: get fixed images working
	// export let fixed: ImageOptions['fixed'] = undefined

	// PDFKit options
	/**
	 * The alignment of the image horizontally.
	 */
	export let align: ImageOptions['align'] = undefined
	/**
	 * A URL to link this image to.
	 */
	export let link: ImageOptions['link'] = undefined
	/**
	 * A named destination to link this image to.
	 */
	export let destination: ImageOptions['destination'] = undefined
	/**
	 * Image is scaled to cover the rectangle provided.
	 */
	export let cover: ImageOptions['cover'] = undefined
	/**
	 * Image is scaled to fit the rectangle provided.
	 */
	export let fit: ImageOptions['fit'] = undefined
	/**
	 * A named destination to link this image to.
	 */
	export let goTo: ImageOptions['goTo'] = undefined
	/**
	 * The height of the image.
	 */
	export let height: ImageOptions['height'] = undefined
	/**
	 * A factor by which to scale the image.
	 */
	export let scale: ImageOptions['scale'] = undefined
	/**
	 * The alignment of the image vertically.
	 */
	export let valign: ImageOptions['valign'] = undefined
	/**
	 * The width of the image.
	 */
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
		// fixed,
	} satisfies ImageOptions
	$: hasOptions = Object.values(options).some((value) => value !== undefined)
</script>

<img
	data-svelte-pdf-kit-type="image"
	data-svelte-pdf-kit-options={hasOptions && JSON.stringify(options)}
	{src}
	{alt}
	{...options}
/>
