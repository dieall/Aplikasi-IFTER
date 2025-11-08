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

// --- Knowledge base: gejala -> possible diseases, descriptions, initial handling, and recommended meds ---
const gejalaData = {
    "batuk": { "flu": 0.6, "tbc": 0.8 },
    "demam": { "flu": 0.7, "dbd": 0.9 },
    "sakit kepala": { "flu": 0.5, "migraine": 0.9 },
    "pilek": { "flu": 0.9 },
    "mimisan": { "dbd": 0.5 },
    "berkeringat malam": { "tbc": 0.7 },
    "mual": { "dbd": 0.6 },
    "pusing": { "migraine": 0.7 },
    "nyeri perut": { "maag": 0.9 }
};

const deskripsiPenyakit = {
    "flu": "Infeksi virus yang menyerang saluran pernapasan.",
    "tbc": "Infeksi bakteri Mycobacterium tuberculosis.",
    "dbd": "Infeksi virus dengue yang ditularkan oleh nyamuk.",
    "migraine": "Sakit kepala berulang yang bisa disertai mual.",
    "maag": "Iritasi atau luka pada lambung."
};

const penangananAwal = {
    "flu": "Istirahat cukup dan minum air hangat.",
    "tbc": "Segera konsultasikan ke dokter untuk pengobatan jangka panjang.",
    "dbd": "Periksa trombosit dan konsultasikan ke rumah sakit.",
    "migraine": "Hindari stres dan konsumsi obat pereda nyeri.",
    "maag": "Hindari makanan pedas, asam, dan makan teratur."
};

const rekomendasiObat = {
    "flu": "Paracetamol, dekongestan, antihistamin.",
    "tbc": "Rifampisin, isoniazid (sesuai resep dokter).",
    "dbd": "Paracetamol (bukan aspirin), cairan oralit.",
    "migraine": "Ibuprofen, sumatriptan.",
    "maag": "Antasida, ranitidine, omeprazole."
};

function recommendMedications(symptomText, analysis) {
    const text = (symptomText || '').toLowerCase();
    const matchedSymptoms = [];

    // Find known symptom tokens in the text
    Object.keys(gejalaData).forEach(sym => {
        if (text.includes(sym)) matchedSymptoms.push(sym);
    });

    const diseaseScores = {};
    matchedSymptoms.forEach(sym => {
        const map = gejalaData[sym];
        Object.entries(map).forEach(([disease, score]) => {
            diseaseScores[disease] = (diseaseScores[disease] || 0) + score;
        });
    });

    // Sort diseases by score
    const sortedDiseases = Object.keys(diseaseScores).sort((a, b) => diseaseScores[b] - diseaseScores[a]);

    // Collect recommended meds and initial handling for top diseases
    const meds = [];
    const penanganan = [];
    sortedDiseases.slice(0, 3).forEach(d => {
        if (rekomendasiObat[d]) meds.push(`${d}: ${rekomendasiObat[d]}`);
        if (penangananAwal[d]) penanganan.push(`${d}: ${penangananAwal[d]}`);
    });

    return {
        matchedSymptoms,
        diseaseScores,
        sortedDiseases,
        meds,
        penanganan
    };
}

// Show Symptom Checker
function showSymptomChecker() {
    // Close modal if open
    if (window.closeModalIfOpen) {
        window.closeModalIfOpen();
    }
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

    // Return only the top 1 recommendation (most relevant)
    // Filter to only show apps that match the category
    const topMatches = recommendations.filter(rec => rec.isTopMatch);

    if (topMatches.length > 0) {
        // Return only the best match
        return [topMatches[0]];
    }

    // If no category match, return top 1 overall
    return recommendations.slice(0, 1);
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

    // Get top charts for matched categories
    const topCharts = getTopChartsForCategories(analysis.categories.map(cat => cat.category));

    let html = urgencyWarning;

    // Build analysis summary and include KB-based medication suggestions
    try {
        const medsRes = recommendMedications(symptomText, analysis);

        html += `
        <div class="analysis-summary">
            <h4><i class="fas fa-chart-line"></i> Analisis Gejala</h4>
            <p><strong>Gejala yang dimasukkan:</strong> "${symptomText}"</p>
            <p><strong>Kategori yang cocok:</strong> ${matchedCategories || 'Konsultasi Umum'}</p>
            <p><strong>Tingkat kepercayaan:</strong> ${Math.round(analysis.confidence)}%</p>

            ${medsRes.meds && medsRes.meds.length > 0 ? `
                <div class="kb-medications">
                    <p><strong>Rekomendasi Obat (berdasarkan gejala):</strong></p>
                    <ul>
                        ${medsRes.meds.map(m => `<li>${m}</li>`).join('')}
                    </ul>
                </div>
            ` : `
                <div class="kb-medications">
                    <p><strong>Rekomendasi Obat:</strong> Tidak ada rekomendasi obat otomatis — konsultasikan ke penyedia layanan kesehatan.</p>
                </div>
            `}

            ${medsRes.penanganan && medsRes.penanganan.length > 0 ? `
                <div class="kb-penanganan">
                    <p><strong>Penanganan awal (ringkas):</strong></p>
                    <ul>
                        ${medsRes.penanganan.map(p => `<li>${p}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

        </div>
    `;
    } catch (e) {
        console.warn('KB recommend error', e);
        // Fallback to original summary without KB
        html += `
        <div class="analysis-summary">
            <h4><i class="fas fa-chart-line"></i> Analisis Gejala</h4>
            <p><strong>Gejala yang dimasukkan:</strong> "${symptomText}"</p>
            <p><strong>Kategori yang cocok:</strong> ${matchedCategories || 'Konsultasi Umum'}</p>
            <p><strong>Tingkat kepercayaan:</strong> ${Math.round(analysis.confidence)}%</p>
        </div>
        `;
    }

    // Trust Indicators
    const totalApps = allApps.length;
    const avgRating = allApps.reduce((sum, app) => sum + app.overall_score, 0) / totalApps;
    const totalUsers = allApps.reduce((sum, app) => {
        const users = app.active_users.match(/(\d+)/);
        return sum + (users ? parseInt(users[1]) : 0);
    }, 0);

    html += `
        <div class="trust-indicators">
            <div class="trust-item">
                <i class="fas fa-mobile-alt"></i>
                <div class="trust-item-value">${totalApps}+</div>
                <div class="trust-item-label">Aplikasi Dievaluasi</div>
            </div>
            <div class="trust-item">
                <i class="fas fa-star"></i>
                <div class="trust-item-value">${avgRating.toFixed(1)}</div>
                <div class="trust-item-label">Rating Rata-rata</div>
            </div>
            <div class="trust-item">
                <i class="fas fa-users"></i>
                <div class="trust-item-value">${totalUsers}+</div>
                <div class="trust-item-label">Juta Pengguna</div>
            </div>
            <div class="trust-item">
                <i class="fas fa-check-circle"></i>
                <div class="trust-item-value">100%</div>
                <div class="trust-item-label">Terverifikasi</div>
            </div>
        </div>
    `;

    // Top Charts Section
    if (topCharts.length > 0) {
        html += `
            <div class="top-charts-section">
                <h4><i class="fas fa-trophy"></i> Top Chart Aplikasi Terbaik</h4>
                <p class="charts-subtitle">Berdasarkan evaluasi komprehensif dan rating pengguna - Memberikan kepercayaan untuk pilihan Anda</p>
                <div class="top-charts-container">
                    ${topCharts.map((chart, index) => `
                        <div class="top-chart-card">
                            <div class="chart-header">
                                <h5><i class="${getCategoryIcon(chart.category)}"></i> ${chart.category === 'all' ? 'Semua Kategori' : getCategoryLabel(chart.category)}</h5>
                                <span class="chart-badge">Top ${chart.apps.length}</span>
                            </div>
                            <div class="chart-ranking">
                                ${chart.apps.map((app, rank) => `
                                    <div class="rank-item ${rank === 0 ? 'rank-gold' : rank === 1 ? 'rank-silver' : rank === 2 ? 'rank-bronze' : ''}" onclick="showAppDetail(${app.id}); showHome();">
                                        <div class="rank-number">${rank + 1}</div>
                                        <div class="rank-info">
                                            <div class="rank-name">${app.name}</div>
                                            <div class="rank-score">
                                                <span class="score-value">${app.overall_score.toFixed(1)}</span>
                                                <span class="score-stars">${generateStars(app.overall_score)}</span>
                                            </div>
                                        </div>
                                        <div class="rank-badge-icon">
                                            ${rank === 0 ? '<i class="fas fa-crown"></i>' : ''}
                                            ${rank === 1 ? '<i class="fas fa-medal"></i>' : ''}
                                            ${rank === 2 ? '<i class="fas fa-award"></i>' : ''}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Recommendations - Only show the top 1 recommendation
    if (recommendations.length > 0) {
        const rec = recommendations[0];
        const app = rec.app;

        html += '<div class="recommendations-list">';
        html += `
            <div class="recommendation-card recommended">
                <div class="recommendation-header">
                    <div class="recommendation-icon">
                        ${app.logo ? `<img src="${app.logo}" alt="${app.name}" class="app-logo" onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<i class=\\'${app.icon}\\'></i>';">
                        <i class="${app.icon}" style="display: none;"></i>` : `<i class="${app.icon}"></i>`}
                    </div>
                    <div class="recommendation-info">
                        <h4>
                            <span style="color: var(--secondary-color);">⭐ REKOMENDASI UTAMA</span> ${app.name}
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
        html += '</div>';
    }

    contentDiv.innerHTML = html;
}

// Get top charts for categories
function getTopChartsForCategories(categories) {
    if (!allApps || allApps.length === 0) return [];

    const charts = [];
    const uniqueCategories = [...new Set(categories)];

    uniqueCategories.forEach(category => {
        const categoryApps = allApps
            .filter(app => app.category === category)
            .sort((a, b) => b.overall_score - a.overall_score)
            .slice(0, 5); // Top 5 per category

        if (categoryApps.length > 0) {
            charts.push({
                category: category,
                apps: categoryApps
            });
        }
    });

    // If no specific category matched, show overall top apps
    if (charts.length === 0) {
        const topApps = allApps
            .sort((a, b) => b.overall_score - a.overall_score)
            .slice(0, 5);

        charts.push({
            category: 'all',
            apps: topApps
        });
    }

    return charts;
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        'telemedicine': 'fas fa-user-md',
        'fitness': 'fas fa-dumbbell',
        'mental': 'fas fa-brain',
        'nutrition': 'fas fa-apple-alt',
        'all': 'fas fa-star'
    };
    return icons[category] || 'fas fa-mobile-alt';
}

// Generate stars from score
function generateStars(score) {
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }

    if (hasHalfStar && fullStars < 5) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }

    const emptyStars = 5 - Math.ceil(score);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
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

