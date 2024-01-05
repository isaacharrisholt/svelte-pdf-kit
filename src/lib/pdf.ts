import type { SvelteComponent } from "svelte";
import DOMParser from 'dom-parser'
import PDFDocument from 'pdfkit'
import fs from 'fs'
import type { FontDefinition, FontStyle, FontWeight, PDFResult, PageOptions, TextOptions } from "./types";
import he from 'he'
import { DEFAULT_FETCH } from "./constants";
import { fetchFile } from "./utils";
import { Fonts } from "./fonts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class PDF<TProps extends Record<string, any>> {
  private fonts: Fonts = new Fonts()
  private numPages = 0

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
        error: new Error('No data found')
      }
    }
    await fs.promises.writeFile(path, data)
    return { data: path, error: null }
  }

  public async toBuffer(): Promise<PDFResult<Buffer>> {
    return await this.generatePdfKitSource()
  }

  private async generatePdfKitSource(): Promise<PDFResult<Buffer>> {
    const html = (this.component as unknown as { render: (props: TProps) => { html: string } }).render(this.props).html

    const dom = DOMParser.parseFromString(html)

    const documents = dom.getElementsByAttribute('data-svelte-pdf-kit-type', 'document');

    if (documents.length === 0) {
      return {
        data: null,
        error: new Error('No document found')
      }
    }

    if (documents.length > 1) {
      return {
        data: null,
        error: new Error('Multiple documents found')
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
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    if (!buf) {
      return {
        data: null,
        error: new Error('Failed to generate PDF')
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

  private parseJsonFromHtml<T>(html: string | null | undefined): PDFResult<T | undefined> {
    if (!html) {
      return {
        data: undefined,
        error: null
      }
    }
    const parsed = he.decode(html)
    try {
      return {
        data: JSON.parse(parsed) as T,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: new Error(`Failed to parse JSON: ${parsed}`)
      }
    }
  }

  private async handleNode(node: DOMParser.Node, pdf: typeof PDFDocument): Promise<PDFResult<null>> {
    const nodeType = node.getAttribute('data-svelte-pdf-kit-type')
    if (this.numPages === 0 && !['document', 'page', 'font'].includes(nodeType)) {
      pdf.addPage()
      this.numPages += 1
    }
    switch (nodeType) {
      case 'document':
        // No need to handle this node
        break
      case 'page':
        return this.handlePage(node, pdf)
      case 'text':
        return await this.handleText(node, pdf)
      case 'image':
        return await this.handleImage(node, pdf)
      case 'font':
        return await this.handleFont(node)
      default:
        return {
          data: null,
          error: new Error(`Unknown node type: ${nodeType}`)
        }
    }
    return { data: null, error: null }
  }

  private async handlePage(node: DOMParser.Node, pdf: typeof PDFDocument): Promise<PDFResult<null>> {
    const options = node.getAttribute('data-svelte-pdf-kit-options')
    const { data: parsedOptions, error } = this.parseJsonFromHtml<PageOptions>(options)
    if (error) {
      return { data: null, error }
    }

    pdf.addPage(parsedOptions)
    this.numPages += 1

    return { data: null, error: null }
  }

  private async handleText(node: DOMParser.Node, pdf: typeof PDFDocument): Promise<PDFResult<null>> {
    const options = node.getAttribute('data-svelte-pdf-kit-options')
    const { data: parsedOptions, error } = this.parseJsonFromHtml<TextOptions>(options)
    if (error) {
      return { data: null, error }
    }

    const fontFamily = node.getAttribute('data-svelte-pdf-kit-font')
    const fontStyle = node.getAttribute('data-svelte-pdf-kit-font-style') as FontStyle | null
    const fontWeight = node.getAttribute('data-svelte-pdf-kit-font-weight') as FontWeight | null

    const fontName = this.fonts.getFontName(fontFamily, fontStyle, fontWeight)

    if (fontFamily) {
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
          error: new Error(`No font found: ${fontFamily} ${fontStyle} ${fontWeight}`)
        }
      }
      pdf.registerFont(fontName, fontData.buffer)
      pdf.font(fontName)
    }

    pdf.text(node.textContent, parsedOptions)
    return { data: null, error: null }
  }

  private async handleImage(node: DOMParser.Node, pdf: typeof PDFDocument): Promise<PDFResult<null>> {
    const options = node.getAttribute('data-svelte-pdf-kit-options')
    // TODO: type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: parsedOptions, error: optionParseError } = this.parseJsonFromHtml<any>(options)
    if (optionParseError) {
      return { data: null, error: optionParseError }
    }

    const src = node.getAttribute('src')
    if (!src) {
      return {
        data: null,
        error: new Error('No src attribute found on image')
      }
    }

    const { data: buffer, error: imageFetchError } = await fetchFile(src, this.fetch)
    if (imageFetchError) {
      return { data: null, error: imageFetchError }
    }

    pdf.image(buffer, parsedOptions)
    return { data: null, error: null }
  }

  private async handleFont(node: DOMParser.Node): Promise<PDFResult<null>> {
    const family = node.getAttribute('data-svelte-pdf-kit-font-family')
    if (!family) {
      return {
        data: null,
        error: new Error('No family attribute found on font')
      }
    }

    const fonts = node.getAttribute('data-svelte-pdf-kit-fonts')
    if (!fonts) {
      return {
        data: null,
        error: new Error('No fonts found on Font node')
      }
    }

    const { data: fontDefinitions, error: fontDefinitionParseError } = this.parseJsonFromHtml<FontDefinition[]>(fonts)
    if (fontDefinitionParseError) {
      return { data: null, error: fontDefinitionParseError }
    }
    if (!fontDefinitions) {
      return {
        data: null,
        error: new Error('No font definitions found on Font node')
      }
    }

    this.fonts.registerFont(family, fontDefinitions)

    return { data: null, error: null }
  }
}
