"use client"

import { Package, FileText, Users, LogOut, User, ImageIcon, Settings, Tag } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { useConfig } from "@/hooks/use-config" // Importando hook de configuração para usar cores personalizadas

const menuItems = [
  {
    title: "Produtos",
    icon: Package,
    href: "/app/produtos",
  },
  {
    title: "Categorias",
    icon: Tag,
    href: "/app/categorias",
  },
  {
    title: "Imagens",
    icon: ImageIcon,
    href: "/app/imagens",
  },
  {
    title: "Orçamentos",
    icon: FileText,
    href: "/app/orcamentos",
  },
  {
    title: "Contatos",
    icon: Users,
    href: "/app/contatos",
  },
  {
    title: "Configurações",
    icon: Settings,
    href: "/app/configuracoes",
  },
  {
    title: "Meu Perfil",
    icon: User,
    href: "/app/perfil",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { signOut, user, perfil } = useAuth()
  const { config } = useConfig() // Importando hook de configuração para usar cores personalizadas

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium">{perfil?.nome || "Usuário"}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <Button variant="outline" className="w-full bg-transparent hover:bg-transparent cursor-pointer" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}
