window.__ModuleLoader__.load({
	id: "dsh-power-button",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_dom = require("react-dom");
		let react_jsx_runtime = require("react/jsx-runtime");
		// src/client/index.tsx
		/**
		* 电源键 · 浏览器半边。
		*
		* 挂在 `sidebar.footer.action`（侧栏底部、设置行下面那一排动作按钮），
		* 与「发现新版本」那个按钮同一排。点击弹确认框，确认后 POST 到
		* `/api/dsh-power/shutdown`，宿主进程退出（见 src/index.ts）。
		*
		* 没有用 ctx.effect 包注册：slots.inject 已经把注册挂到调用者 fiber 上，
		* 卸载时自动撤销。
		*/
		/** 与宿主半边一致的关机路由。 */
		const SHUTDOWN_PATH = "/api/dsh-power/shutdown";
		/** 需要的服务：slots 提供侧栏底部的动作位。 */
		const inject = ["slots"];
		/** 样式表 id，重复挂载时先删旧的。 */
		const STYLE_ID = "dsh-power-css";
		/** 电源键的样式。全部走 app 的语义 token，跟着明暗与衣装走。 */
		function stylesheet() {
			return `
.dsh-power-action {
  display: flex;
  align-items: center;
  gap: 6px;
  /* 侧栏底部是 flex 列，app 给这一排动作设了 flex: 1 1 100%（整行按钮）；
     电源键只要自己的宽度，所以这三条必须 !important。 */
  width: auto !important;
  flex: 0 0 auto !important;
  align-self: flex-start !important;
  height: 36px;
  padding: 0 10px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #61666b);
  font: inherit;
  font-size: 13px;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color .15s ease, color .15s ease;
}
.dsh-power-action:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, .12));
  color: var(--dsw-alias-state-error-primary, #c0392b);
}
.dsh-power-action:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #4d6bfe);
  outline-offset: 2px;
}
.dsh-power-action[data-flat="true"] {
  padding: 0 !important;
  width: 36px !important;
  align-self: center !important;
  justify-content: center;
}

.dsh-power-veil {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(10, 12, 18, .48);
  backdrop-filter: blur(2px);
  animation: dsh-power-fade .14s ease-out;
}
.dsh-power-card {
  box-sizing: border-box;
  width: min(380px, 100%);
  padding: 22px 22px 18px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, .1));
  border-radius: 16px;
  background: var(--dsw-alias-bg-module-platform, #ffffff);
  color: var(--dsw-alias-label-primary, #0f1115);
  box-shadow: 0 24px 60px rgba(0, 0, 0, .28);
  animation: dsh-power-rise .16s ease-out;
}
.dsh-power-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}
.dsh-power-title svg { color: var(--dsw-alias-state-error-primary, #c0392b); }
.dsh-power-body {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-secondary, #61666b);
}
.dsh-power-hint {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.dsh-power-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 18px;
}
.dsh-power-btn {
  height: 32px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 999px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.dsh-power-btn[data-tone="ghost"] {
  background: transparent;
  border-color: var(--dsw-alias-border-l2, rgba(0, 0, 0, .12));
  color: var(--dsw-alias-label-primary, #0f1115);
}
.dsh-power-btn[data-tone="ghost"]:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, .12));
}
.dsh-power-btn[data-tone="danger"] {
  background: var(--dsw-alias-state-error-primary, #c0392b);
  color: #fff;
}
.dsh-power-btn[data-tone="danger"]:hover { filter: brightness(1.06); }
.dsh-power-btn:disabled { opacity: .6; cursor: default; }
.dsh-power-done {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 8px 4px 4px;
  text-align: center;
}
.dsh-power-done strong { font-size: 15px; font-weight: 600; }
.dsh-power-done span { font-size: 13px; color: var(--dsw-alias-label-secondary, #61666b); }
@keyframes dsh-power-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes dsh-power-rise { from { transform: translateY(6px); opacity: .6 } to { transform: none; opacity: 1 } }
`;
		}
		/** 电源图标（圆环 + 顶部竖线）。 */
		function PowerIcon({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				xmlns: "http://www.w3.org/2000/svg",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M6.9 6.4A8.6 8.6 0 1 0 17.1 6.4",
					stroke: "currentColor",
					strokeWidth: "2.2",
					strokeLinecap: "round"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M12 3.5v7.5",
					stroke: "currentColor",
					strokeWidth: "2.2",
					strokeLinecap: "round"
				})]
			});
		}
		/**
		* 侧栏底部的电源键。
		* @param props - 侧栏列状态（wide = 展开态，显示文字；收起态只剩图标）。
		* @returns 按钮与（必要时）确认框。
		*/
		function PowerAction({ wide }) {
			const [view, setView] = (0, react.useState)("closed");
			const [error, setError] = (0, react.useState)();
			const close = (0, react.useCallback)(() => {
				setView((current) => current === "closing" || current === "done" ? current : "closed");
			}, []);
			(0, react.useEffect)(() => {
				if (view !== "confirm") return;
				const onKeyDown = (event) => {
					if (event.key === "Escape") close();
				};
				window.addEventListener("keydown", onKeyDown);
				return () => {
					window.removeEventListener("keydown", onKeyDown);
				};
			}, [view, close]);
			const shutdown = (0, react.useCallback)(async () => {
				setError(void 0);
				setView("closing");
				try {
					const response = await fetch(SHUTDOWN_PATH, {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: "{}"
					});
					if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
					setView("done");
				} catch (caught) {
					setError(caught instanceof Error ? caught.message : String(caught));
					setView("error");
				}
			}, []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "dsh-power-action",
				"data-flat": wide ? "false" : "true",
				"aria-label": "退出 DeepSeek Harness",
				title: "退出 DeepSeek Harness",
				onClick: () => {
					setView("confirm");
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PowerIcon, {}), wide ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "退出" }) : null]
			}), view !== "closed" ? (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dsh-power-veil",
				role: "presentation",
				onMouseDown: (event) => {
					if (event.target === event.currentTarget) close();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-power-card",
					role: "dialog",
					"aria-modal": "true",
					"aria-labelledby": "dsh-power-title",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-power-title",
						id: "dsh-power-title",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PowerIcon, { size: 18 }), "退出 DeepSeek Harness？"]
					}), view === "done" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dsh-power-done",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "已退出" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "dsh web 进程已结束，可以关闭这个标签页了。" })]
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dsh-power-body",
							children: "将结束当前的 dsh web 进程。正在运行的会话与任务会中断，已保存的会话记录不会丢失。"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dsh-power-hint",
							children: "下次双击桌面图标即可重新启动。"
						}),
						view === "error" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
							className: "dsh-power-hint",
							style: { color: "var(--dsw-alias-state-error-primary, #c0392b)" },
							children: ["退出请求失败：", error]
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-power-row",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: "dsh-power-btn",
								"data-tone": "ghost",
								type: "button",
								onClick: close,
								disabled: view === "closing",
								children: "取消"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: "dsh-power-btn",
								"data-tone": "danger",
								type: "button",
								onClick: () => {
									shutdown();
								},
								disabled: view === "closing",
								children: view === "closing" ? "正在退出…" : view === "error" ? "重试" : "退出"
							})]
						})
					] })]
				})
			}), document.body) : null] });
		}
		/**
		* 浏览器插件体：装样式、注册电源键。
		* @param ctx - 客户端上下文。
		*/
		function apply(ctx) {
			ctx.effect(() => {
				const style = document.createElement("style");
				style.id = STYLE_ID;
				style.textContent = stylesheet();
				document.head.append(style);
				return () => {
					style.remove();
				};
			}, "dsh-power: 样式表");
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "dsh-power",
				order: 200
			}, PowerAction));
		}
		exports.PowerAction = PowerAction;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map