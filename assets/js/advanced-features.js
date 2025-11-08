// Advanced Features: Favorites, Recent Views, Share, Export, Toast, Search Suggestions

// Global compare apps array
let compareApps = [];

// Toast Notification System
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// Favorites Management
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let recentViews = JSON.parse(localStorage.getItem('recentViews') || '[]');

function updateFavoriteCount() {
    const count = favorites.length;
    const badge = document.getElementById('favoriteCount');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

function isFavorite(appId) {
    return favorites.includes(appId);
}

function toggleFavorite(appId = null) {
    const id = appId || currentAppId;
    if (!id) return;
    
    const index = favorites.indexOf(id);
    const favoriteBtn = document.getElementById('favoriteBtn');
    
    if (index > -1) {
        favorites.splice(index, 1);
        if (favoriteBtn) {
            favoriteBtn.classList.remove('favorited');
            favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
        }
        showToast('Dihapus dari favorit', 'info');
    } else {
        favorites.push(id);
        if (favoriteBtn) {
            favoriteBtn.classList.add('favorited');
            favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
        }
        showToast('Ditambahkan ke favorit', 'success');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteCount();
    updateFavoriteIcons();
}

function updateFavoriteIcons() {
    document.querySelectorAll('.favorite-icon').forEach(icon => {
        const appId = parseInt(icon.dataset.appId);
        if (isFavorite(appId)) {
            icon.classList.add('favorited');
            icon.innerHTML = '<i class="fas fa-heart"></i>';
        } else {
            icon.classList.remove('favorited');
            icon.innerHTML = '<i class="far fa-heart"></i>';
        }
    });
}

async function showFavorites() {
    hideAllSections();
    document.getElementById('favoritesSection').classList.remove('hidden');
    updateNavActive('favorites');
    
    if (favorites.length === 0) {
        document.getElementById('favoritesList').innerHTML = `
            <div class="no-results">
                <i class="fas fa-heart" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <p>Belum ada aplikasi favorit</p>
            </div>
        `;
        return;
    }
    
    const favoriteApps = allApps.filter(app => favorites.includes(app.id));
    displayAppsWithFavorites(favoriteApps, 'favoritesList');
}

// Recent Views Management
function addToRecentViews(appId) {
    if (!appId) return;
    
    const index = recentViews.indexOf(appId);
    if (index > -1) {
        recentViews.splice(index, 1);
    }
    
    recentViews.unshift(appId);
    recentViews = recentViews.slice(0, 10); // Keep only last 10
    
    localStorage.setItem('recentViews', JSON.stringify(recentViews));
}

async function showRecentViews() {
    hideAllSections();
    document.getElementById('recentViewsSection').classList.remove('hidden');
    updateNavActive('recent');
    
    if (recentViews.length === 0) {
        document.getElementById('recentViewsList').innerHTML = `
            <div class="no-results">
                <i class="fas fa-history" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <p>Belum ada aplikasi yang dilihat</p>
            </div>
        `;
        return;
    }
    
    const recentApps = allApps.filter(app => recentViews.includes(app.id));
    displayAppsWithFavorites(recentApps, 'recentViewsList');
}

// Share Functionality
function shareApp() {
    if (!currentAppId) return;
    
    const app = allApps.find(a => a.id === currentAppId);
    if (!app) return;
    
    const shareText = `Evaluasi ${app.name}: Skor ${app.overall_score.toFixed(1)}/5.0 - ${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: `Evaluasi ${app.name}`,
            text: shareText,
            url: window.location.href
        }).then(() => {
            showToast('Berhasil dibagikan', 'success');
        }).catch(() => {
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Link disalin ke clipboard', 'success');
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Link disalin ke clipboard', 'success');
    });
}

// Search Suggestions
function setupSearchSuggestions() {
    const searchInput = document.getElementById('searchInput');
    const suggestionsDiv = document.getElementById('searchSuggestions');
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 2) {
            suggestionsDiv.classList.add('hidden');
            return;
        }
        
        const matches = allApps.filter(app => 
            app.name.toLowerCase().includes(query) ||
            getCategoryLabel(app.category).toLowerCase().includes(query)
        ).slice(0, 5);
        
        if (matches.length === 0) {
            suggestionsDiv.classList.add('hidden');
            return;
        }
        
        suggestionsDiv.innerHTML = matches.map(app => `
            <div class="suggestion-item" onclick="selectSuggestion(${app.id})">
                <i class="${app.icon}"></i>
                <div>
                    <div style="font-weight: 600;">${app.name}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">${getCategoryLabel(app.category)}</div>
                </div>
            </div>
        `).join('');
        
        suggestionsDiv.classList.remove('hidden');
    });
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.classList.add('hidden');
        }
    });
}

function selectSuggestion(appId) {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchSuggestions').classList.add('hidden');
    showAppDetail(appId);
}

// Quick Filters
function quickFilter(category) {
    document.getElementById('categoryFilter').value = category;
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.quick-filter-btn').classList.add('active');
    handleFilter();
}

// Export Functions
function exportToExcel() {
    if (!allApps || allApps.length === 0) {
        showToast('Tidak ada data untuk diekspor', 'warning');
        return;
    }
    
    let csv = 'Nama,Kategori,Skor Keseluruhan,Kualitas,Privasi,Literasi,Kemudahan,Akurasi,Rating Store,Pengguna Aktif\n';
    
    allApps.forEach(app => {
        csv += `"${app.name}","${getCategoryLabel(app.category)}",${app.overall_score},${app.quality_score},${app.privacy_score},${app.literacy_score},${app.usability_score},${app.accuracy_score},${app.store_rating},"${app.active_users}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'evaluasi-aplikasi-kesehatan.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Data berhasil diekspor ke CSV', 'success');
}

function exportToCSV() {
    exportToExcel(); // Same function
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateFavoriteCount();
    setupSearchSuggestions();
    
    // Update favorite button state when viewing detail
    const originalShowAppDetail = window.showAppDetail;
    window.showAppDetail = async function(appId) {
        await originalShowAppDetail(appId);
        addToRecentViews(appId);
        
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn) {
            if (isFavorite(appId)) {
                favoriteBtn.classList.add('favorited');
                favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
            } else {
                favoriteBtn.classList.remove('favorited');
                favoriteBtn.innerHTML = '<i class="far fa-heart"></i>';
            }
        }
    };
});

// Enhanced displayApps with favorite icons
function displayAppsWithFavorites(apps, containerId = 'appList') {
    const container = document.getElementById(containerId);
    
    if (apps.length === 0) {
        container.innerHTML = '<div class="no-results">Tidak ada aplikasi yang ditemukan</div>';
        return;
    }
    
    container.innerHTML = apps.map(app => `
        <div class="app-card" onclick="showAppDetail(${app.id})">
            <div class="favorite-icon ${isFavorite(app.id) ? 'favorited' : ''}" 
                 data-app-id="${app.id}" 
                 onclick="event.stopPropagation(); toggleFavorite(${app.id})">
                <i class="${isFavorite(app.id) ? 'fas' : 'far'} fa-heart"></i>
            </div>
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
    `).join('');
    
    updateFavoriteIcons();
}

// Make functions globally available
window.showToast = showToast;
window.toggleFavorite = toggleFavorite;
window.showFavorites = showFavorites;
window.showRecentViews = showRecentViews;
window.shareApp = shareApp;
window.selectSuggestion = selectSuggestion;
window.quickFilter = quickFilter;
window.exportToExcel = exportToExcel;
window.exportToCSV = exportToCSV;
window.isFavorite = isFavorite;
window.updateFavoriteIcons = updateFavoriteIcons;
window.addToRecentViews = addToRecentViews;

