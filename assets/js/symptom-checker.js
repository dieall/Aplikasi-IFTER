// Symptom Checker & Recommendation System

// Symptom keywords mapping to app categories
const symptomKeywords = {
    'telemedicine': {
        keywords: [
            'sakit kepala', 'demam', 'batuk', 'pilek', 'flu', 'sakit tenggorokan',
            'nyeri', 'sakit', 'perut', 'mual', 'muntah', 'diare', 'sembelit',
            'sesak napas', 'nyeri dada', 'sakit perut', 'konsultasi dokter',
            'dokter', 'konsultasi', 'obat', 'resep', 'checkup', 'pemeriksaan',
            'gejala', 'penyakit', 'infeksi', 'radang', 'alergi', 'ruam',
            'gatal', 'luka', 'cedera', 'patah', 'keseleo', 'darurat medis'
        ],
        priority: 1
    },
    'mental': {
        keywords: [
            'cemas', 'anxiety', 'stress', 'depresi', 'depression', 'sulit tidur',
            'insomnia', 'panik', 'panic', 'trauma', 'emosi', 'marah', 'sedih',
            'putus asa', 'keputusasaan', 'overthinking', 'khawatir', 'takut',
            'fobia', 'mental', 'psikolog', 'konseling', 'meditasi', 'relaksasi',
            'mindfulness', 'kesehatan mental', 'wellbeing', 'self care'
        ],
        priority: 1
    },
    'nutrition': {
        keywords: [
            'diet', 'nutrisi', 'makanan', 'kalori', 'berat badan', 'obesitas',
            'kurus', 'gemuk', 'protein', 'karbohidrat', 'vitamin', 'mineral',
            'tracking makanan', 'meal plan', 'menu sehat', 'gizi', 'nutrisi',
            'makan sehat', 'diet sehat', 'penurunan berat badan', 'naik berat badan',
            'kolesterol', 'diabetes', 'gula darah', 'hipertensi', 'tekanan darah'
        ],
        priority: 2
    },
    'fitness': {
        keywords: [
            'olahraga', 'fitness', 'gym', 'latihan', 'exercise', 'workout',
            'jogging', 'lari', 'jalan', 'sepeda', 'renang', 'yoga', 'pilates',
            'strength', 'kardio', 'aerobik', 'stamina', 'kebugaran', 'fit',
            'massa otot', 'otot', 'lemak', 'burning', 'calories', 'kalori',
            'tracking aktivitas', 'step counter', 'pedometer'
        ],
        priority: 2
    }
};

// Show Symptom Checker
function showSymptomChecker() {
    hideAllSections();
    document.getElementById('symptomChecker').classList.remove('hidden');
    updateNavActive('symptom');
    
    // Clear previous results
    document.getElementById('recommendationResult').classList.add('hidden');
    document.getElementById('symptomInput').value = '';
}

// Fill symptom from example
function fillSymptom(symptom) {
    document.getElementById('symptomInput').value = symptom;
    document.getElementById('symptomInput').focus();
}

// Get recommendations based on symptoms
async function getRecommendations() {
    const symptomText = document.getElementById('symptomInput').value.trim().toLowerCase();
    const resultDiv = document.getElementById('recommendationResult');
    const contentDiv = document.getElementById('recommendationContent');
    
    if (!symptomText) {
        showToast('Silakan masukkan gejala yang Anda rasakan', 'warning');
        return;
    }
    
    // Show loading
    contentDiv.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Menganalisis gejala...</div>';
    resultDiv.classList.remove('hidden');
    
    // Scroll to results
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Analyze symptoms
    const analysis = analyzeSymptoms(symptomText);
    
    // Get recommended apps
    if (!allApps || allApps.length === 0) {
        await loadApps();
    }
    
    const recommendations = getRecommendedApps(analysis, allApps);
    
    // Display recommendations
    displayRecommendations(recommendations, symptomText, analysis);
    
    showToast(`Ditemukan ${recommendations.length} rekomendasi aplikasi`, 'success');
}

// Analyze symptoms and determine categories
function analyzeSymptoms(symptomText) {
    const analysis = {
        categories: [],
        matchedKeywords: {},
        urgency: 'normal', // normal, moderate, high
        confidence: 0
    };
    
    // Check each category
    for (const [category, config] of Object.entries(symptomKeywords)) {
        let matchCount = 0;
        const matched = [];
        
        for (const keyword of config.keywords) {
            if (symptomText.includes(keyword.toLowerCase())) {
                matchCount++;
                matched.push(keyword);
            }
        }
        
        if (matchCount > 0) {
            analysis.categories.push({
                category: category,
                score: matchCount * config.priority,
                matches: matched,
                matchCount: matchCount
            });
            analysis.matchedKeywords[category] = matched;
        }
    }
    
    // Sort by score
    analysis.categories.sort((a, b) => b.score - a.score);
    
    // Determine urgency
    const urgentKeywords = ['sesak napas', 'nyeri dada', 'darurat', 'patah', 'cedera serius', 'muntah darah'];
    if (urgentKeywords.some(kw => symptomText.includes(kw))) {
        analysis.urgency = 'high';
    } else if (analysis.categories.length > 0 && analysis.categories[0].score >= 3) {
        analysis.urgency = 'moderate';
    }
    
    // Calculate confidence
    const totalMatches = analysis.categories.reduce((sum, cat) => sum + cat.matchCount, 0);
    analysis.confidence = Math.min(100, (totalMatches / 5) * 100);
    
    return analysis;
}

// Get recommended apps based on analysis
function getRecommendedApps(analysis, apps) {
    if (analysis.categories.length === 0) {
        // Default: recommend telemedicine for general consultation
        return apps
            .filter(app => app.category === 'telemedicine')
            .sort((a, b) => b.overall_score - a.overall_score)
            .slice(0, 3);
    }
    
    const recommendations = [];
    const categoryScores = {};
    
    // Calculate scores for each category
    analysis.categories.forEach(cat => {
        categoryScores[cat.category] = cat.score;
    });
    
    // Score each app
    apps.forEach(app => {
        let score = 0;
        let matchReason = '';
        
        // Base score from category match
        if (categoryScores[app.category]) {
            score = categoryScores[app.category] * 10;
            matchReason = `Cocok untuk gejala ${getCategoryLabel(app.category).toLowerCase()}`;
        }
        
        // Bonus for high overall score
        score += app.overall_score * 5;
        
        // Bonus for high quality score
        score += app.quality_score * 3;
        
        // Bonus for high usability (important for users in distress)
        score += app.usability_score * 2;
        
        if (score > 0) {
            recommendations.push({
                app: app,
                score: score,
                matchReason: matchReason || `Aplikasi ${getCategoryLabel(app.category).toLowerCase()} yang direkomendasikan`,
                category: app.category,
                isTopMatch: categoryScores[app.category] > 0
            });
        }
    });
    
    // Sort by score
    recommendations.sort((a, b) => b.score - a.score);
    
    // Return top 5 recommendations
    return recommendations.slice(0, 5);
}

// Display recommendations
function displayRecommendations(recommendations, symptomText, analysis) {
    const contentDiv = document.getElementById('recommendationContent');
    
    if (recommendations.length === 0) {
        contentDiv.innerHTML = `
            <div class="no-results">
                <i class="fas fa-info-circle" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <p>Tidak ada rekomendasi yang ditemukan. Silakan coba dengan gejala yang lebih spesifik.</p>
            </div>
        `;
        return;
    }
    
    // Urgency warning
    let urgencyWarning = '';
    if (analysis.urgency === 'high') {
        urgencyWarning = `
            <div class="urgency-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Peringatan Darurat:</strong> Gejala yang Anda sebutkan mungkin memerlukan perhatian medis segera. 
                Segera hubungi layanan darurat (119) atau kunjungi IGD terdekat.
            </div>
        `;
    }
    
    // Analysis summary
    const matchedCategories = analysis.categories.map(cat => getCategoryLabel(cat.category)).join(', ');
    
    let html = urgencyWarning;
    
    html += `
        <div class="analysis-summary">
            <h4><i class="fas fa-chart-line"></i> Analisis Gejala</h4>
            <p><strong>Gejala yang dimasukkan:</strong> "${symptomText}"</p>
            <p><strong>Kategori yang cocok:</strong> ${matchedCategories || 'Konsultasi Umum'}</p>
            <p><strong>Tingkat kepercayaan:</strong> ${Math.round(analysis.confidence)}%</p>
        </div>
    `;
    
    // Recommendations
    html += '<div class="recommendations-list">';
    
    recommendations.forEach((rec, index) => {
        const app = rec.app;
        const isTop = rec.isTopMatch;
        const rank = index + 1;
        
        html += `
            <div class="recommendation-card ${isTop ? 'recommended' : ''}">
                <div class="recommendation-header">
                    <div class="recommendation-icon">
                        <i class="${app.icon}"></i>
                    </div>
                    <div class="recommendation-info">
                        <h4>
                            ${rank === 1 ? '<span style="color: var(--secondary-color);">⭐ REKOMENDASI UTAMA</span> ' : ''}
                            ${app.name}
                        </h4>
                        <div class="recommendation-match">
                            <i class="fas fa-check-circle"></i> ${rec.matchReason}
                        </div>
                    </div>
                </div>
                
                <div class="recommendation-stats">
                    <div class="stat-item">
                        <span class="stat-label">Skor Keseluruhan</span>
                        <span class="stat-value">${app.overall_score.toFixed(1)}/5.0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Kualitas</span>
                        <span class="stat-value">${app.quality_score.toFixed(1)}/5.0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Kemudahan</span>
                        <span class="stat-value">${app.usability_score.toFixed(1)}/5.0</span>
                    </div>
                </div>
                
                <div class="recommendation-reason">
                    <strong>Mengapa direkomendasikan:</strong> ${getRecommendationReason(app, analysis)}
                </div>
                
                <div class="recommendation-actions">
                    <button class="btn-view-detail" onclick="showAppDetail(${app.id}); showHome();">
                        <i class="fas fa-info-circle"></i> Lihat Detail
                    </button>
                    <button class="btn-compare" onclick="addToCompareFromRecommendation(${app.id})">
                        <i class="fas fa-balance-scale"></i> Bandingkan
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    contentDiv.innerHTML = html;
}

// Get recommendation reason
function getRecommendationReason(app, analysis) {
    const reasons = [];
    
    // Category match reason
    const categoryMatch = analysis.categories.find(cat => cat.category === app.category);
    if (categoryMatch) {
        reasons.push(`Aplikasi ini khusus untuk ${getCategoryLabel(app.category).toLowerCase()} dan cocok dengan gejala yang Anda sebutkan`);
    }
    
    // Quality reason
    if (app.quality_score >= 4.5) {
        reasons.push('memiliki kualitas yang sangat baik');
    } else if (app.quality_score >= 4.0) {
        reasons.push('memiliki kualitas yang baik');
    }
    
    // Usability reason
    if (app.usability_score >= 4.5) {
        reasons.push('sangat mudah digunakan');
    }
    
    // Privacy reason
    if (app.privacy_score >= 4.0) {
        reasons.push('memiliki privasi data yang terjamin');
    }
    
    // User count reason
    if (app.active_users && app.active_users.includes('juta')) {
        reasons.push('digunakan oleh jutaan pengguna');
    }
    
    if (reasons.length === 0) {
        return 'Aplikasi ini direkomendasikan berdasarkan evaluasi komprehensif.';
    }
    
    return reasons.join(', ') + '.';
}

// Add to compare from recommendation
function addToCompareFromRecommendation(appId) {
    // Get compareApps from global scope (defined in features.js)
    if (!window.compareApps) {
        window.compareApps = [];
    }
    
    if (window.compareApps.length < 2) {
        if (!window.compareApps.includes(appId)) {
            window.compareApps.push(appId);
            showToast(`Aplikasi ditambahkan ke perbandingan (${window.compareApps.length}/2)`, 'success');
            
            if (window.compareApps.length === 2) {
                // Auto fill and show compare
                setTimeout(() => {
                    const select1 = document.getElementById('compareApp1');
                    const select2 = document.getElementById('compareApp2');
                    if (select1 && select2) {
                        select1.value = window.compareApps[0];
                        select2.value = window.compareApps[1];
                        if (window.showCompare) showCompare();
                        setTimeout(() => {
                            if (window.doCompare) doCompare();
                        }, 500);
                    }
                }, 300);
            }
        } else {
            showToast('Aplikasi sudah ada di perbandingan', 'info');
        }
    } else {
        showToast('Maksimal 2 aplikasi untuk dibandingkan. Hapus salah satu terlebih dahulu.', 'warning');
    }
}

// Make functions globally available
window.showSymptomChecker = showSymptomChecker;
window.fillSymptom = fillSymptom;
window.getRecommendations = getRecommendations;
window.addToCompareFromRecommendation = addToCompareFromRecommendation;

