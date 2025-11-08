# Aplikasi Evaluasi Kesehatan Konsumen

Aplikasi web untuk mengevaluasi aplikasi kesehatan seluler berdasarkan kualitas, privasi, dan literasi pengguna.

## Fitur

### Fitur Utama
- ✅ **Evaluasi Aplikasi Kesehatan**: Evaluasi berbagai aplikasi kesehatan berdasarkan kriteria kualitas, privasi, dan literasi
- ✅ **Matriks Penilaian**: Tampilan matriks evaluasi yang komprehensif untuk setiap aplikasi
- ✅ **Rekomendasi Perbaikan**: Rekomendasi spesifik untuk meningkatkan kualitas aplikasi
- ✅ **Pencarian & Filter**: Fitur pencarian dan filter berdasarkan kategori aplikasi
- ✅ **API Backend**: RESTful API untuk mengambil data evaluasi
- ✅ **Responsive Design**: Desain yang responsif dan modern

### Fitur Baru & Kebaruan 🆕
- 🌙 **Dark Mode**: Toggle tema gelap/terang untuk kenyamanan mata
- 📊 **Dashboard Statistik**: Dashboard interaktif dengan statistik lengkap dan visualisasi data
- 📈 **Chart Visualisasi**: Grafik distribusi skor dan perbandingan kategori menggunakan Chart.js
- ⚖️ **Perbandingan Aplikasi**: Bandingkan 2 aplikasi side-by-side dengan metrik lengkap
- 🔍 **Filter Lanjutan**: Filter berdasarkan skor minimum dan urutkan berdasarkan berbagai kriteria
- 📄 **Export PDF**: Export hasil evaluasi ke format PDF untuk dokumentasi
- ➕ **Quick Compare**: Tambahkan aplikasi ke perbandingan langsung dari halaman detail

## Aplikasi yang Dievaluasi

Aplikasi ini mengevaluasi berbagai aplikasi kesehatan populer di Indonesia:

### Telemedicine
- **Halodoc** - Platform telemedicine terbesar di Indonesia
- **Alodokter** - Konsultasi dokter online dan artikel kesehatan
- **SehatQ** - Booking dokter dan reminder obat
- **KlikDokter** - Platform konsultasi dokter terpercaya
- **Good Doctor** - Telemedicine dengan integrasi apotek

### Fitness & Wellness
- **MyFitnessPal** - Tracking nutrisi dan fitness

### Kesehatan Mental
- **Riliv** - Aplikasi kesehatan mental pertama di Indonesia

### Nutrisi
- **NutriCheck** - Tracking nutrisi dan diet seimbang

## Kriteria Evaluasi

Setiap aplikasi dievaluasi berdasarkan 5 aspek utama:

1. **Kualitas Aplikasi** - Fitur, interface, dan pengalaman pengguna
2. **Privasi & Keamanan Data** - Kebijakan privasi dan perlindungan data
3. **Literasi Pengguna** - Kemudahan memahami informasi kesehatan
4. **Kemudahan Penggunaan** - Usability dan navigasi aplikasi
5. **Akurasi Informasi** - Keakuratan informasi medis yang disediakan

## Instalasi

### Persyaratan
- Web server (Apache/Nginx)
- PHP 7.4 atau lebih tinggi
- Browser modern (Chrome, Firefox, Safari, Edge)

### Langkah Instalasi

1. Clone atau download repository ini
2. Letakkan folder di web server Anda (misalnya: `htdocs` atau `www`)
3. Pastikan folder `api` dapat diakses
4. Buka aplikasi di browser: `http://localhost/IFTER UTS/`

### Untuk Laragon

1. Pastikan Laragon sudah berjalan
2. Folder sudah berada di `C:\laragon\www\IFTER UTS`
3. Buka browser dan akses: `http://localhost/IFTER UTS/`

## Struktur Folder

```
IFTER UTS/
├── index.html              # Halaman utama
├── assets/
│   ├── css/
│   │   └── style.css       # Styling aplikasi
│   └── js/
│       └── app.js          # JavaScript aplikasi
├── api/
│   └── index.php           # Backend API
└── README.md               # Dokumentasi
```

## API Endpoints

### 1. Get All Apps
```
GET /api/index.php?action=getAllApps
```

**Response:**
```json
{
  "success": true,
  "apps": [...],
  "total": 8
}
```

### 2. Get App Detail
```
GET /api/index.php?action=getAppDetail&id=1
```

**Response:**
```json
{
  "success": true,
  "app": {
    "id": 1,
    "name": "Halodoc",
    "category": "telemedicine",
    ...
  }
}
```

### 3. Search Apps
```
GET /api/index.php?action=searchApps&query=halodoc
```

**Response:**
```json
{
  "success": true,
  "apps": [...],
  "total": 1
}
```

## Penggunaan

### Dasar
1. **Melihat Daftar Aplikasi**: Halaman utama menampilkan semua aplikasi yang dievaluasi
2. **Mencari Aplikasi**: Gunakan kotak pencarian untuk mencari aplikasi tertentu
3. **Filter & Sort**: Gunakan filter kategori, skor minimum, dan urutkan hasil
4. **Lihat Detail**: Klik pada kartu aplikasi untuk melihat detail evaluasi lengkap
5. **Matriks Evaluasi**: Lihat matriks penilaian untuk setiap aspek evaluasi
6. **Rekomendasi**: Baca rekomendasi perbaikan untuk setiap aplikasi

### Fitur Baru
1. **Dark Mode**: Klik tombol bulan/matahari di header untuk mengaktifkan tema gelap
2. **Dashboard**: Klik tombol "Dashboard" untuk melihat statistik dan grafik visualisasi
3. **Bandingkan Aplikasi**: 
   - Klik tombol "Bandingkan" di header
   - Pilih 2 aplikasi yang ingin dibandingkan
   - Atau gunakan tombol "Tambah ke Perbandingan" di halaman detail
4. **Export PDF**: Klik tombol "Export PDF" untuk mengunduh laporan evaluasi dalam format PDF
5. **Filter Lanjutan**: 
   - Filter berdasarkan skor minimum (Excellent, Very Good, Good, Fair)
   - Urutkan berdasarkan nama, skor, atau jumlah pengguna

## Troubleshooting

### Error: "Terjadi kesalahan saat memuat data"

Jika Anda melihat error ini, ikuti langkah-langkah berikut:

1. **Pastikan Server PHP Berjalan**
   - Untuk Laragon: Pastikan Apache dan PHP sudah running
   - Cek di Laragon bahwa status server hijau

2. **Test API Langsung**
   - Buka file `test-api.html` di browser untuk test API
   - Atau akses langsung: `http://localhost/IFTER UTS/api/index.php?action=getAllApps`
   - Seharusnya menampilkan JSON data

3. **Cek Path API**
   - Buka Developer Console (F12) di browser
   - Lihat tab Console untuk melihat log API URL
   - Pastikan path API benar sesuai struktur folder

4. **Cek Permission File**
   - Pastikan file `api/index.php` dapat dibaca oleh web server
   - Pastikan folder `api` dapat diakses

5. **Cek Error Log**
   - Cek error log PHP di Laragon
   - Cek browser console untuk error JavaScript

### Test API Manual

Anda dapat test API secara manual dengan mengakses URL berikut di browser:

- **Get All Apps**: `http://localhost/IFTER UTS/api/index.php?action=getAllApps`
- **Get App Detail**: `http://localhost/IFTER UTS/api/index.php?action=getAppDetail&id=1`
- **Search Apps**: `http://localhost/IFTER UTS/api/index.php?action=searchApps&query=halodoc`

Jika URL di atas menampilkan JSON, berarti API bekerja dengan baik.

## Teknologi yang Digunakan

- **HTML5** - Struktur halaman
- **CSS3** - Styling dan layout dengan CSS Variables untuk dark mode
- **JavaScript (Vanilla)** - Interaktivitas dan API calls
- **PHP** - Backend API
- **Chart.js** - Visualisasi data dan grafik interaktif
- **jsPDF** - Export ke format PDF
- **Font Awesome** - Icons
- **RESTful API** - Arsitektur API
- **LocalStorage** - Penyimpanan preferensi dark mode

## Skor Penilaian

Skor diberikan dalam skala 1-5 dengan kategori:

- **Excellent (4.5-5.0)**: Sangat baik, hampir sempurna
- **Good (3.5-4.4)**: Baik, dengan beberapa area perbaikan
- **Fair (2.5-3.4)**: Cukup, memerlukan perbaikan signifikan
- **Poor (1.0-2.4)**: Buruk, memerlukan perbaikan besar

## Kontribusi

Aplikasi ini dibuat untuk keperluan evaluasi dan penelitian. Data evaluasi dapat diperbarui sesuai dengan perkembangan aplikasi yang dievaluasi.

## Lisensi

Aplikasi ini dibuat untuk keperluan akademik dan evaluasi.

## Catatan

- Data evaluasi dalam aplikasi ini adalah contoh dan dapat disesuaikan dengan kebutuhan
- Aplikasi ini menggunakan API lokal (PHP) untuk menyediakan data
- Untuk produksi, pertimbangkan untuk menggunakan database untuk menyimpan data evaluasi

## Kontak

Untuk pertanyaan atau saran, silakan hubungi pengembang aplikasi.

---

**Dibuat dengan ❤️ untuk Evaluasi Aplikasi Kesehatan Konsumen**

