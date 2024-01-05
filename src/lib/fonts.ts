import { DEFAULT_FETCH } from './constants'
import {
	type FontWeight,
	type FontStyle,
	type FontDefinition,
	type PDFResult,
	DEFAULT_FONT_STYLE,
	DEFAULT_FONT_WEIGHT,
	FONT_WEIGHTS,
	type FontWeightNumber,
} from './types'
import { fetchFile } from './utils'

type FontWithBuffer = FontDefinition & { buffer?: ArrayBuffer }

class FontFamily {
	constructor(
		public readonly name: string,
		public readonly fonts: FontWithBuffer[],
	) {}

	private findFont(style: FontStyle, weight: FontWeight): FontWithBuffer | null {
		return (
			this.fonts.find((font) => {
				return font.style === style && font.weight === Fonts.weightToNumber(weight)
			}) ?? null
		)
	}

	public async getFontFile(
		style: FontStyle,
		weight: FontWeight,
		fetch = DEFAULT_FETCH,
	): Promise<PDFResult<Required<FontWithBuffer>>> {
		const font = this.findFont(style, weight)

		if (!font) {
			return {
				data: null,
				error: new Error(`Font not found: ${this.name} ${style} ${weight}`),
			}
		}

		if (!font.buffer) {
			const { data: buf, error: fontFetchError } = await fetchFile(font.src)
			if (fontFetchError) {
				return { data: null, error: fontFetchError }
			}
			font.buffer = buf
		}

		return { data: font as Required<FontWithBuffer>, error: null }
	}

	public registerVariant(style: FontStyle, weight: FontWeight, src: string) {
		const font = this.findFont(style, weight)

		if (font) {
			font.src = src
			return font
		}

		const newFont = { src, style, weight: Fonts.weightToNumber(weight) }
		this.fonts.push(newFont)
		return newFont
	}
}

export class Fonts {
	private readonly families: FontFamily[] = []

	static weightToNumber(weight: FontWeight): FontWeightNumber {
		return typeof weight === 'string' ? FONT_WEIGHTS[weight] : weight
	}

	public registerFont(family: string, fonts: FontDefinition | FontDefinition[]) {
		if (Array.isArray(fonts)) {
			const existingFamily = this.families.find((f) => f.name === family)
			if (existingFamily) {
				fonts.forEach((font) => {
					existingFamily.registerVariant(
						font.style ?? DEFAULT_FONT_STYLE,
						font.weight ?? DEFAULT_FONT_WEIGHT,
						font.src,
					)
				})
				return
			}

			this.families.push(new FontFamily(family, fonts))
			return
		}

		const existingFamily = this.families.find((f) => f.name === family)
		if (existingFamily) {
			existingFamily.registerVariant(
				fonts.style ?? DEFAULT_FONT_STYLE,
				fonts.weight ?? DEFAULT_FONT_WEIGHT,
				fonts.src,
			)
			return
		}

		this.families.push(new FontFamily(family, [fonts]))
	}

	public async getFontFile(
		family: string,
		style: FontStyle | null,
		weight: FontWeight | null,
		fetch = DEFAULT_FETCH,
	): Promise<PDFResult<Required<FontWithBuffer>>> {
		const fontFamily = this.families.find((f) => f.name === family)
		if (!fontFamily) {
			return {
				data: null,
				error: new Error(`Font family not found: ${family}`),
			}
		}

		return await fontFamily.getFontFile(
			style ?? DEFAULT_FONT_STYLE,
			weight ?? DEFAULT_FONT_WEIGHT,
			fetch,
		)
	}

	public getFontName(
		family: string,
		style: FontStyle | null,
		weight: FontWeight | null,
	): string {
		return `${family}-${style ?? DEFAULT_FONT_STYLE}-${Fonts.weightToNumber(
			weight ?? DEFAULT_FONT_WEIGHT,
		)}`
	}
}
