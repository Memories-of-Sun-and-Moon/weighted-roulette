export type WeightedEntry<T> = {
  item: T
  weight: number
}

export type PickWeightedResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

export function pickWeighted<T>(
  entries: WeightedEntry<T>[]
): PickWeightedResult<T> {
  if (entries.length === 0) {
    return {
      ok: false,
      error: "候補がありません",
    }
  }

  let totalWeight = 0

  for (const entry of entries) {
    if (!Number.isFinite(entry.weight)) {
      return {
        ok: false,
        error: "重みに不正な値があります",
      }
    }

    if (entry.weight < 0) {
      return {
        ok: false,
        error: "重みが負の候補があります",
      }
    }

    totalWeight += entry.weight
  }

  if (totalWeight <= 0) {
    return {
      ok: false,
      error: "重みの合計が 0 以下です",
    }
  }

  const r = Math.random() * totalWeight

  let acc = 0
  for (const entry of entries) {
    acc += entry.weight
    if (r < acc) {
      return {
        ok: true,
        value: entry.item,
      }
    }
  }

  return {
    ok: true,
    value: entries[entries.length - 1].item,
  }
}

export type RouletteSegment<T> = {
  item: T
  weight: number
  startAngle: number
  endAngle: number
  centerAngle: number
}

export function buildRouletteSegments<T>(
  entries: WeightedEntry<T>[]
): RouletteSegment<T>[] {
  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0)

  if (totalWeight <= 0) {
    return []
  }

  let currentAngle = 0

  return entries.map((entry) => {
    const angle = (entry.weight / totalWeight) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    const centerAngle = (startAngle + endAngle) / 2

    currentAngle = endAngle

    return {
      item: entry.item,
      weight: entry.weight,
      startAngle,
      endAngle,
      centerAngle,
    }
  })
}
