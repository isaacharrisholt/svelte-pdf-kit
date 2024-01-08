import type PDFDocument from 'pdfkit'

export type PDFResult<T, E = Error> =
	| {
			data: T
			error: null
	  }
	| {
			data: null
			error: E
	  }

// Fonts
export type FontStyle = 'normal' | 'italic' | 'oblique'
export const FONT_WEIGHTS = {
	thin: 100,
	extralight: 200,
	ultralight: 200,
	light: 300,
	normal: 400,
	medium: 500,
	semibold: 600,
	demibold: 600,
	bold: 700,
	extrabold: 800,
	ultrabold: 800,
	black: 900,
} as const
export type FontWeightName = keyof typeof FONT_WEIGHTS
export type FontWeightNumber = (typeof FONT_WEIGHTS)[FontWeightName]
export type FontWeight = FontWeightName | FontWeightNumber

export const DEFAULT_FONT_STYLE: FontStyle = 'normal'
export const DEFAULT_FONT_WEIGHT: FontWeight = 'normal'

export type FontDefinition = {
	src: string
	style?: FontStyle
	weight?: FontWeight
}

// Options
export type DocumentOptions = NonNullable<ConstructorParameters<typeof PDFDocument>[0]>
export type TextOptions = NonNullable<Parameters<typeof PDFDocument.text>[1]> & {
	fixed?: boolean
}
export type ImageOptions = NonNullable<Parameters<typeof PDFDocument.image>[1]> & {
	fixed?: boolean
}
export type PageOptions = Pick<
	DocumentOptions,
	'layout' | 'margin' | 'font' | 'margin' | 'margins'
> & {
	size?: PageSize
}

// Page sizes
type PredefinedPageSize =
	| 'A0'
	| 'A1'
	| 'A2'
	| 'A3'
	| 'A4'
	| 'A5'
	| 'A6'
	| 'A7'
	| 'A8'
	| 'A9'
	| 'A10'
	| 'B0'
	| 'B1'
	| 'B2'
	| 'B3'
	| 'B4'
	| 'B5'
	| 'B6'
	| 'B7'
	| 'B8'
	| 'B9'
	| 'B10'
	| 'C0'
	| 'C1'
	| 'C2'
	| 'C3'
	| 'C4'
	| 'C5'
	| 'C6'
	| 'C7'
	| 'C8'
	| 'C9'
	| 'C10'
	| 'RA0'
	| 'RA1'
	| 'RA2'
	| 'RA3'
	| 'RA4'
	| 'SRA0'
	| 'SRA1'
	| 'SRA2'
	| 'SRA3'
	| 'SRA4'
	| 'EXECUTIVE'
	| 'FOLIO'
	| 'LEGAL'
	| 'LETTER'
	| 'TABLOID'
	| '4A0'
	| '2A0'

export type PageSize = PredefinedPageSize | [number, number]
