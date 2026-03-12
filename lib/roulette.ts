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
