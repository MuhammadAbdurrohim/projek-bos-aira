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
import { Search, Edit, UserPlus, Ban } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

// Data dummy untuk contoh
const users = [
  {
    id: 1,
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    role: "Pelanggan",
    status: "Aktif",
    joinDate: "2024-01-15",
    avatar: "https://ui.shadcn.com/avatars/01.png"
  },
  {
    id: 2,
    name: "Dewi Lestari",
    email: "dewi.lestari@email.com",
    role: "Admin",
    status: "Aktif",
    joinDate: "2024-01-10",
    avatar: "https://ui.shadcn.com/avatars/02.png"
  },
  {
    id: 3,
    name: "Rini Wijaya",
    email: "rini.wijaya@email.com",
    role: "Pelanggan",
    status: "Tidak Aktif",
    joinDate: "2024-02-20",
    avatar: "https://ui.shadcn.com/avatars/03.png"
  },
  {
    id: 4,
    name: "Agus Setiawan",
    email: "agus@email.com",
    role: "Pelanggan",
    status: "Aktif",
    joinDate: "2024-03-01",
    avatar: "https://ui.shadcn.com/avatars/04.png"
  },
]

export default function UserPage() {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = !roleFilter || user.role === roleFilter
    const matchesStatus = !statusFilter || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pengguna</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari pengguna..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua Role</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Pelanggan">Pelanggan</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Semua Status</SelectItem>
            <SelectItem value="Aktif">Aktif</SelectItem>
            <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pengguna</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Bergabung</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <img
                        alt={user.name}
                        src={user.avatar}
                        className="rounded-full"
                      />
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    user.role === "Admin" 
                      ? "bg-purple-100 text-purple-700" 
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    user.status === "Aktif"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell>{user.joinDate}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={user.status === "Aktif" ? "text-red-600" : "text-green-600"}
                  >
                    <Ban className="h-4 w-4" />
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
