import type { SvelteComponent } from 'svelte'
import DOMParser from 'dom-parser'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import type {
	FontDefinition,
	FontStyle,
	FontWeight,
	ImageOptions,
	PDFResult,
	PageOptions,
	TextOptions,
} from './types'
import he from 'he'
import { DEFAULT_FETCH } from './constants'
import { fetchFile } from './utils'
import { Fonts } from './fonts'

type FixedElement = {
	beforePos: { x: number; y: number },
	afterPos: { x: number; y: number },
} & ({
	type: 'text',
	text: string,
	fontFamily: string | null,
	fontStyle: FontStyle | null,
	fontWeight: FontWeight | null,
	options?: TextOptions,
} | {
	type: 'image',
	src: string,
	options?: ImageOptions,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class PDF<TProps extends Record<string, any>> {
	private fonts: Fonts = new Fonts()
	private numPages = 0
	private fixedElements: FixedElement[] = []
	private cache: Record<string, ArrayBuffer> = {}

	constructor(
		private component: typeof SvelteComponent<TProps>,
		private props: TProps,
		private fetch = DEFAULT_FETCH,
	) { }

	public async toFile(path: string): Promise<PDFResult<string>> {
		const { data, error } = await this.generatePdfKitSource()
		if (error) {
			return { data: null, error }
		}
		if (!data) {
			return {
				data: null,
				error: new Error('No data found'),
			}
		}
		await fs.promises.writeFile(path, data)
		return { data: path, error: null }
	}

	public async toBuffer(): Promise<PDFResult<Buffer>> {
		return await this.generatePdfKitSource()
	}

	private async generatePdfKitSource(): Promise<PDFResult<Buffer>> {
		const html = (
			this.component as unknown as { render: (props: TProps) => { html: string } }
		).render(this.props).html

		const dom = DOMParser.parseFromString(html)

		const documents = dom.getElementsByAttribute('data-svelte-pdf-kit-type', 'document')

		if (documents.length === 0) {
			return {
				data: null,
				error: new Error('No document found'),
			}
		}

		if (documents.length > 1) {
			return {
				data: null,
				error: new Error('Multiple documents found'),
			}
		}

		const document = documents[0]

		const pdf = new PDFDocument({ autoFirstPage: false })
		const buffers: Uint8Array[] = []

		let buf: Buffer | null = null
		pdf.on('data', buffers.push.bind(buffers))
		pdf.on('end', () => {
			const buffer = Buffer.concat(buffers)
			buf = buffer
		})

		for (const node of this.walkTree(document)) {
			const { error } = await this.handleNode(node, pdf)
			if (error) {
				return { data: null, error }
			}
		}

		pdf.end()

		if (!buf) {
			await new Promise((resolve) => setTimeout(resolve, 100))
		}

		if (!buf) {
			return {
				data: null,
				error: new Error('Failed to generate PDF'),
			}
		}

		return { data: buf, error: null }
	}

	private *walkTree(node: DOMParser.Node): Generator<DOMParser.Node> {
		if (node.getAttribute('data-svelte-pdf-kit-type')) {
			yield node
		}
		if (node.childNodes.length) {
			for (const child of node.childNodes) {
				yield* this.walkTree(child)
			}
		}
	}

	private fetchFile(src: string): Promise<PDFResult<ArrayBuffer>> {
		if (this.cache[src]) {
			return Promise.resolve({ data: this.cache[src], error: null })
		}
		return fetchFile(src, this.fetch)
	}

	private parseJsonFromHtml<T>(
		html: string | null | undefined,
	): PDFResult<T | undefined> {
		if (!html) {
			return {
				data: undefined,
				error: null,
			}
		}
		const parsed = he.decode(html)
		try {
			return {
				data: JSON.parse(parsed) as T,
				error: null,
			}
		} catch (error) {
			return {
				data: null,
				error: new Error(`Failed to parse JSON: ${parsed}`),
			}
		}
	}

	private getNodeOptions<TOptions>(
		node: DOMParser.Node,
	): PDFResult<TOptions | undefined> {
		const options = node.getAttribute('data-svelte-pdf-kit-options')
		return this.parseJsonFromHtml<TOptions>(options)
	}

	private addFixedElement(element: FixedElement): void {
		this.fixedElements.push(element)
		this.fixedElements.sort((a, b) => {
			// Sort by afterPos y, then x
			if (a.afterPos.y < b.afterPos.y) {
				return -1
			}
			if (a.afterPos.y > b.afterPos.y) {
				return 1
			}
			if (a.afterPos.x < b.afterPos.x) {
				return -1
			}
			if (a.afterPos.x > b.afterPos.x) {
				return 1
			}
			return 0
		})
		console.log('Registering element', element)
	}

	private placeFixedElements(pdf: typeof PDFDocument): void {
		console.log('Adding fixed elements', { fixedElements: this.fixedElements.length })
		this.fixedElements.forEach((element) => {
			console.log(element)
			console.log('Moving to', element.beforePos.x, element.beforePos.y)
			pdf.x = element.beforePos.x
			pdf.y = element.beforePos.y
			console.log({ x: pdf.x, y: pdf.y })
			switch (element.type) {
				case 'text':
					this.handleText(pdf, element.text, element.fontFamily, element.fontStyle, element.fontWeight, { ...element.options, fixed: false })
					break
				case 'image':
					this.handleImage(pdf, element.src, { ...element.options, fixed: false })
					break
			}
		})
		// Move to beginning of first element
		if (this.fixedElements.length) {
			pdf.moveTo(this.fixedElements[0].beforePos.x, this.fixedElements[0].beforePos.y)
		}
	}

	private async handleNode(
		node: DOMParser.Node,
		pdf: typeof PDFDocument,
	): Promise<PDFResult<null>> {
		const nodeType = node.getAttribute('data-svelte-pdf-kit-type')
		if (this.numPages === 0 && !['document', 'page', 'font'].includes(nodeType)) {
			pdf.addPage()
			this.numPages += 1
		}

		if (nodeType === 'document') {
			return { data: null, error: null }

		} else if (nodeType === 'page') {
			const { data: options, error: optionsError } = this.getNodeOptions<PageOptions>(node)
			if (optionsError) {
				return { data: null, error: optionsError }
			}
			return await this.handlePage(pdf, options)

		} else if (nodeType === 'text') {
			const { data: options, error: optionsError } = this.getNodeOptions<TextOptions>(node)
			if (optionsError) {
				return { data: null, error: optionsError }
			}
			const fontFamily = node.getAttribute('data-svelte-pdf-kit-font-family')
			const fontStyle = node.getAttribute('data-svelte-pdf-kit-font-style') as FontStyle | null
			const fontWeight = node.getAttribute('data-svelte-pdf-kit-font-weight') as FontWeight | null
			return await this.handleText(pdf, node.textContent || '', fontFamily, fontStyle, fontWeight, options)

		} else if (nodeType === 'image') {
			const src = node.getAttribute('src')
			const { data: options, error: optionsError } = this.getNodeOptions<ImageOptions>(node)
			if (optionsError) {
				return { data: null, error: optionsError }
			}
			return await this.handleImage(pdf, src || '', options)

		} else if (nodeType === 'font') {
			const fontFamily = node.getAttribute('data-svelte-pdf-kit-font-family')
			if (!fontFamily) {
				return {
					data: null,
					error: new Error('No family attribute found on font'),
				}
			}
			const fontDefinitions = node.getAttribute('data-svelte-pdf-kit-fonts')
			if (!fontDefinitions) {
				return {
					data: null,
					error: new Error('No font definitions found on Font node'),
				}
			}
			const { data: fonts, error: fontsError } = this.parseJsonFromHtml<FontDefinition[]>(fontDefinitions)
			if (fontsError) {
				return { data: null, error: fontsError }
			}
			return await this.handleFont(fontFamily, fonts || [])
		}

		return { data: null, error: new Error(`Unknown node type: ${nodeType}`) }
	}

	private async handlePage(
		pdf: typeof PDFDocument,
		options?: PageOptions,
	): Promise<PDFResult<null>> {
		pdf.addPage(options)
		this.placeFixedElements(pdf)
		this.numPages += 1
		console.log('Added page')

		return { data: null, error: null }
	}

	private async handleText(
		pdf: typeof PDFDocument,
		rawText: string,
		fontFamily: string | null,
		fontStyle: FontStyle | null,
		fontWeight: FontWeight | null,
		options?: TextOptions,
	): Promise<PDFResult<null>> {
		if (fontFamily) {
			const fontName = this.fonts.getFontName(fontFamily, fontStyle, fontWeight)
			const { data: fontData, error: fontFetchError } = await this.fonts.getFontFile(
				fontFamily,
				fontStyle,
				fontWeight,
				this.fetch,
			)
			if (fontFetchError) {
				return { data: null, error: fontFetchError }
			}
			if (!fontData) {
				return {
					data: null,
					error: new Error(`No font found: ${fontFamily} ${fontStyle} ${fontWeight}`),
				}
			}
			pdf.registerFont(fontName, fontData.buffer)
			pdf.font(fontName)
		}

		const text = he.decode(rawText)

		const fixedText: FixedElement = {
			type: 'text',
			text,
			fontFamily,
			fontStyle,
			fontWeight,
			beforePos: { x: pdf.x || 0, y: pdf.y || 0 },
			afterPos: { x: 0, y: 0 },
			options,
		}

		pdf.text(text, options)

		if (options?.fixed) {
			fixedText.afterPos.x = pdf.x || 0
			fixedText.afterPos.y = pdf.y || 0
			this.addFixedElement(fixedText)
		}

		return { data: null, error: null }
	}

	// TODO: Get fixed images working
	private async handleImage(
		pdf: typeof PDFDocument,
		src: string,
		options?: ImageOptions,
	): Promise<PDFResult<null>> {
		if (!src) {
			return {
				data: null,
				error: new Error('No src attribute found on image'),
			}
		}

		const { data: buffer, error: imageFetchError } = await this.fetchFile(src)
		if (imageFetchError) {
			return { data: null, error: imageFetchError }
		}

		const fixedImage: FixedElement = {
			type: 'image',
			src,
			beforePos: { x: pdf.x || 0, y: pdf.y || 0 },
			afterPos: { x: 0, y: 0 },
			options,
		}

		pdf.image(Buffer.from(buffer), options)

		if (options?.fixed) {
			fixedImage.afterPos.x = pdf.x || 0
			fixedImage.afterPos.y = pdf.y || 0
			this.addFixedElement(fixedImage)
		}

		return { data: null, error: null }
	}

	private async handleFont(fontFamily: string, fonts: FontDefinition[]): Promise<PDFResult<null>> {
		if (!fontFamily) {
			return {
				data: null,
				error: new Error('No family attribute found on font'),
			}
		}

		if (!fonts) {
			return {
				data: null,
				error: new Error('No fonts found on Font node'),
			}
		}

		if (!fonts || !fonts.length) {
			return {
				data: null,
				error: new Error('No font definitions found on Font node'),
			}
		}

		this.fonts.registerFont(fontFamily, fonts)

		return { data: null, error: null }
	}
}
