# SIGAP Bencana — Frontend

Frontend SIGAP Bencana, platform peringatan dini dan pelaporan bencana, adalah aplikasi
Svelte SPA berbasis Vite. Halaman berada di
`src/pages`, aset publik yang disalin saat build berada di `public`, dan
`index.html` ada di root aplikasi.

## Menjalankan

```sh
bun install
bun run dev
```

Backend berada pada repository BE terpisah. Saat development lokal, jalankan
backend pada port `8787`, lalu salin `.env.example` ke `.env.local` dan biarkan
`VITE_API_URL` kosong agar request `/api` memakai proxy Vite. Saat deploy ke Vercel,
isi `VITE_API_URL` dengan base URL HTTPS backend lalu redeploy.

## Validasi dan build

```sh
bun run check
bun run lint
bun run test:coverage
bun run build
bun run preview
```

Build static SPA dibuat ke `dist`.

## Repository backend

API Express.js + PostgreSQL yang sebelumnya berada di folder `backend/` dipindahkan
ke repository BE terpisah. Panduan deploy frontend: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
Panduan form audit Lighthouse & Axe Core: `docs/AUDIT.md`.

## Deploy produksi

Deploy repository ini ke Vercel dengan root directory `.`, build command
`npm run build`, dan output directory `dist`. Deploy backend repository secara
terpisah ke host Node.js, lalu set `VITE_API_URL` pada project Vercel ke URL BE.
