"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  activeUsers: number
  activeLiveStreams: number
  revenueGrowth: number
  ordersGrowth: number
  usersGrowth: number
  liveStreamsGrowth: number
}
import { Overview } from "@/components/dashboard/overview"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { 
  ShoppingBag, 
  Users, 
  CreditCard, 
  Activity 
} from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    activeLiveStreams: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    usersGrowth: 0,
    liveStreamsGrowth: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:8000/api/admin/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats")
        }

        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp{stats.totalRevenue.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.revenueGrowth > 0 ? "+" : ""}{stats.revenueGrowth}% dari bulan lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesanan</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalOrders.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.ordersGrowth > 0 ? "+" : ""}{stats.ordersGrowth}% dari bulan lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengguna Aktif</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeUsers.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.usersGrowth > 0 ? "+" : ""}{stats.usersGrowth}% dari bulan lalu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Stream Aktif</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeLiveStreams}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.liveStreamsGrowth > 0 ? "+" : ""}{stats.liveStreamsGrowth}% dari kemarin
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ikhtisar</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Penjualan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
