export type RouletteItem = {
  id: number
  name: string
  weight: number
}

export type CsvParseResult =
  | { ok: true; items: RouletteItem[] }
  | { ok: false; error: string }

export type ExprNode =
  | { type: "number"; value: number }
  | { type: "variable" }
  | { type: "binary"; op: "+" | "-" | "*"; left: ExprNode; right: ExprNode }
  | { type: "unary"; op: "-"; expr: ExprNode }
  | { type: "call"; fn: "max" | "min"; args: [ExprNode, ExprNode] }

export type ExpressionParseResult =
  | { ok: true; ast: ExprNode }
  | { ok: false; error: string }

export type ExpressionEvalResult =
  | { ok: true; value: number }
  | { ok: false; error: string }
