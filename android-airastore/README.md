# AiraStore Android Application

## Fitur Utama

- **Live Streaming & Chat**  
  Pengguna dapat menonton live streaming produk secara real-time dan berinteraksi melalui fitur chat yang terintegrasi menggunakan ZegoCloud SDK.

- **Daftar Produk**  
  Menampilkan daftar produk yang dapat dibeli langsung dari aplikasi dengan fitur keranjang belanja.

- **Navigasi Mudah**  
  Navigasi yang intuitif antara halaman utama, detail produk, dan live streaming.

- **Sinkronisasi Data dengan Backend**  
  Data produk, live stream, dan komentar disinkronkan secara real-time dengan backend API.

- **Kategori Produk Dinamis**  
  Pengguna dapat memfilter produk berdasarkan kategori yang ditampilkan secara dinamis.

- **Banner Promosi**  
  Menampilkan banner promosi yang dapat diubah dari backend.

- **Preview Live Stream di Halaman Utama**  
  Menampilkan preview live stream yang sedang berlangsung di halaman utama.

## Halaman & Fitur

### HomeFragment  
- Menampilkan daftar produk dan preview live streaming dalam bentuk horizontal RecyclerView.  
- Pengguna dapat memilih produk untuk melihat detail atau menambah ke keranjang.  
- Pengguna dapat memilih live stream untuk menonton dan berinteraksi.  
- Fitur pencarian produk dengan SearchView.  
- Swipe to refresh untuk memuat ulang data produk dan live stream.  
- Menampilkan status loading dan empty state.

### LiveStreamActivity  
- Menampilkan video live streaming menggunakan ZegoCloud SDK.  
- Menampilkan chat real-time dengan fitur mengirim dan menerima pesan.  
- Menampilkan produk yang sedang dipromosikan selama live streaming dengan opsi pembelian langsung.  
- Integrasi dengan ZegoLiveHelper untuk manajemen live stream.  
- Menampilkan statistik live stream (akan dikembangkan di CMS admin panel).

### Produk Detail (belum diimplementasi)  
- Menampilkan detail lengkap produk dan opsi pembelian.

## Alur Penggunaan Aplikasi

1. **Pengguna membuka aplikasi** dan melihat halaman utama (HomeFragment) yang menampilkan produk, kategori, banner promosi, dan preview live streaming yang sedang berlangsung.

2. **Pengguna dapat mencari produk** menggunakan fitur pencarian dan memfilter berdasarkan kategori.

3. **Pengguna memilih live stream** dari daftar live streaming untuk masuk ke LiveStreamActivity.

4. **Di LiveStreamActivity**, pengguna dapat menonton video live, melihat produk yang sedang dipromosikan, dan berinteraksi melalui chat real-time.

5. **Pengguna dapat menambahkan produk ke keranjang** langsung dari halaman live streaming atau halaman produk.

6. **Data live stream, produk, dan komentar disinkronkan** secara real-time dengan backend untuk memastikan informasi selalu up-to-date.

7. **Pengguna dapat melakukan refresh data** dengan fitur swipe to refresh di halaman utama.

## Konfigurasi

- Pastikan variabel environment ZegoCloud sudah dikonfigurasi di backend dan aplikasi Android (`ApiConfig.kt`):  
  - `ZEGO_APP_ID`  
  - `ZEGO_SERVER_SECRET`

- SDK ZegoCloud sudah terintegrasi di aplikasi Android melalui dependensi di `build.gradle`.

## Pengembangan Selanjutnya

- Implementasi halaman detail produk.  
- Penambahan fitur statistik live streaming di CMS admin panel.  
- Pengujian end-to-end untuk memastikan kestabilan fitur live streaming dan chat.  
- Optimalisasi UI/UX untuk pengalaman pengguna yang lebih baik.

---

Dokumentasi ini memberikan gambaran lengkap mengenai fitur dan alur aplikasi Android AiraStore berdasarkan kode yang sudah dibuat. Untuk informasi lebih lanjut atau bantuan pengembangan, silakan hubungi tim pengembang.
