<script lang="ts">
	import { onMount } from 'svelte'
	import type { DocumentOptions, PageSize } from '$lib/types'

	// Custom options
	export let debug = false

	// PDFKit options
	/**
	 * Whether to automatically create a new page. This is enabled by default.
	 */
	export let autoFirstPage: DocumentOptions['autoFirstPage'] = true
	/**
	 * Whether to buffer the output page.
	 */
	export let bufferPages: DocumentOptions['bufferPages'] = undefined
	/**
	 * Whether to compress the PDF output.
	 */
	export let compress: DocumentOptions['compress'] = undefined
	/**
	 * Whether to display the title of the document in the title bar of the PDF reader.
	 */
	export let displayTitle: DocumentOptions['displayTitle'] = undefined
	/**
	 * The default font to use for text.
	 */
	export let font: DocumentOptions['font'] = undefined
	/**
	 * The document language.
	 */
	export let lang: DocumentOptions['lang'] = undefined
	/**
	 * The document language. Overridden by `lang` if present.
	 */
	export let language: DocumentOptions['lang'] = undefined
	/**
	 * The document layout (landscape, portrait)
	 */
	export let layout: DocumentOptions['layout'] = undefined
	/**
	 * The document layout (landscape, portrait). Overridden by `layout` if present.
	 */
	export let orientation: DocumentOptions['layout'] = undefined
	/**
	 * The margin to use for all sides of the document.
	 */
	export let margin: DocumentOptions['margin'] = undefined
	/**
	 * Margins to use for each side of the document.
	 */
	export let margins: DocumentOptions['margins'] = undefined
	/**
	 * The owner password for the document.
	 */
	export let ownerPassword: DocumentOptions['ownerPassword'] = undefined
	/**
	 * The PDF version to use.
	 */
	export let pdfVersion: DocumentOptions['pdfVersion'] = undefined
	/**
	 * The permissions for the document.
	 */
	export let permissions: DocumentOptions['permissions'] = undefined
	/**
	 * The default page size.
	 */
	export let size: PageSize | undefined = undefined
	/**
	 * Whether to subset fonts.
	 */
	export let subset: DocumentOptions['subset'] = undefined
	/**
	 * Whether to create a tagged PDF.
	 */
	export let tagged: DocumentOptions['tagged'] = undefined
	/**
	 * The user password for the document.
	 */
	export let userPassword: DocumentOptions['userPassword'] = undefined

	// PDFKit info
	/**
	 * The document author.
	 */
	export let author: NonNullable<DocumentOptions['info']>['Author'] = undefined
	/**
	 * The document creator.
	 */
	export let creator: NonNullable<DocumentOptions['info']>['Creator'] = undefined
	/**
	 * The document keywords.
	 */
	export let keywords: NonNullable<DocumentOptions['info']>['Keywords'] = undefined
	/**
	 * The document producer.
	 */
	export let producer: NonNullable<DocumentOptions['info']>['Producer'] = undefined
	/**
	 * The document subject.
	 */
	export let subject: NonNullable<DocumentOptions['info']>['Subject'] = undefined
	/**
	 * The document title.
	 */
	export let title: NonNullable<DocumentOptions['info']>['Title'] = undefined
	/**
	 * The document creation date.
	 */
	export let creationDate: NonNullable<DocumentOptions['info']>['CreationDate'] =
		undefined
	/**
	 * The document modification date.
	 */
	export let modDate: NonNullable<DocumentOptions['info']>['ModDate'] = undefined

	$: info = {
		Title: title,
		Keywords: keywords,
		Author: author,
		Creator: creator,
		Producer: producer,
		Subject: subject,
		CreationDate: creationDate,
		ModDate: modDate,
	} satisfies DocumentOptions['info']

	$: options = {
		autoFirstPage,
		bufferPages,
		compress,
		displayTitle,
		font,
		info,
		lang: lang || language,
		layout: layout || orientation,
		margin,
		margins,
		ownerPassword,
		pdfVersion,
		permissions,
		size,
		subset,
		tagged,
		userPassword,
	} satisfies DocumentOptions
	$: hasOptions = Object.values(options).some((value) => value !== undefined)

	onMount(() => {
		if (!debug) {
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
	data-svelte-pdf-kit-options={hasOptions && JSON.stringify(options)}
	style="font-family: Helvetica, sans-serif;"
>
	<slot />
</div>
