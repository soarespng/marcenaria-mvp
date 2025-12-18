"use client"

import type { ReactNode } from "react"
import { useConfig } from "@/hooks/use-config"

interface AppHeaderProps {
  title: string
  children?: ReactNode
}

export function AppHeader({ title, children }: AppHeaderProps) {
  const { config, loading } = useConfig()

  if (loading) {
    return (
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded bg-muted" />
          <div className="space-y-2">
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
        {children && <div className="flex gap-2">{children}</div>}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between border-b px-6 py-4">
      <div className="flex items-center gap-3">
        {config?.logo_url && (
          <img
            src={config.logo_url || "/placeholder.svg"}
            alt={config.nome_empresa}
            className="h-8 w-auto object-contain"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold text-black">
            {title}
          </h1>
          {config?.nome_empresa && <p className="text-xs text-muted-foreground">{config.nome_empresa}</p>}
        </div>
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  )
}
