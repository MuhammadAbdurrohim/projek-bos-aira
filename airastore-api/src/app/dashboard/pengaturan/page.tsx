"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Pengaturan</h1>

      <Tabs defaultValue="umum" className="w-full">
        <TabsList>
          <TabsTrigger value="umum">Umum</TabsTrigger>
          <TabsTrigger value="tampilan">Tampilan</TabsTrigger>
          <TabsTrigger value="notifikasi">Notifikasi</TabsTrigger>
          <TabsTrigger value="keamanan">Keamanan</TabsTrigger>
        </TabsList>

        <TabsContent value="umum">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Umum</CardTitle>
              <CardDescription>
                Kelola pengaturan dasar toko online Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="store-name">Nama Toko</Label>
                <Input id="store-name" defaultValue="Airastore" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-description">Deskripsi Toko</Label>
                <Textarea
                  id="store-description"
                  defaultValue="Toko fashion online terpercaya dengan berbagai koleksi terbaru"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email Kontak</Label>
                <Input
                  id="contact-email"
                  type="email"
                  defaultValue="contact@airastore.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  type="tel"
                  defaultValue="+62 812-3456-7890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  defaultValue="Jl. Sudirman No. 123, Jakarta Pusat"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tampilan">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Tampilan</CardTitle>
              <CardDescription>
                Sesuaikan tampilan toko online Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mode Gelap</Label>
                  <CardDescription>
                    Aktifkan mode gelap untuk tampilan yang lebih nyaman
                  </CardDescription>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animasi</Label>
                  <CardDescription>
                    Aktifkan animasi untuk pengalaman yang lebih menarik
                  </CardDescription>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifikasi">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Notifikasi</CardTitle>
              <CardDescription>
                Atur preferensi notifikasi Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifikasi Email</Label>
                  <CardDescription>
                    Terima notifikasi pesanan baru melalui email
                  </CardDescription>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifikasi Push</Label>
                  <CardDescription>
                    Terima notifikasi push di browser
                  </CardDescription>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifikasi WhatsApp</Label>
                  <CardDescription>
                    Terima notifikasi melalui WhatsApp
                  </CardDescription>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keamanan">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Keamanan</CardTitle>
              <CardDescription>
                Kelola pengaturan keamanan akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autentikasi Dua Faktor</Label>
                  <CardDescription>
                    Tingkatkan keamanan dengan verifikasi dua langkah
                  </CardDescription>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current-password">Password Saat Ini</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password Baru</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button>Ubah Password</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
