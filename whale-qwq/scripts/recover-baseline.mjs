/**
 * 从已构建的 lib/client.js 里取回 0.1.9 内联的基线模块
 * （design/baseline-4q.json 未随仓库发布，src/generated/baseline.ts 因此缺失），
 * 重新生成与其来源脚本同形的 src/generated/baseline.ts。
 */
import { readFileSync, writeFileSync } from 'node:fs'

const file = process.argv[2]
const out = process.argv[3]
const text = readFileSync(file, 'utf8')
const start = text.indexOf('//#region src/generated/baseline.ts')
const end = text.indexOf('//#endregion', start)
if (start < 0 || end < 0) throw new Error('baseline region not found')
const region = text.slice(start, end)

const names = ['PALETTE', 'TOKEN_MAP', 'RAMP', 'TEXTURE', 'SHIKI', 'RIPENESS', 'GEOMETRY']
const values = new Function(`${region}; return { ${names.join(', ')} }`)()
for (const name of names) {
  if (values[name] === undefined) throw new Error(`missing ${name}`)
}

const j = (v) => JSON.stringify(v, null, 2)
const body = `/* 由 scripts/gen-baseline.mjs 从 design/baseline-4q.json 生成，请勿手改。
 *
 * 注（0.2.x 适配）：design/baseline-4q.json 没有随仓库发布，上一版产物只以
 * 内联常量的形式存在于 0.1.9 的 lib/client.js 里。为了能在干净的 clone 上重建
 * 浏览器半边，这份文件由 scripts/recover-baseline.mjs 从该产物中原样取回；
 * 数值与 0.1.9 运行时逐项一致，没有重新设计。
 */

/** 一套衣装在一种明暗下的语义色板。 */
export type Palette = Record<string, string>

/** 衣装标识。两套互斥，不得混用（设计法条）。 */
export type Suit = 'flowers' | 'library'

/** 四象限语义色板：衣装 × 明暗。 */
export const PALETTE: Record<Suit, Record<'light' | 'dark', Palette>> = ${j(values.PALETTE)}

/** 语义色 → 真实 --dsw-* token 的映射（${Object.keys(values.TOKEN_MAP).length} 条）。 */
export const TOKEN_MAP: Record<string, string> = ${j(values.TOKEN_MAP)}

/** 中性色阶：兜住未列举组件。只在 body{} 定义一次，覆盖一次明暗双向生效。 */
export const RAMP = ${j(values.RAMP)} as const

/** 底纹参数：Flowers 点阵（衣料樱花印花）/ Library 方格纸（裙面制图线）。 */
export const TEXTURE = ${j(values.TEXTURE)} as const

/**
 * 语法配色：shiki.css 是独立表，不引用任何 alias，色阶覆盖对它无效，
 * 必须两套直写。constant/link 两套同值（客观事实不随衣装变）。
 */
export const SHIKI: Record<Suit, Record<'light' | 'dark', Record<string, string>>> = ${j(values.SHIKI)}

/** 上下文计量的橘子成熟度色阶：相邻档线性插值；叶恒绿、蒂恒褐。 */
export const RIPENESS = ${j(values.RIPENESS)} as const

/** 实测几何锚点（参照视口 1520×960）。 */
export const GEOMETRY = ${j(values.GEOMETRY)} as const
`
writeFileSync(out, body, 'utf8')
console.log(`wrote ${out} (${body.length} bytes)`)
