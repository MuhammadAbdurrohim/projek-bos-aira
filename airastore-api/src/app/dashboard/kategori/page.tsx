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
  Plus, 
  Search,
  Edit,
  Trash2,
  Box
} from "lucide-react"

// Data dummy untuk contoh
const categories = [
  {
    id: 1,
    name: "Pakaian",
    description: "Berbagai jenis pakaian pria dan wanita",
    totalProducts: 150,
    status: "Aktif"
  },
  {
    id: 2,
    name: "Sepatu",
    description: "Koleksi sepatu casual dan formal",
    totalProducts: 80,
    status: "Aktif"
  },
  {
    id: 3,
    name: "Aksesoris",
    description: "Aksesoris fashion dan perhiasan",
    totalProducts: 200,
    status: "Aktif"
  },
  {
    id: 4,
    name: "Elektronik",
    description: "Gadget dan peralatan elektronik",
    totalProducts: 45,
    status: "Tidak Aktif"
  },
]

export default function CategoryPage() {
  const [search, setSearch] = useState("")

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kategori</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kategori..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="p-6">
              <div className="flex items-center gap-2">
                <Box className="h-5 w-5" />
                <h3 className="text-lg font-semibold">{category.name}</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {category.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {category.totalProducts} Produk
                </span>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    category.status === "Aktif"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {category.status}
                </span>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
