<script lang="ts">
	import type { TextOptions, FontStyle, FontWeight } from '$lib/types'
	import { FONT_WEIGHTS } from '$lib/types'

	// Custom options
	export let font: string | null = null
	export let style: FontStyle | null = null
	export let weight: FontWeight | null = null

	// PDFKit options
	export let align: TextOptions['align'] = undefined
	export let baseline: TextOptions['baseline'] = undefined
	export let bulletIndent: TextOptions['bulletIndent'] = undefined
	export let bulletRadius: TextOptions['bulletRadius'] = undefined
	export let characterSpacing: TextOptions['characterSpacing'] = undefined
	export let columnGap: TextOptions['columnGap'] = undefined
	export let columns: TextOptions['columns'] = undefined
	export let continued: TextOptions['continued'] = undefined
	export let destination: TextOptions['destination'] = undefined
	export let features: TextOptions['features'] = undefined
	export let fill: TextOptions['fill'] = undefined
	export let ellipsis: TextOptions['ellipsis'] = undefined
	export let goTo: TextOptions['goTo'] = undefined
	export let height: TextOptions['height'] = undefined
	export let indent: TextOptions['indent'] = undefined
	export let lineBreak: TextOptions['lineBreak'] = undefined
	export let lineGap: TextOptions['lineGap'] = undefined
	export let link: TextOptions['link'] = undefined
	export let listType: TextOptions['listType'] = undefined
	export let oblique: TextOptions['oblique'] = undefined
	export let paragraphGap: TextOptions['paragraphGap'] = undefined
	export let strike: TextOptions['strike'] = undefined
	export let stroke: TextOptions['stroke'] = undefined
	export let structParent: TextOptions['structParent'] = undefined
	export let structType: TextOptions['structType'] = undefined
	export let structTypes: TextOptions['structTypes'] = undefined
	export let textIndent: TextOptions['textIndent'] = undefined
	export let underline: TextOptions['underline'] = undefined
	export let width: TextOptions['width'] = undefined
	export let wordSpacing: TextOptions['wordSpacing'] = undefined

	$: options = {
		align,
		baseline,
		bulletIndent,
		bulletRadius,
		characterSpacing,
		columnGap,
		columns,
		continued,
		destination,
		features,
		fill,
		ellipsis,
		goTo,
		height,
		indent,
		lineBreak,
		lineGap,
		link,
		listType,
		oblique,
		paragraphGap,
		strike,
		stroke,
		structParent,
		structType,
		structTypes,
		textIndent,
		underline,
		width,
		wordSpacing,
	} satisfies TextOptions
	$: hasOptions = Object.values(options).some((value) => value !== undefined)
</script>

<p
	data-svelte-pdf-kit-type="text"
	data-svelte-pdf-kit-options={hasOptions && JSON.stringify(options)}
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
