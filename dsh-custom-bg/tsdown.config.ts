/**
 * 构建配置：一次 tsdown 产出两个面。
 *   · 宿主半边 lib/index.js —— 普通 ESM，Loader 直接 import。
 *   · 浏览器半边 lib/client.js —— 闭包工厂产物，由 window.__ModuleLoader__ 装载。
 *
 * 壳的三段（banner/intro/footer）与 harness 自带 packages/client/tsdown.client.ts
 * 的产物逐字节同形：模块表用注入的 require 解析外部依赖，表里没有的 require
 * 一定在运行时抛错，所以规则是「表内外部化，其余全部内联」。
 */
import type { UserConfig } from 'tsdown'

/** dsh 浏览器模块表里的平台模块（与 packages/client/web/src/platform.ts 对齐）。 */
const PLATFORM_MODULES = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-runtime/client',
]

const ID = 'dsh-custom-bg'

const host: UserConfig = {
  entry: ['src/index.ts'],
  outDir: 'lib',
  format: 'esm',
  platform: 'neutral',
  dts: false,
  clean: false,
  outputOptions: { entryFileNames: 'index.js' },
}

const client: UserConfig = {
  entry: ['src/client/index.tsx'],
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  dts: false,
  sourcemap: true,
  clean: false,
  external: [...PLATFORM_MODULES],
  noExternal: (id: string) => (PLATFORM_MODULES.includes(id) ? undefined : true),
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {`,
    intro: 'var module = { exports: {} }; var exports = module.exports;',
    footer: 'return module.exports; } });',
  },
}

export default [host, client]
