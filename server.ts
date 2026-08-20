import index from "./index.html"

const server = Bun.serve({
  development: true,
  port: 3000,
  routes: {
    "/": index,
  },
  async fetch(req) {
    // 静态资源走 public/（favicon、icons 等）
    const url = new URL(req.url)
    const path = decodeURIComponent(url.pathname)
    if (path === "/favicon.ico") {
      return new Response(null, { status: 302, headers: { location: "/favicon.svg" } })
    }
    if (path.startsWith("/public/")) {
      return new Response(null, { status: 404 })
    }
    const file = Bun.file(`public${path}`)
    if (await file.exists()) {
      return new Response(file)
    }
    return new Response("Not Found", { status: 404 })
  },
})

console.log(`Satori 中文网 dev → http://localhost:${server.port}`)
