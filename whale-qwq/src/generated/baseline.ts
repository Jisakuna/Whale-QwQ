/* 由 scripts/gen-baseline.mjs 从 design/baseline-4q.json 生成，请勿手改。
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
export const PALETTE: Record<Suit, Record<'light' | 'dark', Palette>> = {
  "flowers": {
    "light": {
      "ground": "#FFFAF2",
      "panel": "#FFFFFF",
      "panel2": "#FDF2E4",
      "sidebar": "#FDF6EC",
      "ink": "#2C2028",
      "ink2": "#6B5560",
      "ink3": "#9C8792",
      "line": "#EADCE2",
      "line2": "#DBC7D0",
      "brand": "#7B3B5C",
      "brandSoft": "#F3E3EA",
      "gold": "#FFCE65",
      "goldInk": "#6B4A0E",
      "tangerine": "#EE7F2D",
      "crimson": "#A63A4B",
      "petal": "#F0B4C4",
      "whale": "#3F51B5",
      "bubble": "#FFCE65",
      "bubbleInk": "#6B4A0E",
      "texA1": "50%",
      "texA2": "42%"
    },
    "dark": {
      "ground": "#191216",
      "panel": "#221A20",
      "panel2": "#2B2028",
      "sidebar": "#221A20",
      "ink": "#F4E9EE",
      "ink2": "#C3AAB6",
      "ink3": "#937986",
      "line": "#362A31",
      "line2": "#4A3941",
      "brand": "#D68CB0",
      "brandSoft": "#3A2632",
      "gold": "#FFCE65",
      "goldInk": "#2A1D06",
      "tangerine": "#F5A05C",
      "crimson": "#E2717F",
      "petal": "#D98BA3",
      "whale": "#8C9BEA",
      "bubble": "#FFCE65",
      "bubbleInk": "#2A1D06",
      "texA1": "20%",
      "texA2": "15%"
    }
  },
  "library": {
    "light": {
      "ground": "#FAFBFC",
      "panel": "#FFFFFF",
      "panel2": "#F1F3F6",
      "sidebar": "#F1F3F6",
      "ink": "#22252A",
      "ink2": "#5C6470",
      "ink3": "#8B95A3",
      "line": "#E2E6EB",
      "line2": "#CDD3DB",
      "brand": "#3E4E6B",
      "brandSoft": "#E7EBF1",
      "gold": "#D9A63C",
      "goldInk": "#4A360C",
      "tangerine": "#C96A2A",
      "crimson": "#9E4450",
      "petal": "#B9C2D0",
      "whale": "#3F51B5",
      "bubble": "#F1F3F6",
      "bubbleInk": "#22252A",
      "texA1": "62%"
    },
    "dark": {
      "ground": "#15171B",
      "panel": "#1D2026",
      "panel2": "#24282F",
      "sidebar": "#1D2026",
      "ink": "#E7EAEF",
      "ink2": "#A7B1C0",
      "ink3": "#79838F",
      "line": "#2A2E35",
      "line2": "#3A4049",
      "brand": "#8FA6D4",
      "brandSoft": "#232A38",
      "gold": "#E8C070",
      "goldInk": "#241A05",
      "tangerine": "#DE8850",
      "crimson": "#D4737F",
      "petal": "#6E7A8C",
      "whale": "#8C9BEA",
      "bubble": "#24282F",
      "bubbleInk": "#E7EAEF",
      "texA1": "62%"
    }
  }
}

/** 语义色 → 真实 --dsw-* token 的映射（44 条）。 */
export const TOKEN_MAP: Record<string, string> = {
  "--dsw-alias-bg-base": "ground",
  "--dsw-alias-bg-layer-1": "panel",
  "--dsw-alias-bg-layer-2": "panel2",
  "--dsw-alias-bg-layer-3": "panel",
  "--dsw-alias-bg-overlay": "panel",
  "--dsw-alias-bg-module-platform": "panel2",
  "--dsw-specific-sidebar-fill": "sidebar",
  "--dsw-specific-menu": "panel",
  "--dsw-specific-input-major": "panel",
  "--dsw-specific-login-input": "panel",
  "--dsw-specific-bubble": "bubble",
  "--dsw-specific-bubble-highlight": "gold",
  "--dsw-specific-selector": "panel2",
  "--dsw-specific-tip": "panel2",
  "--dsw-specific-sidebar-nav-item-active": "brandSoft",
  "--dsw-specific-sidebar-nav-item-active-accent": "gold",
  "--dsw-specific-sidebar-nav-item-hover": "panel2",
  "--dsw-alias-button-elevated-fill": "panel",
  "--dsw-alias-button-floating-fill": "panel",
  "--dsw-alias-button-floating-hover": "panel2",
  "--dsw-alias-button-contrast-fill": "ink",
  "--dsw-alias-label-primary": "ink",
  "--dsw-alias-label-secondary": "ink2",
  "--dsw-alias-label-tertiary": "ink3",
  "--dsw-alias-label-caption": "ink3",
  "--dsw-alias-label-dimmed": "ink3",
  "--dsw-alias-label-primary-bluish": "brand",
  "--dsw-alias-border-l1": "line",
  "--dsw-alias-border-l2": "line2",
  "--dsw-alias-border-l3": "line2",
  "--dsw-alias-brand-primary": "brand",
  "--dsw-alias-brand-text": "brand",
  "--dsw-alias-button-primary-fill": "tangerine",
  "--dsw-alias-button-primary-hover": "tangerine",
  "--dsw-alias-button-info-fill": "brandSoft",
  "--dsw-alias-state-error-primary": "crimson",
  "--dsw-alias-state-warn-primary": "gold",
  "--dsw-alias-state-warn-label": "goldInk",
  "--dsw-alias-state-business-primary": "whale",
  "--dsw-alias-markdown-code-block": "panel2",
  "--dsw-alias-markdown-inline-code": "panel2",
  "--dsw-alias-markdown-code-block-banner": "panel2",
  "--dsh-scrollbar-thumb": "tangerine",
  "--dsh-scrollbar-thumb-hover": "brand"
}

/** 中性色阶：兜住未列举组件。只在 body{} 定义一次，覆盖一次明暗双向生效。 */
export const RAMP = {
  "prefix": "--dsw-static-neutral-bluish-",
  "steps": [
    "00",
    "50",
    "60",
    "75",
    "100",
    "150",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "750",
    "800",
    "850",
    "875",
    "900",
    "950",
    "1000"
  ],
  "flowers": [
    "#FFFFFF",
    "#FBF9FA",
    "#FBF9FA",
    "#F5F1F2",
    "#F2EBEE",
    "#F2E9EC",
    "#EEE1E6",
    "#D6CFD1",
    "#BBAAB0",
    "#AB929B",
    "#997482",
    "#745862",
    "#4E3F44",
    "#3C3135",
    "#31292C",
    "#262123",
    "#1D1A1B",
    "#171516",
    "#150F11"
  ],
  "library": [
    "#FFFFFF",
    "#F9FAFB",
    "#F9FAFB",
    "#F1F3F5",
    "#EBEEF2",
    "#E9EDF2",
    "#E1E7EE",
    "#CFD2D6",
    "#ADB2B8",
    "#979EA6",
    "#80868D",
    "#61666B",
    "#43464A",
    "#353638",
    "#2C2D2E",
    "#232324",
    "#1B1B1C",
    "#151617",
    "#0F1215"
  ]
} as const

/** 底纹参数：Flowers 点阵（衣料樱花印花）/ Library 方格纸（裙面制图线）。 */
export const TEXTURE = {
  "flowers": {
    "type": "点阵 · 对应衣料樱花印花",
    "tile": "34px 34px, 34px 34px",
    "layers": [
      {
        "at": "22% 28%",
        "color": "petal",
        "alpha": "texA1",
        "r": "1.5px",
        "edge": "1.7px"
      },
      {
        "at": "70% 74%",
        "color": "gold",
        "alpha": "texA2",
        "r": "1.1px",
        "edge": "1.3px"
      }
    ]
  },
  "library": {
    "type": "方格纸网格 · 对应裙面制图线",
    "tile": "22px 22px, 22px 22px",
    "layers": [
      {
        "dir": "to right",
        "color": "line2",
        "alpha": "texA1",
        "w": "1px"
      },
      {
        "dir": "to bottom",
        "color": "line2",
        "alpha": "texA1",
        "w": "1px"
      }
    ]
  }
} as const

/**
 * 语法配色：shiki.css 是独立表，不引用任何 alias，色阶覆盖对它无效，
 * 必须两套直写。constant/link 两套同值（客观事实不随衣装变）。
 */
export const SHIKI: Record<Suit, Record<'light' | 'dark', Record<string, string>>> = {
  "flowers": {
    "light": {
      "keyword": "#7B3B5C",
      "string": "#4A7C3F",
      "constant": "#3F51B5",
      "function": "#A63A4B",
      "parameter": "#C4611F",
      "comment": "#9C8792",
      "punctuation": "#6B5560",
      "string-expression": "#3F6B35",
      "link": "#3F51B5"
    },
    "dark": {
      "keyword": "#D68CB0",
      "string": "#8FCB7A",
      "constant": "#8C9BEA",
      "function": "#E2717F",
      "parameter": "#F5A05C",
      "comment": "#937986",
      "punctuation": "#C3AAB6",
      "string-expression": "#A3D98F",
      "link": "#8C9BEA"
    }
  },
  "library": {
    "light": {
      "keyword": "#3E4E6B",
      "string": "#3F7A46",
      "constant": "#3F51B5",
      "function": "#9E4450",
      "parameter": "#B25A22",
      "comment": "#8B95A3",
      "punctuation": "#5C6470",
      "string-expression": "#356B3C",
      "link": "#3F51B5"
    },
    "dark": {
      "keyword": "#8FA6D4",
      "string": "#7FC98C",
      "constant": "#8C9BEA",
      "function": "#D4737F",
      "parameter": "#DE8850",
      "comment": "#79838F",
      "punctuation": "#A7B1C0",
      "string-expression": "#93D69E",
      "link": "#8C9BEA"
    }
  }
}

/** 上下文计量的橘子成熟度色阶：相邻档线性插值；叶恒绿、蒂恒褐。 */
export const RIPENESS = {
  "stops": [
    [
      0,
      "#2E6B3A"
    ],
    [
      25,
      "#6FA84B"
    ],
    [
      50,
      "#D8CF5C"
    ],
    [
      72,
      "#F2B12E"
    ],
    [
      90,
      "#E4571F"
    ],
    [
      100,
      "#C43C10"
    ]
  ],
  "leaf": "#4A7C3F",
  "stem": "#6B4A2A"
} as const

/** 实测几何锚点（参照视口 1520×960）。 */
export const GEOMETRY = {
  "portrait": {
    "asset": "New Chat - {Suit}.png",
    "canvas": [
      1086,
      1448
    ],
    "aspect": 1.3333333,
    "eyeAnchor": {
      "$comment": "金瞳在各自画幅中的归一化坐标（PIL 实测）。两套衣装的脸在画幅里位置不同，靠这两组值把眼点锚到同一处；不做per-suit锚定则换装时头会跳 56×7 px。",
      "flowers": [
        0.359,
        0.189
      ],
      "library": [
        0.462,
        0.199
      ]
    },
    "width": 540,
    "eyeRight": 168,
    "eyeY": "运行时量取标题文字中线 —— hero 区垂直居中，随视口高度浮动，不可写死",
    "mask": "linear-gradient(to bottom, #000 0%, #000 70%, transparent 96%)",
    "rimLight": {
      "light": "drop-shadow(0 0 1px rgba(70,80,100,.30)) drop-shadow(0 2px 10px rgba(70,80,100,.13))",
      "dark": "drop-shadow(0 0 1px rgba(255,255,255,.16)) drop-shadow(0 0 22px rgba(0,0,0,.5))",
      "why": "Library 的白开衫贴近白底会糊；深色下需压住底噪。"
    },
    "verified": {
      "eyeDelta": "0px",
      "portraitBottom": "959 / 视口 960"
    }
  },
  "whaleMusume": {
    "asset": "Kanban in Lay - Deepseek Whale Musume.png",
    "canvas": [
      1254,
      1254
    ],
    "restLine": 0.842,
    "clawLine": 0.9,
    "anchor": 0.878,
    "width": 184,
    "anchorFormula": "爪尖落点 = 标题字顶 + 宽度 × (0.90 − anchor)；anchor 必须小于 0.90 才产生压入",
    "alignTo": "「小鲸鱼 + 标题」合并跨度的水平中心（预览版徽章不计入）",
    "contactShadow": {
      "light": "drop-shadow(0 5px 4px rgba(56,42,52,.20))",
      "dark": "drop-shadow(0 5px 5px rgba(0,0,0,.48))",
      "why": "零遮挡会读成悬浮；4px 压入是唯一的深度线索，再多就啃到汉字顶横。"
    },
    "verified": {
      "clawOverlap": "4px（字高的 11%）",
      "restToTitleTop": "7px",
      "centerOffset": "1px"
    }
  },
  "brandLockup": {
    "asset": "App Logo - {Suit}.png",
    "canvas": [
      1774,
      887
    ],
    "renderHeight": "46px",
    "align": "按原始画布对齐，绝不 trim —— 两图内容包围盒不等高（825 / 887），trim 后脸会错开 7%；按画布对齐则脸线差 0.9%，不可见。",
    "svgSurgery": {
      "$comment": "原生 SVG viewBox 0 0 182 24 的构成，由 getBBox 实测。",
      "whaleGlyph": "x 0.1–23.3（单条 path，隐藏）",
      "deepseek": "x 27–122，逐字母：d27 e39 e51 p63 s75 e87 e99 k111+115",
      "harnessPlate": "x 129–181（<rect> 徽章底板）",
      "harnessLetters": "x 132.8–178.4（七个字母）",
      "shift": [
        -33.8,
        -20
      ],
      "why": "H 从 132.8 移到 99（\"ek\" 的 e）对齐；此时末尾 SS 探出 k 右缘约 23px。对齐 s 时 SS 反而收在 k 以内，视觉不平衡。"
    },
    "verified": {
      "ekAlign": "H 与 e 同在 x=186",
      "ssOverhang": "23px",
      "badgeRight": "235 < 侧栏 280"
    }
  }
} as const
