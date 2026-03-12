export type RouletteItem = {
  id: number
  name: string
  weight: number
}

export type CsvParseResult =
  | { ok: true; items: RouletteItem[] }
  | { ok: false; error: string }
