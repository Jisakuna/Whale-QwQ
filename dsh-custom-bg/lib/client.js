window.__ModuleLoader__.load({
	id: "dsh-custom-bg",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/store.ts
		/**
		* 设置行的 slot store：插件世界到组件世界的单向镜像。
		* 组件只经由 props.useStore 读，写入口只有插件 apply 里的同步回调。
		*/
		/**
		* 声明设置行的状态与写入面。
		* @returns store 句柄。
		*/
		function createBgStore() {
			return (0, _deepseek_ai_dsh_client_runtime_client.defineStore)({
				init: () => ({
					mode: "light",
					enabled: false,
					opacity: 100,
					hasImage: false,
					importing: false
				}),
				actions: { sync: (d, patch) => {
					Object.assign(d, patch);
				} }
			});
		}
		//#endregion
		//#region src/client/row.tsx
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
		/** 原生行规范（与 Joi 换装行同源）。 */
		const NATIVE = {
			group: {
				display: "flex",
				flexDirection: "column",
				gap: 8,
				padding: "16px 0",
				borderBottom: "1px solid var(--dsw-alias-border-l2)"
			},
			title: {
				fontSize: 14,
				fontWeight: 400,
				lineHeight: "22px",
				color: "var(--dsw-alias-label-primary)"
			},
			desc: {
				fontSize: 12,
				fontWeight: 400,
				lineHeight: "18px",
				color: "var(--dsw-alias-label-tertiary)"
			},
			row: {
				display: "flex",
				alignItems: "center",
				gap: 8,
				flexWrap: "wrap"
			},
			button: {
				font: "inherit",
				fontSize: 13,
				lineHeight: "20px",
				padding: "6px 12px",
				borderRadius: 8,
				border: "1px solid var(--dsw-alias-border-l2)",
				background: "var(--dsw-alias-bg-layer-1)",
				color: "var(--dsw-alias-label-primary)",
				cursor: "pointer"
			},
			slider: {
				flex: "1 1 160px",
				minWidth: 120,
				accentColor: "var(--dsw-alias-brand-primary)"
			}
		};
		/**
		* 渲染「自定义背景」行。
		* @param props - 合成后的 slot props。
		* @returns 行的元素树。
		*/
		function BgRow({ useStore, onToggle, onOpacity, onFile, onClear }) {
			const mode = useStore((s) => s.mode);
			const enabled = useStore((s) => s.enabled);
			const opacity = useStore((s) => s.opacity);
			const hasImage = useStore((s) => s.hasImage);
			const importing = useStore((s) => s.importing);
			const fileRef = (0, react.useRef)(null);
			const modeLabel = mode === "light" ? "浅色" : "深色";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				style: NATIVE.group,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: {
							display: "flex",
							flexDirection: "column",
							gap: 4
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: NATIVE.title,
							children: "自定义背景"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							style: NATIVE.desc,
							children: [
								"为对话界面导入一张背景图，可调节不透明度；当前编辑「",
								modeLabel,
								"」模式，明暗两态分别记忆"
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: NATIVE.row,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: NATIVE.button,
								disabled: importing,
								onClick: () => {
									fileRef.current?.click();
								},
								children: importing ? "处理中…" : "导入图片"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: NATIVE.button,
								disabled: !hasImage,
								onClick: onClear,
								children: "清除"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								style: {
									...NATIVE.desc,
									display: "flex",
									alignItems: "center",
									gap: 6,
									cursor: "pointer"
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: enabled,
									onChange: (e) => {
										onToggle(e.target.checked);
									}
								}), "启用"]
							}),
							hasImage && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								style: {
									...NATIVE.desc,
									display: "flex",
									alignItems: "center",
									gap: 6
								},
								children: "✓ 已导入"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								ref: fileRef,
								type: "file",
								accept: "image/*",
								style: { display: "none" },
								onChange: (e) => {
									const f = e.target.files?.[0];
									if (f !== void 0) onFile(f);
									e.target.value = "";
								}
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: NATIVE.row,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								style: {
									...NATIVE.desc,
									width: 64
								},
								children: "不透明度"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: 100,
								step: 1,
								value: opacity,
								style: NATIVE.slider,
								onChange: (e) => {
									onOpacity(Number(e.target.value));
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								style: {
									...NATIVE.desc,
									width: 36,
									textAlign: "right"
								},
								children: [opacity, "%"]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/client/background.ts
		/** 打在大背景容器上的类名。 */
		const SURFACE_CLASS = "dsh-cbg-surface";
		/** 样式表 id（便于销毁）。 */
		const STYLE_ID = "dsh-custom-bg-css";
		/** 背景相关 CSS 变量。 */
		const VAR_IMAGE = "--dsh-cbg-image";
		/** 注入的样式表：只认打过类的表面。 */
		function stylesheet() {
			return `
body div.${SURFACE_CLASS} {
  background-image: var(${VAR_IMAGE}) !important;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  background-attachment: fixed !important;
}
`;
		}
		/**
		* 找出真正画着底色的大容器。
		*
		* 三重匹配（任一命中即算）：
		*   ① 底色等于 body 计算底色（有主题给 body 上色时的经典判据）；
		*   ② 底色等于解析后的 --dsw-alias-bg-base token 值（无主题时 body 透明，
		*      AppFrame/ConversationRoot 仍画这个 token，直接按 token 比色）；
		*   ③ 兜底：不透明的大容器（≥45% 视口），防止 token 值格式差异漏判。
		* 同时排除 fixed/absolute 定位或显式 z-index 的覆盖层——给它们贴不透明
		* 背景会把下方界面盖住。
		* @returns 命中的表面元素。
		*/
		function findSurfaces(max = 8) {
			const cs = getComputedStyle(document.body);
			const bodyBg = cs.backgroundColor;
			const token = cs.getPropertyValue("--dsw-alias-bg-base").trim();
			const out = [];
			for (const el of Array.from(document.querySelectorAll("body div"))) {
				if (out.length >= max) break;
				const ecs = getComputedStyle(el);
				if (ecs.position === "fixed" || ecs.position === "absolute") continue;
				if (ecs.zIndex !== "auto") continue;
				const r = el.getBoundingClientRect();
				if (r.width < window.innerWidth * .45 || r.height < window.innerHeight * .45) continue;
				const bg = ecs.backgroundColor;
				if (bg === bodyBg) {
					out.push(el);
					continue;
				}
				if (token !== "" && sameRgb(bg, token)) {
					out.push(el);
					continue;
				}
				if (!isTransparent(bg) && out.length === 0) out.push(el);
			}
			return out;
		}
		/** "rgb(r,g,b)" / "rgba(...)" / "#rrggbb" / "#rgb" 统一比较。 */
		function sameRgb(a, b) {
			const pa = parseRgb(a);
			const pb = parseRgb(b);
			if (pa === void 0 || pb === void 0) return false;
			return pa[0] === pb[0] && pa[1] === pb[1] && pa[2] === pb[2];
		}
		function isTransparent(bg) {
			return bg === "transparent" || bg === "" || /^rgba\(0,\s*0,\s*0,\s*0\)$/.test(bg);
		}
		/**
		* 按当前配置刷新背景：
		* 启用且有图 → 打类 + 设 CSS 变量；否则 → 摘类、清变量。
		* @param state - 持久配置。
		* @param mode - 当前外观模式。
		*/
		function applyBackground(state, mode) {
			const cfg = state[mode];
			const root = document.documentElement;
			if (cfg.enabled !== true || typeof cfg.image !== "string" || cfg.image.length === 0) {
				root.style.removeProperty(VAR_IMAGE);
				for (const el of Array.from(document.querySelectorAll(".dsh-cbg-surface"))) el.classList.remove(SURFACE_CLASS);
				return;
			}
			const surfaces = findSurfaces();
			let baseRgb;
			if (surfaces.length > 0) baseRgb = parseRgb(getComputedStyle(surfaces[0]).backgroundColor);
			else baseRgb = parseRgb(getComputedStyle(document.body).backgroundColor);
			const pct = Math.round(100 - cfg.opacity);
			const tint = baseRgb === void 0 ? "transparent" : `rgba(${baseRgb[0]}, ${baseRgb[1]}, ${baseRgb[2]}, ${(pct / 100).toFixed(3)})`;
			root.style.setProperty(VAR_IMAGE, `linear-gradient(${tint}, ${tint}), url("${cfg.image}")`);
			for (const el of surfaces) el.classList.add(SURFACE_CLASS);
		}
		/**
		* 把颜色字符串解析成 [r, g, b] 三元组。
		* 支持 "rgb(r,g,b)" / "rgba(r,g,b,a)" / "#rrggbb" / "#rgb"；失败返回 undefined。
		*/
		function parseRgb(value) {
			const v = value.trim().toLowerCase();
			const m = v.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
			if (m !== null) return [
				Number(m[1]),
				Number(m[2]),
				Number(m[3])
			];
			const hex6 = v.match(/^#([0-9a-f]{6})$/);
			if (hex6 !== null) {
				const n = parseInt(hex6[1], 16);
				return [
					n >> 16 & 255,
					n >> 8 & 255,
					n & 255
				];
			}
			const hex3 = v.match(/^#([0-9a-f]{3})$/);
			if (hex3 !== null) {
				const h = hex3[1];
				return [
					parseInt(h[0] + h[0], 16),
					parseInt(h[1] + h[1], 16),
					parseInt(h[2] + h[2], 16)
				];
			}
		}
		//#endregion
		//#region src/client/storage.ts
		const KEY = "dsh-custom-bg";
		const DEFAULT_MODE = {
			opacity: 100,
			enabled: false
		};
		function defaults() {
			return {
				light: { ...DEFAULT_MODE },
				dark: { ...DEFAULT_MODE }
			};
		}
		/** 读回持久配置；缺失或损坏时回落到默认。 */
		function loadState() {
			const s = defaults();
			try {
				const raw = localStorage.getItem(KEY);
				if (raw === null) return s;
				const parsed = JSON.parse(raw);
				for (const mode of ["light", "dark"]) {
					const m = parsed[mode];
					if (m === void 0 || typeof m !== "object") continue;
					if (typeof m.image === "string" && m.image.length > 0) s[mode].image = m.image;
					if (typeof m.opacity === "number") s[mode].opacity = Math.min(100, Math.max(0, Math.round(m.opacity)));
					s[mode].enabled = m.enabled === true;
				}
			} catch {}
			return s;
		}
		/** 写回持久配置。写失败只影响下次启动，不回滚界面。 */
		function saveState(s) {
			try {
				localStorage.setItem(KEY, JSON.stringify(s));
			} catch {}
		}
		/** 当前外观模式。与 ui-layout presenter 的判据一致（body 属性）。 */
		function isDark() {
			return document.body.hasAttribute("data-ds-dark-theme");
		}
		/**
		* 把用户选的图片文件压缩成可存储的 data URI。
		*
		* 两件事：① 限制最长边（浏览器 canvas 有 16384 上限，且 localStorage
		* 有 ~5MB 配额，base64 再膨胀 33%）；② 转 WebP（浏览器原生支持时）。
		* 失败（非图片、无 canvas）时抛错，由调用方兜住。
		* @param file - 用户选择的图片文件。
		* @param maxDim - 最长边像素上限。
		* @returns WebP（或回退 PNG）的 data URI。
		*/
		function fileToDataUrl(file, maxDim = 1600) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onerror = () => reject(reader.error ?? /* @__PURE__ */ new Error("读取文件失败"));
				reader.onload = () => {
					const img = new Image();
					img.onerror = () => reject(/* @__PURE__ */ new Error("文件不是可解码的图片"));
					img.onload = () => {
						const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
						const w = Math.max(1, Math.round(img.width * scale));
						const h = Math.max(1, Math.round(img.height * scale));
						const canvas = document.createElement("canvas");
						canvas.width = w;
						canvas.height = h;
						const ctx = canvas.getContext("2d");
						if (ctx === null) {
							reject(/* @__PURE__ */ new Error("浏览器不支持 canvas"));
							return;
						}
						ctx.drawImage(img, 0, 0, w, h);
						try {
							const webp = canvas.toDataURL("image/webp", .85);
							resolve(webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png"));
						} catch {
							resolve(canvas.toDataURL("image/png"));
						}
					};
					img.src = reader.result;
				};
				reader.readAsDataURL(file);
			});
		}
		//#endregion
		//#region src/client/index.tsx
		/** 需要的服务：slots 提供设置行的注册位。 */
		const inject = ["slots"];
		/**
		* 浏览器插件体。
		* @param ctx - 客户端 cordis 上下文。
		*/
		function apply(ctx) {
			let state = loadState();
			const store = createBgStore();
			let bound;
			let disposed = false;
			/** 最近一次绘制错误（诊断用）。 */
			let lastError;
			/** 当前外观模式。 */
			const mode = () => isDark() ? "dark" : "light";
			/** 把状态写进 store（驱动设置行 UI）。 */
			const syncStore = (importing = false) => {
				const m = mode();
				bound?.sync({
					mode: m,
					enabled: state[m].enabled,
					opacity: state[m].opacity,
					hasImage: typeof state[m].image === "string" && state[m].image.length > 0,
					importing
				});
			};
			/** 重绘背景 + 同步 UI。 */
			const refresh = () => {
				if (disposed) return;
				try {
					applyBackground(state, mode());
					lastError = void 0;
				} catch (error) {
					lastError = error instanceof Error ? error.message : String(error);
					console.warn("[dsh-custom-bg] 绘制失败：", error);
				}
				syncStore();
			};
			const style = document.createElement("style");
			style.id = STYLE_ID;
			style.textContent = stylesheet();
			document.head.append(style);
			let raf = 0;
			const schedule = () => {
				if (disposed || raf !== 0) return;
				raf = requestAnimationFrame(() => {
					raf = 0;
					refresh();
				});
			};
			const observer = new MutationObserver(schedule);
			observer.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeFilter: [
					"class",
					"style",
					"data-ds-dark-theme"
				]
			});
			window.addEventListener("resize", schedule);
			const cbg = () => {
				const m = mode();
				const els = Array.from(document.querySelectorAll(".dsh-cbg-surface"));
				return {
					mode: m,
					enabled: state[m].enabled,
					opacity: state[m].opacity,
					hasImage: typeof state[m].image === "string",
					imageLen: state[m].image?.length ?? 0,
					surfaces: els.length,
					surfaceList: els.map((el) => {
						const cs = getComputedStyle(el);
						const r = el.getBoundingClientRect();
						return {
							tag: el.tagName,
							cls: el.className.toString().slice(0, 60),
							pos: cs.position,
							z: cs.zIndex,
							size: `${Math.round(r.width)}x${Math.round(r.height)}`,
							interactive: el.querySelector("button,input,textarea,select,a") !== null,
							bg: cs.backgroundColor
						};
					}),
					bodyBg: getComputedStyle(document.body).backgroundColor,
					varImage: getComputedStyle(document.documentElement).getPropertyValue(VAR_IMAGE).slice(0, 120),
					lastError
				};
			};
			window.__cbg = cbg;
			console.info("[dsh-custom-bg] 插件激活；初始表面数：", findSurfaces().length);
			const injected = (actions) => {
				bound = actions;
				syncStore();
				return {
					onToggle: (on) => {
						state[mode()].enabled = on;
						saveState(state);
						refresh();
					},
					onOpacity: (value) => {
						state[mode()].opacity = Math.min(100, Math.max(0, Math.round(value)));
						saveState(state);
						refresh();
					},
					onFile: (file) => {
						syncStore(true);
						fileToDataUrl(file).then((url) => {
							const m = mode();
							state[m].image = url;
							state[m].enabled = true;
							saveState(state);
							refresh();
						}).catch((error) => {
							console.warn("[dsh-custom-bg] 图片处理失败：", error);
							syncStore();
						});
					},
					onClear: () => {
						const m = mode();
						delete state[m].image;
						state[m].enabled = false;
						saveState(state);
						refresh();
					}
				};
			};
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "custom-background",
				order: 20,
				store,
				inject: injected
			}, BgRow));
			refresh();
			ctx.effect(() => () => {
				disposed = true;
				observer.disconnect();
				window.removeEventListener("resize", schedule);
				if (raf !== 0) cancelAnimationFrame(raf);
				style.remove();
				document.documentElement.style.removeProperty("--dsh-cbg-image");
				for (const el of Array.from(document.querySelectorAll(".dsh-cbg-surface"))) el.classList.remove(SURFACE_CLASS);
				delete window.__cbg;
			}, "dsh-custom-bg: 清理");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map