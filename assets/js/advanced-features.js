// Advanced Features: Share, Export, Toast, Search Suggestions

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

// Favorites and Recent Views features removed

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
                ${app.logo ? `<img src="${app.logo}" alt="${app.name}" class="app-logo-small" onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<i class=\\'${app.icon}\\'></i>';">
                <i class="${app.icon}" style="display: none;"></i>` : `<i class="${app.icon}"></i>`}
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
window.quickFilter = function(category, buttonElement) {
    // Close modal if open
    if (window.closeModalIfOpen) {
        window.closeModalIfOpen();
    }
    
    // Hide all other sections
    const sections = ['dashboard', 'compareSection', 'problemDefinition', 'systemDesign', 
                     'insights', 'ethics', 'about', 'symptomChecker'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    
    // Show app list
    const appList = document.getElementById('appList');
    if (appList) {
        appList.classList.remove('hidden');
    }
    
    // Update category filter dropdown
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = category;
    }
    
    // Update active state for quick filter buttons
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Set active state for clicked button
    if (buttonElement) {
        buttonElement.classList.add('active');
    } else {
        // Fallback: find button by category
        const buttons = document.querySelectorAll('.quick-filter-btn');
        buttons.forEach(btn => {
            const onclick = btn.getAttribute('onclick');
            if (onclick && onclick.includes(`'${category}'`)) {
                btn.classList.add('active');
            }
        });
    }
    
    // Clear search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Set sort to score descending for better UX when filtering by category
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter && sortFilter.value === 'name') {
        sortFilter.value = 'score-desc';
    }
    
    // Apply filter
    if (typeof handleFilter === 'function') {
        handleFilter();
    } else {
        // Fallback: manually filter and display
        if (window.allApps && window.allApps.length > 0) {
            let filtered = window.allApps.filter(app => app.category === category);
            
            // Sort by score descending (best apps first)
            filtered.sort((a, b) => b.overall_score - a.overall_score);
            
            // Update filteredApps global variable
            if (typeof window.filteredApps !== 'undefined') {
                window.filteredApps = filtered;
            }
            
            if (typeof displayApps === 'function') {
                displayApps(filtered);
            }
        }
    }
    
    // Scroll to app list smoothly
    setTimeout(() => {
        const appListElement = document.getElementById('appList');
        if (appListElement) {
            appListElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
    
    // Update nav active state
    if (typeof updateNavActive === 'function') {
        updateNavActive('home');
    }
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
    setupSearchSuggestions();
});

// Removed displayAppsWithFavorites - using standard displayApps from app.js instead

// Make functions globally available
window.showToast = showToast;
window.shareApp = shareApp;
window.selectSuggestion = selectSuggestion;
window.quickFilter = quickFilter;
window.exportToExcel = exportToExcel;
window.exportToCSV = exportToCSV;

