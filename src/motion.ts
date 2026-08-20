// Aurora 动效基建：滚动入场 reveal + 卡片聚光跟随
export function initAuroraFx(): () => void {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in")
          io.unobserve(e.target)
        }
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  )
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el))

  const onMove = (ev: PointerEvent) => {
    const card = (ev.target as HTMLElement | null)?.closest?.(".card-spotlight") as HTMLElement | null
    if (!card) return
    const r = card.getBoundingClientRect()
    card.style.setProperty("--mx", `${ev.clientX - r.left}px`)
    card.style.setProperty("--my", `${ev.clientY - r.top}px`)
  }
  document.addEventListener("pointermove", onMove, { passive: true })

  return () => {
    io.disconnect()
    document.removeEventListener("pointermove", onMove)
  }
}
