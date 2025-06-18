"use client"

import { useEffect, useState } from "react"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: false,
    },
  },
}

interface ChartData {
  labels: string[]
  revenue: number[]
  orders: number[]
}

export function Overview() {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    revenue: [],
    orders: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:8000/api/admin/dashboard/chart", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error("Failed to fetch chart data")
        }

        const data = await response.json()
        setChartData(data)
      } catch (error) {
        console.error("Error fetching chart data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  if (loading) {
    return <div className="flex h-[300px] items-center justify-center">Loading...</div>
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Pendapatan",
        data: chartData.revenue,
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
      {
        label: "Pesanan",
        data: chartData.orders,
        backgroundColor: "rgba(99, 102, 241, 0.5)",
      },
    ],
  }

  return <Bar options={options} data={data} height={300} />
}
