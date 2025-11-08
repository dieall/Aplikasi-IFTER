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
    document.getElementById('categoryFilter').addEventListener('change', handleFilter);
    document.getElementById('scoreFilter').addEventListener('change', handleFilter);
    document.getElementById('sortFilter').addEventListener('change', handleFilter);

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
        container.innerHTML = '<div class="no-results">Tidak ada aplikasi yang ditemukan</div>';
        return;
    }

    container.innerHTML = apps.map(app => {
        const isFav = window.isFavorite ? window.isFavorite(app.id) : false;
        return `
        <div class="app-card" onclick="showAppDetail(${app.id})">
            ${window.isFavorite ? `
            <div class="favorite-icon ${isFav ? 'favorited' : ''}" 
                 data-app-id="${app.id}" 
                 onclick="event.stopPropagation(); toggleFavorite(${app.id})">
                <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
            </div>
            ` : ''}
            <div class="app-card-header">
                <div class="app-icon">
                    <i class="${app.icon}"></i>
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

    if (window.updateFavoriteIcons) {
        window.updateFavoriteIcons();
    }
}

// Show App Detail
async function showAppDetail(appId) {
    currentAppId = appId; // Store for compare feature

    // Hide all content sections
    const contentSections = ['appList', 'dashboard', 'compareSection',
        'problemDefinition', 'systemDesign', 'insights', 'ethics', 'about'];
    contentSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    const appDetail = document.getElementById('appDetail');
    const detailContent = document.getElementById('detailContent');
    appDetail.classList.remove('hidden');

    const loading = document.getElementById('loading');
    loading.classList.remove('hidden');

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
            showError(data.message || 'Gagal memuat detail aplikasi');
        }
    } catch (error) {
        console.error('Error loading app detail:', error);
        showError(`Terjadi kesalahan saat memuat detail: ${error.message}`);
    } finally {
        loading.classList.add('hidden');
    }
}

// Generate Detail HTML
function generateDetailHTML(app) {
    return `
        <div class="detail-header">
            <div class="detail-icon">
                <i class="${app.icon}"></i>
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
function closeDetail() {
    const appDetail = document.getElementById('appDetail');
    const appList = document.getElementById('appList');

    appDetail.classList.add('hidden');
    appList.classList.remove('hidden');
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
function handleFilter() {
    const category = document.getElementById('categoryFilter').value;
    const minScore = parseFloat(document.getElementById('scoreFilter').value);
    const sortBy = document.getElementById('sortFilter').value;

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

    // Sort
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
    }

    displayApps(filteredApps);
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
        'nutrition': 'Nutrisi'
    };
    return labels[category] || category;
}

function showError(message) {
    const appList = document.getElementById('appList');
    appList.innerHTML = `<div class="error-message" style="text-align: center; padding: 40px; color: white; background: rgba(239, 68, 68, 0.2); border-radius: 10px; margin: 20px 0;">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
        <p>${message}</p>
    </div>`;
}

