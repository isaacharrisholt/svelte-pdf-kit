import type PDFKit from 'pdfkit'

export type PDFResult<T, E = Error> = {
  data: T
  error: null
} | {
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
export type FontWeightNumber = typeof FONT_WEIGHTS[FontWeightName]
export type FontWeight = FontWeightName | FontWeightNumber

export const DEFAULT_FONT_STYLE: FontStyle = 'normal'
export const DEFAULT_FONT_WEIGHT: FontWeight = 'normal'

export type FontDefinition = {
  src: string,
  style?: FontStyle,
  weight?: FontWeight,
}

// Options
export type TextOptions = NonNullable<Parameters<typeof PDFKit.text>[1]>
export type ImageOptions = NonNullable<Parameters<typeof PDFKit.image>[1]>
export type PageOptions = NonNullable<Parameters<typeof PDFKit.addPage>[0]>

