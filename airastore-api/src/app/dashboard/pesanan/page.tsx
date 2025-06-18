"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Eye } from "lucide-react"

// Data dummy untuk contoh
const orders = [
  {
    id: "ORD001",
    customer: "Budi Santoso",
    date: "2024-03-20",
    total: 450000,
    status: "Menunggu Pembayaran",
    items: 3
  },
  {
    id: "ORD002",
    customer: "Dewi Lestari",
    date: "2024-03-20",
    total: 750000,
    status: "Dikemas",
    items: 5
  },
  {
    id: "ORD003",
    customer: "Rini Wijaya",
    date: "2024-03-19",
    total: 250000,
    status: "Dikirim",
    items: 2
  },
  {
    id: "ORD004",
    customer: "Agus Setiawan",
    date: "2024-03-19",
    total: 1250000,
    status: "Selesai",
    items: 8
  },
]

const statusColors = {
  "Menunggu Pembayaran": "bg-yellow-100 text-yellow-700",
  "Dikemas": "bg-blue-100 text-blue-700",
  "Dikirim": "bg-purple-100 text-purple-700",
  "Selesai": "bg-green-100 text-green-700",
  "Dibatalkan": "bg-red-100 text-red-700"
}

export default function OrderPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pesanan</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari pesanan..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua Status</SelectItem>
            <SelectItem value="Menunggu Pembayaran">Menunggu Pembayaran</SelectItem>
            <SelectItem value="Dikemas">Dikemas</SelectItem>
            <SelectItem value="Dikirim">Dikirim</SelectItem>
            <SelectItem value="Selesai">Selesai</SelectItem>
            <SelectItem value="Dibatalkan">Dibatalkan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Pesanan</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Total Item</TableHead>
              <TableHead>Total Harga</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.items} item</TableCell>
                <TableCell>Rp{order.total.toLocaleString()}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      statusColors[order.status as keyof typeof statusColors]
                    }`}
                  >
                    {order.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
