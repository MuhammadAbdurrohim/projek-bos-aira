"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Play, Pause, Video, Users } from "lucide-react"

// Data dummy untuk contoh
const liveStreams = [
  {
    id: 1,
    title: "Flash Sale Produk Fashion",
    host: "Dewi Lestari",
    status: "Live",
    viewers: 256,
    duration: "01:23:45",
    thumbnail: "https://source.unsplash.com/800x600/?fashion",
    scheduledAt: "2024-03-20 15:00"
  },
  {
    id: 2,
    title: "Koleksi Sepatu Terbaru",
    host: "Budi Santoso",
    status: "Terjadwal",
    viewers: 0,
    duration: "00:00:00",
    thumbnail: "https://source.unsplash.com/800x600/?shoes",
    scheduledAt: "2024-03-21 19:00"
  },
  {
    id: 3,
    title: "Promo Gadget Minggu Ini",
    host: "Rini Wijaya",
    status: "Selesai",
    viewers: 1205,
    duration: "02:15:30",
    thumbnail: "https://source.unsplash.com/800x600/?gadget",
    scheduledAt: "2024-03-19 14:00"
  }
]

const statusColors = {
  "Live": "bg-red-100 text-red-700",
  "Terjadwal": "bg-blue-100 text-blue-700",
  "Selesai": "bg-gray-100 text-gray-700"
}

export default function LiveStreamPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredStreams = liveStreams.filter(stream => {
    const matchesSearch = stream.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || stream.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Live Stream</h1>
        <Button>
          <Video className="mr-2 h-4 w-4" />
          Buat Live Stream
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari live stream..."
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
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="Live">Live</SelectItem>
            <SelectItem value="Terjadwal">Terjadwal</SelectItem>
            <SelectItem value="Selesai">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStreams.map((stream) => (
          <Card key={stream.id}>
            <CardHeader className="relative p-0">
              <img
                src={stream.thumbnail}
                alt={stream.title}
                className="aspect-video w-full rounded-t-lg object-cover"
              />
              <div className="absolute left-2 top-2 flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  statusColors[stream.status as keyof typeof statusColors]
                }`}>
                  {stream.status === "Live" && <span className="mr-1 h-2 w-2 rounded-full bg-red-600" />}
                  {stream.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="line-clamp-1 text-lg">{stream.title}</CardTitle>
              <CardDescription className="mt-2">
                Host: {stream.host}
              </CardDescription>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {stream.viewers}
                </div>
                <div>{stream.scheduledAt}</div>
              </div>
              <div className="mt-4">
                <Button className="w-full" variant={stream.status === "Live" ? "destructive" : "secondary"}>
                  {stream.status === "Live" ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Hentikan
                    </>
                  ) : stream.status === "Terjadwal" ? (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Mulai
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-4 w-4" />
                      Lihat Rekaman
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
