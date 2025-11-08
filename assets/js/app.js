// API Configuration
// Deteksi path API secara otomatis berdasarkan lokasi file saat ini
function getApiBaseUrl() {
    const currentPath = window.location.pathname;
    const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));

    // Jika di root atau subfolder, gunakan path relatif
    if (currentDir === '' || currentDir === '/') {
        return 'api/index.php';
    }

    // Gunakan path relatif dari direktori saat ini
    return `${currentDir}/api/index.php`;
}

const API_BASE_URL = getApiBaseUrl();

// Debug: log API URL untuk troubleshooting
console.log('API Base URL:', API_BASE_URL);
console.log('Current Path:', window.location.pathname);

// State Management
let allApps = [];
let filteredApps = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadApps();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    const categoryFilter = document.getElementById('categoryFilter');
    const scoreFilter = document.getElementById('scoreFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            // Remove active state from quick filter buttons when dropdown changes
            document.querySelectorAll('.quick-filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            handleFilter();
        });
    }
    
    if (scoreFilter) {
        scoreFilter.addEventListener('change', handleFilter);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', handleFilter);
    }

    // Sidebar functionality
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    // Toggle sidebar
    sidebarToggle.addEventListener('click', function () {
        sidebar.classList.add('active');
        document.body.classList.add('sidebar-active');
    });

    // Close sidebar
    closeSidebar.addEventListener('click', function () {
        sidebar.classList.remove('active');
        document.body.classList.remove('sidebar-active');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function (event) {
        if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
            sidebar.classList.remove('active');
            document.body.classList.remove('sidebar-active');
        }
    });

    // Handle dropdown toggles in sidebar
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            const dropdownMenu = this.nextElementSibling;
            dropdownMenu.classList.toggle('show');
        });
    });

    // Close modal dengan tombol ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const appDetailModal = document.getElementById('appDetailModal');
            if (appDetailModal && !appDetailModal.classList.contains('hidden')) {
                closeDetail();
            }
        }
    });
    
    // Close modal ketika klik overlay
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            e.stopPropagation();
            closeDetail();
        });
    }
    
    // Ensure navigation buttons can close modal and navigate
    const navButtons = document.querySelectorAll('.nav-btn, .sidebar-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Close modal if open before navigation
            if (window.closeModalIfOpen) {
                window.closeModalIfOpen();
            }
        });
    });
}

// Load Apps from API
async function loadApps() {
    const loading = document.getElementById('loading');
    const appList = document.getElementById('appList');

    loading.classList.remove('hidden');
    appList.innerHTML = '';

    try {
        // Try to fetch real data first, fallback to static if fails
        let response = await fetch(`${API_BASE_URL}?action=getAllApps&real=true`);

        // If real data fails, try static data
        if (!response.ok) {
            response = await fetch(`${API_BASE_URL}?action=getAllApps`);
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Show data source info
        if (data.data_source === 'real') {
            console.log('✅ Menggunakan data real dari API eksternal');
        } else {
            console.log('ℹ️ Menggunakan data static (fallback)');
        }

        if (data.success) {
            allApps = data.apps;
            filteredApps = allApps;
            displayApps(filteredApps);
            // Initialize charts and analysis with loaded data
            try {
                renderCharts(allApps);
            } catch (e) {
                console.warn('Chart rendering failed:', e);
            }
        } else {
            showError(data.message || 'Gagal memuat data aplikasi');
        }
    } catch (error) {
        console.error('Error loading apps:', error);
        console.error('API URL:', `${API_BASE_URL}?action=getAllApps`);
        showError(`Terjadi kesalahan saat memuat data: ${error.message}. Pastikan server PHP berjalan dan path API benar.`);
    } finally {
        loading.classList.add('hidden');
    }
}

// Display Apps
function displayApps(apps, containerId = 'appList') {
    const container = document.getElementById(containerId);

    if (apps.length === 0) {
        container.innerHTML = '<div class="no-results"><i class="fas fa-search" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 20px; display: block;"></i><h3>Tidak ada aplikasi yang ditemukan</h3><p>Coba pilih kategori lain atau ubah filter Anda</p><button class="clear-filter-btn" onclick="clearCategoryFilter()" style="margin-top: 20px;"><i class="fas fa-times"></i> Hapus Filter</button></div>';
        return;
    }

    container.innerHTML = apps.map(app => {
        return `
        <div class="app-card" onclick="showAppDetail(${app.id})">
            <div class="app-card-header">
                <div class="app-icon">
                    ${app.logo ? `<img src="${app.logo}" alt="${app.name}" class="app-logo" onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<i class=\\'${app.icon}\\'></i>';">
                    <i class="${app.icon}" style="display: none;"></i>` : `<i class="${app.icon}"></i>`}
                </div>
                <div class="app-info">
                    <h3>${app.name}</h3>
                    <div class="category">${getCategoryLabel(app.category)}</div>
                </div>
            </div>
            <div class="rating">
                <div class="stars">${generateStars(app.overall_score)}</div>
                <span class="score">${app.overall_score.toFixed(1)}/5.0</span>
            </div>
            <div class="metrics">
                <div class="metric">
                    <div class="metric-label">Kualitas</div>
                    <div class="metric-value">${app.quality_score.toFixed(1)}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Privasi</div>
                    <div class="metric-value">${app.privacy_score.toFixed(1)}</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Literasi</div>
                    <div class="metric-value">${app.literacy_score.toFixed(1)}</div>
                </div>
            </div>
        </div>
    `}).join('');
}

// Show App Detail
window.showAppDetail = async function(appId) {
    currentAppId = appId; // Store for compare feature

    const appDetailModal = document.getElementById('appDetailModal');
    const detailContent = document.getElementById('detailContent');
    
    // Check if modal exists
    if (!appDetailModal) {
        console.error('Modal element not found!');
        alert('Modal element tidak ditemukan. Silakan refresh halaman.');
        return;
    }
    
    if (!detailContent) {
        console.error('Detail content element not found!');
        return;
    }
    
    console.log('Membuka modal untuk app ID:', appId);
    
    // Tampilkan modal - hapus class hidden dan set display
    appDetailModal.classList.remove('hidden');
    appDetailModal.style.display = 'flex';
    appDetailModal.style.visibility = 'visible';
    appDetailModal.style.opacity = '1';
    
    // Prevent body scroll saat modal terbuka
    document.body.style.overflow = 'hidden';
    
    console.log('Modal status:', {
        hasHidden: appDetailModal.classList.contains('hidden'),
        display: appDetailModal.style.display,
        visibility: appDetailModal.style.visibility
    });

    // Show loading indicator inside modal
    detailContent.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i><p style="margin-top: 20px;">Memuat detail aplikasi...</p></div>';

    try {
        const response = await fetch(`${API_BASE_URL}?action=getAppDetail&id=${appId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            const app = data.app;
            detailContent.innerHTML = generateDetailHTML(app);
        } else {
            detailContent.innerHTML = `<div style="padding: 20px; text-align: center;"><p style="color: var(--danger-color);">${data.message || 'Gagal memuat detail aplikasi'}</p><button class="back-btn" onclick="closeDetail()" style="margin-top: 20px;">Tutup</button></div>`;
        }
    } catch (error) {
        console.error('Error loading app detail:', error);
        detailContent.innerHTML = `<div style="padding: 20px; text-align: center;"><p style="color: var(--danger-color);">Terjadi kesalahan: ${error.message}</p><button class="back-btn" onclick="closeDetail()" style="margin-top: 20px;">Tutup</button></div>`;
    }
}

// Generate Detail HTML
function generateDetailHTML(app) {
    return `
        <div class="detail-header">
            <div class="detail-icon">
                ${app.logo ? `<img src="${app.logo}" alt="${app.name}" class="app-logo" onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<i class=\\'${app.icon}\\'></i>';">
                <i class="${app.icon}" style="display: none;"></i>` : `<i class="${app.icon}"></i>`}
            </div>
            <div class="detail-title">
                <h2>${app.name}</h2>
                <p>${getCategoryLabel(app.category)}</p>
            </div>
        </div>

        <div class="rating" style="margin-bottom: 30px;">
            <div class="stars">${generateStars(app.overall_score)}</div>
            <span class="score" style="font-size: 1.2rem;">Skor Keseluruhan: ${app.overall_score.toFixed(1)}/5.0</span>
        </div>

        <div class="evaluation-matrix">
            <h3 class="matrix-title">Matriks Evaluasi</h3>
            <table class="matrix-table">
                <thead>
                    <tr>
                        <th>Aspek Evaluasi</th>
                        <th>Skor</th>
                        <th>Kategori</th>
                        <th>Keterangan</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Kualitas Aplikasi</strong></td>
                        <td>${app.quality_score.toFixed(1)}</td>
                        <td>${getScoreBadge(app.quality_score)}</td>
                        <td>${app.quality_description}</td>
                    </tr>
                    <tr>
                        <td><strong>Privasi & Keamanan Data</strong></td>
                        <td>${app.privacy_score.toFixed(1)}</td>
                        <td>${getScoreBadge(app.privacy_score)}</td>
                        <td>${app.privacy_description}</td>
                    </tr>
                    <tr>
                        <td><strong>Literasi Pengguna</strong></td>
                        <td>${app.literacy_score.toFixed(1)}</td>
                        <td>${getScoreBadge(app.literacy_score)}</td>
                        <td>${app.literacy_description}</td>
                    </tr>
                    <tr>
                        <td><strong>Kemudahan Penggunaan</strong></td>
                        <td>${app.usability_score.toFixed(1)}</td>
                        <td>${getScoreBadge(app.usability_score)}</td>
                        <td>${app.usability_description}</td>
                    </tr>
                    <tr>
                        <td><strong>Akurasi Informasi</strong></td>
                        <td>${app.accuracy_score.toFixed(1)}</td>
                        <td>${getScoreBadge(app.accuracy_score)}</td>
                        <td>${app.accuracy_description}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="recommendations">
            <h3><i class="fas fa-lightbulb"></i> Rekomendasi Perbaikan</h3>
            ${app.recommendations.map(rec => `
                <div class="recommendation-item">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <strong>${rec.title}</strong>
                        <p>${rec.description}</p>
                    </div>
                </div>
            `).join('')}
        </div>

        <div style="margin-top: 30px; padding: 20px; background: var(--bg-color); border-radius: 10px;">
            <h3 style="margin-bottom: 15px;">Informasi Tambahan</h3>
            <p><strong>Platform:</strong> ${app.platform}</p>
            <p><strong>Pengguna Aktif:</strong> ${app.active_users}</p>
            <p><strong>Rating di Store:</strong> ${app.store_rating}/5.0</p>
            <p><strong>Tanggal Evaluasi:</strong> ${app.evaluation_date}</p>
        </div>
    `;
}

// Close Detail View
window.closeDetail = function() {
    const appDetailModal = document.getElementById('appDetailModal');
    
    if (!appDetailModal) {
        console.error('Modal tidak ditemukan saat menutup');
        return;
    }
    
    console.log('Menutup modal');
    
    // Sembunyikan modal
    appDetailModal.classList.add('hidden');
    appDetailModal.style.display = 'none';
    appDetailModal.style.visibility = 'hidden';
    appDetailModal.style.opacity = '0';
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    currentAppId = null;
}

// Handle Search
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    if (searchTerm === '') {
        filteredApps = allApps;
    } else {
        filteredApps = allApps.filter(app =>
            app.name.toLowerCase().includes(searchTerm) ||
            getCategoryLabel(app.category).toLowerCase().includes(searchTerm)
        );
    }

    displayApps(filteredApps);
}

// Handle Filter
window.handleFilter = function() {
    const categoryFilter = document.getElementById('categoryFilter');
    const scoreFilter = document.getElementById('scoreFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (!categoryFilter || !allApps || allApps.length === 0) {
        return;
    }
    
    const category = categoryFilter.value;
    const minScore = parseFloat(scoreFilter ? scoreFilter.value : 0);
    const sortBy = sortFilter ? sortFilter.value : 'score-desc';

    // Filter by category
    if (category === 'all') {
        filteredApps = [...allApps];
    } else {
        filteredApps = allApps.filter(app => app.category === category);
    }

    // Filter by minimum score
    if (minScore > 0) {
        filteredApps = filteredApps.filter(app => app.overall_score >= minScore);
    }

    // Sort - default to score descending for better UX
    switch (sortBy) {
        case 'name':
            filteredApps.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'score-desc':
            filteredApps.sort((a, b) => b.overall_score - a.overall_score);
            break;
        case 'score-asc':
            filteredApps.sort((a, b) => a.overall_score - b.overall_score);
            break;
        case 'users':
            filteredApps.sort((a, b) => {
                const usersA = parseInt(a.active_users.match(/(\d+)/)?.[1] || 0);
                const usersB = parseInt(b.active_users.match(/(\d+)/)?.[1] || 0);
                return usersB - usersA;
            });
            break;
        default:
            // Default: sort by score descending
            filteredApps.sort((a, b) => b.overall_score - a.overall_score);
    }

    // Display filtered apps
    if (typeof displayApps === 'function') {
        displayApps(filteredApps);
    }
    
    // Show category header if filtering by category
    showCategoryHeader(category);
}

// Show category header
function showCategoryHeader(category) {
    // Remove existing header if any
    const existingHeader = document.getElementById('categoryHeader');
    if (existingHeader) {
        existingHeader.remove();
    }
    
    if (category === 'all' || !category) {
        return;
    }
    
    const categoryLabels = {
        'telemedicine': 'Telemedicine',
        'fitness': 'Fitness & Wellness',
        'mental': 'Kesehatan Mental',
        'nutrition': 'Nutrisi',
        'sleep': 'Sleep Monitor',
        'pregnancy': 'Kesehatan Ibu & Anak',
        'chronic': 'Penyakit Kronis',
        'elderly': 'Kesehatan Lansia'
    };
    
    const categoryLabel = categoryLabels[category] || category;
    const appList = document.getElementById('appList');
    
    if (appList && filteredApps) {
        const header = document.createElement('div');
        header.id = 'categoryHeader';
        header.className = 'category-header';
        header.innerHTML = `
            <div class="category-header-content">
                <h2><i class="fas fa-filter"></i> ${categoryLabel}</h2>
                <p>Menampilkan <strong>${filteredApps.length}</strong> aplikasi yang direkomendasikan</p>
                <button class="clear-filter-btn" onclick="clearCategoryFilter()">
                    <i class="fas fa-times"></i> Hapus Filter
                </button>
            </div>
        `;
        
        // Insert before app list
        appList.parentNode.insertBefore(header, appList);
    }
}

// Clear category filter
window.clearCategoryFilter = function() {
    // Remove header
    const header = document.getElementById('categoryHeader');
    if (header) {
        header.remove();
    }
    
    // Reset filter dropdown
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = 'all';
    }
    
    // Remove active state from buttons
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show all apps
    if (typeof handleFilter === 'function') {
        handleFilter();
    }
}

// Helper Functions
function generateStars(score) {
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }

    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }

    const emptyStars = 5 - Math.ceil(score);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

function getScoreBadge(score) {
    if (score >= 4.5) {
        return '<span class="score-badge score-excellent">Excellent</span>';
    } else if (score >= 3.5) {
        return '<span class="score-badge score-good">Good</span>';
    } else if (score >= 2.5) {
        return '<span class="score-badge score-fair">Fair</span>';
    } else {
        return '<span class="score-badge score-poor">Poor</span>';
    }
}

function getCategoryLabel(category) {
    const labels = {
        'telemedicine': 'Telemedicine',
        'fitness': 'Fitness & Wellness',
        'mental': 'Kesehatan Mental',
        'nutrition': 'Nutrisi',
        'sleep': 'Sleep Monitor',
        'pregnancy': 'Kesehatan Ibu & Anak',
        'chronic': 'Penyakit Kronis',
        'elderly': 'Kesehatan Lansia'
    };
    return labels[category] || category;
}

// --- Charts & Analysis ---
function renderCharts(apps) {
    if (!window.Chart) return;

    const scores = apps.map(a => parseFloat(a.overall_score) || 0);
    const categories = apps.map(a => a.category || 'unknown');
    const dates = apps.map(a => a.evaluation_date || null);

    // Score distribution buckets (0-1,1-2,2-3,3-4,4-5)
    const buckets = [0, 0, 0, 0, 0];
    scores.forEach(s => {
        if (s < 1) buckets[0]++;
        else if (s < 2) buckets[1]++;
        else if (s < 3) buckets[2]++;
        else if (s < 4) buckets[3]++;
        else buckets[4]++;
    });

    // Category counts for pie chart
    const categoryCounts = {};
    categories.forEach(c => { categoryCounts[c] = (categoryCounts[c] || 0) + 1; });

    // Trend: average score per month (from evaluation_date if available)
    // Create monthly data from 2024-01 to current month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Group apps by evaluation date
    const monthly = {};
    apps.forEach(a => {
        const d = a.evaluation_date ? new Date(a.evaluation_date) : null;
        const key = d && !isNaN(d) ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` : '2024-01';
        monthly[key] = monthly[key] || { sum: 0, count: 0 };
        monthly[key].sum += parseFloat(a.overall_score) || 0;
        monthly[key].count += 1;
    });

    // Generate all months from 2024-01 to current month
    const startDate = new Date('2024-01-01');
    const endDate = new Date(`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`);
    const allMonths = [];
    let current = new Date(startDate);
    
    while (current <= endDate) {
        const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        allMonths.push(monthKey);
        current.setMonth(current.getMonth() + 1);
    }
    
    // Calculate average for each month, interpolate if missing
    const overallAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const trendLabels = allMonths;
    const trendData = allMonths.map(monthKey => {
        if (monthly[monthKey]) {
            return +(monthly[monthKey].sum / monthly[monthKey].count).toFixed(2);
        }
        // Use overall average for missing months (will be interpolated by createTrendChart)
        return overallAvg;
    });

    // Colors
    const palette = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

    // Destroy existing charts if present
    if (!window.charts) window.charts = {};
    Object.keys(window.charts).forEach(key => {
        try { window.charts[key].destroy(); } catch (e) { }
    });

    // Score distribution - Bar chart
    const scoreCtx = document.getElementById('scoreChart').getContext('2d');
    window.charts.scoreChart = new Chart(scoreCtx, {
        type: 'bar',
        data: {
            labels: ['0-1', '1-2', '2-3', '3-4', '4-5'],
            datasets: [{
                label: 'Jumlah Aplikasi',
                data: buckets,
                backgroundColor: palette.slice(0, 5),
                borderRadius: 8,
                maxBarThickness: 48
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: 'var(--muted-color)' } },
                y: { beginAtZero: true, ticks: { color: 'var(--muted-color)' } }
            }
        }
    });

    // Category - Doughnut chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    const catLabels = Object.keys(categoryCounts).map(k => getCategoryLabel(k));
    const catValues = Object.values(categoryCounts);
    const catColors = palette.slice(0, catLabels.length);

    window.charts.categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: catLabels,
            datasets: [{ data: catValues, backgroundColor: catColors, hoverOffset: 8 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { color: 'var(--muted-color)' } },
                tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.formattedValue} aplikasi` } }
            }
        }
    });

    // Trend - Line chart
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    window.charts.trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: trendLabels,
            datasets: [{
                label: 'Rata-rata Skor',
                data: trendData,
                borderColor: palette[0],
                backgroundColor: hexToRgba(palette[0], 0.08),
                tension: 0.35,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
            scales: {
                x: { ticks: { color: 'var(--muted-color)' }, grid: { display: false } },
                y: { beginAtZero: true, ticks: { color: 'var(--muted-color)' }, suggestedMax: 5 }
            }
        }
    });

    // Fill analysis sections
    try {
        const scoreAnalysis = document.getElementById('scoreAnalysis');
        const categoryAnalysis = document.getElementById('categoryAnalysis');
        const trendAnalysis = document.getElementById('trendAnalysis');

        const mean = meanOfArray(scores).toFixed(2);
        const median = medianOfArray(scores).toFixed(2);
        const topBucketIndex = buckets.indexOf(Math.max(...buckets));
        const topBucketLabel = ['0-1', '1-2', '2-3', '3-4', '4-5'][topBucketIndex];

        scoreAnalysis.innerHTML = `Rata-rata skor: <strong>${mean}</strong>. Median: <strong>${median}</strong>. Kelompok terbanyak: <strong>${topBucketLabel}</strong>. Gunakan tabel dan filter untuk melihat distribusi per kategori.`;

        // Top category
        const topCatIdx = catValues.indexOf(Math.max(...catValues));
        const topCat = catLabels[topCatIdx] || '—';
        categoryAnalysis.innerHTML = `Kategori terbanyak: <strong>${topCat}</strong> (${catValues[topCatIdx]} aplikasi). Periksa skor rata-rata per kategori untuk insight lebih dalam.`;

        // Trend analysis
        const trendChange = trendData.length >= 2 ? (trendData[trendData.length - 1] - trendData[0]).toFixed(2) : '0.00';
        trendAnalysis.innerHTML = `Periode: <strong>${trendLabels[0]}</strong> → <strong>${trendLabels[trendLabels.length - 1]}</strong>. Perubahan rata-rata skor: <strong>${trendChange}</strong>. Lihat titik outlier untuk tanggal evaluasi yang berbeda.`;
    } catch (e) {
        console.warn('Analysis render error', e);
    }
}

// Small helpers
function meanOfArray(arr) { if (!arr.length) return 0; return arr.reduce((a, b) => a + (parseFloat(b) || 0), 0) / arr.length; }
function medianOfArray(arr) { if (!arr.length) return 0; const s = arr.slice().sort((a, b) => a - b); const mid = Math.floor(s.length / 2); return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2; }
function hexToRgba(hex, alpha) { const h = hex.replace('#', ''); const bigint = parseInt(h, 16); const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255; return `rgba(${r},${g},${b},${alpha})`; }

function showError(message) {
    const appList = document.getElementById('appList');
    appList.innerHTML = `<div class="error-message" style="text-align: center; padding: 40px; color: white; background: rgba(239, 68, 68, 0.2); border-radius: 10px; margin: 20px 0;">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
        <p>${message}</p>
    </div>`;
}

