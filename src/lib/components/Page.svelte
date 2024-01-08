<script lang="ts">
	import type { PageOptions, PageSize } from '$lib/types'

	// PDFKit options
	/**
	 * The default font to use for text.
	 */
	export let font: PageOptions['font'] = undefined
	/**
	 * The document layout (landscape, portrait)
	 */
	export let layout: PageOptions['layout'] = undefined
	/**
	 * The document layout (landscape, portrait). Overridden by `layout` if present.
	 */
	export let orientation: PageOptions['layout'] = undefined
	/**
	 * The margin to use for all sides of the document.
	 */
	export let margin: PageOptions['margin'] = undefined
	/**
	 * Margins to use for each side of the document.
	 */
	export let margins: PageOptions['margins'] = undefined
	/**
	 * The default page size.
	 */
	export let size: PageSize | undefined = undefined

	$: options = {
		font,
		layout: layout || orientation,
		margin,
		margins,
		size,
	} satisfies PageOptions
	$: hasOptions = Object.values(options).some((value) => value !== undefined)
</script>

<div
	data-svelte-pdf-kit-type="page"
	data-svelte-pdf-kit-options={hasOptions && JSON.stringify(options)}
>
	<slot />
</div>
