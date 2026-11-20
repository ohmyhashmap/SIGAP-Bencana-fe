# Deploy Frontend SIGAP Bencana ke Vercel

Source repository frontend adalah isi root repository FE. Repository ini tidak
menyimpan source backend; backend dipindahkan dari folder `backend/` pada repository
gabungan ke repository BE terpisah.

## Pengaturan project Vercel

Import repository FE ke Vercel dengan pengaturan:

- **Root Directory:** `.` (root repository FE)
- **Framework Preset:** Vite
- **Install Command:** `npm ci`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Tambahkan environment variable `VITE_API_URL` berisi **base URL backend** HTTPS,
tanpa `/api/v1` dan tanpa slash akhir. Contoh:

```text
VITE_API_URL=https://sigap-api.example.com
```

Frontend menggunakan URL tersebut untuk memanggil
`https://sigap-api.example.com/api/v1/...`. Variabel `VITE_API_URL` dibenamkan ke
bundle saat build, jadi setiap perubahan nilai perlu diikuti redeploy.

Deploy frontend mungkin dilakukan sebelum backend, tetapi fitur yang memerlukan API
belum berfungsi sampai BE tersedia dan `VITE_API_URL` diset lalu frontend di-redeploy.
Jangan isi `localhost`; pada browser pengguna nilai tersebut menunjuk ke komputer
pengguna, bukan ke server backend.

## Development lokal

Jalankan BE pada port `8787`, lalu jalankan FE:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Biarkan `VITE_API_URL` kosong agar Vite meneruskan request `/api` ke
`http://localhost:8787`. Untuk production, isi URL BE publik pada pengaturan
Environment Variables Vercel, bukan commit URL lokal atau secret ke source code.

## Verifikasi

Setelah deploy:

1. Buka URL frontend Vercel dan pastikan halaman utama tampil.
2. Pada Developer Tools → Network, pastikan API mengarah ke domain BE HTTPS.
3. Uji halaman statistik, daftar/login, forum, dan akses API yang terproteksi.
4. Jika browser melaporkan CORS, set `CORS_ORIGIN` di BE menjadi origin FE Vercel
   yang tepat, misalnya `https://sigap-bencana-fe.vercel.app`, tanpa slash akhir.
