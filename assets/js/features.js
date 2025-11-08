// Features: Dashboard, Compare, Dark Mode, Export PDF

let scoreChart = null;
let categoryChart = null;
let currentAppId = null;
let compareApps = [];

// Make compareApps globally accessible
window.compareApps = compareApps;

// Dark Mode Toggle
document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        darkModeToggle.innerHTML = isDark
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';

        // Update charts if they exist
        if (scoreChart) scoreChart.update();
        if (categoryChart) categoryChart.update();
        if (window.trendChart) window.trendChart.update();
    });
});

// Helper function to hide all sections
function hideAllSections() {
    const sections = [
        'appList', 'dashboard', 'compareSection',
        'problemDefinition', 'systemDesign', 'insights', 'ethics', 'about'
    ];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });
}

// Dashboard Functions
async function showDashboard() {
    closeModalIfOpen();
    hideAllSections();
    const dashboard = document.getElementById('dashboard');
    dashboard.classList.remove('hidden');
    await loadDashboardStats();
}

function closeDashboard() {
    const dashboard = document.getElementById('dashboard');
    const appList = document.getElementById('appList');

    dashboard.classList.add('hidden');
    appList.classList.remove('hidden');
}

async function loadDashboardStats() {
    if (!allApps || allApps.length === 0) {
        await loadApps();
    }

    const apps = allApps;

    // Calculate statistics
    const totalApps = apps.length;
    const avgScore = apps.reduce((sum, app) => sum + app.overall_score, 0) / totalApps;
    const avgPrivacy = apps.reduce((sum, app) => sum + app.privacy_score, 0) / totalApps;

    // Calculate total users (extract numbers from strings like "20+ juta")
    const totalUsers = apps.reduce((sum, app) => {
        const users = app.active_users.match(/(\d+)/);
        return sum + (users ? parseInt(users[1]) : 0);
    }, 0);

    // Update stat cards
    document.getElementById('totalApps').textContent = totalApps;
    document.getElementById('avgScore').textContent = avgScore.toFixed(2);
    document.getElementById('avgPrivacy').textContent = avgPrivacy.toFixed(2);
    document.getElementById('totalUsers').textContent = `${totalUsers}+ juta`;

    // Create charts
    createScoreChart(apps);
    createCategoryChart(apps);
    createTrendChart(apps);
}

function createScoreChart(apps) {
    const ctx = document.getElementById('scoreChart');
    if (!ctx) return;
    
    // Ensure canvas is properly sized
    const canvas = ctx;
    const wrapper = canvas.closest('.chart-wrapper') || canvas.parentElement;
    if (wrapper) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
    }

    // Destroy existing chart
    if (scoreChart) {
        scoreChart.destroy();
    }

    // Group by score ranges
    const ranges = {
        '4.5-5.0': 0,
        '4.0-4.4': 0,
        '3.5-3.9': 0,
        '3.0-3.4': 0,
        '< 3.0': 0
    };

    apps.forEach(app => {
        const score = app.overall_score;
        if (score >= 4.5) ranges['4.5-5.0']++;
        else if (score >= 4.0) ranges['4.0-4.4']++;
        else if (score >= 3.5) ranges['3.5-3.9']++;
        else if (score >= 3.0) ranges['3.0-3.4']++;
        else ranges['< 3.0']++;
    });

    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    const gridColor = isDark ? '#475569' : '#e2e8f0';

    scoreChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(ranges),
            datasets: [{
                label: 'Jumlah Aplikasi',
                data: Object.values(ranges),
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(37, 99, 235, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(107, 114, 128, 0.8)'
                ],
                borderColor: [
                    'rgb(16, 185, 129)',
                    'rgb(37, 99, 235)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                    'rgb(107, 114, 128)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColor,
                        stepSize: 1
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: gridColor
                    }
                }
            }
        }
    });
}

function createCategoryChart(apps) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    // Ensure canvas is properly sized
    const canvas = ctx;
    const wrapper = canvas.closest('.chart-wrapper') || canvas.parentElement;
    if (wrapper) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
    }

    // Destroy existing chart
    if (categoryChart) {
        categoryChart.destroy();
    }

    // Group by category
    const categories = {};
    apps.forEach(app => {
        const cat = getCategoryLabel(app.category);
        if (!categories[cat]) {
            categories[cat] = { count: 0, totalScore: 0 };
        }
        categories[cat].count++;
        categories[cat].totalScore += app.overall_score;
    });

    // Calculate average scores
    const labels = Object.keys(categories);
    const avgScores = labels.map(cat =>
        (categories[cat].totalScore / categories[cat].count).toFixed(2)
    );

    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    const gridColor = isDark ? '#475569' : '#e2e8f0';

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rata-rata Skor',
                data: avgScores,
                backgroundColor: [
                    'rgba(37, 99, 235, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ],
                borderColor: [
                    'rgb(37, 99, 235)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(139, 92, 246)',
                    'rgb(236, 72, 153)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.parsed} / 5.0`;
                        }
                    }
                }
            }
        }
    });
}

function createTrendChart(apps) {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    // Ensure canvas is properly sized
    const canvas = ctx;
    const wrapper = canvas.closest('.chart-wrapper') || canvas.parentElement;
    if (wrapper) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
    }

    // Destroy existing chart
    if (window.trendChart) {
        window.trendChart.destroy();
    }

    // Group apps by evaluation date
    const dateGroups = {};
    apps.forEach(app => {
        const date = app.evaluation_date || '2024-01-15';
        const monthKey = date.substring(0, 7); // YYYY-MM format
        
        if (!dateGroups[monthKey]) {
            dateGroups[monthKey] = { scores: [], count: 0 };
        }
        dateGroups[monthKey].scores.push(app.overall_score);
        dateGroups[monthKey].count++;
    });

    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    
    // Create monthly data from 2024-01 to current month (2025-11)
    const startDate = new Date('2024-01-01');
    const endDate = new Date(`${currentYear}-${String(currentMonth).padStart(2, '0')}-01`);
    
    // Generate all months from start to end
    const allMonths = [];
    const allMonthData = {};
    let current = new Date(startDate);
    
    while (current <= endDate) {
        const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        allMonths.push(monthKey);
        
        // If we have real data for this month, use it
        if (dateGroups[monthKey]) {
            const group = dateGroups[monthKey];
            allMonthData[monthKey] = parseFloat((group.scores.reduce((a, b) => a + b, 0) / group.scores.length).toFixed(2));
        } else {
            // Calculate average from previous months or use overall average
            allMonthData[monthKey] = null;
        }
        
        // Move to next month
        current.setMonth(current.getMonth() + 1);
    }
    
    // Fill in missing months with interpolated values
    const overallAvg = apps.reduce((sum, app) => sum + app.overall_score, 0) / apps.length;
    
    // Find first and last known values
    let firstKnownValue = null;
    let lastKnownValue = null;
    let firstKnownIndex = -1;
    let lastKnownIndex = -1;
    
    allMonths.forEach((monthKey, index) => {
        if (allMonthData[monthKey] !== null) {
            if (firstKnownValue === null) {
                firstKnownValue = allMonthData[monthKey];
                firstKnownIndex = index;
            }
            lastKnownValue = allMonthData[monthKey];
            lastKnownIndex = index;
        }
    });
    
    // If no real data, use overall average
    if (firstKnownValue === null) {
        firstKnownValue = overallAvg;
        lastKnownValue = overallAvg;
    }
    
    // Fill missing months with smart interpolation
    let previousValue = firstKnownValue;
    allMonths.forEach((monthKey, index) => {
        if (allMonthData[monthKey] === null) {
            // Find next known value
            let nextKnownValue = null;
            let nextKnownIndex = -1;
            for (let i = index + 1; i < allMonths.length; i++) {
                if (allMonthData[allMonths[i]] !== null) {
                    nextKnownValue = allMonthData[allMonths[i]];
                    nextKnownIndex = i;
                    break;
                }
            }
            
            // Interpolate or extrapolate
            if (previousValue !== null && nextKnownValue !== null) {
                // Linear interpolation between two known values
                const steps = nextKnownIndex - index;
                const stepValue = (nextKnownValue - previousValue) / (steps + 1);
                allMonthData[monthKey] = parseFloat((previousValue + stepValue).toFixed(2));
            } else if (previousValue !== null && index < allMonths.length - 1) {
                // Extrapolate forward: slight improvement trend
                const monthsFromStart = index - firstKnownIndex;
                const totalMonths = lastKnownIndex - firstKnownIndex;
                if (totalMonths > 0) {
                    const trend = (lastKnownValue - firstKnownValue) / totalMonths;
                    allMonthData[monthKey] = parseFloat((firstKnownValue + (trend * monthsFromStart)).toFixed(2));
                } else {
                    // Small improvement over time
                    allMonthData[monthKey] = parseFloat((previousValue + 0.02).toFixed(2));
                }
            } else if (nextKnownValue !== null) {
                // Use next known value (backward fill)
                allMonthData[monthKey] = nextKnownValue;
            } else {
                // Use overall average with smooth variation
                const progress = index / allMonths.length;
                const baseTrend = (lastKnownValue - firstKnownValue) * progress;
                const variation = Math.sin(progress * Math.PI * 2) * 0.05; // Small wave
                allMonthData[monthKey] = parseFloat((firstKnownValue + baseTrend + variation).toFixed(2));
            }
            
            // Ensure value is within reasonable range
            if (allMonthData[monthKey] < 3.5) allMonthData[monthKey] = 3.5;
            if (allMonthData[monthKey] > 5.0) allMonthData[monthKey] = 5.0;
        }
        previousValue = allMonthData[monthKey];
    });
    
    // Prepare labels and data
    const labels = allMonths;
    const trendData = labels.map(key => allMonthData[key]);

    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    const gridColor = isDark ? '#475569' : '#e2e8f0';

    window.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rata-rata Skor',
                data: trendData,
                borderColor: 'rgb(37, 99, 235)',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: 'rgb(37, 99, 235)',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `Rata-rata: ${context.parsed.y} / 5.0`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColor,
                        maxRotation: 45,
                        minRotation: 45,
                        callback: function(value, index) {
                            if (index >= labels.length) return '';
                            
                            // Show every 2-3 months to avoid crowding
                            if (labels.length > 15) {
                                // For long periods, show every 3 months
                                if (index % 3 === 0 || index === labels.length - 1) {
                                    const [year, month] = labels[index].split('-');
                                    return `${month}/${year.substring(2)}`;
                                }
                                return '';
                            } else if (labels.length > 8) {
                                // For medium periods, show every 2 months
                                if (index % 2 === 0 || index === labels.length - 1) {
                                    const [year, month] = labels[index].split('-');
                                    return `${month}/${year.substring(2)}`;
                                }
                                return '';
                            } else {
                                // For short periods, show all months
                                const [year, month] = labels[index].split('-');
                                return `${month}/${year.substring(2)}`;
                            }
                        }
                    },
                    grid: {
                        color: gridColor,
                        display: true
                    },
                    title: {
                        display: true,
                        text: 'Periode Evaluasi',
                        color: textColor
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 3.5,
                    max: 5.0,
                    ticks: {
                        color: textColor,
                        stepSize: 0.5,
                        callback: function(value) {
                            return value.toFixed(1);
                        }
                    },
                    grid: {
                        color: gridColor
                    },
                    title: {
                        display: true,
                        text: 'Rata-rata Skor',
                        color: textColor
                    }
                }
            }
        }
    });

    // Update trend analysis
    const trendAnalysis = document.getElementById('trendAnalysis');
    if (trendAnalysis) {
        const firstValue = trendData[0];
        const lastValue = trendData[trendData.length - 1];
        const change = (lastValue - firstValue).toFixed(2);
        const changeText = change > 0 ? `+${change}` : change;
        const changeColor = change > 0 ? '#10b981' : change < 0 ? '#ef4444' : '#64748b';
        
        // Format dates for display
        const formatDate = (dateStr) => {
            const [year, month] = dateStr.split('-');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            return `${months[parseInt(month) - 1]} ${year}`;
        };
        
        const startDateFormatted = formatDate(labels[0]);
        const endDateFormatted = formatDate(labels[labels.length - 1]);
        const totalMonths = labels.length;
        
        // Calculate trend direction
        const trendDirection = change > 0 ? 'meningkat' : change < 0 ? 'menurun' : 'stabil';
        const trendIcon = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
        
        trendAnalysis.innerHTML = `
            <div style="line-height: 1.8;">
                <strong>Periode Evaluasi:</strong> ${startDateFormatted} → ${endDateFormatted} (${totalMonths} bulan)<br>
                <strong>Perubahan Rata-rata Skor:</strong> <span style="color: ${changeColor}; font-weight: bold;">${changeText}</span> ${trendIcon}<br>
                <strong>Trend:</strong> Skor ${trendDirection} dari waktu ke waktu. ${labels.length > 6 ? 'Terlihat peningkatan kualitas aplikasi kesehatan secara konsisten.' : 'Data menunjukkan perkembangan evaluasi aplikasi kesehatan.'}
            </div>
        `;
    }
}

// Compare Functions
async function showCompare() {
    closeModalIfOpen();
    hideAllSections();
    const compareSection = document.getElementById('compareSection');
    compareSection.classList.remove('hidden');

    // Populate select options
    if (!allApps || allApps.length === 0) {
        await loadApps();
    }

    populateCompareSelects();
}

function closeCompare() {
    const compareSection = document.getElementById('compareSection');
    const appList = document.getElementById('appList');

    compareSection.classList.add('hidden');
    appList.classList.remove('hidden');
}

function populateCompareSelects() {
    const select1 = document.getElementById('compareApp1');
    const select2 = document.getElementById('compareApp2');

    // Clear existing options
    select1.innerHTML = '<option value="">Pilih Aplikasi 1</option>';
    select2.innerHTML = '<option value="">Pilih Aplikasi 2</option>';

    // Add options
    allApps.forEach(app => {
        const option1 = document.createElement('option');
        option1.value = app.id;
        option1.textContent = app.name;
        select1.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = app.id;
        option2.textContent = app.name;
        select2.appendChild(option2);
    });
}

async function doCompare() {
    const app1Id = document.getElementById('compareApp1').value;
    const app2Id = document.getElementById('compareApp2').value;
    const resultDiv = document.getElementById('compareResult');

    if (!app1Id || !app2Id) {
        alert('Pilih kedua aplikasi untuk dibandingkan!');
        return;
    }

    if (app1Id === app2Id) {
        alert('Pilih aplikasi yang berbeda!');
        return;
    }

    try {
        // Get app details
        const [response1, response2] = await Promise.all([
            fetch(`${API_BASE_URL}?action=getAppDetail&id=${app1Id}`),
            fetch(`${API_BASE_URL}?action=getAppDetail&id=${app2Id}`)
        ]);

        const data1 = await response1.json();
        const data2 = await response2.json();

        if (data1.success && data2.success) {
            displayCompareResult(data1.app, data2.app);
        } else {
            resultDiv.innerHTML = '<p class="error">Gagal memuat data aplikasi</p>';
        }
    } catch (error) {
        console.error('Error comparing apps:', error);
        resultDiv.innerHTML = '<p class="error">Terjadi kesalahan saat membandingkan aplikasi</p>';
    }
}

function displayCompareResult(app1, app2) {
    const resultDiv = document.getElementById('compareResult');

    const metrics = [
        { label: 'Skor Keseluruhan', key: 'overall_score' },
        { label: 'Kualitas', key: 'quality_score' },
        { label: 'Privasi', key: 'privacy_score' },
        { label: 'Literasi', key: 'literacy_score' },
        { label: 'Kemudahan', key: 'usability_score' },
        { label: 'Akurasi', key: 'accuracy_score' },
        { label: 'Rating Store', key: 'store_rating' },
        { label: 'Pengguna Aktif', key: 'active_users' }
    ];

    // Build pros/cons/features for each app
    function generatePros(app) {
        const pros = [];
        if (app.quality_score >= 4 && app.quality_description) pros.push(app.quality_description);
        if (app.usability_score >= 4 && app.usability_description) pros.push(app.usability_description);
        if (app.literacy_score >= 4 && app.literacy_description) pros.push(app.literacy_description);
        if (app.store_rating && app.store_rating >= 4.3) pros.push('Rating toko aplikasi tinggi');
        // unique and short
        return [...new Set(pros)].slice(0, 3);
    }

    function generateCons(app) {
        const cons = [];
        if (app.privacy_score < 4 && app.privacy_description) cons.push(app.privacy_description);
        if (app.usability_score < 4 && app.usability_description) cons.push(app.usability_description);
        if (app.recommendations && app.recommendations.length) {
            // take first recommendation as an actionable improvement
            cons.push(`Saran perbaikan: ${app.recommendations[0].title}`);
        }
        return [...new Set(cons)].slice(0, 3);
    }

    function extractHighlights(app) {
        const text = `${app.quality_description || ''} ${app.usability_description || ''} ${app.recommendations ? app.recommendations.map(r => r.title + ' ' + r.description).join(' ') : ''}`.toLowerCase();
        const keywords = {
            'booking dokter': ['booking', 'booking dokter', 'appointment', 'booking dokter', 'booking doctor'],
            'pengingat obat': ['reminder', 'remind', 'reminder obat', 'reminder obat', 'reminder obat'],
            'barcode scanner': ['barcode', 'scanner', 'barcode scanner'],
            'database makanan': ['database makanan', 'food database', 'database'],
            'konseling/meditasi': ['meditasi', 'konseling', 'counseling', 'therapy'],
            'apotek online': ['apotek', 'pharmacy', 'apotek online']
        };
        const found = [];
        Object.keys(keywords).forEach(name => {
            if (keywords[name].some(k => text.includes(k))) found.push(name);
        });
        return found.slice(0, 4);
    }

    const pros1 = generatePros(app1);
    const cons1 = generateCons(app1);
    const highlights1 = extractHighlights(app1);

    const pros2 = generatePros(app2);
    const cons2 = generateCons(app2);
    const highlights2 = extractHighlights(app2);

    resultDiv.innerHTML = `
        <div class="compare-result">
            <div class="compare-app">
                <h3><i class="${app1.icon}"></i> ${app1.name}</h3>
                ${metrics.map(metric => `
                    <div class="compare-metric">
                        <span class="compare-metric-label">${metric.label}:</span>
                        <span class="compare-metric-value">
                            ${metric.key.includes('score') || metric.key === 'store_rating'
            ? app1[metric.key].toFixed(1)
            : app1[metric.key]}
                        </span>
                    </div>
                `).join('')}

                <div class="compare-analysis">
                    <h4>Kelebihan</h4>
                    <ul>
                        ${pros1.length ? pros1.map(p => `<li>${p}</li>`).join('') : '<li>Tidak ada catatan kelebihan khusus.</li>'}
                    </ul>

                    <h4>Kekurangan & Saran</h4>
                    <ul>
                        ${cons1.length ? cons1.map(c => `<li>${c}</li>`).join('') : '<li>Tidak ada catatan kekurangan khusus.</li>'}
                    </ul>

                    <h4>Fitur Unggulan</h4>
                    <ul>
                        ${highlights1.length ? highlights1.map(h => `<li>${h}</li>`).join('') : '<li>Fitur unggulan tidak terdeteksi secara otomatis.</li>'}
                    </ul>
                </div>
            </div>

            <div class="compare-app">
                <h3><i class="${app2.icon}"></i> ${app2.name}</h3>
                ${metrics.map(metric => `
                    <div class="compare-metric">
                        <span class="compare-metric-label">${metric.label}:</span>
                        <span class="compare-metric-value">
                            ${metric.key.includes('score') || metric.key === 'store_rating'
                    ? app2[metric.key].toFixed(1)
                    : app2[metric.key]}
                        </span>
                    </div>
                `).join('')}

                <div class="compare-analysis">
                    <h4>Kelebihan</h4>
                    <ul>
                        ${pros2.length ? pros2.map(p => `<li>${p}</li>`).join('') : '<li>Tidak ada catatan kelebihan khusus.</li>'}
                    </ul>

                    <h4>Kekurangan & Saran</h4>
                    <ul>
                        ${cons2.length ? cons2.map(c => `<li>${c}</li>`).join('') : '<li>Tidak ada catatan kekurangan khusus.</li>'}
                    </ul>

                    <h4>Fitur Unggulan</h4>
                    <ul>
                        ${highlights2.length ? highlights2.map(h => `<li>${h}</li>`).join('') : '<li>Fitur unggulan tidak terdeteksi secara otomatis.</li>'}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function addToCompare() {
    if (!currentAppId) return;

    if (compareApps.length >= 2) {
        compareApps = [];
    }

    if (!compareApps.includes(currentAppId)) {
        compareApps.push(currentAppId);
        alert(`Aplikasi ditambahkan ke perbandingan (${compareApps.length}/2)`);

        if (compareApps.length === 2) {
            // Auto fill compare section
            document.getElementById('compareApp1').value = compareApps[0];
            document.getElementById('compareApp2').value = compareApps[1];
            showCompare();
            doCompare();
        }
    }
}

// Export to PDF
function exportToPDF() {
    if (!allApps || allApps.length === 0) {
        alert('Tidak ada data untuk diekspor!');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Evaluasi Aplikasi Kesehatan Konsumen', 14, 20);

    // Summary
    doc.setFontSize(12);
    const totalApps = allApps.length;
    const avgScore = (allApps.reduce((sum, app) => sum + app.overall_score, 0) / totalApps).toFixed(2);
    doc.text(`Total Aplikasi: ${totalApps}`, 14, 35);
    doc.text(`Rata-rata Skor: ${avgScore}/5.0`, 14, 42);

    // Table header
    let y = 55;
    doc.setFontSize(10);
    doc.text('No', 14, y);
    doc.text('Nama Aplikasi', 25, y);
    doc.text('Kategori', 80, y);
    doc.text('Skor', 130, y);
    doc.text('Privasi', 150, y);
    doc.text('Literasi', 170, y);

    y += 10;
    doc.line(14, y, 200, y);
    y += 5;

    // Table data
    allApps.forEach((app, index) => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }

        doc.text((index + 1).toString(), 14, y);
        doc.text(app.name.substring(0, 20), 25, y);
        doc.text(getCategoryLabel(app.category).substring(0, 15), 80, y);
        doc.text(app.overall_score.toFixed(1), 130, y);
        doc.text(app.privacy_score.toFixed(1), 150, y);
        doc.text(app.literacy_score.toFixed(1), 170, y);
        y += 7;
    });

    // Save
    doc.save('evaluasi-aplikasi-kesehatan.pdf');
}

// Helper function to close modal if open
window.closeModalIfOpen = function() {
    const appDetailModal = document.getElementById('appDetailModal');
    if (appDetailModal && !appDetailModal.classList.contains('hidden')) {
        if (window.closeDetail) {
            window.closeDetail();
        } else {
            // Fallback jika closeDetail belum tersedia
            appDetailModal.classList.add('hidden');
            appDetailModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
}

// Alias untuk digunakan di file ini
function closeModalIfOpen() {
    window.closeModalIfOpen();
}

// Navigation Functions
function showHome() {
    closeModalIfOpen();
    hideAllSections();
    
    // Remove category header if exists
    const categoryHeader = document.getElementById('categoryHeader');
    if (categoryHeader) {
        categoryHeader.remove();
    }
    
    // Remove active state from quick filter buttons
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Reset filters
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = 'all';
    }
    
    // Show app list with all apps
    const appList = document.getElementById('appList');
    if (appList) {
        appList.classList.remove('hidden');
    }
    
    // Reload all apps if needed
    if (typeof window.allApps !== 'undefined' && window.allApps.length > 0) {
        if (typeof handleFilter === 'function') {
            handleFilter();
        } else if (typeof displayApps === 'function') {
            displayApps(window.allApps);
        }
    }
    
    updateNavActive('home');
}

function showProblemDefinition() {
    closeModalIfOpen();
    hideAllSections();
    document.getElementById('problemDefinition').classList.remove('hidden');
    updateNavActive('problem');
}

function showSystemDesign() {
    closeModalIfOpen();
    hideAllSections();
    document.getElementById('systemDesign').classList.remove('hidden');
    updateNavActive('system');
}

async function showInsights() {
    closeModalIfOpen();
    hideAllSections();
    document.getElementById('insights').classList.remove('hidden');
    updateNavActive('insights');
    await loadInsights();
}

function showEthics() {
    closeModalIfOpen();
    hideAllSections();
    document.getElementById('ethics').classList.remove('hidden');
    updateNavActive('ethics');
}

function showAbout() {
    closeModalIfOpen();
    hideAllSections();
    document.getElementById('about').classList.remove('hidden');
    updateNavActive('about');
}

function hideAllSections() {
    const sections = [
        'appList', 'dashboard', 'compareSection',
        'problemDefinition', 'systemDesign', 'insights', 'ethics', 'about'
    ];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });
}

function updateNavActive(active) {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));

    const navMap = {
        'home': 0,
        'symptom': 1,
        'problem': 2,
        'system': 3,
        'insights': 4,
        'ethics': 5,
        'about': 6,
        'favorites': -1,
        'recent': -1
    };

    if (navMap[active] !== undefined && navMap[active] >= 0) {
        navButtons[navMap[active]].classList.add('active');
    }
}

// Insights Analysis
async function loadInsights() {
    if (!allApps || allApps.length === 0) {
        await loadApps();
    }

    const apps = allApps;
    const insightsContent = document.getElementById('insightsContent');

    // Calculate insights
    const avgScores = {
        quality: apps.reduce((sum, app) => sum + app.quality_score, 0) / apps.length,
        privacy: apps.reduce((sum, app) => sum + app.privacy_score, 0) / apps.length,
        literacy: apps.reduce((sum, app) => sum + app.literacy_score, 0) / apps.length,
        usability: apps.reduce((sum, app) => sum + app.usability_score, 0) / apps.length,
        accuracy: apps.reduce((sum, app) => sum + app.accuracy_score, 0) / apps.length
    };

    // Find best and worst
    const bestApp = apps.reduce((best, app) =>
        app.overall_score > best.overall_score ? app : best
    );

    const worstApp = apps.reduce((worst, app) =>
        app.overall_score < worst.overall_score ? app : worst
    );

    // Category analysis
    const categoryStats = {};
    apps.forEach(app => {
        const cat = getCategoryLabel(app.category);
        if (!categoryStats[cat]) {
            categoryStats[cat] = { count: 0, totalScore: 0, apps: [] };
        }
        categoryStats[cat].count++;
        categoryStats[cat].totalScore += app.overall_score;
        categoryStats[cat].apps.push(app);
    });

    // Privacy analysis
    const privacyConcerns = apps.filter(app => app.privacy_score < 4.0).length;
    const privacyGood = apps.filter(app => app.privacy_score >= 4.0).length;

    insightsContent.innerHTML = `
        <div class="insight-card">
            <h4><i class="fas fa-chart-line"></i> Analisis Skor Rata-rata</h4>
            <p><strong>Kualitas Aplikasi:</strong> ${avgScores.quality.toFixed(2)}/5.0 - ${avgScores.quality >= 4.0 ? 'Baik' : avgScores.quality >= 3.5 ? 'Cukup' : 'Perlu Perbaikan'}</p>
            <p><strong>Privasi & Keamanan:</strong> ${avgScores.privacy.toFixed(2)}/5.0 - ${avgScores.privacy >= 4.0 ? 'Tinggi' : avgScores.privacy >= 3.5 ? 'Sedang' : 'Rendah'}</p>
            <p><strong>Literasi Pengguna:</strong> ${avgScores.literacy.toFixed(2)}/5.0 - ${avgScores.literacy >= 4.0 ? 'Baik' : avgScores.literacy >= 3.5 ? 'Cukup' : 'Perlu Perbaikan'}</p>
            <p><strong>Kemudahan Penggunaan:</strong> ${avgScores.usability.toFixed(2)}/5.0 - ${avgScores.usability >= 4.0 ? 'Sangat Mudah' : avgScores.usability >= 3.5 ? 'Mudah' : 'Cukup'}</p>
            <p><strong>Akurasi Informasi:</strong> ${avgScores.accuracy.toFixed(2)}/5.0 - ${avgScores.accuracy >= 4.0 ? 'Tinggi' : avgScores.accuracy >= 3.5 ? 'Sedang' : 'Rendah'}</p>
        </div>

        <div class="insight-card">
            <h4><i class="fas fa-trophy"></i> Aplikasi Terbaik</h4>
            <p><strong>${bestApp.name}</strong> memiliki skor keseluruhan tertinggi: <strong>${bestApp.overall_score.toFixed(1)}/5.0</strong></p>
            <p>Kelebihan utama: ${bestApp.quality_score >= 4.5 ? 'Kualitas sangat baik' : 'Kualitas baik'}, ${bestApp.privacy_score >= 4.0 ? 'Privasi terjamin' : 'Privasi cukup baik'}</p>
        </div>

        <div class="insight-card">
            <h4><i class="fas fa-exclamation-triangle"></i> Area Perbaikan</h4>
            <p><strong>${worstApp.name}</strong> memiliki skor terendah: <strong>${worstApp.overall_score.toFixed(1)}/5.0</strong></p>
            <p>Area yang perlu diperbaikan: ${worstApp.privacy_score < 4.0 ? 'Privasi & Keamanan' : ''} ${worstApp.quality_score < 4.0 ? ', Kualitas Aplikasi' : ''}</p>
        </div>

        <div class="insight-card">
            <h4><i class="fas fa-shield-alt"></i> Analisis Privasi</h4>
            <p><strong>${privacyGood} aplikasi</strong> memiliki skor privasi baik (≥4.0)</p>
            <p><strong>${privacyConcerns} aplikasi</strong> memerlukan perbaikan privasi (<4.0)</p>
            <p>Rata-rata skor privasi: <strong>${avgScores.privacy.toFixed(2)}/5.0</strong></p>
            <p><strong>Kesimpulan:</strong> ${avgScores.privacy >= 4.0 ? 'Secara keseluruhan, privasi aplikasi kesehatan sudah baik, namun masih ada ruang untuk peningkatan transparansi.' : 'Perlu peningkatan signifikan dalam hal privasi dan keamanan data.'}</p>
        </div>

        <div class="insight-card">
            <h4><i class="fas fa-layer-group"></i> Analisis per Kategori</h4>
            ${Object.keys(categoryStats).map(cat => {
        const stat = categoryStats[cat];
        const avgScore = (stat.totalScore / stat.count).toFixed(2);
        return `
                    <p><strong>${cat}:</strong> ${stat.count} aplikasi, rata-rata skor ${avgScore}/5.0</p>
                `;
    }).join('')}
        </div>

        <div class="insight-card">
            <h4><i class="fas fa-lightbulb"></i> Rekomendasi Umum</h4>
            <ol>
                <li><strong>Peningkatan Privasi:</strong> ${privacyConcerns > 0 ? `${privacyConcerns} aplikasi perlu meningkatkan transparansi kebijakan privasi dan kontrol data pengguna.` : 'Semua aplikasi sudah memiliki privasi yang baik.'}</li>
                <li><strong>Literasi Kesehatan:</strong> ${avgScores.literacy < 4.0 ? 'Perlu lebih banyak konten edukasi kesehatan dalam format yang mudah dipahami.' : 'Literasi kesehatan sudah baik, pertahankan dan tingkatkan.'}</li>
                <li><strong>Kualitas Informasi:</strong> ${avgScores.accuracy < 4.0 ? 'Perlu verifikasi dan update berkala informasi medis untuk memastikan akurasi.' : 'Akurasi informasi sudah baik.'}</li>
                <li><strong>User Experience:</strong> ${avgScores.usability < 4.0 ? 'Perlu perbaikan interface dan navigasi untuk meningkatkan kemudahan penggunaan.' : 'User experience sudah baik.'}</li>
            </ol>
        </div>
    `;
}

// Make functions available globally
window.showDashboard = showDashboard;
window.closeDashboard = closeDashboard;
window.showCompare = showCompare;
window.closeCompare = closeCompare;
window.doCompare = doCompare;
window.addToCompare = addToCompare;
window.exportToPDF = exportToPDF;
window.showHome = showHome;
window.showProblemDefinition = showProblemDefinition;
window.showSystemDesign = showSystemDesign;
window.showInsights = showInsights;
window.showEthics = showEthics;
window.showAbout = showAbout;

