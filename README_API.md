# API Configuration untuk Data Real

## Setup Data Real dari API Eksternal

Aplikasi ini sekarang mendukung pengambilan data real dari API eksternal seperti App Store dan Google Play Store.

### Konfigurasi

1. **Buat file `api/config.local.php`** (opsional, untuk API keys):
```php
<?php
// RapidAPI Key (optional)
define('RAPIDAPI_KEY', 'your-rapidapi-key-here');

// Enable/disable real data
define('ENABLE_REAL_DATA', true);
?>
```

2. **Tambahkan App Store IDs** di `api/config.php`:
   - Dapatkan App Store ID dari URL aplikasi di App Store
   - Contoh: `https://apps.apple.com/app/id1099194598` → ID: `1099194598`

3. **Tambahkan Play Store Package IDs** di `api/config.php`:
   - Dapatkan Package ID dari URL aplikasi di Play Store
   - Contoh: `https://play.google.com/store/apps/details?id=com.halodoc.android` → ID: `com.halodoc.android`

### Menggunakan Data Real

**Default (Static Data):**
```
GET /api/index.php?action=getAllApps
```

**Dengan Data Real:**
```
GET /api/index.php?action=getAllApps&real=true
```

### Sumber Data

1. **App Store (iTunes API)**
   - Gratis, tidak perlu API key
   - Mengambil rating, reviews, dan deskripsi
   - Endpoint: `https://itunes.apple.com/lookup`

2. **Google Play Store**
   - Menggunakan RapidAPI (perlu API key)
   - Atau web scraping (tidak disarankan untuk production)

3. **Cache System**
   - Data di-cache selama 1 jam (default)
   - Mengurangi request ke API eksternal
   - Cache disimpan di `api/cache/`

### Troubleshooting

1. **Data tidak ter-update:**
   - Hapus cache: `rm -rf api/cache/*`
   - Atau tunggu cache expire (1 jam)

2. **API error:**
   - Sistem otomatis fallback ke static data
   - Cek error log PHP

3. **RapidAPI tidak bekerja:**
   - Pastikan API key valid
   - Atau set `ENABLE_REAL_DATA = false` untuk menggunakan static data

### Data yang Diambil dari API Real

**Dari App Store (iTunes API):**
- ✅ Rating aplikasi (averageUserRating)
- ✅ Jumlah reviews (userRatingCount)
- ✅ Jumlah pengguna (dari userRatingCount, diformat)
- ✅ Deskripsi aplikasi
- ✅ Versi aplikasi
- ✅ Tanggal rilis
- ✅ Developer/Seller
- ✅ Genre
- ✅ Screenshots

**Dari Google Play Store:**
- ✅ Rating aplikasi
- ✅ Jumlah reviews
- ✅ **Jumlah downloads/installs (REAL)** - ini yang penting!
- ✅ Deskripsi aplikasi
- ✅ Versi aplikasi
- ✅ Ukuran aplikasi
- ✅ Developer
- ✅ Genre
- ✅ Screenshots

**Data Evaluasi (Tetap Manual):**
- Quality Score (memerlukan analisis mendalam)
- Privacy Score (memerlukan review kebijakan)
- Literacy Score (memerlukan evaluasi konten)
- Usability Score (memerlukan testing)
- Accuracy Score (memerlukan verifikasi medis)
- Recommendations (memerlukan expert review)

### Catatan

- **Jumlah Pengguna Real**: Sistem sekarang mengambil jumlah downloads/installs real dari Play Store dan App Store
- Data real di-cache selama 1 jam untuk mengurangi beban server
- Jika API gagal, sistem otomatis fallback ke data static
- Data evaluasi (quality, privacy, literacy) tetap manual karena memerlukan analisis mendalam oleh expert

