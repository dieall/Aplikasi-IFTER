<?php
// Set error reporting untuk development (nonaktifkan di production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Set headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include real data fetcher (only functions, not execution)
if (file_exists(__DIR__ . '/fetch_real_data.php')) {
    require_once __DIR__ . '/fetch_real_data.php';
}

// Error handler untuk JSON
function sendJsonError($message, $code = 500) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

// Load configuration
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
}

// Get data source mode: use real data by default if enabled, unless explicitly disabled
$useRealData = true; // Default to true
if (isset($_GET['real'])) {
    $useRealData = $_GET['real'] === 'true';
} elseif (defined('ENABLE_REAL_DATA')) {
    $useRealData = ENABLE_REAL_DATA;
}

// Try to get real data, fallback to static data if fails
$baseApps = getStaticAppsData();
try {
    if ($useRealData && function_exists('enhanceAppsWithRealData')) {
        // Enhance base apps with real data from Play Store/App Store
        $apps = enhanceAppsWithRealData($baseApps);
    } else {
        // Use static data only
        $apps = $baseApps;
    }
} catch (Exception $e) {
    // If real data fetch fails, use static data
    error_log("Error fetching real data: " . $e->getMessage());
    $apps = $baseApps;
}

// Static data as fallback
function getStaticAppsData() {
    return [
        [
        'id' => 1,
        'name' => 'Halodoc',
        'category' => 'telemedicine',
        'icon' => 'fas fa-user-md',
        'logo' => 'assets/images/apps/halodoc.png',
        'platform' => 'Android & iOS',
        'active_users' => '20+ juta',
        'store_rating' => 4.9,
        'overall_score' => 4.3,
        'quality_score' => 4.5,
        'quality_description' => 'Aplikasi dengan fitur lengkap untuk konsultasi dokter, pembelian obat, dan layanan kesehatan lainnya. Interface modern dan mudah digunakan.',
        'privacy_score' => 3.8,
        'privacy_description' => 'Kebijakan privasi cukup jelas, namun perlu perbaikan dalam transparansi penggunaan data pengguna untuk analitik.',
        'literacy_score' => 4.2,
        'literacy_description' => 'Informasi kesehatan disajikan dengan bahasa yang mudah dipahami. Tersedia fitur edukasi kesehatan yang informatif.',
        'usability_score' => 4.4,
        'usability_description' => 'Navigasi aplikasi sangat intuitif. Proses booking konsultasi dan pembelian obat sangat mudah.',
        'accuracy_score' => 4.3,
        'accuracy_description' => 'Informasi medis yang disediakan akurat dan terverifikasi oleh dokter profesional.',
        'evaluation_date' => '2024-01-15',
        'recommendations' => [
            [
                'title' => 'Peningkatan Transparansi Privasi',
                'description' => 'Perlu penjelasan lebih detail tentang bagaimana data pengguna digunakan, terutama untuk tujuan analitik dan pemasaran. Tambahkan opsi kontrol privasi yang lebih granular.'
            ],
            [
                'title' => 'Peningkatan Literasi Kesehatan',
                'description' => 'Tambahkan lebih banyak konten edukasi kesehatan dalam format video dan infografis. Buat sistem notifikasi untuk artikel kesehatan yang relevan.'
            ],
            [
                'title' => 'Fitur Aksesibilitas',
                'description' => 'Tingkatkan aksesibilitas untuk pengguna dengan disabilitas, termasuk dukungan screen reader yang lebih baik dan kontras warna yang lebih tinggi.'
            ]
        ]
    ],
    [
        'id' => 2,
        'name' => 'Alodokter',
        'category' => 'telemedicine',
        'icon' => 'fas fa-stethoscope',
        'logo' => 'assets/images/apps/alodokter.png',
        'platform' => 'Android & iOS',
        'active_users' => '15+ juta',
        'store_rating' => 4.4,
        'overall_score' => 4.1,
        'quality_score' => 4.2,
        'quality_description' => 'Platform telemedicine yang solid dengan fitur konsultasi dokter dan artikel kesehatan yang komprehensif.',
        'privacy_score' => 4.0,
        'privacy_description' => 'Kebijakan privasi lebih transparan dibandingkan kompetitor. Data pengguna dilindungi dengan enkripsi yang baik.',
        'literacy_score' => 4.5,
        'literacy_description' => 'Konten edukasi kesehatan sangat baik dengan artikel yang ditulis oleh dokter dan mudah dipahami masyarakat umum.',
        'usability_score' => 4.0,
        'usability_description' => 'Interface cukup user-friendly, namun beberapa fitur memerlukan beberapa langkah untuk diakses.',
        'accuracy_score' => 4.2,
        'accuracy_description' => 'Informasi medis akurat dan selalu diupdate. Artikel kesehatan direview oleh tim medis profesional.',
        'evaluation_date' => '2024-03-20',
        'recommendations' => [
            [
                'title' => 'Optimasi User Experience',
                'description' => 'Sederhanakan proses navigasi dengan mengurangi jumlah klik untuk mengakses fitur utama. Pertimbangkan redesign interface untuk meningkatkan efisiensi.'
            ],
            [
                'title' => 'Fitur Chat yang Lebih Interaktif',
                'description' => 'Tingkatkan fitur chat dengan dokter dengan menambahkan opsi untuk mengirim foto, voice message, dan video call yang lebih stabil.'
            ],
            [
                'title' => 'Integrasi dengan Wearables',
                'description' => 'Tambahkan integrasi dengan perangkat wearable untuk tracking kesehatan harian seperti langkah, detak jantung, dan pola tidur.'
            ]
        ]
    ],
    [
        'id' => 3,
        'name' => 'SehatQ',
        'category' => 'telemedicine',
        'icon' => 'fas fa-heartbeat',
        'logo' => 'assets/images/apps/sehatq.png',
        'platform' => 'Android & iOS',
        'active_users' => '10+ juta',
        'store_rating' => 4.3,
        'overall_score' => 4.0,
        'quality_score' => 4.1,
        'quality_description' => 'Aplikasi kesehatan dengan fitur lengkap termasuk booking dokter, artikel kesehatan, dan fitur reminder obat.',
        'privacy_score' => 3.9,
        'privacy_description' => 'Kebijakan privasi standar, namun perlu peningkatan dalam hal notifikasi kepada pengguna tentang perubahan kebijakan.',
        'literacy_score' => 4.0,
        'literacy_description' => 'Konten edukasi kesehatan baik dengan berbagai topik, namun perlu lebih banyak konten dalam bahasa daerah.',
        'usability_score' => 4.1,
        'usability_description' => 'Interface bersih dan mudah digunakan. Fitur reminder obat sangat membantu pengguna.',
        'accuracy_score' => 4.0,
        'accuracy_description' => 'Informasi medis akurat dengan sumber yang dapat dipercaya.',
        'evaluation_date' => '2024-05-10',
        'recommendations' => [
            [
                'title' => 'Peningkatan Konten Lokal',
                'description' => 'Tambahkan lebih banyak konten kesehatan dalam bahasa daerah untuk meningkatkan aksesibilitas informasi kesehatan.'
            ],
            [
                'title' => 'Notifikasi Privasi yang Lebih Proaktif',
                'description' => 'Berikan notifikasi yang jelas kepada pengguna ketika ada perubahan dalam kebijakan privasi atau penggunaan data.'
            ],
            [
                'title' => 'Fitur Komunitas',
                'description' => 'Tambahkan fitur komunitas atau forum dimana pengguna dapat berbagi pengalaman dan tips kesehatan dengan moderasi yang baik.'
            ]
        ]
    ],
    [
        'id' => 4,
        'name' => 'KlikDokter',
        'category' => 'telemedicine',
        'icon' => 'fas fa-clipboard-check',
        'logo' => 'assets/images/apps/klikdokter.png',
        'platform' => 'Android & iOS',
        'active_users' => '8+ juta',
        'store_rating' => 4.2,
        'overall_score' => 3.9,
        'quality_score' => 4.0,
        'quality_description' => 'Platform konsultasi dokter yang terpercaya dengan database dokter yang luas.',
        'privacy_score' => 3.7,
        'privacy_description' => 'Perlu peningkatan dalam transparansi penggunaan data. Kebijakan privasi perlu lebih mudah diakses dan dipahami.',
        'literacy_score' => 3.8,
        'literacy_description' => 'Konten edukasi ada namun perlu lebih banyak variasi format dan topik yang lebih luas.',
        'usability_score' => 3.9,
        'usability_description' => 'Interface fungsional namun terlihat sedikit ketinggalan zaman. Perlu update desain untuk pengalaman yang lebih modern.',
        'accuracy_score' => 4.1,
        'accuracy_description' => 'Informasi medis akurat dengan dokter yang terverifikasi.',
        'evaluation_date' => '2024-07-25',
        'recommendations' => [
            [
                'title' => 'Modernisasi Interface',
                'description' => 'Lakukan redesign interface untuk memberikan pengalaman pengguna yang lebih modern dan menarik. Pertimbangkan menggunakan design system yang konsisten.'
            ],
            [
                'title' => 'Ekspansi Konten Edukasi',
                'description' => 'Tingkatkan jumlah dan variasi konten edukasi kesehatan dengan format yang lebih menarik seperti video, podcast, dan infografis interaktif.'
            ],
            [
                'title' => 'Transparansi Privasi yang Lebih Baik',
                'description' => 'Buat halaman kebijakan privasi yang lebih mudah dipahami dengan visualisasi dan contoh konkret tentang penggunaan data.'
            ]
        ]
    ],
    [
        'id' => 5,
        'name' => 'MyFitnessPal',
        'category' => 'fitness',
        'icon' => 'fas fa-dumbbell',
        'logo' => 'assets/images/apps/myfitnesspal.png',
        'platform' => 'Android & iOS',
        'active_users' => '200+ juta (global)',
        'store_rating' => 4.5,
        'overall_score' => 4.2,
        'quality_score' => 4.4,
        'quality_description' => 'Aplikasi tracking nutrisi dan fitness yang sangat komprehensif dengan database makanan yang luas.',
        'privacy_score' => 3.5,
        'privacy_description' => 'Perlu perhatian khusus pada privasi data kesehatan. Beberapa fitur premium memerlukan berbagi data dengan pihak ketiga.',
        'literacy_score' => 4.3,
        'literacy_description' => 'Informasi nutrisi dan fitness sangat informatif dengan penjelasan yang mudah dipahami.',
        'usability_score' => 4.5,
        'usability_description' => 'Interface sangat intuitif dengan fitur barcode scanner yang memudahkan input data makanan.',
        'accuracy_score' => 4.2,
        'accuracy_description' => 'Database nutrisi cukup akurat, namun beberapa item makanan lokal Indonesia masih kurang lengkap.',
        'evaluation_date' => '2024-08-22',
        'recommendations' => [
            [
                'title' => 'Peningkatan Privasi Data Kesehatan',
                'description' => 'Berikan kontrol yang lebih baik kepada pengguna tentang data kesehatan yang dibagikan. Tambahkan opsi untuk menyimpan data secara lokal tanpa cloud sync.'
            ],
            [
                'title' => 'Ekspansi Database Makanan Lokal',
                'description' => 'Tambahkan lebih banyak makanan dan produk lokal Indonesia ke dalam database untuk meningkatkan akurasi tracking nutrisi pengguna Indonesia.'
            ],
            [
                'title' => 'Fitur Komunitas Lokal',
                'description' => 'Buat fitur komunitas atau grup lokal untuk pengguna Indonesia agar dapat berbagi tips dan motivasi dalam bahasa Indonesia.'
            ]
        ]
    ],
    [
        'id' => 6,
        'name' => 'Riliv',
        'category' => 'mental',
        'icon' => 'fas fa-brain',
        'logo' => 'assets/images/apps/riliv.png',
        'platform' => 'Android & iOS',
        'active_users' => '500+ ribu',
        'store_rating' => 4.4,
        'overall_score' => 4.1,
        'quality_score' => 4.2,
        'quality_description' => 'Aplikasi kesehatan mental pertama di Indonesia dengan fitur meditasi, konseling, dan artikel kesehatan mental.',
        'privacy_score' => 4.3,
        'privacy_description' => 'Privasi data sangat dijaga dengan enkripsi end-to-end untuk sesi konseling. Kebijakan privasi sangat jelas.',
        'literacy_score' => 4.4,
        'literacy_description' => 'Konten edukasi kesehatan mental sangat baik dengan bahasa yang mudah dipahami dan mengurangi stigma kesehatan mental.',
        'usability_score' => 4.0,
        'usability_description' => 'Interface tenang dan menenangkan dengan desain yang mendukung kesehatan mental.',
        'accuracy_score' => 4.1,
        'accuracy_description' => 'Konten dan program meditasi dikembangkan oleh profesional kesehatan mental yang terverifikasi.',
        'evaluation_date' => '2024-10-18',
        'recommendations' => [
            [
                'title' => 'Aksesibilitas Harga',
                'description' => 'Pertimbangkan paket berlangganan yang lebih terjangkau atau program subsidi untuk meningkatkan aksesibilitas layanan kesehatan mental.'
            ],
            [
                'title' => 'Fitur Offline',
                'description' => 'Tambahkan lebih banyak konten meditasi dan artikel yang dapat diakses offline untuk pengguna dengan koneksi internet terbatas.'
            ],
            [
                'title' => 'Program Korporat',
                'description' => 'Kembangkan program kesehatan mental untuk perusahaan untuk meningkatkan awareness dan akses kesehatan mental di tempat kerja.'
            ]
        ]
    ],
    [
        'id' => 7,
        'name' => 'NutriCheck',
        'category' => 'nutrition',
        'icon' => 'fas fa-apple-alt',
        'logo' => 'assets/images/apps/nutricheck.png',
        'platform' => 'Android & iOS',
        'active_users' => '2+ juta',
        'store_rating' => 4.1,
        'overall_score' => 3.8,
        'quality_score' => 3.9,
        'quality_description' => 'Aplikasi tracking nutrisi dengan fokus pada makanan sehat dan diet seimbang.',
        'privacy_score' => 3.8,
        'privacy_description' => 'Kebijakan privasi standar, namun perlu lebih jelas tentang penggunaan data untuk personalisasi rekomendasi.',
        'literacy_score' => 4.0,
        'literacy_description' => 'Informasi nutrisi disajikan dengan baik dengan tips diet yang praktis.',
        'usability_score' => 3.7,
        'usability_description' => 'Interface cukup baik namun beberapa fitur memerlukan beberapa langkah untuk diakses.',
        'accuracy_score' => 3.9,
        'accuracy_description' => 'Database nutrisi akurat untuk makanan umum, namun perlu ekspansi untuk variasi lokal.',
        'evaluation_date' => '2024-12-05',
        'recommendations' => [
            [
                'title' => 'Peningkatan User Experience',
                'description' => 'Sederhanakan proses input makanan dengan fitur voice input atau AI recognition untuk foto makanan.'
            ],
            [
                'title' => 'Database Makanan Lokal',
                'description' => 'Ekspansi database dengan lebih banyak makanan tradisional Indonesia dan produk lokal untuk meningkatkan relevansi bagi pengguna Indonesia.'
            ],
            [
                'title' => 'Fitur Meal Planning',
                'description' => 'Tambahkan fitur meal planning otomatis berdasarkan preferensi diet, budget, dan kebutuhan nutrisi pengguna.'
            ]
        ]
    ],
    [
        'id' => 8,
        'name' => 'Good Doctor',
        'category' => 'telemedicine',
        'icon' => 'fas fa-hospital',
        'logo' => 'assets/images/apps/gooddoctor.png',
        'platform' => 'Android & iOS',
        'active_users' => '10000+ juta',
        'store_rating' => 4.3,
        'overall_score' => 4.0,
        'quality_score' => 4.1,
        'quality_description' => 'Platform telemedicine dengan integrasi layanan kesehatan yang komprehensif termasuk apotek online.',
        'privacy_score' => 3.9,
        'privacy_description' => 'Kebijakan privasi baik dengan enkripsi data, namun perlu lebih transparan tentang sharing data dengan mitra.',
        'literacy_score' => 4.1,
        'literacy_description' => 'Konten edukasi kesehatan informatif dengan berbagai topik kesehatan yang relevan.',
        'usability_score' => 4.2,
        'usability_description' => 'Interface modern dan mudah digunakan dengan proses booking yang efisien.',
        'accuracy_score' => 4.0,
        'accuracy_description' => 'Informasi medis akurat dengan dokter yang terverifikasi dan terpercaya.',
        'evaluation_date' => '2025-05-10',
        'recommendations' => [
            [
                'title' => 'Transparansi Data Sharing',
                'description' => 'Berikan informasi yang jelas kepada pengguna tentang data yang dibagikan dengan mitra dan bagaimana data tersebut digunakan.'
            ],
            [
                'title' => 'Fitur Follow-up',
                'description' => 'Tambahkan sistem follow-up otomatis untuk memastikan pengguna mendapatkan perawatan lanjutan yang diperlukan setelah konsultasi.'
            ],
            [
                'title' => 'Integrasi dengan Lab',
                'description' => 'Integrasikan dengan laboratorium untuk memungkinkan pengguna melakukan booking tes lab dan melihat hasil secara langsung di aplikasi.'
            ]
        ]
    ]
    ];
}

// Handle API requests
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'getAllApps':
        $dataSource = $useRealData ? 'real' : 'static';
        echo json_encode([
            'success' => true,
            'apps' => $apps,
            'total' => count($apps),
            'data_source' => $dataSource,
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        break;
    
    case 'getAppDetail':
        $id = intval($_GET['id'] ?? 0);
        
        if ($id <= 0) {
            sendJsonError('ID aplikasi tidak valid', 400);
        }
        
        $app = array_filter($apps, function($a) use ($id) {
            return $a['id'] === $id;
        });
        
        if (!empty($app)) {
            echo json_encode([
                'success' => true,
                'app' => array_values($app)[0]
            ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        } else {
            sendJsonError('Aplikasi tidak ditemukan', 404);
        }
        break;
    
    case 'searchApps':
        $query = strtolower($_GET['query'] ?? '');
        $filtered = array_filter($apps, function($app) use ($query) {
            return strpos(strtolower($app['name']), $query) !== false ||
                   strpos(strtolower($app['category']), $query) !== false;
        });
        
        echo json_encode([
            'success' => true,
            'apps' => array_values($filtered),
            'total' => count($filtered)
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        break;
    
    default:
        sendJsonError('Action tidak valid. Gunakan: getAllApps, getAppDetail, atau searchApps', 400);
        break;
}
?>

