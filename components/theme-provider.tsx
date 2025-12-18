"use client"

import type React from "react"

import { useEffect } from "react"
import { useConfig } from "@/hooks/use-config"

function hexToOklch(hex: string): string {
  // Remove o # se existir
  hex = hex.replace("#", "")

  // Converte hex para RGB
  const r = Number.parseInt(hex.substring(0, 2), 16) / 255
  const g = Number.parseInt(hex.substring(2, 4), 16) / 255
  const b = Number.parseInt(hex.substring(4, 6), 16) / 255

  // Conversão simplificada para OKLCH (aproximação)
  // Para produção, use uma biblioteca como culori
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const c = Math.sqrt((r - l) ** 2 + (g - l) ** 2 + (b - l) ** 2) * 0.5
  const h = Math.atan2(b - l, r - l) * (180 / Math.PI)

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
