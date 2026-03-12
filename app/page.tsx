"use client"

import { useMemo, useState } from "react"
import { parseCsv } from "../lib/csv"
import { RouletteItem } from "../types/roulette"

type RouletteMode = "instant" | "animated"

type PreviewItem = {
  id: number
  name: string
  weight: string
}

const SAMPLE_CSV = `A, 10
B, 20
C, 15`

export default function Page() {
  const [csvText, setCsvText] = useState(SAMPLE_CSV)
  const [expression, setExpression] = useState("x")
  const [mode, setMode] = useState<RouletteMode>("instant")
  const [result, setResult] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [fileError, setFileError] = useState("")

  const parsed = useMemo(() => {
    return parseCsv(csvText)
  }, [csvText])

  const handleCsvFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileError("")

    try {
      const text = await file.text()
      setCsvText(text)
      setResult("")
    } catch {
      setFileError("CSVファイルの読み込みに失敗しました")
    } finally {
      e.target.value = ""
    }
  }


  // TODO: 抽選関数の実装
  const handlePick = () => {
    if (!parsed.ok) return
    setError("")

    if (parsed.items.length === 0) {
      setResult("")
      setError("候補がありません")
      return
    }

    setResult(parsed.items[0]?.name ?? "")
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">重み付きルーレット</h1>
          <p className="mt-2 text-sm text-slate-600">
            重み付きのルーレットです
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          {/* 左カラム: 入力 */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">入力</h2>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">
                CSV形式のテキスト
              </label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="h-64 w-full rounded-xl border border-slate-300 p-3 font-mono text-sm outline-none transition focus:border-slate-500"
                placeholder={"[名前], [重み]\nA, 10\nB, 20"}
              />
              <p className="mt-2 text-xs text-slate-500">
                1行につき「[名前], [重み]」の形式で入力します。
              </p>
              <p className="mt-2 text-xs text-slate-500">
                [名前] にカンマ "," を含めたい場合は、ダブルクオーテーション "" で囲んでください。例: "Osaka, Japan", 5
              </p>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">
                CSVファイル
              </label>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvFileChange}
                className="block w-full text-sm"
              />
              <p className="mt-2 text-xs text-slate-500">
                あるいは上記の形式の CSV ファイルを選択することで入力できます。
              </p>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium">
                重み変換式
              </label>
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-sm outline-none transition focus:border-slate-500"
                placeholder="x"
              />
              <p className="mt-2 text-xs text-slate-500">
                各種重みに対して、一律で変換を行うことが出来ます。
                </p>
              <p className="mt-2 text-xs text-slate-500">
                例: x / x*2 / max(0, 100-x*0.2)
              </p>
            </div>

            <div className="mb-6">
              <span className="mb-2 block text-sm font-medium">抽選モード</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setMode("instant")}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    mode === "instant"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  瞬時に結果表示
                </button>

                <button
                  type="button"
                  onClick={() => setMode("animated")}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    mode === "animated"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  アニメーション付きで結果表示
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePick}
              className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              抽選
            </button>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </section>

          {/* 右カラム: プレビューと結果 */}
          <div className="grid gap-6">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">候補プレビュー</h2>
              
              {!parsed.ok && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {parsed.error}
                </div>
              )}
              
              {parsed.ok && parsed.items.length === 0 ? (
                <p className="text-sm text-slate-500">候補がありません</p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold">
                          名前
                        </th>
                        <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold">
                          重み
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.ok && parsed.items.map((item) => (
                        <tr key={item.id} className="odd:bg-white even:bg-slate-50/50">
                          <td className="border-b border-slate-100 px-4 py-3">
                            {item.name || (
                              <span className="text-slate-400">(空)</span>
                            )}
                          </td>
                          <td className="border-b border-slate-100 px-4 py-3 font-mono">
                            {item.weight || (
                              <span className="text-slate-400">(空)</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">現在の設定</h2>
              <dl className="grid gap-3 text-sm">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">変換式</dt>
                  <dd className="font-mono">{expression}</dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">抽選モード</dt>
                  <dd>{mode === "instant" ? "瞬時表示" : "アニメーション表示"}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-slate-500">候補数</dt>
                  <dd>{parsed.ok ? parsed.items.length : -1}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">抽選結果</h2>

              <div className="flex min-h-32 items-center justify-center rounded-2xl bg-slate-100 p-6">
                {result ? (
                  <div className="text-center">
                    <p className="mb-2 text-sm text-slate-500">選ばれた項目</p>
                    <p className="text-3xl font-bold">{result}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    まだ抽選していません。
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
