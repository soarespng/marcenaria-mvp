"use client"

import type React from "react"
import { useEffect } from "react"
import { useConfig } from "@/hooks/use-config"

function hexToOklch(hex: string): string {
  hex = hex.replace("#", "")

  // Converte hex para RGB (0-1)
  const r = Number.parseInt(hex.substring(0, 2), 16) / 255
  const g = Number.parseInt(hex.substring(2, 4), 16) / 255
  const b = Number.parseInt(hex.substring(4, 6), 16) / 255

  // Aplicar gamma correction (sRGB para RGB linear)
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))

  const rLinear = toLinear(r)
  const gLinear = toLinear(g)
  const bLinear = toLinear(b)

  // RGB linear para XYZ
  const x = rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375
  const y = rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.072175
  const z = rLinear * 0.0193339 + gLinear * 0.119192 + bLinear * 0.9503041

  // XYZ para OKLab (aproximação)
  const l_ = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z)
  const m_ = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z)
  const s_ = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.633851707 * z)

  const l = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_

  // OKLab para OKLCH
  const c = Math.sqrt(a * a + b_ * b_)
  let h = (Math.atan2(b_, a) * 180) / Math.PI
  if (h < 0) h += 360

  return `${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)}`
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { config, loading } = useConfig()

  useEffect(() => {
    if (!loading && config) {
      const root = document.documentElement

      if (config.cor_primaria) {
        const primaryOklch = hexToOklch(config.cor_primaria)
        root.style.setProperty("--primary", `oklch(${primaryOklch})`)
        root.style.setProperty("--ring", `oklch(${primaryOklch})`)
      }

      if (config.cor_secundaria) {
        const secondaryOklch = hexToOklch(config.cor_secundaria)
        root.style.setProperty("--secondary", `oklch(${secondaryOklch})`)
      }

      if (config.cor_destaque) {
        const accentOklch = hexToOklch(config.cor_destaque)
        root.style.setProperty("--accent", `oklch(${accentOklch})`)
      }
    }
  }, [config, loading])

  return <>{children}</>
}
