export type Styles = {
  thing: string
}

export type StylesheetDefinition = {
  [key: string]: Styles | StylesheetDefinition
}
