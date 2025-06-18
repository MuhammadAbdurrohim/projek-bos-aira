"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Box,
  BarChart,
  Settings,
  Video
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Produk",
    href: "/dashboard/produk",
    icon: ShoppingBag
  },
  {
    title: "Kategori",
    href: "/dashboard/kategori",
    icon: Box
  },
  {
    title: "Pesanan",
    href: "/dashboard/pesanan",
    icon: BarChart
  },
  {
    title: "Pengguna",
    href: "/dashboard/pengguna",
    icon: Users
  },
  {
    title: "Live Stream",
    href: "/dashboard/live-stream",
    icon: Video
  },
  {
    title: "Pengaturan",
    href: "/dashboard/pengaturan",
    icon: Settings
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-64 flex-col border-r">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold">Airastore</span>
        </Link>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          Airastore Admin v1.0.0
        </p>
      </div>
    </aside>
  )
}
