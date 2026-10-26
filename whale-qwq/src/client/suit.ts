/**
 * 衣装状态：当前是哪一套、怎么换、怎么记住。
 *
 * 三条约束决定了这里的形状：
 *   · 互斥。两套衣装各是一层 overrideTokens，切换必须「先卸后挂」。
 *     叠加层是按 seq 后来居上逐 token 合并的，两层并存不会得到后一套，
 *     只会得到「后一套盖住了前一套里同名的部分」——也就是混色。
 *   · 明暗不归我们。body[data-ds-dark-theme] 是 ui-layout presenter 的私产，
 *     外部写会被它改回去。衣装只管色相，明暗永远由 app 的外观设置驱动。
 *   · 偏好要能存。ui-theme 的偏好白名单只认 light/dark/system，
 *     自定义 id 存不进去，所以走本插件自有的设置段。
 */
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client'
import { DEFAULT_SKIN, DEFAULT_SUIT, SUIT_FIELD, isSkin, type JoiSettings, type Skin, type Suit } from '../contract.ts'
import { tokensFor, type TokenOverrides } from './tokens.ts'

/** 挂载/卸载一层 token 覆盖的最小面，便于测试替身。 */
export interface TokenLayerHost {
  /**
   * 挂一层覆盖。
   * @param source - 层标识（同名后挂会替换前一层）。
   * @param tokens - 覆盖表。
   * @returns 卸载该层的 disposer。
   */
  overrideTokens(source: string, tokens: TokenOverrides): () => void
}

/** 覆盖层标识。两套衣装共用同一个 source，保证任意时刻至多一层。 */
const LAYER = 'whale-qwq'

/**
 * 本地兜底存放键。键名沿用 0.1.x，升级后用户原来的选择不会丢。
 *
 * 为什么还要兜底：0.2.x 的 `SettingsForms` 只投影 schema 里标了 `.volatile()`
 * 的字段，且要等 Loader 把那行挂起来之后 `describe` 才有内容；在那之前
 * 浏览器拿到的快照是 `unavailable`。另外设置文档本身也可能不可写（远端浏览器、
 * 只读 profile）。localStorage 同样满足「过刷新与重启仍在」，代价是它绑在
 * 浏览器 origin 上，不进 $DSH_HOME，换浏览器或换机器不跟随——这条限制照实
 * 记在 README 的已知限制里。
 */
const LOCAL_KEY = 'whale-qwq.suit'

/** 衣装变化的订阅者。 */
export type SuitListener = (skin: Skin) => void

/**
 * 衣装运行时：持有当前衣装、唯一的 token 层，以及偏好读写。
 */
export class SuitRuntime {
  private current: Skin = DEFAULT_SKIN
  private detach: (() => void) | undefined
  private readonly listeners = new Set<SuitListener>()
  /** 用户是否已明确选过。未选过就不写盘——首装不该在设置文档里留痕。 */
  private chosen = false
  /** 关掉主题前那套衣装。再打开时回到它，而不是粗暴地回到默认。 */
  private lastSuit: Suit = DEFAULT_SUIT

  private readonly host: TokenLayerHost
  /**
   * 本插件 Loader 行的配置表单（0.2.x 的官方持久化通道）。
   * 由 `ctx.configForms.get(entryId)` 提供；设置服务缺席时为 undefined。
   */
  private readonly form: ConfigForm<JoiSettings> | undefined

  /**
   * @param host - token 覆盖宿主（生产环境是 ctx.theme）。
   * @param form - 本插件设置行的表单句柄；不可用时退化为进程内偏好。
   */
  constructor(host: TokenLayerHost, form: ConfigForm<JoiSettings> | undefined) {
    this.host = host
    this.form = form
  }

  /** @returns 当前皮肤（含 native）。 */
  get skin(): Skin {
    return this.current
  }

  /**
   * @returns 装饰层该用哪套衣装的素材。原生态下没有"当前衣装"可言，
   *          返回默认套只是给素材一个基准——原生态下装饰层本就不出图。
   */
  get suit(): Suit {
    return this.current === 'native' ? DEFAULT_SUIT : this.current
  }

  /** @returns 是否处于原生态（不着色、不装饰）。 */
  get isNative(): boolean {
    return this.current === 'native'
  }

  /**
   * 总开关。关 = 切到原生；开 = 回到关掉前那套衣装。
   * @param on - 是否让主题生效。
   */
  setEnabled(on: boolean): void {
    this.setSuit(on ? this.lastSuit : 'native')
  }

  /**
   * @returns 持久化通道的实况。`unavailable` / `loading` 表示这台机器上
   *          衣装偏好只在进程内有效——这是降级而不是故障，但必须能看见，
   *          否则「选了却没记住」会被当成随机 bug 反复排查。
   */
  get persistence(): { channel: string, hostStatus: string, hostUser: unknown, stored: unknown } {
    const snapshot = this.form?.getSnapshot()
    return {
      // 实际生效的通道：host = 官方设置文档；local = localStorage 兜底。
      channel: snapshot?.status === 'ready' ? 'host' : 'local',
      hostStatus: snapshot?.status ?? 'unbound',
      // 用户层里那格的实际取值（undefined = 没覆盖过，走默认或兜底）。
      hostUser: this.readHost(),
      stored: this.read(),
    }
  }

  /**
   * 读设置文档里的衣装偏好。
   *
   * 只认**用户层**（`snapshot.user`），不认解析后的 `value`：后者带 schema
   * 默认值 `flowers`，若拿它当「用户选过」的证据，0.1.x 时代靠 localStorage
   * 记住的 `library` 会在升级后第一次加载时被默认值顶掉。`user` 里有这个键
   * 才说明用户真的在设置文档里选过。
   * @returns 存着的衣装，没有则 undefined。
   */
  private readHost(): Skin | undefined {
    const user = this.form?.getSnapshot().user
    if (typeof user !== 'object' || user === null) return undefined
    const stored = (user as Record<string, unknown>)[SUIT_FIELD]
    return isSkin(stored) ? stored : undefined
  }

  /**
   * 读回持久偏好：官方通道优先，其次本地兜底。
   * @returns 存着的衣装，没有则 undefined。
   */
  private read(): Skin | undefined {
    const fromHost = this.readHost()
    if (fromHost !== undefined) return fromHost
    try {
      const local = globalThis.localStorage?.getItem(LOCAL_KEY)
      if (isSkin(local)) return local
    } catch {
      // 隐私模式 / 禁用存储：读不到就当没存过，不是错误。
    }
    return undefined
  }

  /**
   * 写入持久偏好。两条通道都尝试：官方通道若可用就走它，
   * 本地兜底无论如何都写——设置文档能不能写不该改变用户看到的行为。
   * @param suit - 要记住的衣装。
   */
  private write(suit: Skin): void {
    // 写失败不回滚界面：用户已经看见换装生效了，把它撤回去更费解。
    // 设置层自己有重试与回读恢复，这里只需要不让 rejection 逃逸。
    if (this.form?.getSnapshot().status === 'ready') {
      void this.form.set(SUIT_FIELD, suit).catch(() => {})
    }
    try {
      globalThis.localStorage?.setItem(LOCAL_KEY, suit)
    } catch {
      // 写不进去就只在本进程有效，与内置行在 memory 模式下的降级同义。
    }
  }

  /**
   * 读回持久偏好并挂上对应衣装。设置不可用时用默认衣装，
   * 这与内置外观行在 memory 模式下的降级语义一致。
   */
  start(): void {
    const stored = this.read()
    if (stored !== undefined) {
      this.current = stored
      this.chosen = true
      if (stored !== 'native') this.lastSuit = stored
    }
    this.mount()
  }

  /**
   * 采纳设置文档里的用户层改动（多窗口、Host 侧写入都走这里）。
   *
   * 只处理用户层：`value` 在首次 describe 时就已经带默认值，
   * 用它回灌会把 localStorage 里的选择顶掉，见 {@link readHost}。
   */
  adoptHost(): void {
    const stored = this.readHost()
    if (stored !== undefined && stored !== this.current) this.setSuit(stored, false)
  }

  /**
   * 换一套衣装。同一套重复调用是空操作（不重挂、不写盘、不通知）。
   * @param suit - 目标衣装。
   * @param persist - 是否写回设置文档；来自设置文档的回读要传 false。
   */
  setSuit(suit: Skin, persist = true): void {
    if (suit === this.current && (this.chosen || !persist)) return
    if (this.current !== 'native') this.lastSuit = this.current
    this.current = suit
    // 先卸后挂：同 source 的 overrideTokens 本身就会替换旧层，
    // 但显式卸载让「任意时刻至多一层」在代码里看得见，而不是靠实现细节兜着。
    this.mount()
    if (persist) {
      this.chosen = true
      this.write(suit)
    }
    for (const listener of this.listeners) listener(suit)
  }

  /**
   * 订阅衣装变化。
   * @param listener - 变化后调用。
   * @returns 取消订阅的 disposer。
   */
  subscribe(listener: SuitListener): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /** 卸载 token 层并清空订阅。disposer 幂等（HMR 下会被重复调用）。 */
  dispose(): void {
    this.detach?.()
    this.detach = undefined
    this.listeners.clear()
  }

  /**
   * 卸掉旧层再挂新层。原生态只卸不挂。
   *
   * 只卸就够了：overrideTokens 的 disposer 精确回收它自己那一层，
   * 而内置 light/dark 的 tokens 是空对象，层没了就落回 app 原生取值。
   */
  private mount(): void {
    this.detach?.()
    this.detach = undefined
    if (this.current === 'native') return
    this.detach = this.host.overrideTokens(LAYER, tokensFor(this.current))
  }
}
