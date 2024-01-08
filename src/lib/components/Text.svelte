<script lang="ts">
	import type { TextOptions, FontStyle, FontWeight } from '$lib/types'
	import { FONT_WEIGHTS } from '$lib/types'

	// Custom options
	/**
	 * The font to use for text.
	 */
	export let font: string | null = null
	/**
	 * The font style to use for text.
	 */
	export let style: FontStyle | null = null
	/**
	 * The font weight to use for text.
	 */
	export let weight: FontWeight | null = null
	/**
	 * Display this element in this location on every page.
	 */
	export let fixed: TextOptions['fixed'] = undefined

	// PDFKit options
	/**
	 * The alignment of the text.
	 */
	export let align: TextOptions['align'] = undefined
	/**
	 * The baseline of the text.
	 */
	export let baseline: TextOptions['baseline'] = undefined
	/**
	 * The indent of the bullet.
	 */
	export let bulletIndent: TextOptions['bulletIndent'] = undefined
	/**
	 * The radius of the bullet.
	 */
	export let bulletRadius: TextOptions['bulletRadius'] = undefined
	/**
	 * The character spacing of the text.
	 */
	export let characterSpacing: TextOptions['characterSpacing'] = undefined
	/**
	 * The gap between columns.
	 */
	export let columnGap: TextOptions['columnGap'] = undefined
	/**
	 * The number of columns.
	 */
	export let columns: TextOptions['columns'] = undefined
	/**
	 * Whether the text will be followed immediately in the same segment.
	 * Useful for changing text styling in the middle of a paragraph.
	 */
	export let continued: TextOptions['continued'] = undefined
	/**
	 * Create an anchor to a named destination.
	 */
	export let destination: TextOptions['destination'] = undefined
	/**
	 * The OpenType features to apply to the text.
	 */
	export let features: TextOptions['features'] = undefined
	/**
	 * Whether to fill the text.
	 */
	export let fill: TextOptions['fill'] = undefined
	/**
	 * The ellipsis character to use when truncating text.
	 * Set to `true` to use the default ellipsis character.
	 */
	export let ellipsis: TextOptions['ellipsis'] = undefined
	/**
	 * Go to anchor (shortcut for creating annotations)
	 */
	export let goTo: TextOptions['goTo'] = undefined
	/**
	 * The height of the text.
	 */
	export let height: TextOptions['height'] = undefined
	/**
	 * The indent of the text.
	 */
	export let indent: TextOptions['indent'] = undefined
	/**
	 * Whether to wrap text. Set to `false` to disable wrapping on line breaks.
	 */
	export let lineBreak: TextOptions['lineBreak'] = undefined
	/**
	 * The gap between lines.
	 */
	export let lineGap: TextOptions['lineGap'] = undefined
	/**
	 * A URL to link to (shortcut for creating annotations)
	 */
	export let link: TextOptions['link'] = undefined
	/**
	 * The type of list to use.
	 */
	export let listType: TextOptions['listType'] = undefined
	/**
	 * Whether to use an oblique font. Set to `true` or specify an angle in degrees.
	 */
	export let oblique: TextOptions['oblique'] = undefined
	/**
	 * The gap between paragraphs.
	 */
	export let paragraphGap: TextOptions['paragraphGap'] = undefined
	/**
	 * Whether to strike the text.
	 */
	export let strike: TextOptions['strike'] = undefined
	/**
	 * Whether to stroke the text.
	 */
	export let stroke: TextOptions['stroke'] = undefined
	/**
	 * The indent of text in lists.
	 */
	export let textIndent: TextOptions['textIndent'] = undefined
	/**
	 * Whether to underline the text.
	 */
	export let underline: TextOptions['underline'] = undefined
	/**
	 * The width the text should be wrapped to.
	 */
	export let width: TextOptions['width'] = undefined
	/**
	 * The space between words.
	 */
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
		textIndent,
		underline,
		width,
		wordSpacing,
		fixed,
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
