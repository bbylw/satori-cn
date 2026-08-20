import { StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

declare global {
  interface Window { __satoriRoot?: Root }
}

// HMR（bun --hot）会重新执行本模块，复用已有 root 避免 createRoot 重复挂载
const container = document.getElementById('root')!
const root = (window.__satoriRoot ??= createRoot(container))

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
