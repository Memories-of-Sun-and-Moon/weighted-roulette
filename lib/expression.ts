import {
  ExprNode,
  ExpressionEvalResult,
  ExpressionParseResult,
} from "../types/roulette"

type Token =
  | { type: "number"; value: number }
  | { type: "identifier"; value: string }
  | { type: "plus" }
  | { type: "minus" }
  | { type: "star" }
  | { type: "lparen" }
  | { type: "rparen" }
  | { type: "comma" }
  | { type: "eof" }

type TokenizeResult =
  | { ok: true; tokens: Token[] }
  | { ok: false; error: string }

function tokenize(input: string): TokenizeResult {
  const tokens: Token[] = []
  let i = 0

  while (i < input.length) {
    const c = input[i]

    if (/\s/.test(c)) {
      i++
      continue
    }

    if (c === "+") {
      tokens.push({ type: "plus" })
      i++
      continue
    }

    if (c === "-") {
      tokens.push({ type: "minus" })
      i++
      continue
    }

    if (c === "*") {
      tokens.push({ type: "star" })
      i++
      continue
    }

    if (c === "(") {
      tokens.push({ type: "lparen" })
      i++
      continue
    }

    if (c === ")") {
      tokens.push({ type: "rparen" })
      i++
      continue
    }

    if (c === ",") {
      tokens.push({ type: "comma" })
      i++
      continue
    }

    if (/[0-9.]/.test(c)) {
      let j = i
      let dotCount = 0

      while (j < input.length && /[0-9.]/.test(input[j])) {
        if (input[j] === ".") dotCount++
        j++
      }

      const raw = input.slice(i, j)

      if (dotCount > 1 || raw === ".") {
        return {
          ok: false,
          error: `数値リテラルが不正です: ${raw}`,
        }
      }

      const value = Number(raw)

      if (!Number.isFinite(value)) {
        return {
          ok: false,
          error: `数値リテラルが不正です: ${raw}`,
        }
      }

      tokens.push({ type: "number", value })
      i = j
      continue
    }

    if (/[a-zA-Z_]/.test(c)) {
      let j = i
      while (j < input.length && /[a-zA-Z_]/.test(input[j])) {
        j++
      }

      const value = input.slice(i, j)
      tokens.push({ type: "identifier", value })
      i = j
      continue
    }

    return {
      ok: false,
      error: `使用できない文字があります: ${c}`,
    }
  }

  tokens.push({ type: "eof" })
  return { ok: true, tokens }
}

class Parser {
  private tokens: Token[]
  private pos: number

  constructor(tokens: Token[]) {
    this.tokens = tokens
    this.pos = 0
  }

  parse(): ExpressionParseResult {
    try {
      const ast = this.parseExpression()

      if (this.peek().type !== "eof") {
        throw new Error("式の末尾に余分な文字があります")
      }

      return { ok: true, ast }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "式の解析に失敗しました",
      }
    }
  }

  private peek(): Token {
    return this.tokens[this.pos]
  }

  private consume(): Token {
    const token = this.tokens[this.pos]
    this.pos++
    return token
  }

  private expect(type: Token["type"], message: string): Token {
    const token = this.peek()
    if (token.type !== type) {
      throw new Error(message)
    }
    return this.consume()
  }

  private parseExpression(): ExprNode {
    return this.parseAdd()
  }

  private parseAdd(): ExprNode {
    let node = this.parseMul()

    while (true) {
      const token = this.peek()

      if (token.type === "plus") {
        this.consume()
        node = {
          type: "binary",
          op: "+",
          left: node,
          right: this.parseMul(),
        }
        continue
      }

      if (token.type === "minus") {
        this.consume()
        node = {
          type: "binary",
          op: "-",
          left: node,
          right: this.parseMul(),
        }
        continue
      }

      break
    }

    return node
  }

  private parseMul(): ExprNode {
    let node = this.parseUnary()

    while (true) {
      const token = this.peek()

      if (token.type === "star") {
        this.consume()
        node = {
          type: "binary",
          op: "*",
          left: node,
          right: this.parseUnary(),
        }
        continue
      }

      break
    }

    return node
  }

  private parseUnary(): ExprNode {
    const token = this.peek()

    if (token.type === "minus") {
      this.consume()
      return {
        type: "unary",
        op: "-",
        expr: this.parseUnary(),
      }
    }

    return this.parsePrimary()
  }

  private parsePrimary(): ExprNode {
    const token = this.peek()

    if (token.type === "number") {
      this.consume()
      return {
        type: "number",
        value: token.value,
      }
    }

    if (token.type === "identifier") {
      this.consume()

      if (token.value === "x") {
        return { type: "variable" }
      }

      if (token.value === "max" || token.value === "min") {
        this.expect("lparen", `${token.value} の後には '(' が必要です`)
        const arg1 = this.parseExpression()
        this.expect("comma", `${token.value} の引数は 2 つ必要です`)
        const arg2 = this.parseExpression()
        this.expect("rparen", `${token.value} の ')' が必要です`)

        return {
          type: "call",
          fn: token.value,
          args: [arg1, arg2],
        }
      }

      throw new Error(`未対応の識別子です: ${token.value}`)
    }

    if (token.type === "lparen") {
      this.consume()
      const expr = this.parseExpression()
      this.expect("rparen", "対応する ')' が必要です")
      return expr
    }

    throw new Error("式として解釈できません")
  }
}

export function parseExpression(input: string): ExpressionParseResult {
  const tokenized = tokenize(input)

  if (!tokenized.ok) {
    return tokenized
  }

  const parser = new Parser(tokenized.tokens)
  return parser.parse()
}

export function evaluateExpression(
  ast: ExprNode,
  x: number
): ExpressionEvalResult {
  try {
    const value = evalNode(ast, x)

    if (!Number.isFinite(value)) {
      return {
        ok: false,
        error: "計算結果が不正です",
      }
    }

    return {
      ok: true,
      value,
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "式の評価に失敗しました",
    }
  }
}

function evalNode(node: ExprNode, x: number): number {
  switch (node.type) {
    case "number":
      return node.value

    case "variable":
      return x

    case "unary": {
      const value = evalNode(node.expr, x)
      if (node.op === "-") return -value
      throw new Error("未対応の単項演算子です")
    }

    case "binary": {
      const left = evalNode(node.left, x)
      const right = evalNode(node.right, x)

      switch (node.op) {
        case "+":
          return left + right
        case "-":
          return left - right
        case "*":
          return left * right
      }

      throw new Error("未対応の二項演算子です")
    }

    case "call": {
      const a = evalNode(node.args[0], x)
      const b = evalNode(node.args[1], x)

      switch (node.fn) {
        case "max":
          return Math.max(a, b)
        case "min":
          return Math.min(a, b)
      }

      throw new Error("未対応の関数です")
    }
  }
}

export function applyWeightExpression(
  expression: string,
  x: number
): ExpressionEvalResult {
  const parsed = parseExpression(expression)

  if (!parsed.ok) {
    return parsed
  }

  const evaluated = evaluateExpression(parsed.ast, x)

  if (!evaluated.ok) {
    return evaluated
  }

  if (evaluated.value < 0) {
    return {
      ok: false,
      error: "重み変換結果が 0 未満になりました",
    }
  }

  return evaluated
}
