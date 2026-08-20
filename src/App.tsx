import { useEffect, useMemo, useRef, useState } from "react"
import satori from "satori"
import { SatoriLogo } from "./Logo"
import { initAuroraFx } from "./motion"

// --- fonts ---
type LoadedFont = { name: string; data: ArrayBuffer; weight: number; style: "normal" | "italic" }
const FONT_URLS: Record<string, string> = {
  "Inter-400": "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-400-normal.woff",
  "Inter-700": "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-700-normal.woff",
  "NotoSC-400": "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.11/files/noto-sans-sc-chinese-simplified-400-normal.woff",
  "NotoSC-700": "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.11/files/noto-sans-sc-chinese-simplified-700-normal.woff",
}

function useFonts() {
  const [fonts, setFonts] = useState<LoadedFont[] | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const entries = Object.entries(FONT_URLS)
        const results = await Promise.all(entries.map(async ([key, url]) => {
          const res = await fetch(url)
          if (!res.ok) throw new Error(`font ${key} failed`)
          const buf = await res.arrayBuffer()
          const [name, w] = key.split("-")
          return { name: name === "Inter" ? "Inter" : "NotoSC", data: buf, weight: Number(w), style: "normal" as const }
        }))
        if (!cancel) { setFonts(results); setStatus("ready") }
      } catch {
        if (!cancel) setStatus("error")
      }
    })()
    return () => { cancel = true }
  }, [])
  return { fonts, status }
}

// --- helpers ---
function downloadText(filename: string, text: string, mime = "image/svg+xml") {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}
function copy(text: string) { navigator.clipboard.writeText(text) }

// --- template definitions ---
type TemplateKey = "og" | "product" | "stats" | "gradient" | "emoji" | "glass" | "notion" | "squircle"
type PlaygroundOpts = {
  title: string; subtitle: string; tag: string; accent: string; width: number; height: number; rounded: number
}

const ACCENTS = ["#8b5cf6", "#06b6d4", "#f43f5e", "#10b981", "#f59e0b", "#3b82f6", "#ec4899"]

function TemplateView({ k, opts }: { k: TemplateKey; opts: PlaygroundOpts }) {
  const common: React.CSSProperties = { fontFamily: "Inter, NotoSC, sans-serif" }
  switch (k) {
    case "og":
      return (
        <div style={{ width: opts.width, height: opts.height, display: "flex", flexDirection: "column", background: "#0a0a0f", color: "white", padding: 32, ...common }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: opts.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>S</div>
              <span style={{ fontSize: 13, letterSpacing: ".08em", opacity: .7 }}>SATORI · 中文</span>
            </div>
            <span style={{ fontSize: 11, padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.06)" }}>{opts.tag}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24, flex: 1 }}>
            <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-.03em" }}>{opts.title}</div>
            <div style={{ fontSize: 16, opacity: .7, lineHeight: 1.6, maxWidth: 520 }}>{opts.subtitle}</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <img src="https://avatars.githubusercontent.com/u/14985020?s=48&v=4" width={28} height={28} style={{ borderRadius: 999, border: "1px solid rgba(255,255,255,.2)" }} />
            <span style={{ fontSize: 13, opacity: .8 }}>vercel/satori · v0.33.0</span>
            <span style={{ marginLeft: "auto", fontSize: 12, opacity: .5 }}>600 × 315 · SVG</span>
          </div>
        </div>
      )
    case "product":
      return (
        <div style={{ width: opts.width, height: opts.height, display: "flex", background: "white", ...common, borderRadius: opts.rounded, overflow: "hidden" }}>
          <div style={{ flex: 1, padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 11, letterSpacing: ".1em", color: opts.accent, fontWeight: 800 }}>{opts.tag}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#0a0a0f", lineHeight: 1.15, marginTop: 8 }}>{opts.title}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 8, lineHeight: 1.6 }}>{opts.subtitle}</div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <div style={{ background: "#0a0a0f", color: "white", padding: "10px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700 }}>立即使用</div>
              <div style={{ border: "1px solid #e2e8f0", padding: "10px 16px", borderRadius: 999, fontSize: 13, fontWeight: 700, color: "#0a0a0f" }}>查看文档</div>
            </div>
          </div>
          <div style={{ width: 220, background: `linear-gradient(135deg, ${opts.accent}, #06b6d4)`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, padding: 16 }}>
            <div style={{ width: 96, height: 96, borderRadius: 20, background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: "0 12px 32px rgba(0,0,0,.2)" }}>⚡️</div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 13, opacity: .9 }}>HTML → SVG</div>
          </div>
        </div>
      )
    case "stats":
      return (
        <div style={{ width: opts.width, height: opts.height, display: "flex", flexDirection: "column", background: "#f8fafc", padding: 20, gap: 16, ...common }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>{opts.tag}</div>
            <div style={{ fontSize: 11, background: "#0f172a", color: "white", padding: "6px 10px", borderRadius: 999 }}>{opts.title}</div>
          </div>
          <div style={{ display: "flex", gap: 12, flex: 1 }}>
            {[
              { k: "渲染速度", v: "2.4ms", d: "+18%" },
              { k: "支持属性", v: "80+", d: "CSS" },
              { k: "周下载", v: "420k", d: "npm" },
            ].map(c => (
              <div key={c.k} style={{ flex: 1, background: "white", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 6, border: "1px solid #e2e8f0", boxShadow: "0 8px 24px rgba(0,0,0,.06)" }}>
                <div style={{ fontSize: 11, color: "#64748b", letterSpacing: ".06em", textTransform: "uppercase" }}>{c.k}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{c.v}</div>
                <div style={{ fontSize: 12, color: "#10b981", fontWeight: 700 }}>{c.d}</div>
                <div style={{ height: 6, background: "#f1f5f9", borderRadius: 999, overflow: "hidden", marginTop: 4, display: "flex" }}>
                  <div style={{ width: "72%", height: "100%", background: opts.accent }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
            <span>{opts.subtitle}</span><span>由 Satori 实时生成 · {opts.width}×{opts.height}</span>
          </div>
        </div>
      )
    case "gradient":
      return (
        <div style={{
          width: opts.width, height: opts.height, display: "flex", flexDirection: "column", padding: 24, gap: 14, ...common,
          backgroundColor: "#0a0a0f", backgroundImage: `linear-gradient(135deg, #0a0a0f, #1a102e)`, color: "white", borderRadius: opts.rounded
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 11, padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)" }}>linear-gradient</span>
            <span style={{ fontSize: 11, padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)" }}>radial-gradient</span>
            <span style={{ fontSize: 11, padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)" }}>boxShadow</span>
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-.03em" }}>{opts.title}</div>
          <div style={{ fontSize: 13, opacity: .75, lineHeight: 1.6, maxWidth: 520 }}>{opts.subtitle}</div>
          <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
            <div style={{ flex: 1, height: 72, borderRadius: 14, backgroundImage: `linear-gradient(90deg, ${opts.accent}, #06b6d4)`, border: "1px solid rgba(255,255,255,.15)", boxShadow: `0 12px 32px ${opts.accent}55` }} />
            <div style={{ flex: 1, height: 72, borderRadius: 14, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, opacity: .9 }}>filter: blur(12px)</div>
          </div>
        </div>
      )
    case "emoji":
      return (
        <div style={{ width: opts.width, height: opts.height, display: "flex", flexDirection: "column", background: "white", padding: 22, ...common, borderRadius: opts.rounded }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🤯</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 16 }}>{opts.title}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{`${opts.tag} · 多语言排版`}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.7, color: "#334155", display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "baseline" }}>中文排版：骨、Satori 支持 <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 6, fontFamily: "monospace" }}>lang="ja-JP"</span> 与 Noto 中文字体。</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "baseline" }}>Emoji：通过 <span style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 6, fontFamily: "monospace" }}>graphemeImages</span> 映射任意字形 → SVG 。</div>
            <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ background: "#0f172a", color: "white", padding: "6px 10px", borderRadius: 999, fontSize: 12 }}>你好 👋</span>
              <span style={{ background: "#f43f5e", color: "white", padding: "6px 10px", borderRadius: 999, fontSize: 12 }}>こんにちは 🌸</span>
              <span style={{ background: "#06b6d4", color: "white", padding: "6px 10px", borderRadius: 999, fontSize: 12 }}>Hello ✨</span>
            </div>
          </div>
          <div style={{ marginTop: "auto", fontSize: 11, color: "#94a3b8" }}>{opts.subtitle}</div>
        </div>
      )
    case "glass":
      return (
        <div style={{
          width: opts.width, height: opts.height, display: "flex", alignItems: "center", justifyContent: "center", padding: 18, ...common,
          backgroundColor: "#0f172a", backgroundImage: `linear-gradient(135deg, ${opts.accent}, #1e293b)`, position: "relative", borderRadius: opts.rounded, overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundImage: "linear-gradient(180deg, rgba(255,255,255,.10), rgba(0,0,0,.35))" }} />
          <div style={{
            position: "relative", width: "88%", background: "rgba(255,255,255,.86)", borderRadius: 18, padding: 18, border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 16px 40px rgba(0,0,0,.25)",
            display: "flex", flexDirection: "column", gap: 8
          }}>
            <div style={{ fontSize: 11, letterSpacing: ".08em", color: opts.accent, fontWeight: 800 }}>{opts.tag}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>{opts.title}</div>
            <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>{opts.subtitle}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <div style={{ background: "#0f172a", color: "white", padding: "8px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>gradient</div>
              <div style={{ background: "white", border: "1px solid #e2e8f0", padding: "8px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, color: "#0f172a" }}>boxShadow</div>
            </div>
          </div>
        </div>
      )
    case "notion":
      return (
        <div style={{ width: opts.width, height: opts.height, display: "flex", flexDirection: "column", background: "#ffffff", padding: 20, ...common, borderRadius: opts.rounded, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: opts.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 14 }}>N</div>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>{opts.tag}</div>
            <div style={{ marginLeft: "auto", fontSize: 11, color: "#64748b" }}>600 × 315 · SVG path</div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginTop: 14, lineHeight: 1.15 }}>{opts.title}</div>
          <div style={{ fontSize: 13, color: "#475569", marginTop: 6, lineHeight: 1.6, maxWidth: 560 }}>{opts.subtitle}</div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>◐</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>Flexbox 布局</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Yoga 引擎 · gap / align / justify</div>
            </div>
            <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>⬢</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>clipPath / polygon</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>circle / inset / path()</div>
            </div>
            <div style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: "#ede9fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✦</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>文字排版</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>HarfBuzz · OpenType</div>
            </div>
          </div>
        </div>
      )
    case "squircle":
      return (
        <div style={{ width: opts.width, height: opts.height, display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0f", padding: 20, gap: 18, ...common, borderRadius: opts.rounded }}>
          <div style={{ width: 120, height: 120, background: opts.accent, borderRadius: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 22, boxShadow: `0 16px 40px ${opts.accent}66`, transform: "rotate(-6deg)" }}>squircle</div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, letterSpacing: ".08em", color: opts.accent, fontWeight: 800 }}>cornerShape · 新特性</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "white", lineHeight: 1.2 }}>{opts.title}</div>
            <div style={{ fontSize: 12, color: "#a1a1b5", lineHeight: 1.6 }}>{opts.subtitle}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["round", "squircle", "scoop", "notch"].map(s => (
                <span key={s} style={{ fontSize: 11, padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", color: "white" }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      )
  }
}

// --- main ---
export default function App() {
  const { fonts, status } = useFonts()
  useEffect(() => initAuroraFx(), [])
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200) }

  const [active, setActive] = useState<TemplateKey>("og")
  const [title, setTitle] = useState("把 HTML & CSS 变成 SVG")
  const [subtitle, setSubtitle] = useState("Satori 在浏览器与 Node 中以同一套布局引擎实时渲染，零依赖于浏览器，完美用于 OG 图、社交卡片与封面生成。")
  const [tag, setTag] = useState("OPEN GRAPH · 1200×630")
  const [accent, setAccent] = useState(ACCENTS[0])
  const [width, setWidth] = useState(600)
  const [height, setHeight] = useState(315)
  const [rounded, setRounded] = useState(16)
  const [embedFont, setEmbedFont] = useState(true)
  const [debug, setDebug] = useState(false)

  const opts: PlaygroundOpts = useMemo(() => ({ title, subtitle, tag, accent, width, height, rounded }), [title, subtitle, tag, accent, width, height, rounded])

  // playground svg
  const [svg, setSvg] = useState<string>("")
  const [generating, setGenerating] = useState(false)
  const genRef = useRef<number>(0)

  useEffect(() => {
    if (!fonts) return
    const id = ++genRef.current
    setGenerating(true)
    const el = <TemplateView k={active} opts={opts} />
    satori(el as any, {
      width: opts.width,
      height: opts.height,
      fonts: fonts as any,
      embedFont,
      debug,
    }).then(out => {
      if (id === genRef.current) { setSvg(out); setGenerating(false) }
    }).catch(e => {
      console.error(e)
      if (id === genRef.current) setGenerating(false)
    })
  }, [fonts, active, opts, embedFont, debug])

  // hero svg (separate, cached)
  const [heroSvg, setHeroSvg] = useState<string>("")
  useEffect(() => {
    if (!fonts) return
    void ["Satori"]
    satori(
      <div style={{ width: 600, height: 340, display: "flex", flexDirection: "column", background: "linear-gradient(135deg,#0a0a0f 0%,#1a102e 55%,#0a2a2e 100%)", color: "white", padding: 24, fontFamily: "Inter, NotoSC", borderRadius: 16, border: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>S</div>
          <span style={{ fontSize: 12, letterSpacing: ".08em", opacity: .8 }}>SATORI 中文 · vercel/satori</span>
          <span style={{ marginLeft: "auto", fontSize: 11, padding: "6px 10px", borderRadius: 999, background: "rgba(16,185,129,.18)", border: "1px solid rgba(16,185,129,.35)", color: "#a7f3d0" }}>● 运行中 · 浏览器端生成</span>
        </div>
        <div style={{ marginTop: 18, fontSize: 44, fontWeight: 900, lineHeight: 1, letterSpacing: "-.03em", display: "flex", alignItems: "baseline" }}>
          <span style={{ background: "linear-gradient(90deg,#a78bfa,#22d3ee)", backgroundClip: "text", color: "transparent" as any }}>HTML</span>
          <span style={{ opacity: .9 }}> + CSS</span>
          <span style={{ opacity: .5 }}> → </span>
          <span style={{ background: "linear-gradient(90deg,#f43f5e,#f59e0b)", backgroundClip: "text", color: "transparent" as any }}>SVG</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 13, opacity: .7, lineHeight: 1.6, maxWidth: 520 }}>无需浏览器 · Yoga 布局 · 支持渐变/阴影/滤镜/裁剪/中日韩排版 · 为 OG Image 而生</div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {["flex", "gradient", "filter", "clipPath", "mask", "squircle"].map(t => (
            <span key={t} style={{ fontSize: 11, padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)" }}>{t}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: "auto", alignItems: "center" }}>
          <div style={{ fontSize: 12, opacity: .6 }}>600×340 · embedFont: true · Yoga WASM</div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <div style={{ width: 72, height: 28, borderRadius: 999, background: "white", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0a0f", fontWeight: 800, fontSize: 11 }}>JSX ✓</div>
            <div style={{ width: 72, height: 28, borderRadius: 999, background: "transparent", border: "1px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11 }}>TS ✓</div>
          </div>
        </div>
      </div> as any,
      { width: 600, height: 340, fonts: fonts as any }
    ).then(setHeroSvg).catch(console.error)
  }, [fonts])

  const codeSnippet = useMemo(() => {
    return `import satori from 'satori'

const svg = await satori(
  <div style={{
    width: ${width}, height: ${height},
    display: 'flex', background: '${accent}',
    borderRadius: ${rounded},
    // 试试: gradient / shadow / filter / clipPath
  }}>
    <span style={{ fontSize: 28, fontWeight: 700 }}>
      ${title}
    </span>
  </div>,
  {
    width: ${width}, height: ${height},
    fonts: [{ name: 'Inter', data: interData, weight: 400 }],
    embedFont: ${embedFont},
    // pointScaleFactor: 2, // 高分屏
    // debug: ${debug},
  }
)`
  }, [width, height, accent, rounded, title, embedFont, debug])

  const gallery: { key: TemplateKey; title: string; desc: string; tag: string }[] = [
    { key: "og", title: "OG 社交卡片", desc: "Vercel OG 官方用法，标题+副标题+头像，适配 1200×630", tag: "og-image" },
    { key: "product", title: "产品发布卡片", desc: "白底+渐变侧栏，按钮与圆角，适合官网头图", tag: "marketing" },
    { key: "stats", title: "数据看板", desc: "Flex 三栏 + 进度条 + 阴影，展示布局能力", tag: "dashboard" },
    { key: "gradient", title: "渐变与毛玻璃", desc: "linear/radial + backdropFilter blur", tag: "visual" },
    { key: "emoji", title: "多语言 & Emoji", desc: "中文/日文/Emoji + graphemeImages 映射", tag: "typography" },
    { key: "glass", title: "毛玻璃封面", desc: "背景图 + backdropFilter 浮层卡片", tag: "cover" },
    { key: "notion", title: "Notion 风格文档卡", desc: "精致边框与栅格，适合知识库封面", tag: "docs" },
    { key: "squircle", title: "squircle 圆角", desc: "cornerShape 新特性：squircle / scoop / notch", tag: "new" },
  ]

  return (
    <>
      <div className="aurora-field" aria-hidden="true">
        <div className="aurora-blob a1" />
        <div className="aurora-blob a2" />
        <div className="aurora-blob a3" />
      </div>
      <div className="grid-overlay" aria-hidden="true" />
      <nav className="nav">
        <div className="container nav-inner">
          <a href="#" className="brand">
            <span className="brand-mark"><SatoriLogo size={24} /></span>
            <span>Satori <small>中文</small></span>
            <span className="badge">v0.33.0 · 最新</span>
          </a>
          <div className="nav-links">
            <a href="#playground">演练场</a>
            <a href="#gallery">画廊</a>
            <a href="#css">CSS 支持</a>
            <a href="#docs">文档</a>
            <a href="https://github.com/vercel/satori" target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href="#playground" className="nav-cta">立即体验</a>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="container hero-grid">
          <div>
            <span className="kicker reveal"><i /> 适用于 Node / 浏览器 / Workers · WASM 驱动</span>
            <h1 className="h1 reveal reveal-d1">用 <em>JSX 与 CSS</em><br />生成精致的 SVG</h1>
            <p className="lead reveal reveal-d1">Satori 将 HTML + CSS 转为 SVG 字符串，底层采用 Yoga 布局与 HarfBuzz 排版，样式与浏览器高度一致。无需截图、无需 Headless，直接在服务端生成 OG 图、社交卡片、封面与海报。</p>
            <div className="hero-actions reveal reveal-d2">
              <a className="btn btn-aurora" href="#playground">打开实时演练场 →</a>
              <a className="btn btn-ghost" href="https://vercel.com/docs/og-image-generation" target="_blank" rel="noreferrer">Vercel OG 文档</a>
            </div>
            <div className="inst reveal reveal-d2"><b>bun add satori</b><span style={{ opacity: .6 }}># 或 npm / pnpm / yarn</span> <button className="copy" onClick={() => { copy("bun add satori"); showToast("已复制：bun add satori") }}>复制</button></div>
            <div className="stats reveal reveal-d3">
              <span><strong>80+</strong> CSS 属性</span>
              <span><strong>TTF / OTF / WOFF</strong> 字体</span>
              <span><strong>SVG 1.1</strong> 路径内嵌</span>
              <span><strong style={{ color: status === "ready" ? "#10b981" : "#f59e0b" }}>{status === "ready" ? "● 字体就绪" : status === "loading" ? "○ 字体加载中…" : "字体加载失败"}</strong></span>
            </div>
          </div>
          <div className="hero-card reveal reveal-d2">
            <div className="hero-card-bar">
              <span className="dot" style={{ background: "#f87171" }} />
              <span className="dot" style={{ background: "#facc15" }} />
              <span className="dot" style={{ background: "#4ade80" }} />
              <span style={{ marginLeft: 8, fontSize: 12, color: "#a1a1b5" }}>hero.tsx · 浏览器端由 Satori 生成</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "#10b981", fontWeight: 700 }}>{generating ? "生成中…" : "实时"}</span>
            </div>
            <div className="hero-svg-wrap">
              {heroSvg ? <div dangerouslySetInnerHTML={{ __html: heroSvg }} /> : <div style={{ color: "#6b6b82", fontSize: 13 }}>{status === "loading" ? "正在加载字体与 Yoga WASM…" : "生成中…"}</div>}
              <span className="badge-live"><i /> LIVE SVG</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <span className="tag">JSX 运行时</span><span className="tag">Flexbox (Yoga)</span><span className="tag">HarfBuzz</span><span className="tag">WASM</span>
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <h2>为什么选 Satori <span>· Enlightened</span></h2>
          <p className="sub">专为“静态、可视、可分享”的图片生成而设计，去掉浏览器冗余，只保留最常用且可高效实现的子集。</p>
          <div className="grid3">
            {[
              { icon: "◐", title: "直觉的 JSX", desc: "像写 React 一样写图片：<div style={{display:'flex'}}> 即可，所见即所得。支持自定义组件与无状态函数。" },
              { icon: "⬢", title: "确定性布局", desc: "基于 Yoga 的 Flexbox 引擎，支持 absolute / relative、width/height、gap、padding、margin 等，像素级可控。" },
              { icon: "✦", title: "完整排版", desc: "HarfBuzz 整形 + OpenType 特性（liga/smcp/ss01…）、中文/日文 locale、Emoji graphemeImages 映射。" },
              { icon: "🎨", title: "视觉表现力", desc: "linear/radial 渐变、阴影、滤镜、backdropFilter、clipPath、mask、transform、opacity 等一应俱全。" },
              { icon: "⚡", title: "跨运行时", desc: "浏览器、Node ≥16、Web Workers、Cloudflare Workers（standalone + yoga.wasm）均可运行。" },
              { icon: "🧩", title: "字体即数据", desc: "TTF/OTF/WOFF 内嵌为 <path>，无需外链；也可 embedFont:false 输出 <text> 保留可检索文本。" },
            ].map(c => (
              <div key={c.title} className="card">
                <div className="icon">{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="playground" className="section" style={{ background: "linear-gradient(180deg, #0e0e14, #0a0a0f)" }}>
        <div className="container">
          <h2>实时演练场 <span>· Playground — 真正调用 satori()</span></h2>
          <p className="sub">左侧改参数，右侧即时由 <code style={{ background: "rgba(255,255,255,.08)", padding: "2px 6px", borderRadius: 6 }}>satori()</code> 在浏览器内生成 SVG。可导出 SVG / 复制代码，所有模板都展示不同的能力边界。</p>

          <div className="playground">
            <div className="panel">
              <div className="panel-hd"><h3>模板与参数</h3><span className="badge" style={{ fontSize: 11 }}>{width}×{height}</span></div>
              <div className="controls">
                <div className="tabs">
                  {gallery.slice(0, 6).map(g => (
                    <button key={g.key} className={`tab ${active === g.key ? "active" : ""}`} onClick={() => setActive(g.key)}>{g.title}</button>
                  ))}
                </div>

                <div className="field">
                  <label>标题</label>
                  <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="输入标题" />
                </div>
                <div className="field">
                  <label>副标题 / 描述</label>
                  <textarea className="textarea" value={subtitle} onChange={e => setSubtitle(e.target.value)} />
                </div>
                <div className="row2">
                  <div className="field"><label>标签</label><input className="input" value={tag} onChange={e => setTag(e.target.value)} /></div>
                  <div className="field"><label>主题色</label>
                    <div className="color-row">
                      {ACCENTS.map(c => (
                        <button key={c} className="color-dot" style={{ background: c, outline: accent === c ? "3px solid white" : "none" }} onClick={() => setAccent(c)} aria-label={c} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="row2">
                  <div className="field"><label>宽度 {width}px</label><input type="range" min={320} max={800} value={width} onChange={e => setWidth(Number(e.target.value))} /></div>
                  <div className="field"><label>高度 {height}px</label><input type="range" min={200} max={480} value={height} onChange={e => setHeight(Number(e.target.value))} /></div>
                </div>
                <div className="field"><label>圆角 {rounded}px</label><input type="range" min={0} max={32} value={rounded} onChange={e => setRounded(Number(e.target.value))} /></div>

                <div className="row2">
                  <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}><input type="checkbox" checked={embedFont} onChange={e => setEmbedFont(e.target.checked)} /> embedFont（内嵌为 path）</label>
                  <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}><input type="checkbox" checked={debug} onChange={e => setDebug(e.target.checked)} /> debug 边界框</label>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="mini-btn" onClick={() => { setTitle("把 HTML & CSS 变成 SVG"); setSubtitle("Satori 在浏览器与 Node 中以同一套布局引擎实时渲染，零依赖于浏览器，完美用于 OG 图、社交卡片与封面生成。"); showToast("已重置文案") }}>重置文案</button>
                  <button className="mini-btn" onClick={() => { copy(codeSnippet); showToast("代码已复制") }}>复制代码</button>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-hd">
                <div className="preview-head">
                  <h3>预览 · {active}</h3>
                  <span className="badge" style={{ background: generating ? "rgba(245,158,11,.15)" : "rgba(16,185,129,.15)", borderColor: generating ? "rgba(245,158,11,.3)" : "rgba(16,185,129,.3)" }}>{generating ? "生成中…" : "已生成"}</span>
                </div>
                <div className="preview-actions">
                  <button className="mini-btn" onClick={() => { if (svg) downloadText(`satori-${active}.svg`, svg); showToast("已下载 SVG") }}>下载 SVG</button>
                  <button className="mini-btn" onClick={() => { if (svg) copy(svg); showToast("SVG 已复制") }}>复制 SVG</button>
                  <button className="mini-btn" onClick={() => { if (svg) { const w = window.open(); w?.document.write(svg) } }}>新窗口打开</button>
                </div>
              </div>
              <div className="svg-stage">
                <div className="svg-frame">
                  {status !== "ready" ? (
                    <div style={{ padding: 40, textAlign: "center", color: "#64748b", background: "white" }}>字体加载中…（首次需拉取 Inter / NotoSC WOFF）</div>
                  ) : svg ? (
                    <div dangerouslySetInnerHTML={{ __html: svg }} />
                  ) : (
                    <div style={{ padding: 40, textAlign: "center", color: "#64748b", background: "white" }}>生成失败，请检查控制台</div>
                  )}
                </div>
              </div>
              <div className="code-block">{codeSnippet}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery" className="section">
        <div className="container">
          <h2>能力画廊 <span>· Gallery — 一键切换模板</span></h2>
          <p className="sub">每个卡片都是一个独立的 Satori JSX 模板，点击即可载入演练场体验对应的 CSS 能力。</p>
          <div className="gallery">
            {gallery.map(g => {
              const prevOpts: PlaygroundOpts = { title, subtitle, tag, accent, width: 600, height: 315, rounded: 16 }
              return (
                <div key={g.key} className="g-card" onClick={() => { setActive(g.key); document.querySelector("#playground")?.scrollIntoView({ behavior: "smooth" }); showToast(`已载入：${g.title}`) }}>
                  <div className="g-preview">
                    {/* static placeholder via inline svg for gallery thumbnail to avoid many satori calls; show live minimal */}
                    <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", background: g.key === "gradient" || g.key === "squircle" ? "#0a0a0f" : "#fff", color: g.key === "gradient" || g.key === "squircle" ? "white" : "#0f172a", padding: 14 }}>
                      <GalleryThumb k={g.key} opts={prevOpts} />
                    </div>
                  </div>
                  <div className="g-meta">
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}><span className="tag">{g.tag}</span><span style={{ fontSize: 11, color: "#64748b" }}>{g.key}</span></div>
                    <h4>{g.title}</h4>
                    <p>{g.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="css" className="section">
        <div className="container">
          <h2>CSS 支持一览 <span>· 覆盖 80+ 属性</span></h2>
          <p className="sub">Satori 采用 Yoga 布局 + 自研渲染，支持下表子集（与浏览器高度一致，但非 100% 完整）。更多示例见上方演练场。</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>分类</th><th>属性</th><th>支持</th><th>示例</th></tr></thead>
              <tbody>
                <tr><td>布局</td><td>display: flex / block / none / contents / -webkit-box</td><td className="ok">✓</td><td>div 多子节点请用 flex</td></tr>
                <tr><td>定位</td><td>position: relative / absolute / static + top/right/bottom/left</td><td className="ok">✓</td><td>绝对定位卡片</td></tr>
                <tr><td>尺寸</td><td>width / height / min/max-*</td><td className="ok">✓</td><td>不支持 min/max-content</td></tr>
                <tr><td>盒模型</td><td>margin / padding / border / borderRadius / boxSizing / overflow</td><td className="ok">✓</td><td>支持 50% / 5px 等</td></tr>
                <tr><td>新特性</td><td>cornerShape: squircle / scoop / notch / bevel</td><td className="ok">✓</td><td>需配合 borderRadius</td></tr>
                <tr><td>Flex</td><td>flexDirection / wrap / gap / align / justify / grow/shrink</td><td className="ok">✓</td><td>Yoga 引擎</td></tr>
                <tr><td>字体</td><td>fontFamily / size / weight / style / fontFeatureSettings</td><td className="ok">✓</td><td>HarfBuzz 连字/小型大写</td></tr>
                <tr><td>文本</td><td>textAlign / transform / decoration / shadow / lineHeight / clamp</td><td className="ok">✓</td><td>支持 ellipsis</td></tr>
                <tr><td>背景</td><td>backgroundColor / Image (gradient/url) / Position / Size / Clip</td><td className="ok">✓</td><td>支持 repeating-*</td></tr>
                <tr><td>变换</td><td>transform: translate / rotate / scale / skew + transformOrigin</td><td className="ok">✓</td><td>不支持 3D</td></tr>
                <tr><td>视觉</td><td>opacity / boxShadow / filter / backdropFilter / objectFit</td><td className="ok">✓</td><td>blur / hue-rotate 等</td></tr>
                <tr><td>裁剪</td><td>clipPath: circle/ellipse/inset/polygon/path/shape()</td><td className="ok">✓</td><td>最强能力之一</td></tr>
                <tr><td>遮罩</td><td>maskImage / Position / Size / Repeat</td><td className="ok">✓</td><td>linear-gradient 遮罩</td></tr>
                <tr><td>其他</td><td>WebkitTextStroke / CSS 变量 var(--*)</td><td className="ok">✓</td><td>支持嵌套与回退</td></tr>
                <tr><td>不支持</td><td>z-index / calc / 3D transform / style 标签外链</td><td className="no">—</td><td>文档靠后者层级更高</td></tr>
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="mini-btn" href="https://og-playground.vercel.app/" target="_blank" rel="noreferrer">在 OG Playground 交互调试 ↗</a>
            <a className="mini-btn" href="https://github.com/vercel/satori/blob/main/src/handler/presets.ts" target="_blank" rel="noreferrer">查看受支持 HTML 元素列表 ↗</a>
          </div>
        </div>
      </section>

      <section id="docs" className="section">
        <div className="container">
          <h2>快速上手 <span>· 3 步生成你的第一张 SVG</span></h2>
          <div className="grid3">
            <div className="card">
              <div className="icon">1</div>
              <h3>安装</h3>
              <p><code style={{ background: "rgba(255,255,255,.06)", padding: "4px 8px", borderRadius: 8 }}>bun add satori</code> · 最新 0.33.0，支持 React 19 + ESM。Bun / Node / 浏览器 / Workers 均可。</p>
            </div>
            <div className="card">
              <div className="icon">2</div>
              <h3>准备字体</h3>
              <p>TTF/OTF/WOFF 皆可（暂不支持 WOFF2）。通过 <code style={{ background: "rgba(255,255,255,.06)", padding: "4px 8px", borderRadius: 8 }}>fetch</code> 或 <code style={{ background: "rgba(255,255,255,.06)", padding: "4px 8px", borderRadius: 8 }}>fs.readFile</code> 取得 ArrayBuffer 后传入 <code style={{ background: "rgba(255,255,255,.06)", padding: "4px 8px", borderRadius: 8 }}>fonts</code>。</p>
            </div>
            <div className="card">
              <div className="icon">3</div>
              <h3>调用 satori</h3>
              <p>传入 JSX 与 <code style={{ background: "rgba(255,255,255,.06)", padding: "4px 8px", borderRadius: 8 }}>width/height/fonts</code>，即可得到 SVG 字符串；可直接写入文件或转为 PNG（配合 @resvg/resvg-js）。</p>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-hd"><h3>最小可运行示例</h3><button className="mini-btn" onClick={() => { copy(`import satori from 'satori'\nconst svg = await satori(<div style={{color:'black'}}>hello, world</div>, { width:600, height:400, fonts:[{name:'Roboto', data: robotoData, weight:400, style:'normal'}] })\n`); showToast("已复制示例") }}>复制</button></div>
            <div className="code-block">{`import satori from 'satori'

// 浏览器
const res = await fetch('/fonts/Inter-Regular.woff')
const fontData = await res.arrayBuffer()

// Node.js: import { readFile } from 'node:fs/promises'
// const fontData = await readFile('./Inter-Regular.woff')

const svg = await satori(
  <div style={{
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    color: 'white', fontSize: 48, fontWeight: 700,
    borderRadius: 16,
  }}>
    hello, world 👋
  </div>,
  {
    width: 600, height: 400,
    fonts: [{ name: 'Inter', data: fontData, weight: 400, style: 'normal' }],
    // embedFont: true,       // 默认 true：文本转为 <path>
    // pointScaleFactor: 2,   // 高分屏更锐利
    // debug: true,           // 调试边界框
  }
)

// svg -> '<svg ...><path d="..." /></svg>'
// 转 PNG: 配合 satori/html 或 @resvg/resvg-js`}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }} className="docs-grid">
            <div className="card">
              <h3>服务端（Next.js / OG）</h3>
              <p style={{ fontSize: 13, lineHeight: 1.7 }}>直接在 Route Handler / Edge Function 中调用，返回 <code>new ImageResponse(...)</code>（底层即 satori）。参考 <a href="https://vercel.com/docs/og-image-generation" target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>Vercel OG 文档</a>。</p>
              <div className="code-block" style={{ marginTop: 10, borderRadius: 10, border: "1px solid var(--border)" }}>{`// app/api/og/route.tsx
import { ImageResponse } from 'next/og'
export async function GET(){
  return new ImageResponse(
    <div style={{display:'flex'}}>Hello</div>,
    { width:1200, height:630 }
  )
}`}</div>
            </div>
            <div className="card">
              <h3>Workers 独立构建</h3>
              <p style={{ fontSize: 13, lineHeight: 1.7 }}>若环境限制动态 WASM，使用 standalone：先 fetch <code>yoga.wasm</code> 再 init。</p>
              <div className="code-block" style={{ marginTop: 10, borderRadius: 10, border: "1px solid var(--border)" }}>{`import satori, { init } from 'satori/standalone'
const yoga = await fetch('https://unpkg.com/satori/yoga.wasm')
  .then(r=>r.arrayBuffer())
await init(yoga)
const svg = await satori(<div>hello</div>, opts)`}</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container" style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
          <div>© 2026 Satori 中文网 · 非官方翻译与演练场 · 原作 <a href="https://github.com/vercel/satori" target="_blank" rel="noreferrer">vercel/satori</a> · 作者 Shu Ding</div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="https://vercel.com/blog/introducing-vercel-og-image-generation-fast-dynamic-social-card-images" target="_blank" rel="noreferrer">发布公告</a>
            <a href="https://og-playground.vercel.app/" target="_blank" rel="noreferrer">Playground</a>
            <a href="https://github.com/vercel/satori/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer">贡献</a>
          </div>
        </div>
      </footer>

      {toast && <div className="toast">{toast}</div>}
      <style>{`@media(max-width:800px){ .docs-grid{grid-template-columns:1fr!important} }`}</style>
    </>
  )
}

function GalleryThumb({ k, opts }: { k: TemplateKey; opts: PlaygroundOpts }) {
  // lightweight inline preview (no satori) for gallery grid performance
  const s: React.CSSProperties = { fontFamily: "Inter, NotoSC" }
  if (k === "og") return (
    <div style={{ width: "100%", height: "100%", background: "#0a0a0f", color: "white", padding: 14, display: "flex", flexDirection: "column", ...s }}>
      <div style={{ fontSize: 10, opacity: .6 }}>SATORI · 中文 · {opts.tag}</div>
      <div style={{ fontSize: 18, fontWeight: 800, marginTop: 8, lineHeight: 1.1 }}>{opts.title}</div>
      <div style={{ fontSize: 11, opacity: .6, marginTop: 6, lineHeight: 1.5 }}>{opts.subtitle.slice(0, 42)}…</div>
    </div>
  )
  if (k === "product") return (
    <div style={{ width: "100%", height: "100%", display: "flex", ...s }}>
      <div style={{ flex: 1, padding: 14 }}><div style={{ fontSize: 18, fontWeight: 800 }}>{opts.title}</div><div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>{opts.subtitle.slice(0, 36)}…</div></div>
      <div style={{ width: 90, background: `linear-gradient(135deg, ${opts.accent}, #06b6d4)` }} />
    </div>
  )
  if (k === "stats") return (
    <div style={{ width: "100%", height: "100%", background: "#f8fafc", padding: 12, display: "flex", gap: 8, ...s }}>
      {[1, 2, 3].map(i => <div key={i} style={{ flex: 1, background: "white", borderRadius: 10, padding: 10, border: "1px solid #e2e8f0" }}><div style={{ fontSize: 10, color: "#64748b" }}>指标 {i}</div><div style={{ fontWeight: 800 }}>420k</div></div>)}
    </div>
  )
  if (k === "gradient") return (
    <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, #0a0a0f, ${opts.accent})`, color: "white", padding: 14, display: "flex", flexDirection: "column", ...s }}>
      <div style={{ fontSize: 16, fontWeight: 800 }}>{opts.title}</div><div style={{ fontSize: 11, opacity: .7, marginTop: 6 }}>gradient + backdropFilter</div>
    </div>
  )
  if (k === "emoji") return <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", fontSize: 28, ...s }}>你好 👋 こんにちは 🌸</div>
  if (k === "glass") return <div style={{ width: "100%", height: "100%", background: "#ddd", display: "grid", placeItems: "center", ...s }}><div style={{ background: "rgba(255,255,255,.8)", padding: "10px 14px", borderRadius: 12, fontWeight: 700, fontSize: 12 }}>{opts.title}</div></div>
  if (k === "notion") return <div style={{ width: "100%", height: "100%", padding: 14, ...s }}><div style={{ fontWeight: 800 }}>{opts.title}</div><div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>文档卡 · Flex 栅格</div></div>
  return <div style={{ width: "100%", height: "100%", background: "#0a0a0f", color: "white", display: "flex", alignItems: "center", gap: 10, padding: 14, ...s }}><div style={{ width: 48, height: 48, borderRadius: 14, background: opts.accent }} /><div style={{ fontWeight: 800 }}>{opts.title.slice(0, 10)}</div></div>
}
