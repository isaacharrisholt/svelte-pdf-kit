<script lang="ts">
	import type { FontDefinition, FontStyle, FontWeight } from '$lib/types'
	import { DEFAULT_FONT_STYLE, DEFAULT_FONT_WEIGHT, FONT_WEIGHTS } from '$lib/types'

	/**
	 * The source of the font. Will check the filesystem first, then the web.
	 * Specify an array of objects to support multiple weights and styles.
	 */
	export let src: string | FontDefinition[]
	/**
	 * The name of the font family.
	 */
	export let family: string
	/**
	 * The font style to use for text.
	 * Defaults to `normal`.
	 * Ignored if `src` is an array.
	 */
	export let style: FontStyle = DEFAULT_FONT_STYLE
	/**
	 * The font weight to use for text.
	 * Defaults to `400`.
	 * Ignored if `src` is an array.
	 */
	export let weight: FontWeight = DEFAULT_FONT_WEIGHT

	const fonts: FontDefinition[] = Array.isArray(src) ? src : [{ src, style, weight }]

	const styleTagContent = fonts.map((font) => {
		const { style, weight } = font
		const fontStyle = style || DEFAULT_FONT_STYLE
		const fontWeight =
			typeof weight === 'string' ? FONT_WEIGHTS[weight] : weight || DEFAULT_FONT_WEIGHT
		return `
@font-face {
	font-family: ${family};
	src: url(${font.src});
	font-style: ${fontStyle};
	font-weight: ${fontWeight};
}
		`
	})
</script>

<div
	data-svelte-pdf-kit-type="font"
	data-svelte-pdf-kit-fonts={JSON.stringify(fonts)}
	data-svelte-pdf-kit-font-family={family}
	hidden
	aria-hidden="true"
/>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html `<style>
	${styleTagContent.join('\n')}
</style>`}
