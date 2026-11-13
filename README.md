# Kasir UMKM Offline

Aplikasi kasir (POS) ringan untuk warung, kedai kopi, toko kecil, sampai booth bazar. Cukup buka di browser HP, tablet, atau laptop. Semua data tersimpan di perangkat itu sendiri, jadi tetap jalan walau sinyal hilang.

Dibuat murni dengan HTML, CSS, dan JavaScript. Tidak perlu server, database, atau langganan apa pun.

## Fitur

- **Produk & stok**: kategori, stok per produk, dan varian harga (misal Reguler/Large, Hot/Ice).
- **Kasir cepat**: cari produk, filter kategori, ketuk untuk masuk keranjang, atur jumlah.
- **Diskon** dalam Rupiah atau persen.
- **Metode bayar**: tunai (dengan tombol uang cepat + kembalian otomatis), QRIS (gambar statis), transfer bank.
- **Struk 58mm** siap cetak ke printer thermal lewat dialog cetak browser.
- **Riwayat transaksi** per tanggal, cetak ulang, dan batalkan (stok kembali otomatis).
- **Laporan** harian (per jam) dan bulanan (per tanggal), omzet, rata-rata per struk, produk terlaris, ringkasan metode bayar.
- **Ekspor/impor**: produk ke/dari CSV, transaksi ke CSV (bisa dibuka di Excel/Google Sheets), backup & pulihkan semua data dalam JSON.
- **Multi-kasir** dengan PIN 4 angka. Peran *admin* bisa kelola produk/pengaturan; peran *kasir* hanya jualan.
- **PWA**: bisa di-install seperti aplikasi dan dibuka tanpa internet.
- **Data contoh** (kedai kopi + transaksi 30 hari) supaya langsung bisa dicoba.

## Cara menjalankan (pemula)

### Coba di komputer
1. Unduh/clone folder ini.
2. Buka terminal di folder ini lalu jalankan `python3 -m http.server 8000` (atau pakai ekstensi *Live Server* di VS Code).
3. Buka `http://localhost:8000` di Chrome.
4. Pilih **Admin**, masukkan PIN **1234**. Kasir contoh lain: **Sari**, PIN **1111**.

> Bisa juga klik ganda `index.html`, tapi fitur *install* dan offline (service worker) hanya aktif lewat `http://localhost` atau HTTPS.

### Pakai beneran di HP
1. Unggah folder ini ke hosting statis gratis yang HTTPS: GitHub Pages, Netlify, Vercel, atau Cloudflare Pages.
   - GitHub Pages: buat repo, unggah semua berkas, buka **Settings → Pages → Deploy from branch → main / root**.
2. Buka alamatnya di Chrome HP, lalu menu ⋮ → **Install aplikasi** / **Tambahkan ke layar utama**.
3. Setelah sekali dibuka, aplikasi tetap jalan walau mode pesawat.

### Langkah awal setelah masuk
1. Buka **Atur** → isi profil toko (nama, alamat, telepon, catatan struk, nomor rekening).
2. Ganti PIN: tambah kasir/admin baru dengan PIN sendiri, lalu hapus akun contoh.
3. Di **Atur → Data**, klik **Hapus semua data** kalau mau mulai dari nol (PIN admin kembali 1234).
4. Tambah produk di menu **Produk**, atau impor CSV.

### Format CSV produk
```
nama,kategori,stok,varian
Kopi Susu,Kopi,40,Reguler:18000|Large:23000
Roti Bakar,Camilan,20,Cokelat:15000|Keju:17000
```
Produk dengan nama sama akan diperbarui, bukan diduplikasi.

### Mencetak struk 58mm
Sambungkan printer thermal (USB/Bluetooth) ke perangkat, lalu tekan **Cetak struk**. Di dialog cetak pilih printernya, ukuran kertas 58mm, margin *None*. Di Android biasanya perlu aplikasi layanan cetak dari pembuat printer (misal RawBT).

## Struktur folder
```
kasir-umkm/
├── index.html            # kerangka halaman
├── style.css             # tampilan + gaya struk cetak
├── app.js                # semua logika aplikasi
├── tema.css, tema.js     # warna, sudut, huruf, nama usaha, mode
├── DESIGN.md             # arah desain, token, komponen, motion
├── AGENTS.md, .claude/   # panduan untuk AI (Claude, Cursor, Copilot)
├── sw.js                 # service worker (offline)
├── manifest.webmanifest  # info PWA
├── ikon.svg              # ikon aplikasi
├── qris.svg              # CONTOH QRIS — ganti dengan QRIS tokomu
├── meta.json, LICENSE, README.md, ss.png
```

## Ganti warna & nama
Semua warna, sudut, huruf, dan nama usaha diatur di dua berkas kecil (juga yang diubah otomatis oleh customizer di malikisaputra.biz.id/kode):
- `tema.css`: `--tema-utama` (tombol, sorotan), `--tema-aksen` (menu aktif, uang cepat, kembalian, nada kotak ilustrasi), `--tema-radius` (sudut), `--tema-font` (huruf Google Fonts: Plus Jakarta Sans, Inter, Poppins, DM Sans, Space Grotesk, Nunito — ganti juga `href` pada `<link id="fontTema">` di `index.html`).
- `tema.js`: `nama` (nama usaha di layar; dipakai sebagai nama toko bawaan selama belum diganti lewat menu **Atur**) dan `mode`: `"terang"`, `"gelap"`, atau `"auto"` (ikut setelan HP).

Warna lain (versi muda/tua, latar, garis, mode gelap) diturunkan otomatis dengan `color-mix()` di `style.css`. Teks di atas warna utama dihitung otomatis (putih/gelap) dari terang-gelapnya warna, tapi warna utama yang cukup gelap (setara teal-700 / ungu-600) paling enak dibaca. Arah desain lengkap ada di `DESIGN.md`.

Warna per bagian: `tema.css` juga punya `--tema-latar` (latar halaman), `--tema-panel` (kartu/panel/form), `--tema-nav` (sidebar/header/nav bawah), `--tema-teks` (teks utama). Mode gelap memakai palet gelap paket kecuali customizer mengirim nilai bagian. Warna teks di atas nav & tombol utama dihitung otomatis (terang/gelap) dari luminansi.

## Ubah brand lainnya
- Nama toko di struk: menu **Atur** di aplikasi (setelah diganti di sini, `tema.js` tidak lagi menimpanya).
- QRIS: simpan gambar QRIS tokomu (PNG/SVG), beri nama `qris.svg` (atau ubah `src` di `app.js`, cari `qris.svg`).
- Ikon: ganti `ikon.svg`. Kalau berkas diubah, naikkan versi `CACHE` di `sw.js` (misal `kasir-umkm-v2`) agar HP mengambil versi baru.

## Ubah pakai Claude
Paket ini membawa Agent Skill di `.claude/skills/ubah-kasir-umkm/SKILL.md` (peta berkas, letak tema, cara menambah fitur, aturan aman) dan `AGENTS.md` untuk Cursor/Copilot/Codex.

- **Claude Code / Claude Desktop**: buka folder paket ini; skill di `.claude/skills` terbaca otomatis. Tinggal minta, misal "tambah field barcode di produk".
- **claude.ai**: unduh ZIP skill (tombol **Unduh Skill** di [malikisaputra.biz.id/kode](https://malikisaputra.biz.id/kode)), lalu di claude.ai buka **Customize › Skills › tombol "+" › Create skill › Upload a skill** dan pilih ZIP itu (folder skill sebagai akar ZIP). Syarat: **Code execution and file creation** aktif di **Settings › Capabilities** (paket Free/Pro/Max); di Team/Enterprise diatur oleh Owner. Sumber: support.claude.com/en/articles/12512180 (dicek 6 Nov 2026).

## Mau hasil lebih maksimal?
Pasang skill desain berikut di Claude Code sebelum minta perubahan tampilan:
- impeccable — https://github.com/pbakaus/impeccable (Apache-2.0, dicek 6 Nov 2026)
- ui-ux-pro-max — https://github.com/nextlevelbuilder/ui-ux-pro-max-skill (MIT menurut GitHub API, dicek 6 Nov 2026)

## Catatan penting
- Data tersimpan di browser perangkat (localStorage). Menghapus data situs/browser = data hilang. **Rajin backup JSON** (misal tiap minggu) dan simpan di Google Drive.
- PIN di sini untuk membedakan kasir, bukan pengamanan tingkat bank.
- QRIS yang disertakan hanya gambar contoh, bukan kode pembayaran asli.

## Ganti logo & foto
- **Logo toko**: timpa `img/logo.svg` (persegi 1:1, PNG/JPG/SVG), atau ubah path `KONFIG.logo` di bagian atas `app.js`. Logo tampil di sidebar, layar masuk, dan struk cetak. Bila gagal dimuat, muncul inisial nama toko. Isi `''` untuk kembali ke ikon bawaan.
- **Foto produk**: menu **Kelola › Ubah produk › Foto produk** — foto diperkecil otomatis (maks 400px) dan disimpan di perangkat (localStorage). Tanpa foto, produk memakai ilustrasi bawaan.
- Foto produk contoh bisa dipasang lewat `KONFIG.fotoProduk` (nama produk → path, mis. `img/mie.jpg`). `img/produk-contoh.svg` adalah contoh ukuran (1:1).

## Lisensi
MIT + syarat tambahan (lihat `LICENSE`): gratis dipakai untuk usaha/organisasi sendiri dan boleh diubah, **wajib mencantumkan kreator** (Template oleh Maliki Saputra, @malikisaputra), dan **tidak boleh diperjualbelikan** tanpa izin. Mau menjual atau kerja sama? Diskusikan dulu dengan kreatornya.

---
Dibuat oleh **Maliki Studio** — [malikisaputra.biz.id](https://malikisaputra.biz.id), follow TikTok/IG **@malikisaputra**

---

<!-- kredit-maliki -->
**Kredit:** Template oleh Maliki Saputra (@malikisaputra) — https://malikisaputra.biz.id. Kredit di footer & kepala berkas wajib dipertahankan (lihat LICENSE).

<!-- panduan-ai-maliki -->
## Ubah sendiri sesuai kebutuhanmu pakai AI

Kamu tidak perlu jago coding. Template ini sudah disiapkan supaya mudah diubah AI: ada **AGENTS.md** (aturan proyek untuk AI), **DESIGN.md** (gaya desain), dan skill Claude di folder `.claude/skills/`. Pilih salah satu cara di bawah.

### Cara 1: ChatGPT, Claude, atau Gemini di browser (paling gampang, gratis)
1. Unduh ZIP template ini, lalu ekstrak.
2. Buka chatgpt.com, claude.ai, atau gemini.google.com.
3. Unggah berkas yang mau diubah (biasanya `index.html`, `style.css`, `app.js`, atau berkas data). Unggah juga `AGENTS.md` dan `DESIGN.md` (kalau ada) biar AI paham aturannya. ChatGPT juga bisa menerima ZIP utuh.
4. Tulis permintaanmu (contoh di bawah), lalu minta: "Kirim ulang berkas yang diubah secara utuh."
5. Ganti berkas lama dengan hasil dari AI, lalu buka `index.html` di browser untuk cek.

### Cara 2: Claude Code (paling rapi untuk perubahan besar)
1. Pasang Claude Code (lihat claude.com/claude-code), atau pakai aplikasi Claude Desktop tab Code.
2. Buka folder template ini, lalu jalankan `claude` di terminal folder itu.
3. Tulis permintaanmu. Kalau ada folder `.claude/skills/ubah-…`, Claude Code otomatis memakainya, jadi hasilnya tetap mengikuti desain aslinya.

### Cara 3: Codex (OpenAI)
1. Pasang Codex CLI atau pakai Codex di aplikasi ChatGPT.
2. Buka folder template, jalankan `codex`. Codex otomatis membaca `AGENTS.md`.
3. Tulis permintaanmu, cek perubahannya, lalu setujui.

### Cara 4: Google Antigravity atau Gemini CLI (gratis)
1. Antigravity: buka aplikasinya, pilih **Open Folder** ke folder template ini, lalu tulis permintaan di panel agen.
2. Gemini CLI: jalankan `gemini` di folder template.
3. Di awal, tulis: "Baca AGENTS.md dan DESIGN.md dulu sebelum mengubah apa pun."

### Contoh permintaan yang bisa langsung kamu pakai
- "Ganti nama, logo teks, dan warna utama jadi hijau tua sesuai usahaku: [nama usaha]."
- "Tambahkan kolom [nama kolom] di formulir dan tampilkan di daftar."
- "Ubah semua data contoh jadi data usahaku: [tempel datanya]."
- "Tambahkan halaman/menu baru untuk [kebutuhan], gaya desainnya sama dengan yang sudah ada."
- "Jelaskan dulu cara kerja aplikasi ini dengan bahasa sederhana, baru ubah [bagian]."

### Tips biar hasilnya bagus
- Satu permintaan = satu perubahan. Cek dulu hasilnya, baru minta yang berikutnya.
- Simpan salinan folder asli sebelum mengubah, jadi bisa balik kalau ada yang rusak.
- Kalau ada error, salin pesan errornya (klik kanan > Inspect > Console) lalu tempel ke AI.
- Data aplikasi tersimpan di browser (localStorage). Backup dulu sebelum ganti versi.
- Jangan hapus kredit "Template oleh @malikisaputra", dan template ini **tidak boleh diperjualbelikan** tanpa izin. Mau menjual atau kerja sama? Diskusikan dulu dengan kreatornya (@malikisaputra).

Masih bingung? Komen di TikTok/IG **@malikisaputra**, nanti aku bantu.
