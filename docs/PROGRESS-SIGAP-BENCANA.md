# Progres Migrasi: SigapAsap → SIGAP Bencana + PostgreSQL

Terakhir dikerjakan: 13 November 2026. **Belum ada commit** (sesuai permintaan, perubahan direview dulu).

> Catatan: dokumen ini adalah catatan historis dari struktur monorepo sebelum source
> backend dipisahkan. Source BE sekarang dikelola di repository GitHub terpisah.

## Keputusan

- Kode backend lama (Express + SQLite) tidak ada di mesin ini, jadi **backend dibuat ulang** dengan Express 5 + PostgreSQL. Kontrak API-nya mengikuti respons backend yang sudah ter-deploy.
- Rebrand dilakukan sampai **generalisasi konten**: aplikasi kini mencakup bencana umum (banjir, longsor, gempa, karhutla, erupsi, cuaca ekstrem), sedangkan fitur karhutla (titik api, lintasan asap, AQI) tetap dipertahankan.

## 1. Backend baru (`backend/`)

> Pada saat catatan ini dibuat, backend berada di folder `backend/` pada monorepo.

| File | Isi |
| --- | --- |
| `package.json` | Script: `start`, `dev`, `migrate`, `seed`, `setup`, `test`. Dependensi: express, pg, cors |
| `src/config.js` | Membaca `.env` (via `process.loadEnvFile`); `JWT_SECRET` wajib saat production |
| `src/db/pool.js` | Pool `pg` |
| `src/db/schema.sql` | Tabel `users`, `reports` (ada kolom `category`), `news`, `hotspots`, `sync_state` |
| `src/db/migrate.js`, `src/db/seed.js`, `src/cli.js` | Migrasi idempoten; seed 7 berita kebencanaan + akun `auditor` / `Auditor123!` |
| `src/lib/auth.js` | Hash scrypt, JWT HS256, `requireAuth` / `optionalAuth` |
| `src/lib/http.js` | `HttpError`, `ok()`, `toNumber()`, cache in-memory, `fetchJson` / `fetchText` |
| `src/lib/geo.js` | 38 ibu kota provinsi, haversine, `nearestProvince`, `destination` |
| `src/services/firms.js` | Sinkronisasi NASA FIRMS → tabel `hotspots` (butuh `FIRMS_MAP_KEY`) |
| `src/services/weather.js` | Open-Meteo (cuaca, AQI, waktu aman, angin); WAQI opsional (`WAQI_TOKEN`) |
| `src/services/rss.js` | Berita eksternal dari RSS CNBC, difilter dengan kata kunci bencana |
| `src/services/recommendations.js` | 12 aturan saran kesehatan (4 tingkat AQI × 3 profil) |
| `src/routes/*.js` | Semua endpoint: auth, reports, news, hotspots, stats, environment, safe-window, recommendations, trajectory |
| `src/app.js`, `src/server.js` | Rakitan Express, CORS, error handler, `/health` |
| `test/api.test.js`, `test/firms.test.js` | 21 tes integrasi (pakai `TEST_DATABASE_URL`) |
| `README.md`, `.env.example`, `.gitignore` | Dokumentasi dan contoh konfigurasi |

Jenis bencana (`reports.category`): `banjir`, `longsor`, `gempa`, `karhutla`, `erupsi`, `cuaca`, `lainnya`. Daftar ini harus sama di tiga tempat: `schema.sql`, `src/routes/reports.js`, dan `src/lib/disaster.ts` (frontend).

### Database lokal (sudah dibuat)

- PostgreSQL 17 lokal untuk development
- `sigap_bencana`: sudah di-migrate dan di-seed untuk development
- `sigap_bencana_test`: khusus `npm test`, isinya dikosongkan setiap kali tes jalan
- File environment lokal tidak termasuk source repository.

### Status verifikasi backend ✅

- `npm test`: 21/21 lulus
- Uji manual server dengan layanan asli: environment, safe-window, stats, trajectory, news, berita eksternal, login, POST laporan, dan `reports/mine` semuanya berjalan

## 2. Frontend

**File baru**

- `src/lib/disaster.ts`: daftar jenis bencana dan `disasterCategory()` (nilai kosong atau tidak dikenal jatuh ke "Lainnya")
- `src/lib/DisasterCategoryPicker.svelte`: grup tombol pemilih jenis bencana, dipakai di Lapor dan Peta

**File yang diubah**

- `src/pages/Lapor.svelte`: pemilih jenis bencana, `category` ikut di body POST, badge kategori di feed, placeholder umum
- `src/pages/Peta.svelte`: modal "Lapor Kejadian Bencana" dengan pemilih kategori, branding panel
- `src/lib/MyReportList.svelte`: menampilkan jenis bencana
- `src/lib/auth.svelte.ts`: `MyReport.category`; key token jadi `sigapbencana_token` (pengguna lama perlu login ulang)
- `src/App.svelte`: logo "SIGAP Bencana", meta, deskripsi footer, sumber data (OpenAQ diganti BNPB), copyright
- `src/pages/Home.svelte`, `Tentang.svelte` (arsitektur dikoreksi jadi Express + PostgreSQL), `Berita.svelte`, `BeritaDetail.svelte`, `Statistik.svelte`: teks digeneralisasi
- Judul dan meta di `Login`, `Register`, `Dashboard`, `LaporanSaya`, `Profil`, `Pengaturan`, `NotFound`
- `index.html`, `public/llms.txt`, `public/ai-catalog.json`, `public/.well-known/ai-catalog.json`, `public/favicon.svg` (ikon segitiga peringatan)
- Tes: `pages.test.ts`, `account.test.ts`, `App.test.ts`, `auth.test.ts` disesuaikan

### Status verifikasi frontend ✅

- `vitest --coverage`: 96/96 lulus, coverage 100% (statements, branches, functions, lines)
- `svelte-check`: 0 error, 0 warning
- `npm run build`: berhasil (peringatan ukuran chunk maplibre sudah ada sejak sebelumnya)
- Prettier: semua file yang berubah lolos `prettier --check`
- ESLint: 60 error yang tersisa **semuanya sudah ada di HEAD** (dibandingkan per file; tidak ada error baru, di `pages.test.ts` malah berkurang satu). Kebanyakan `no-explicit-any` dan `no-unused-vars` di `Peta.svelte`, `Statistik.svelte`, `src/test/setup.ts`, dan `scripts/*.cjs`
- Peringatan `prettier --check .` pada file seperti `vercel.json` dan `vite.config.ts` hanya akibat akhir baris CRLF di checkout Windows (`core.autocrlf=true`); isinya sama dengan repo

## 3. Sudah diselesaikan pada 13 November

- Perbandingan lint dengan HEAD (lihat di atas)
- Build produksi
- `README.md` dan `docs/AUDIT.md` di-rebrand; kontrak API di AUDIT kini menyebut PostgreSQL serta field `category` dan `severity`
- `backend` dikeluarkan dari `.gitignore` root
- 10 file yang sebelumnya hanya berubah akhir baris (akibat `prettier --write`) dikembalikan seperti semula

## 4. Sisa pekerjaan

1. Review lalu commit perubahan (disarankan di branch baru, bukan langsung di `main`).
2. Email kontak `infoSigapAsap@gmail.com` di footer `App.svelte` sengaja dibiarkan sampai ada alamat baru yang aktif.
3. Deploy backend: siapkan PostgreSQL di server, set `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, dan sebaiknya `FIRMS_MAP_KEY` (tanpa key ini peta titik panas kosong), lalu jalankan `npm run setup`.
4. Data SQLite di server lama **tidak dimigrasikan** (file `.db` dan skemanya tidak tersedia). Jika data lama perlu dipertahankan, ambil file `.db`-nya dari server.
5. Opsional: bereskan 60 error eslint lama agar `bun run lint` lolos penuh.

## Catatan lingkungan

- `bun install` merusak `node_modules` di folder OneDrive (banyak folder `dist` kosong). Dependensi frontend dipasang dengan `npm install --no-package-lock --no-save`, dan `bun.lock` sudah dikembalikan ke kondisi semula.
- Menjalankan tes frontend: `npx vitest run --coverage`
- Menjalankan backend: `cd backend && npm run dev` (port 8787; `vite dev` mem-proxy `/api` ke port ini)
