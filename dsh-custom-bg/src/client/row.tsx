/**
 * 「自定义背景」设置行 —— 附加行（不同于 Joi 的遮蔽行）：
 * 同 slot settings.general.item、独立 id、默认 priority，排在 General 区
 * 的「外观/换装」行之后。卸载后此行随插件一起消失。
 *
 * 界面：标题 + 副题（当前外观模式）→ 预览 + 三个操作（导入图片 / 启用 /
 * 清除）→ 不透明度滑杆。
 *
 * 排版数值照抄 Joi 主题的换装行（即 ui-theme AppearanceRow 的原生规范）：
 * group / title / desc 逐值对齐，避免夹在原生行中间一眼看出是外来的。
 */
import { useRef } from 'react'
import type { PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { createBgStore } from './store.ts'

/** 注入的业务面。 */
export interface BgRowInjected {
  /** 切换启用状态。 */
  onToggle: (on: boolean) => void
  /** 调节不透明度 0–100。 */
  onOpacity: (value: number) => void
  /** 用户选了图片文件（尚未处理完成）。 */
  onFile: (file: File) => void
  /** 清除当前模式的背景图并关闭。 */
  onClear: () => void
}

/** 完整 props：store 份额 + 注入面。 */
export type BgRowProps = PropsStore<ReturnType<typeof createBgStore>> & BgRowInjected

/** 原生行规范（与 Joi 换装行同源）。 */
const NATIVE = {
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '16px 0',
    borderBottom: '1px solid var(--dsw-alias-border-l2)',
  },
  title: { fontSize: 14, fontWeight: 400, lineHeight: '22px', color: 'var(--dsw-alias-label-primary)' },
  desc: { fontSize: 12, fontWeight: 400, lineHeight: '18px', color: 'var(--dsw-alias-label-tertiary)' },
  row: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  button: {
    font: 'inherit',
    fontSize: 13,
    lineHeight: '20px',
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid var(--dsw-alias-border-l2)',
    background: 'var(--dsw-alias-bg-layer-1)',
    color: 'var(--dsw-alias-label-primary)',
    cursor: 'pointer',
  },
  slider: { flex: '1 1 160px', minWidth: 120, accentColor: 'var(--dsw-alias-brand-primary)' },
} as const

/**
 * 渲染「自定义背景」行。
 * @param props - 合成后的 slot props。
 * @returns 行的元素树。
 */
export function BgRow({ useStore, onToggle, onOpacity, onFile, onClear }: BgRowProps) {
  const mode = useStore((s) => s.mode)
  const enabled = useStore((s) => s.enabled)
  const opacity = useStore((s) => s.opacity)
  const hasImage = useStore((s) => s.hasImage)
  const importing = useStore((s) => s.importing)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const modeLabel = mode === 'light' ? '浅色' : '深色'

  return (
    <div style={NATIVE.group}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={NATIVE.title}>自定义背景</div>
        <div style={NATIVE.desc}>
          为对话界面导入一张背景图，可调节不透明度；当前编辑「{modeLabel}」模式，明暗两态分别记忆
        </div>
      </div>

      <div style={NATIVE.row}>
        <button
          type="button"
          style={NATIVE.button}
          disabled={importing}
          onClick={() => { fileRef.current?.click() }}
        >
          {importing ? '处理中…' : '导入图片'}
        </button>
        <button type="button" style={NATIVE.button} disabled={!hasImage} onClick={onClear}>
          清除
        </button>
        <label style={{ ...NATIVE.desc, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => { onToggle(e.target.checked) }}
          />
          启用
        </label>
        {hasImage && (
          <span style={{ ...NATIVE.desc, display: 'flex', alignItems: 'center', gap: 6 }}>
            ✓ 已导入
          </span>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f !== undefined) onFile(f)
            e.target.value = ''
          }}
        />
      </div>

      <div style={NATIVE.row}>
        <div style={{ ...NATIVE.desc, width: 64 }}>不透明度</div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={opacity}
          style={NATIVE.slider}
          onChange={(e) => { onOpacity(Number(e.target.value)) }}
        />
        <div style={{ ...NATIVE.desc, width: 36, textAlign: 'right' }}>{opacity}%</div>
      </div>
    </div>
  )
}
