"use client"

import { useEffect, useState } from "react"
import { Avatar } from "@/components/ui/avatar"

interface RecentSale {
  id: number
  user: {
    name: string
    email: string
    avatar: string
  }
  amount: number
}

export function RecentSales() {
  const [sales, setSales] = useState<RecentSale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentSales = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:8000/api/admin/dashboard/recent-sales", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error("Failed to fetch recent sales")
        }

        const data = await response.json()
        setSales(data)
      } catch (error) {
        console.error("Error fetching recent sales:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentSales()
  }, [])

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center">Loading...</div>
  }

  return (
    <div className="space-y-8">
      {sales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <img
              alt={`${sale.user.name}'s avatar`}
              src={sale.user.avatar}
              className="rounded-full"
            />
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium">{sale.user.name}</p>
            <p className="text-sm text-muted-foreground">
              {sale.user.email}
            </p>
          </div>
          <div className="ml-auto font-medium">
            Rp{sale.amount.toLocaleString("id-ID")}
          </div>
        </div>
      ))}
    </div>
  )
}
