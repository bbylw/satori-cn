// Satori 品牌图标「悟之星芒」：主四角星 + 45° 副星芒 + 中心高光核
export function SatoriLogo({ size = 24 }: { size?: number }) {
  return (
    <svg className="satori-logo" width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="sl-grad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset=".5" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
        <radialGradient id="sl-core" cx=".5" cy=".5" r=".5">
          <stop stopColor="#fff" stopOpacity=".95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M24 12.5 C25 19 29 23 35.5 24 C29 25 25 29 24 35.5 C23 29 19 25 12.5 24 C19 23 23 19 24 12.5 Z"
        fill="url(#sl-grad)"
        opacity=".38"
        transform="rotate(45 24 24)"
      />
      <path
        d="M24 4 C26 16 32 22 44 24 C32 26 26 32 24 44 C22 32 16 26 4 24 C16 22 22 16 24 4 Z"
        fill="url(#sl-grad)"
      />
      <circle cx="24" cy="24" r="6.5" fill="url(#sl-core)" />
    </svg>
  )
}
