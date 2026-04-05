
     // ===== شاشة الافتتاحية =====
window.addEventListener('load', function() {
    let progress = 0;
    let splashProgress = document.getElementById('splashProgress');
    let splashText = document.getElementById('splashText');
    let splashScreen = document.getElementById('splashScreen');
    
    let interval = setInterval(function() {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            if (splashProgress) splashProgress.style.width = progress + '%';
            if (splashText) splashText.textContent = 'تم التحميل بنجاح!';
            
            setTimeout(function() {
                if (splashScreen) {
                    splashScreen.classList.add('fade-out');
                    setTimeout(function() {
                        splashScreen.style.display = 'none';
                    }, 1500);
                }
            }, 500);
            
            clearInterval(interval);
        } else {
            if (splashProgress) splashProgress.style.width = progress + '%';
            if (splashText) splashText.textContent = 'جاري تحميل النظام... ' + Math.floor(progress) + '%';
        }
    }, 200);
    
    updateStats();
    showGroup(1);
    showPage("survey");
    
    window.onclick = function(event) {

        let modal = document.getElementById("profileModal");
        if (event.target === modal) {
            closeProfile();

        }
    };

 


    
    
});
// ===== قراءة الفلاحين من localStorage =====
let farmers = JSON.parse(localStorage.getItem('farmers')) || [];

// تحديث حالة الملفات
farmers = farmers.map(f => {
    if (!f.status || f.status === '' || f.status === 'history') {
        f.status = 'pending';
    }
    return f;
});
localStorage.setItem('farmers', JSON.stringify(farmers));

function saveToLocalStorage() {
    localStorage.setItem('farmers', JSON.stringify(farmers));
}

// ===== تحديث العدادات =====
function updateCounters() {
    let pending = farmers.filter(f => f.status === 'pending').length;
    let approved = farmers.filter(f => f.status === 'approved').length;
    let rejected = farmers.filter(f => f.status === 'rejected').length;
    
    let pendingEl = document.getElementById('pendingCount');
    let approvedEl = document.getElementById('approvedCount');
    let rejectedEl = document.getElementById('rejectedCount');
    let notificationEl = document.getElementById('notificationCount');
    
    if (pendingEl) pendingEl.textContent = pending;
    if (approvedEl) approvedEl.textContent = approved;
    if (rejectedEl) rejectedEl.textContent = rejected;
    if (notificationEl) notificationEl.textContent = pending;
}

// ===== التنقل بين الصفحات =====
function showPage(page) {
    // تحديث القائمة النشطة
    document.querySelectorAll('.menu-item, nav a').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelectorAll(`[onclick="showPage('${page}')"]`).forEach(el => {
        el.classList.add('active');
    });
    
    let content = document.getElementById('mainContent');
    if (!content) {
        console.error('عنصر mainContent غير موجود');
        return;
    }
    
    // عرض الصفحة المطلوبة
    switch(page) {
        case 'dashboard':
            content.innerHTML = getDashboardHTML();
            setTimeout(() => {
                initDashboardCharts();
                updateRecentPending();
            }, 100);
            break;
        case 'pending':
            content.innerHTML = getFilesListHTML('pending', 'الملفات قيد الانتظار', 'قائمة الملفات التي تنتظر المراجعة والتحقق');
            setTimeout(() => renderFilesList('pending'), 100);
            break;
        case 'approved':
            content.innerHTML = getFilesListHTML('approved', 'الملفات المقبولة', 'قائمة الملفات التي تم قبولها بعد المراجعة');
            setTimeout(() => renderFilesList('approved'), 100);
            break;
        case 'rejected':
            content.innerHTML = getFilesListHTML('rejected', 'الملفات المرفوضة', 'قائمة الملفات التي تم رفضها مع أسباب الرفض');
            setTimeout(() => renderFilesList('rejected'), 100);
            break;
        case 'history':
            content.innerHTML = getHistoryHTML();
            setTimeout(renderHistory, 100);
            break;
        case 'stats':
            content.innerHTML = getStatsHTML();
            setTimeout(initStatsCharts, 100);
            break;
        case 'settings':
            content.innerHTML = getSettingsHTML();
            break;
        default:
            content.innerHTML = getDashboardHTML();
            setTimeout(() => {
                initDashboardCharts();
                updateRecentPending();
            }, 100);
    }
}

// ===== قالب لوحة التحكم =====
function getDashboardHTML() {
    let pending = farmers.filter(f => f.status === 'pending').length;
    let approved = farmers.filter(f => f.status === 'approved').length;
    let rejected = farmers.filter(f => f.status === 'rejected').length;
    let total = farmers.length;
    
    let totalArea = farmers.reduce((sum, f) => sum + (parseFloat(f.superficie || f.area) || 0), 0).toFixed(1);
    let totalAnimals = farmers.reduce((sum, f) => sum + (parseInt(f.bovins)||0) + (parseInt(f.ovins)||0) + (parseInt(f.caprins)||0) + (parseInt(f.camelins)||0) + (parseInt(f.equins)||0), 0);
    
    let today = new Date().toLocaleDateString('ar-DZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    return `
        <div class="page-header">
            <div class="page-title">
                <h2>مرحباً بك، محمد العربي 👋</h2>
                <p>نظرة عامة على مهام المراجعة والتحقق - ${today}</p>
            </div>
            <div class="date-range">
                <i class="fas fa-calendar-alt"></i>
                <span>آخر تحديث: الآن</span>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon"><i class="fas fa-clock"></i></div>
                </div>
                <div class="stat-value">${pending}</div>
                <div class="stat-label">ملفات قيد الانتظار</div>
                <div class="stat-change" id="statChangePending">${pending > 0 ? '<i class="fas fa-exclamation-circle"></i> ' + pending : '0'}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                </div>
                <div class="stat-value">${approved}</div>
                <div class="stat-label">ملفات مقبولة</div>
                <div class="stat-change positive" id="statChangeApproved">${approved > 0 ? '<i class="fas fa-arrow-up"></i> +' + Math.floor(Math.random() * 10) : '0'}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
                </div>
                <div class="stat-value">${rejected}</div>
                <div class="stat-label">ملفات مرفوضة</div>
                <div class="stat-change negative" id="statChangeRejected">${rejected > 0 ? '<i class="fas fa-arrow-down"></i> -' + Math.floor(Math.random() * 5) : '0'}</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
                </div>
                <div class="stat-value">${total}</div>
                <div class="stat-label">إجمالي الملفات</div>
                <div class="stat-change" id="statChangeTotal">${total}</div>
            </div>
        </div>

        <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr);">
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon"><i class="fas fa-tractor"></i></div>
                </div>
                <div class="stat-value">${totalArea}</div>
                <div class="stat-label">المساحة الإجمالية (هكتار)</div>
                <div class="stat-trend"><i class="fas fa-arrow-up"></i> هكتار</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-header">
                    <div class="stat-icon"><i class="fas fa-paw"></i></div>
                </div>
                <div class="stat-value">${totalAnimals}</div>
                <div class="stat-label">إجمالي المواشي</div>
                <div class="stat-trend"><i class="fas fa-arrow-up"></i> رأس</div>
            </div>
        </div>

        <div class="charts-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            <div class="chart-card">
                <div class="chart-header">
                    <h3>حالة الملفات</h3>
                </div>
                <div class="chart-container">
                    <canvas id="statusChart" width="400" height="300"></canvas>
                </div>
            </div>
            
            <div class="chart-card">
                <div class="chart-header">
                    <h3>توزيع المواشي</h3>
                </div>
                <div class="chart-container">
                    <canvas id="livestockChart" width="400" height="300"></canvas>
                </div>
            </div>
        </div>

        <div class="recent-activity" style="background: rgba(255,255,255,0.8); border-radius: 25px; padding: 20px;">
            <h3 style="color: var(--primary-dark); margin-bottom: 20px;">أحدث الملفات قيد الانتظار</h3>
            <div id="recentPendingList"></div>
        </div>
    `;
}

// ===== تحديث قائمة أحدث الملفات =====
function updateRecentPending() {
    let recentList = document.getElementById('recentPendingList');
    if (!recentList) return;
    
    let recent = farmers.filter(f => f.status === 'pending')
        .sort((a, b) => new Date(b.submittedDate || b.date) - new Date(a.submittedDate || a.date))
        .slice(0, 5);
    
    if (recent.length === 0) {
        recentList.innerHTML = '<p style="color: var(--primary); text-align: center;">لا توجد ملفات قيد الانتظار</p>';
    } else {
        recentList.innerHTML = recent.map(f => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255,255,255,0.5); border-radius: 15px; margin-bottom: 10px;">
                <div>
                    <strong style="color: var(--primary-dark);">${f.name}</strong>
                    <p style="color: var(--primary); font-size: 13px;">${f.wilayaName || 'ولاية ' + f.wilaya}</p>
                </div>
                <div>
                    <span class="badge" style="background: ${f.priority === 'high' ? '#dc3545' : f.priority === 'medium' ? '#ffc107' : '#28a745'}; color: white; position: static; width: auto; border-radius: 20px; padding: 5px 15px;">
                        ${f.priority === 'high' ? 'عالية' : f.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                    </span>
                </div>
                <div>
                    <button class="btn btn-view btn-sm" onclick="viewFileDetails(${f.id})" style="padding: 5px 10px; font-size: 12px;">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// ===== تهيئة الرسوم البيانية =====
function initDashboardCharts() {
    let pending = farmers.filter(f => f.status === 'pending').length;
    let approved = farmers.filter(f => f.status === 'approved').length;
    let rejected = farmers.filter(f => f.status === 'rejected').length;
    
    // رسم بياني لحالة الملفات
    let statusCtx = document.getElementById('statusChart')?.getContext('2d');
    if (statusCtx && typeof Chart !== 'undefined') {
        if (window.statusChart) window.statusChart.destroy();
        window.statusChart = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['قيد الانتظار', 'مقبول', 'مرفوض'],
                datasets: [{
                    data: [pending, approved, rejected],
                    backgroundColor: ['#ffc107', '#28a745', '#dc3545'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { font: { family: 'Cairo', size: 12 } }
                    }
                },
                cutout: '70%'
            }
        });
    }
    
    // رسم بياني للمواشي
    let totalBovins = farmers.reduce((sum, f) => sum + (parseInt(f.bovins)||0), 0);
    let totalOvins = farmers.reduce((sum, f) => sum + (parseInt(f.ovins)||0), 0);
    let totalCaprins = farmers.reduce((sum, f) => sum + (parseInt(f.caprins)||0), 0);
    let totalCamelins = farmers.reduce((sum, f) => sum + (parseInt(f.camelins)||0), 0);
    let totalEquins = farmers.reduce((sum, f) => sum + (parseInt(f.equins)||0), 0);
    
    let livestockCtx = document.getElementById('livestockChart')?.getContext('2d');
    if (livestockCtx && typeof Chart !== 'undefined') {
        if (window.livestockChart) window.livestockChart.destroy();
        window.livestockChart = new Chart(livestockCtx, {
            type: 'bar',
            data: {
                labels: ['أبقار', 'أغنام', 'ماعز', 'إبل', 'خيول'],
                datasets: [{
                    data: [totalBovins, totalOvins, totalCaprins, totalCamelins, totalEquins],
                    backgroundColor: ['#1C4B2D', '#2E6B3E', '#D4AF37', '#8B5A2B', '#6B4E3E'],
                    borderRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(28,75,45,0.1)' }
                    },
                    x: {
                        ticks: { font: { family: 'Cairo' } }
                    }
                }
            }
        });
    }
}


        // ===== قالب قائمة الملفات =====
        function getFilesListHTML(status, title, subtitle) {
            return `
                <div class="page-header">
                    <div class="page-title">
                        <h2>${title}</h2>
                        <p>${subtitle}</p>
                    </div>
                </div>

                <div class="filter-tabs">
                    <button class="filter-tab ${status === 'pending' ? 'active' : ''}" onclick="showPage('pending')">
                        <i class="fas fa-clock"></i> قيد الانتظار
                    </button>
                    <button class="filter-tab ${status === 'approved' ? 'active' : ''}" onclick="showPage('approved')">
                        <i class="fas fa-check-circle"></i> مقبولة
                    </button>
                    <button class="filter-tab ${status === 'rejected' ? 'active' : ''}" onclick="showPage('rejected')">
                        <i class="fas fa-times-circle"></i> مرفوضة
                    </button>
                </div>

                <div class="search-bar">
                    <input type="text" class="search-input" id="searchInput" placeholder="بحث بالاسم أو رقم الهاتف أو الولاية..." onkeyup="filterFiles('${status}')">
                    <button class="search-btn" onclick="filterFiles('${status}')">
                        <i class="fas fa-search"></i> بحث
                    </button>
                </div>

                <div id="filesList" data-status="${status}"></div>
            `;
        }

        // ===== عرض قائمة الملفات =====
        function renderFilesList(status) {
            let list = document.getElementById('filesList');
            if (!list) return;
            
            let filteredFiles = farmers.filter(f => f.status === status);
            
            if (filteredFiles.length === 0) {
                list.innerHTML = "<p style='color: #1C4B2D; opacity: 0.5; text-align:center; padding:40px;'>لا توجد ملفات في هذه القائمة</p>";
                return;
            }
            
            // ترتيب حسب التاريخ (الأحدث أولاً)
            filteredFiles.sort((a, b) => new Date(b.submittedDate || b.date) - new Date(a.submittedDate || a.date));
            
            list.innerHTML = "";
            filteredFiles.forEach(f => {
                let date = new Date(f.submittedDate || f.date).toLocaleDateString('ar-DZ', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                let totalAnimals = (parseInt(f.bovins)||0) + (parseInt(f.ovins)||0) + (parseInt(f.caprins)||0) + 
                                 (parseInt(f.camelins)||0) + (parseInt(f.equins)||0);
                
                list.innerHTML += `
                    <div class="file-card ${f.status}" data-id="${f.id}">
                        <div class="file-header">
                            <div class="file-title">
                                <div class="file-icon">
                                    <i class="fas fa-${f.sexe === 'female' ? 'user-circle' : 'user-tie'}"></i>
                                </div>
                                <div class="file-info">
                                    <h3>${f.name}</h3>
                                    <div class="file-meta">
                                        <span><i class="fas fa-map-marker-alt"></i> ${f.wilayaName || 'ولاية ' + f.wilaya}</span>
                                        <span><i class="fas fa-phone"></i> ${f.phone || 'غير محدد'}</span>
                                        <span><i class="fas fa-calendar"></i> ${date}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="file-status ${f.status}">
                                <i class="fas fa-${f.status === 'pending' ? 'clock' : f.status === 'approved' ? 'check-circle' : 'times-circle'}"></i>
                                ${f.status === 'pending' ? 'قيد الانتظار' : f.status === 'approved' ? 'مقبول' : 'مرفوض'}
                                ${f.priority === 'high' && f.status === 'pending' ? ' (أولوية عالية)' : ''}
                            </div>
                        </div>
                        
                        <div class="data-grid">
                            <div class="data-item">
                                <div class="data-item-label"><i class="fas fa-ruler-combined"></i> المساحة</div>
                                <div class="data-item-value">${f.area || '0'} هكتار</div>
                            </div>
                            <div class="data-item">
                                <div class="data-item-label"><i class="fas fa-paw"></i> المواشي</div>
                                <div class="data-item-value">${totalAnimals} رأس</div>
                            </div>
                            <div class="data-item">
                                <div class="data-item-label"><i class="fas fa-drumstick-bite"></i> الدواجن</div>
                                <div class="data-item-value">${f.poulets || '0'}</div>
                            </div>
                            <div class="data-item">
                                <div class="data-item-label"><i class="fas fa-water"></i> الري</div>
                                <div class="data-item-value">${f.irrigationMethod || 'غير محدد'}</div>
                            </div>
                        </div>
                        
                        ${f.status === 'rejected' ? `
                            <div style="background: rgba(220,53,69,0.05); padding: 15px; border-radius: 15px; margin-bottom: 15px;">
                                <p style="color: var(--danger);"><i class="fas fa-exclamation-circle"></i> <strong>سبب الرفض:</strong> ${f.reviewNotes || 'غير محدد'}</p>
                            </div>
                        ` : ''}
                        
                        ${f.status === 'approved' ? `
                            <div style="background: rgba(40,167,69,0.05); padding: 15px; border-radius: 15px; margin-bottom: 15px;">
                                <p style="color: var(--success);"><i class="fas fa-check-circle"></i> <strong>تمت المراجعة بواسطة:</strong> ${f.reviewedBy} - ${new Date(f.reviewedDate).toLocaleDateString('ar-DZ')}</p>
                                <p style="color: var(--primary);"><i class="fas fa-comment"></i> ${f.reviewNotes || 'لا توجد ملاحظات'}</p>
                            </div>
                        ` : ''}
                        
                        <div class="action-buttons">
                            <button class="btn btn-view" onclick="viewFileDetails(${f.id})">
                                <i class="fas fa-eye"></i> عرض التفاصيل
                            </button>
                            
                            ${f.status === 'pending' ? `
                                <button class="btn btn-approve" onclick="openReviewModal(${f.id}, 'approve')">
                                    <i class="fas fa-check-circle"></i> قبول
                                </button>
                                <button class="btn btn-reject" onclick="openReviewModal(${f.id}, 'reject')">
                                    <i class="fas fa-times-circle"></i> رفض
                                </button>
                            ` : ''}
                            
                            ${f.status !== 'pending' ? `
                                <button class="btn btn-edit" onclick="reopenFile(${f.id})">
                                    <i class="fas fa-undo-alt"></i> إعادة فتح المراجعة
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
        }

        // ===== تصفية الملفات حسب البحث =====
        function filterFiles(status) {
            let searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
            let list = document.getElementById('filesList');
            
            let filteredFiles = farmers.filter(f => 
                f.status === status && 
                (f.name?.toLowerCase().includes(searchTerm) || 
                 (f.phone && f.phone.includes(searchTerm)) ||
                 (f.wilayaName && f.wilayaName.toLowerCase().includes(searchTerm)))
            );
            
            if (filteredFiles.length === 0) {
                list.innerHTML = "<p style='color: #1C4B2D; opacity: 0.5; text-align:center; padding:40px;'>لا توجد نتائج للبحث</p>";
                return;
            }
            
            filteredFiles.sort((a, b) => new Date(b.submittedDate || b.date) - new Date(a.submittedDate || a.date));
            
            list.innerHTML = "";
            filteredFiles.forEach(f => {
                let date = new Date(f.submittedDate || f.date).toLocaleDateString('ar-DZ', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                let totalAnimals = (parseInt(f.bovins)||0) + (parseInt(f.ovins)||0) + (parseInt(f.caprins)||0) + 
                                 (parseInt(f.camelins)||0) + (parseInt(f.equins)||0);
                
                list.innerHTML += `
                    <div class="file-card ${f.status}" data-id="${f.id}">
                        <div class="file-header">
                            <div class="file-title">
                                <div class="file-icon">
                                    <i class="fas fa-${f.sexe === 'female' ? 'user-circle' : 'user-tie'}"></i>
                                </div>
                                <div class="file-info">
                                    <h3>${f.name}</h3>
                                    <div class="file-meta">
                                        <span><i class="fas fa-map-marker-alt"></i> ${f.wilayaName || 'ولاية ' + f.wilaya}</span>
                                        <span><i class="fas fa-phone"></i> ${f.phone || 'غير محدد'}</span>
                                        <span><i class="fas fa-calendar"></i> ${date}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="file-status ${f.status}">
                                <i class="fas fa-${f.status === 'pending' ? 'clock' : f.status === 'approved' ? 'check-circle' : 'times-circle'}"></i>
                                ${f.status === 'pending' ? 'قيد الانتظار' : f.status === 'approved' ? 'مقبول' : 'مرفوض'}
                            </div>
                        </div>
                        
                        <div class="data-grid">
                            <div class="data-item">
                                <div class="data-item-label"><i class="fas fa-ruler-combined"></i> المساحة</div>
                                <div class="data-item-value">${f.area || '0'} هكتار</div>
                            </div>
                            <div class="data-item">
                                <div class="data-item-label"><i class="fas fa-paw"></i> المواشي</div>
                                <div class="data-item-value">${totalAnimals} رأس</div>
                            </div>
                            <div class="data-item">
                                <div class="data-item-label"><i class="fas fa-drumstick-bite"></i> الدواجن</div>
                                <div class="data-item-value">${f.poulets || '0'}</div>
                            </div>
                            <div class="data-item">
                                <div class="data-item-label"><i class="fas fa-water"></i> الري</div>
                                <div class="data-item-value">${f.irrigationMethod || 'غير محدد'}</div>
                            </div>
                        </div>
                        
                        <div class="action-buttons">
                            <button class="btn btn-view" onclick="viewFileDetails(${f.id})">
                                <i class="fas fa-eye"></i> عرض التفاصيل
                            </button>
                            
                            ${f.status === 'pending' ? `
                                <button class="btn btn-approve" onclick="openReviewModal(${f.id}, 'approve')">
                                    <i class="fas fa-check-circle"></i> قبول
                                </button>
                                <button class="btn btn-reject" onclick="openReviewModal(${f.id}, 'reject')">
                                    <i class="fas fa-times-circle"></i> رفض
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
        }

        // ===== قالب سجل المراجعات =====
        function getHistoryHTML() {
            return `
                <div class="page-header">
                    <div class="page-title">
                        <h2>سجل المراجعات</h2>
                        <p>جميع عمليات القبول والرفض التي قمت بها</p>
                    </div>
                </div>
                
                <div class="search-bar">
                    <input type="text" class="search-input" id="historySearch" placeholder="بحث في السجل...">
                    <button class="search-btn" onclick="filterHistory()">
                        <i class="fas fa-search"></i> بحث
                    </button>
                </div>
                
                <div id="historyList"></div>
            `;
        }

        // ===== عرض سجل المراجعات =====
        function renderHistory() {
            let list = document.getElementById('historyList');
            if (!list) return;
            
            let historyItems = farmers.filter(f => f.status !== 'pending').sort((a, b) => new Date(b.reviewedDate || b.date) - new Date(a.reviewedDate || a.date));
            
            if (historyItems.length === 0) {
                list.innerHTML = "<p style='color: #1C4B2D; opacity: 0.5; text-align:center; padding:40px;'>لا يوجد سجل مراجعات بعد</p>";
                return;
            }
            
            list.innerHTML = "";
            historyItems.forEach(f => {
                let reviewDate = new Date(f.reviewedDate || f.date).toLocaleDateString('ar-DZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                list.innerHTML += `
                    <div class="file-card ${f.status}" style="margin-bottom: 15px;">
                        <div class="file-header">
                            <div class="file-title">
                                <div class="file-icon" style="width: 50px; height: 50px;">
                                    <i class="fas fa-${f.status === 'approved' ? 'check-circle' : 'times-circle'}" style="font-size: 25px;"></i>
                                </div>
                                <div class="file-info">
                                    <h3>${f.name}</h3>
                                    <div class="file-meta">
                                        <span><i class="fas fa-map-marker-alt"></i> ${f.wilayaName || 'ولاية ' + f.wilaya}</span>
                                        <span><i class="fas fa-calendar"></i> ${reviewDate}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="file-status ${f.status}">
                                ${f.status === 'approved' ? 'مقبول' : 'مرفوض'}
                            </div>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.5); padding: 15px; border-radius: 15px;">
                            <p><i class="fas fa-user-check"></i> <strong>تمت المراجعة بواسطة:</strong> ${f.reviewedBy || 'محمد العربي'}</p>
                            <p><i class="fas fa-comment"></i> <strong>الملاحظات:</strong> ${f.reviewNotes || 'لا توجد ملاحظات'}</p>
                            ${f.rejectReason ? `<p><i class="fas fa-exclamation-circle"></i> <strong>سبب الرفض:</strong> ${f.rejectReason}</p>` : ''}
                        </div>
                        
                        <div class="action-buttons" style="margin-top: 15px;">
                            <button class="btn btn-view" onclick="viewFileDetails(${f.id})">
                                <i class="fas fa-eye"></i> عرض التفاصيل
                            </button>
                            <button class="btn btn-edit" onclick="reopenFile(${f.id})">
                                <i class="fas fa-undo-alt"></i> إعادة فتح المراجعة
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        // ===== تصفية السجل =====
        function filterHistory() {
            let searchTerm = document.getElementById('historySearch')?.value.toLowerCase() || '';
            renderHistory();
        }

        // ===== قالب الإحصائيات =====
        function getStatsHTML() {
            let approved = farmers.filter(f => f.status === 'approved').length;
            let rejected = farmers.filter(f => f.status === 'rejected').length;
            let pending = farmers.filter(f => f.status === 'pending').length;
            let total = farmers.length;
            
            let totalArea = farmers.reduce((sum, f) => sum + (parseFloat(f.area) || 0), 0).toFixed(1);
            let totalAnimals = farmers.reduce((sum, f) => sum + (parseInt(f.bovins)||0) + (parseInt(f.ovins)||0) + (parseInt(f.caprins)||0), 0);
            
            return `
                <div class="page-header">
                    <div class="page-title">
                        <h2>إحصائيات التحقق</h2>
                        <p>تحليل أداء المراجعة والتحقق</p>
                    </div>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                        </div>
                        <div class="stat-value">${approved}</div>
                        <div class="stat-label">مقبول</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-times-circle"></i></div>
                        </div>
                        <div class="stat-value">${rejected}</div>
                        <div class="stat-label">مرفوض</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-clock"></i></div>
                        </div>
                        <div class="stat-value">${pending}</div>
                        <div class="stat-label">قيد الانتظار</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-percent"></i></div>
                        </div>
                        <div class="stat-value">${total ? Math.round((approved / total) * 100) : 0}%</div>
                        <div class="stat-label">نسبة القبول</div>
                    </div>
                </div>
                
                <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr);">
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-tractor"></i></div>
                        </div>
                        <div class="stat-value">${totalArea}</div>
                        <div class="stat-label">المساحة الإجمالية (هكتار)</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-paw"></i></div>
                        </div>
                        <div class="stat-value">${totalAnimals}</div>
                        <div class="stat-label">إجمالي المواشي</div>
                    </div>
                </div>
                
                <div class="charts-grid" style="grid-template-columns: 1fr;">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>توزيع المواشي حسب النوع</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="livestockTypeChart"></canvas>
                        </div>
                    </div>
                </div>
            `;
        }

        // ===== قالب الإعدادات =====
        function getSettingsHTML() {
            return `
                <div class="page-header">
                    <div class="page-title">
                        <h2>إعدادات المراجعة</h2>
                        <p>تخصيص عملية المراجعة والتحقق</p>
                    </div>
                </div>
                
                <div class="survey-card">
                    <h3 class="card-title">
                        <i class="fas fa-bell"></i>
                        إعدادات الإشعارات
                    </h3>
                    
                    <div class="fields-grid">
                        <div class="field-group">
                            <div class="field-label">
                                <i class="fas fa-envelope"></i>
                                إشعارات البريد الإلكتروني
                            </div>
                            <div class="options-group">
                                <label class="option-item"><input type="checkbox" checked> عند وصول ملف جديد</label>
                                <label class="option-item"><input type="checkbox" checked> عند اكتمال المراجعة</label>
                                <label class="option-item"><input type="checkbox"> تقرير يومي</label>
                            </div>
                        </div>
                        
                        <div class="field-group">
                            <div class="field-label">
                                <i class="fas fa-mobile-alt"></i>
                                إشعارات الجوال
                            </div>
                            <div class="options-group">
                                <label class="option-item"><input type="checkbox" checked> تنبيهات فورية</label>
                                <label class="option-item"><input type="checkbox"> ملفات ذات أولوية عالية</label>
                            </div>
                        </div>
                    </div>
                    
                    <h3 class="card-title" style="margin-top: 30px;">
                        <i class="fas fa-sliders-h"></i>
                        إعدادات المراجعة
                    </h3>
                    
                    <div class="fields-grid">
                        <div class="field-group">
                            <div class="field-label">
                                <i class="fas fa-sort-amount-up"></i>
                                ترتيب الملفات
                            </div>
                            <select class="input-box">
                                <option>حسب تاريخ الإرسال (الأحدث أولاً)</option>
                                <option>حسب الأولوية</option>
                                <option>حسب اسم الفلاح</option>
                            </select>
                        </div>
                        
                        <div class="field-group">
                            <div class="field-label">
                                <i class="fas fa-check-double"></i>
                                المراجعة التلقائية
                            </div>
                            <div class="options-group">
                                <label class="option-item"><input type="radio" name="autoReview" checked> يدوي (أراجع بنفسي)</label>
                                <label class="option-item"><input type="radio" name="autoReview"> تلقائي للملفات المكتملة</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="action-buttons" style="justify-content: center;">
                        <button class="btn btn-success" onclick="showToast('تم حفظ الإعدادات', 'success')">
                            <i class="fas fa-save"></i> حفظ الإعدادات
                        </button>
                    </div>
                </div>
            `;
        }

        // ===== تهيئة الرسوم البيانية =====
        function initDashboardCharts() {
            let pending = farmers.filter(f => f.status === 'pending').length;
            let approved = farmers.filter(f => f.status === 'approved').length;
            let rejected = farmers.filter(f => f.status === 'rejected').length;
            
            // رسم بياني لحالة الملفات
            let statusCtx = document.getElementById('statusChart')?.getContext('2d');
            if (statusCtx) {
                new Chart(statusCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['قيد الانتظار', 'مقبول', 'مرفوض'],
                        datasets: [{
                            data: [pending, approved, rejected],
                            backgroundColor: ['#ffc107', '#28a745', '#dc3545'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { font: { family: 'Cairo' } }
                            }
                        },
                        cutout: '70%'
                    }
                });
            }
            
            // رسم بياني للمواشي
            let totalBovins = farmers.reduce((sum, f) => sum + (parseInt(f.bovins)||0), 0);
            let totalOvins = farmers.reduce((sum, f) => sum + (parseInt(f.ovins)||0), 0);
            let totalCaprins = farmers.reduce((sum, f) => sum + (parseInt(f.caprins)||0), 0);
            
            let livestockCtx = document.getElementById('livestockChart')?.getContext('2d');
            if (livestockCtx) {
                new Chart(livestockCtx, {
                    type: 'bar',
                    data: {
                        labels: ['أبقار', 'أغنام', 'ماعز'],
                        datasets: [{
                            data: [totalBovins, totalOvins, totalCaprins],
                            backgroundColor: ['#1C4B2D', '#2E6B3E', '#D4AF37'],
                            borderRadius: 10
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: { color: 'rgba(28,75,45,0.1)' }
                            }
                        }
                    }
                });
            }
            
            // عرض أحدث الملفات
            let recentList = document.getElementById('recentPendingList');
            if (recentList) {
                let recent = farmers.filter(f => f.status === 'pending').sort((a, b) => new Date(b.submittedDate || b.date) - new Date(a.submittedDate || a.date)).slice(0, 5);
                
                if (recent.length === 0) {
                    recentList.innerHTML = '<p style="color: var(--primary); text-align: center;">لا توجد ملفات قيد الانتظار</p>';
                } else {
                    recentList.innerHTML = recent.map(f => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255,255,255,0.5); border-radius: 15px; margin-bottom: 10px;">
                            <div>
                                <strong style="color: var(--primary-dark);">${f.name}</strong>
                                <p style="color: var(--primary); font-size: 13px;">${f.wilayaName || 'ولاية ' + f.wilaya}</p>
                            </div>
                            <div>
                                <span class="badge" style="background: ${f.priority === 'high' ? 'var(--danger)' : f.priority === 'medium' ? 'var(--warning)' : 'var(--success)'}; color: white; position: static; width: auto; border-radius: 20px; padding: 5px 15px;">
                                    ${f.priority === 'high' ? 'عالية' : f.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                                </span>
                            </div>
                        </div>
                    `).join('');
                }
            }
        }

        function initStatsCharts() {
            let totalBovins = farmers.reduce((sum, f) => sum + (parseInt(f.bovins)||0), 0);
            let totalOvins = farmers.reduce((sum, f) => sum + (parseInt(f.ovins)||0), 0);
            let totalCaprins = farmers.reduce((sum, f) => sum + (parseInt(f.caprins)||0), 0);
            
            let livestockCtx = document.getElementById('livestockTypeChart')?.getContext('2d');
            if (livestockCtx) {
                new Chart(livestockCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['أبقار', 'أغنام', 'ماعز'],
                        datasets: [{
                            data: [totalBovins, totalOvins, totalCaprins],
                            backgroundColor: ['#1C4B2D', '#2E6B3E', '#D4AF37'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { font: { family: 'Cairo' } }
                            }
                        },
                        cutout: '70%'
                    }
                });
            }
        }

        // ===== متغيرات للمراجعة =====
        let currentFileId = null;
        let currentAction = null;

        // ===== فتح نافذة المراجعة =====
        function openReviewModal(fileId, action) {
            currentFileId = fileId;
            currentAction = action;
            
            let file = farmers.find(f => f.id == fileId);
            if (!file) return;
            
            document.getElementById('reviewTitle').textContent = action === 'approve' ? 'قبول الملف' : 'رفض الملف';
            document.getElementById('reviewFarmerName').textContent = file.name;
            document.getElementById('reviewNotes').value = '';
            document.getElementById('rejectReason').style.display = action === 'reject' ? 'block' : 'none';
            document.getElementById('rejectReason').value = '';
            
            document.getElementById('reviewModal').classList.add('active');
        }

        // ===== إغلاق نافذة المراجعة =====
        function closeReviewModal() {
            document.getElementById('reviewModal').classList.remove('active');
            currentFileId = null;
            currentAction = null;
        }

        // ===== تأكيد القبول =====
        function confirmApprove() {
            if (!currentFileId) return;
            
            let notes = document.getElementById('reviewNotes').value;
            
            let fileIndex = farmers.findIndex(f => f.id == currentFileId);
            if (fileIndex !== -1) {
                farmers[fileIndex].status = 'approved';
                farmers[fileIndex].reviewedBy = 'محمد العربي';
                farmers[fileIndex].reviewedDate = new Date().toISOString();
                farmers[fileIndex].reviewNotes = notes || 'تمت الموافقة على الملف';
                
                saveToLocalStorage();
                
                showToast('تم قبول الملف بنجاح', 'success');
                closeReviewModal();
                updateCounters();
                
                let activeTab = document.querySelector('.filter-tab.active')?.getAttribute('onclick')?.match(/'([^']+)'/)?.[1] || 'pending';
                showPage(activeTab);
            }
        }

        // ===== تأكيد الرفض =====
        function confirmReject() {
            if (!currentFileId) return;
            
            let notes = document.getElementById('reviewNotes').value;
            let reason = document.getElementById('rejectReason').value;
            
            if (!notes && !reason) {
                showToast('الرجاء إدخال سبب الرفض', 'error');
                return;
            }
            
            let fileIndex = farmers.findIndex(f => f.id == currentFileId);
            if (fileIndex !== -1) {
                farmers[fileIndex].status = 'rejected';
                farmers[fileIndex].reviewedBy = 'محمد العربي';
                farmers[fileIndex].reviewedDate = new Date().toISOString();
                farmers[fileIndex].reviewNotes = notes || reason;
                farmers[fileIndex].rejectReason = reason;
                
                saveToLocalStorage();
                
                showToast('تم رفض الملف', 'warning');
                closeReviewModal();
                updateCounters();
                
                let activeTab = document.querySelector('.filter-tab.active')?.getAttribute('onclick')?.match(/'([^']+)'/)?.[1] || 'pending';
                showPage(activeTab);
            }
        }

        // ===== إعادة فتح ملف =====
        function reopenFile(fileId) {
            if (!confirm('هل أنت متأكد من إعادة فتح هذا الملف للمراجعة؟')) return;
            
            let fileIndex = farmers.findIndex(f => f.id == fileId);
            if (fileIndex !== -1) {
                farmers[fileIndex].status = 'pending';
                farmers[fileIndex].reviewedBy = undefined;
                farmers[fileIndex].reviewedDate = undefined;
                farmers[fileIndex].reviewNotes = undefined;
                farmers[fileIndex].rejectReason = undefined;
                
                saveToLocalStorage();
                
                showToast('تم إعادة فتح الملف للمراجعة', 'success');
                updateCounters();
                
                let activeTab = document.querySelector('.filter-tab.active')?.getAttribute('onclick')?.match(/'([^']+)'/)?.[1] || 'pending';
                showPage(activeTab);
            }
        }

       // ===== عرض تفاصيل الملف الكاملة (جميع الحقول الـ 171) =====
function viewFileDetails(fileId) {
    let f = farmers.find(x => x.id == fileId);
    if (!f) return;
    
    let modal = document.getElementById('detailsModal');
    if (!modal) return;
    
    let nameEl = document.getElementById('detailsName');
    let idEl = document.getElementById('detailsId');
    let contentEl = document.getElementById('detailsContent');
    
    if (nameEl) nameEl.textContent = f.exploitantNom || f.name || 'غير محدد';
    if (idEl) idEl.textContent = `رقم الملف: ${f.id}`;
    
    // حساب الإحصائيات
    let totalAnimals = (parseInt(f.bovins)||0) + (parseInt(f.ovins)||0) + (parseInt(f.caprins)||0) + 
                     (parseInt(f.camelins)||0) + (parseInt(f.equins)||0) + (parseInt(f.mulets)||0) + 
                     (parseInt(f.anes)||0) + (parseInt(f.lapins)||0);
    
    let totalHerbacee = (parseFloat(f.herbaceeIrriguee)||0) + (parseFloat(f.herbaceeSec)||0);
    let totalJacher = (parseFloat(f.jacherIrriguee)||0) + (parseFloat(f.jacherSec)||0);
    let totalPerenes = (parseFloat(f.perenesIrriguee)||0) + (parseFloat(f.perenesSec)||0);
    let totalPrairie = (parseFloat(f.prairieIrriguee)||0) + (parseFloat(f.prairieSec)||0);
    let totalSAU = (parseFloat(f.sauIrriguee)||0) + (parseFloat(f.sauSec)||0);
    
    if (contentEl) {
        contentEl.innerHTML = `
            <!-- ========== القسم 1: المعلومات العامة (الحقول 1-12) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-info-circle"></i> I - المعلومات العامة
                    <span class="section-badge">Générales</span>
                </div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-item-label">1. تاريخ المرور</div>
                        <div class="details-item-value">${f.passDay || "00"}/${f.passMonth || "00"}/${f.passYear || "2025"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">2. لقب المحصي</div>
                        <div class="details-item-value">${f.recenseurNom || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">3. اسم المحصي</div>
                        <div class="details-item-value">${f.recenseurPrenom || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">4. تاريخ المراقبة</div>
                        <div class="details-item-value">${f.controlDay || "00"}/${f.controlMonth || "00"}/${f.controlYear || ""}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">5. لقب المراقب</div>
                        <div class="details-item-value">${f.controleurNom || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">6. اسم المراقب</div>
                        <div class="details-item-value">${f.controleurPrenom || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">7. الولاية</div>
                        <div class="details-item-value">${f.wilaya2 || f.wilaya || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">8. البلدية</div>
                        <div class="details-item-value">${f.commune || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">9. رمز البلدية/الولاية</div>
                        <div class="details-item-value">${f.code1 || ""}${f.code2 || ""}${f.code3 || ""}${f.code4 || ""}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">10. اسم المكان/المنطقة</div>
                        <div class="details-item-value">${f.lieuDit || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">11. رقم المنطقة</div>
                        <div class="details-item-value">${f.district1 || ""}${f.district2 || ""}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">12. رقم المستثمرة</div>
                        <div class="details-item-value">${f.numExploitation || "غير محدد"}</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 2: تعريف المستثمر (الحقول 13-31) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-user-tie"></i> II - تعريف المستثمر (الفلاح)
                    <span class="section-badge">Identification de l'exploitant</span>
                </div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-item-label">13. اللقب</div>
                        <div class="details-item-value">${f.exploitantNom || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">14. الاسم</div>
                        <div class="details-item-value">${f.exploitantPrenom || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">15. سنة الميلاد</div>
                        <div class="details-item-value">${f.birthYear || "غير محدد"} (العمر: ${f.birthYear ? (2025 - parseInt(f.birthYear)) : "?"} سنة)</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">16. الجنس</div>
                        <div class="details-item-value">${f.sexe === 'male' ? 'ذكر ♂' : f.sexe === 'female' ? 'أنثى ♀' : 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">17. المستوى التعليمي</div>
                        <div class="details-item-value">${f.education || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">18. مستوى التكوين الفلاحي</div>
                        <div class="details-item-value">${f.formation || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">19. عنوان المستغل الفلاحي</div>
                        <div class="details-item-value">${f.adresse || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">20. رقم الهاتف</div>
                        <div class="details-item-value">${f.phone1 || ""}${f.phone2 || ""}${f.phone3 || ""}${f.phone4 || ""}${f.phone5 || ""}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">21. البريد الإلكتروني</div>
                        <div class="details-item-value">${f.email || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">22. رقم التعريف الوطني (NIN)</div>
                        <div class="details-item-value">${f.nin1 || ""}${f.nin2 || ""}${f.nin3 || ""}${f.nin4 || ""}${f.nin5 || ""}${f.nin6 || ""}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">23. رقم التعريف الإحصائي (NIS)</div>
                        <div class="details-item-value">${f.nis1 || ""}${f.nis2 || ""}${f.nis3 || ""}${f.nis4 || ""}${f.nis5 || ""}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">24. رقم بطاقة الفلاح</div>
                        <div class="details-item-value">${f.carte1 || ""}${f.carte2 || ""}${f.carte3 || ""}${f.carte4 || ""}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">25. التسجيل في المنظمات</div>
                        <div class="details-item-value">
                            ${f.inscritCAW ? 'CAW ✓ ' : ''}${f.inscritCAPA ? 'CAPA ✓ ' : ''}${f.inscritUNPA ? 'UNPA ✓ ' : ''}
                            ${f.inscritCARM ? 'CARM ✓ ' : ''}${f.inscritCCW ? 'CCW ✓ ' : ''}
                            ${!f.inscritCAW && !f.inscritCAPA && !f.inscritUNPA && !f.inscritCARM && !f.inscritCCW ? 'غير مسجل' : ''}
                        </div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">26. نوع التأمين</div>
                        <div class="details-item-value">${f.assuranceType26 || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">28. منحدر من عائلة فلاحية</div>
                        <div class="details-item-value">${f.famille === 'نعم' ? 'نعم ✓' : f.famille === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">29. الفلاح الرئيسي</div>
                        <div class="details-item-value">${f.roleExploitant || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">30. عدد المتداولين (الشركاء)</div>
                        <div class="details-item-value">${f.coExploitantsCount || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">31. طبيعة الفلاح</div>
                        <div class="details-item-value">${f.nature || "غير محدد"}</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 3: تعريف المستثمرة (الحقول 32-43) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-tractor"></i> III - تعريف المستثمرة
                    <span class="section-badge">Identification de l'exploitation</span>
                </div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-item-label">32. اسم المستثمرة</div>
                        <div class="details-item-value">${f.nomExploitation || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">33. عنوان المستثمرة</div>
                        <div class="details-item-value">${f.adresseExploitation || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">34. الوضع القانوني</div>
                        <div class="details-item-value">${f.statut || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">35. الإحداثيات الجغرافية</div>
                        <div class="details-item-value">${f.latitude || "..."} , ${f.longitude || "..."}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">36. نشاط المستثمرة</div>
                        <div class="details-item-value">${f.vocation === 'نباتي' ? '🌱 نباتي' : f.vocation === 'حيواني' ? '🐄 حيواني' : f.vocation === 'مختلط' ? '🌾🐄 مختلط' : 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">37. إذا حيواني: هل لديه أراضٍ؟</div>
                        <div class="details-item-value">${f.terreAnimal || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">38. إمكانية الوصول</div>
                        <div class="details-item-value">${f.access || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">39. متصلة بشبكة الكهرباء؟</div>
                        <div class="details-item-value">${f.electricite === 'نعم' ? 'نعم ✓' : f.electricite === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">40. متصلة بشبكة الهاتف؟</div>
                        <div class="details-item-value">${f.telephone === 'نعم' ? 'نعم ✓' : f.telephone === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">41. نوع الهاتف</div>
                        <div class="details-item-value">${f.typeTel || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">42. متصلة بالإنترنت؟</div>
                        <div class="details-item-value">${f.internet === 'نعم' ? 'نعم ✓' : f.internet === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">43. استخدام الإنترنت للفلاحة؟</div>
                        <div class="details-item-value">${f.internetAgricole === 'نعم' ? 'نعم ✓' : f.internetAgricole === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 4: مساحة المستثمرة (الحقول 47-63) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-ruler-combined"></i> IV - مساحة المستثمرة (هكتار)
                    <span class="section-badge">Superficie de l'exploitation</span>
                </div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-item-label">47. محاصيل عشبية</div>
                        <div class="details-item-value">مروية: ${f.herbaceeIrriguee || "0"} | جافة: ${f.herbaceeSec || "0"} | المجموع: ${totalHerbacee}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">48. أراضي مستريحة (البور)</div>
                        <div class="details-item-value">مروية: ${f.jacherIrriguee || "0"} | جافة: ${f.jacherSec || "0"} | المجموع: ${totalJacher}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">49. محاصيل دائمة</div>
                        <div class="details-item-value">مروية: ${f.perenesIrriguee || "0"} | جافة: ${f.perenesSec || "0"} | المجموع: ${totalPerenes}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">50. مروج طبيعية</div>
                        <div class="details-item-value">مروية: ${f.prairieIrriguee || "0"} | جافة: ${f.prairieSec || "0"} | المجموع: ${totalPrairie}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">51. المساحة الفلاحية المستخدمة SAU</div>
                        <div class="details-item-value">مروية: ${f.sauIrriguee || "0"} | جافة: ${f.sauSec || "0"} | المجموع: ${totalSAU}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">52. المراعي والمسارح</div>
                        <div class="details-item-value">${f.pacages || "0"} هكتار</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">53. مساحات غير منتجة</div>
                        <div class="details-item-value">${f.superficieNonProductive || "0"} هكتار</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">54. المساحة الفلاحية الإجمالية SAT</div>
                        <div class="details-item-value"><strong style="color: #2d6a4f; font-size: 18px;">${f.superficie || "0"}</strong> هكتار</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">55. أراضي الغابات</div>
                        <div class="details-item-value">${f.forets || "0"} هكتار</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">56. المساحة الإجمالية ST</div>
                        <div class="details-item-value">${f.superficieTotale || "0"} هكتار</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">57. المستثمرة قطعة واحدة؟</div>
                        <div class="details-item-value">${f.unBloc === 'نعم' ? 'نعم ✓' : f.unBloc === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">58. عدد القطع</div>
                        <div class="details-item-value">${f.nombreBlocs || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">59. وجود سكان غير شرعيين؟</div>
                        <div class="details-item-value">${f.indusOccupants === 'نعم' ? 'نعم ✓' : f.indusOccupants === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">61. المساحة المبنية المشغولة</div>
                        <div class="details-item-value">${f.surfaceBatie || "0"} م²</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">63. مصادر الطاقة</div>
                        <div class="details-item-value">
                            ${f.energieReseau ? 'شبكة كهربائية ✓ ' : ''}${f.energieGroupe ? 'مولد ✓ ' : ''}
                            ${f.energieSolaire ? 'شمسية ✓ ' : ''}${f.energieEolienne ? 'رياح ✓ ' : ''}
                            ${f.energieAutres ? 'أخرى ✓ ' : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 5: الأشجار المتفرقة (الحقول 65-74) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-tree"></i> V - الأشجار المتفرقة (عدد الأشجار)
                    <span class="section-badge">Arbres épars</span>
                </div>
                <div class="details-grid">
                    <div class="details-item"><div class="details-item-label">65. أشجار الزيتون</div><div class="details-item-value">${f.arbresOliviers || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">66. أشجار التين</div><div class="details-item-value">${f.arbresFiguiers || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">67. ذوات النوى والبذور</div><div class="details-item-value">${f.arbresNoyaux || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">68. أشجار العنب</div><div class="details-item-value">${f.arbresVigne || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">69. الرمان</div><div class="details-item-value">${f.arbresGrenadiers || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">70. اللوز</div><div class="details-item-value">${f.arbresAmandiers || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">71. أشجار السفرجل</div><div class="details-item-value">${f.arbresCongnassiers || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">72. نخيل التمر</div><div class="details-item-value">${f.arbresPalmiers || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">73. الخروب</div><div class="details-item-value">${f.arbresCaroubier || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">74. أشجار أخرى</div><div class="details-item-value">${f.arbresAutres || "0"}</div></div>
                </div>
            </div>
            
            <!-- ========== القسم 6: الممارسات الزراعية (الحقول 75-81) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-flask"></i> VI - الممارسات الزراعية
                    <span class="section-badge">Pratiques agricoles</span>
                </div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-item-label">75. الزراعة البيولوجية</div>
                        <div class="details-item-value">${f.biologique === 'نعم' ? 'نعم ✓' : f.biologique === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">76. هل لديك شهادة؟</div>
                        <div class="details-item-value">${f.certificatBio === 'نعم' ? 'نعم ✓' : f.certificatBio === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">77. الاستزراع المائي</div>
                        <div class="details-item-value">${f.aquaculture === 'نعم' ? 'نعم ✓' : f.aquaculture === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">78. تربية الحلزون</div>
                        <div class="details-item-value">${f.helicicult === 'نعم' ? 'نعم ✓' : f.helicicult === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">79. زراعة الفطريات</div>
                        <div class="details-item-value">${f.myciculture === 'نعم' ? 'نعم ✓' : f.myciculture === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">80. الزراعة التعاقدية</div>
                        <div class="details-item-value">${f.contractuelle === 'نعم' ? 'نعم ✓' : f.contractuelle === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">81. الشعبة المتعاقد عليها</div>
                        <div class="details-item-value">
                            ${f.filiereTomate ? 'طماطم صناعية ' : ''}${f.filiereHuile ? 'حبوب ' : ''}${f.filiereAviculture ? 'دواجن ' : ''}
                            ${f.filiereMaraichage ? 'خضروات ' : ''}${f.filierePomme ? 'بطاطا ' : ''}${f.filiereAutre ? 'أخرى ' : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 7: المواشي (الحقول 82-105) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-paw"></i> VII - المواشي
                    <span class="section-badge">Cheptel</span>
                </div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-item-label">82. الأبقار (Bovins)</div>
                        <div class="details-item-value">الإجمالي: ${f.bovins || "0"} | BLL: ${f.bovinsBLL || "0"} | BLA: ${f.bovinsBLA || "0"} | BLM: ${f.bovinsBLM || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">86. الأغنام (Ovins)</div>
                        <div class="details-item-value">الإجمالي: ${f.ovins || "0"} | منها النعاج: ${f.ovinsBrebis || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">88. الماعز (Caprins)</div>
                        <div class="details-item-value">الإجمالي: ${f.caprins || "0"} | منها المعزات: ${f.caprinsChevres || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">90/91. الإبل (Camelins)</div>
                        <div class="details-item-value">الإجمالي: ${f.camelins || "0"} | منها النوق: ${f.camelinsFemelles || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">92. الخيول (Equins)</div>
                        <div class="details-item-value">الإجمالي: ${f.equins || "0"} | منها الأفراس: ${f.equinsFemelles || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">94. الدواجن (Aviculture)</div>
                        <div class="details-item-value">دجاج: ${f.pouletsChair || "0"} | ديوك رومي: ${f.dindes || "0"} | أخرى: ${f.autreAviculture || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">97/98. البغال والحمير</div>
                        <div class="details-item-value">بغال: ${f.mulets || "0"} | حمير: ${f.anes || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">99. الأرانب</div>
                        <div class="details-item-value">${f.lapins || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">100-105. تربية النحل</div>
                        <div class="details-item-value">خلايا عصرية: ${f.ruchesModernes || "0"} (ممتلئة: ${f.ruchesModernesPleines || "0"}) | تقليدية: ${f.ruchesTraditionnelles || "0"} (ممتلئة: ${f.ruchesTraditionnellesPleines || "0"})</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 8: مباني الاستغلال (الحقول 106-122) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-warehouse"></i> VIII - مباني الاستغلال
                    <span class="section-badge">Bâtiments d'exploitation</span>
                </div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-item-label">106. مباني سكنية</div>
                        <div class="details-item-value">العدد: ${f.batimentsHabitationNb || "0"} | المساحة: ${f.batimentsHabitationSurface || "0"} م²</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">107/108. مباني تربية الحيوانات</div>
                        <div class="details-item-value">حظائر: ${f.bergeriesNb || "0"} (${f.bergeriesCapacite || "0"} م³) | إسطبلات: ${f.etablesNb || "0"} (${f.etablesCapacite || "0"} م³)</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">109. اسطبل خيول</div>
                        <div class="details-item-value">العدد: ${f.ecurieschNb || "0"} | السعة: ${f.ecurieschCapacite || "0"} م³</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">110. مدجنة (مبنى صلب)</div>
                        <div class="details-item-value">العدد: ${f.PoulaillerNb || "0"} | السعة: ${f.PoulaillerCapacite || "0"} م³</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">111. مدجنة تحت البيوت البلاستيكية</div>
                        <div class="details-item-value">العدد: ${f.PserresNb || "0"} | السعة: ${f.PserresCapacite || "0"} م³</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">112. بيوت بلاستيكية نفقية</div>
                        <div class="details-item-value">العدد: ${f.serresTunnelNb || "0"} | المساحة: ${f.serresTunnelSurface || "0"} م²</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">113. بيوت متعددة القبب</div>
                        <div class="details-item-value">العدد: ${f.mulserresNb || "0"} | المساحة: ${f.mulserresSurface || "0"} م²</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">114. مباني التخزين</div>
                        <div class="details-item-value">العدد: ${f.BatimentsStockageNb || "0"} | السعة: ${f.BatimentsStockageCapacite || "0"} م³</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">115. مباني تخزين المنتجات الفلاحية</div>
                        <div class="details-item-value">العدد: ${f.BatimentsProdAgriNb || "0"} | السعة: ${f.BatimentsProdAgriCapacite || "0"} م³</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">118. وحدة التوظيب</div>
                        <div class="details-item-value">العدد: ${f.uniteDeConNb || "0"} | السعة: ${f.uniteDeConCapacite || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">119. وحدة التحول</div>
                        <div class="details-item-value">العدد: ${f.uniteTransfoNb || "0"} | السعة: ${f.uniteTransfoCapacite || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">120. مركز جمع الحليب</div>
                        <div class="details-item-value">العدد: ${f.centreCollecteLaitNb || "0"} | السعة: ${f.centreCollecteLaitCapacite || "0"} لتر/يوم</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">121. مباني أخرى</div>
                        <div class="details-item-value">العدد: ${f.autresBatimentsNb || "0"} | السعة: ${f.autresBatimentsCapacite || "0"} م³</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">122. غرف التبريد</div>
                        <div class="details-item-value">العدد: ${f.chambresFroidesNb || "0"} | السعة: ${f.chambresFroidesCapacite || "0"} م³</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 9: العتاد الفلاحي ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-tractor"></i> IX - العتاد الفلاحي
                    <span class="section-badge">Matériel agricole</span>
                </div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-item-label">الجرارات ذات العجلات</div>
                        <div class="details-item-value">≤45 CV: ${f.tracteursMoins45 || "0"} | 45-65 CV: ${f.tracteurs40a90 || "0"} | >65 CV: ${f.tracteurs65 || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">الجرارات الزاحفة</div>
                        <div class="details-item-value">≤80 CV: ${f.tracteursChenille80 || "0"} | >80 CV: ${f.tracteursChenillePlus || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">آلات الحصاد</div>
                        <div class="details-item-value">${f.moissonneuse || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">المضخات</div>
                        <div class="details-item-value">موتوبومب: ${f.pompeEau || "0"} | إلكتروبومب: ${f.pompeElectrique || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">وسائل النقل</div>
                        <div class="details-item-value">خفيفة: ${f.vehiculesLegers || "0"} | ثقيلة: ${f.vehiculesLourds || "0"} | مقطورات: ${f.remorques || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">معدات أخرى</div>
                        <div class="details-item-value">${f.autreMateriel || "غير محدد"}</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 10: الموارد المائية (الحقول 127-144) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-water"></i> X - الموارد المائية
                    <span class="section-badge">Ressources en eau</span>
                </div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-item-label">مصادر المياه</div>
                        <div class="details-item-value">
                            ${f.sourcePuits ? '127- بئر ✓ ' : ''}${f.sourceForage ? '128- ثقب ✓ ' : ''}${f.sourcePompage ? '129- ضخ من الوادي ✓ ' : ''}
                            ${f.sourceCrues ? '130- فيض الوادي ✓ ' : ''}${f.sourceBarrage ? '131- سد صغير ✓ ' : ''}${f.sourceRetenu ? '132- خزان التلال ✓ ' : ''}
                            ${f.sourceFoggara ? '133- الفقارة ✓ ' : ''}${f.sourceSource ? '134- منبع ✓ ' : ''}${f.sourceEpuration ? '135- محطة تصفية ✓ ' : ''}
                            ${f.sourceAutres ? '136- مصادر أخرى ✓ ' : ''}
                        </div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">طريقة الري</div>
                        <div class="details-item-value">${f.irrigation || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">المساحة المسقية</div>
                        <div class="details-item-value">${f.areaIrriguee || "0"} هكتار</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">المزروعات المسقية</div>
                        <div class="details-item-value">${f.culturesIrriguees || "غير محدد"}</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 11: اليد العاملة (الحقول 147-156) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-users"></i> XI - اليد العاملة
                    <span class="section-badge">Main d'œuvre</span>
                </div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-item-label">147. المستثمرون المشاركون</div>
                        <div class="details-item-value">ذكور دوام كلي: ${f.coexplMalePlein || "0"} | إناث دوام كلي: ${f.coexplFemalePlein || "0"} | ذكور جزئي: ${f.coexplMalePartiel || "0"} | إناث جزئي: ${f.coexplFemalePartiel || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">148. العمال الفلاحيون</div>
                        <div class="details-item-value">ذكور دوام كلي: ${f.ouvMaleP || "0"} | إناث دوام كلي: ${f.ouvFemaleP || "0"} | ذكور جزئي: ${f.ouvMaleJ || "0"} | إناث جزئي: ${f.ouvFemaleJ || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">149. العمال الأجانب</div>
                        <div class="details-item-value">ذكور دوام كلي: ${f.etrangMaleP || "0"} | إناث دوام كلي: ${f.etrangFemaleP || "0"} | ذكور جزئي: ${f.etrangMaleJ || "0"} | إناث جزئي: ${f.etrangFemaleJ || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">150. فلاح فردي</div>
                        <div class="details-item-value">ذكور: ${f.indivMaleP || "0"} | إناث: ${f.indivFemaleP || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">152. أطفال (-15 سنة)</div>
                        <div class="details-item-value">ذكور: ${f.childMale || "0"} | إناث: ${f.childFemale || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">155. بدون عمل</div>
                        <div class="details-item-value">ذكور: ${f.sansEmploiM || "0"} | إناث: ${f.sansEmploiF || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">156. المستفيدون من الشبكة الاجتماعية</div>
                        <div class="details-item-value">${f.filetSocial || "0"}</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 12: الأسرة الفلاحية (الحقول 157-159) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-home"></i> XII - الأسرة الفلاحية
                    <span class="section-badge">Ménage agricole</span>
                </div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-item-label">157. عدد الأشخاص</div>
                        <div class="details-item-value">ذكور: ${f.familyMale || "0"} | إناث: ${f.familyFemale || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">158. كبار (+15 سنة)</div>
                        <div class="details-item-value">ذكور: ${f.adulteMale || "0"} | إناث: ${f.adultesFemale || "0"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">159. أطفال (-15 سنة)</div>
                        <div class="details-item-value">ذكور: ${f.familyChildMale || "0"} | إناث: ${f.familyChildFemale || "0"}</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 13: استخدام المدخلات (الحقل 160) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-seedling"></i> XIII - استخدام المدخلات
                    <span class="section-badge">Intrants</span>
                </div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-item-label">160. البذور</div>
                        <div class="details-item-value">
                            ${f.semencesSelectionnees ? 'بذور مختارة ✓ ' : ''}${f.semencesCertifiees ? 'بذور معتمدة ✓ ' : ''}
                            ${f.semencesBio ? 'بيولوجية ✓ ' : ''}${f.semencesFerme ? 'بذور المزرعة ✓ ' : ''}
                        </div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">الأسمدة والمبيدات</div>
                        <div class="details-item-value">
                            ${f.engraisAzotes ? 'أسمدة آزوتية ✓ ' : ''}${f.engraisPhosphates ? 'أسمدة فوسفاتية ✓ ' : ''}
                            ${f.fumureOrganique ? 'سماد عضوي ✓ ' : ''}${f.produitsPhyto ? 'مبيدات ✓ ' : ''}
                            ${f.autresEngrais ? 'أسمدة أخرى ✓ ' : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 14: تمويل النشاط الفلاحي والتأمينات (الحقول 161-166) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-coins"></i> XIV - التمويل والتأمينات
                    <span class="section-badge">Financement & Assurances</span>
                </div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-item-label">161. مصادر التمويل</div>
                        <div class="details-item-value">
                            ${f.financePropress ? 'موارد ذاتية ✓ ' : ''}${f.financeCredit ? 'قرض بنكي ✓ ' : ''}
                            ${f.financeSoutien ? 'دعم عمومي ✓ ' : ''}${f.financeEmprunt ? 'استلاف من الغير ✓ ' : ''}
                        </div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">162. نوع القرض البنكي</div>
                        <div class="details-item-value">${f.typeCredit || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">163. نوع الدعم العمومي</div>
                        <div class="details-item-value">${f.typeSoutien || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">164. التأمين الفلاحي</div>
                        <div class="details-item-value">${f.assuranceAgricole === 'نعم' ? 'نعم ✓' : f.assuranceAgricole === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">165. شركة التأمين</div>
                        <div class="details-item-value">${f.compagnieAssurance || "غير محدد"}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">166. نوع التأمين</div>
                        <div class="details-item-value">
                            ${f.assuranceTerre ? 'الأرض ✓ ' : ''}${f.assuranceMaterial ? 'المعدات ✓ ' : ''}${f.assuranceMahassel ? 'المحاصيل ✓ ' : ''}
                            ${f.assurancePersonnel ? 'العمال ✓ ' : ''}${f.assuranceMabani ? 'المباني ✓ ' : ''}${f.assuranceMawachi ? 'المواشي ✓ ' : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 15: محيط المستثمرة (الحقول 167-171) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-building"></i> XV - محيط المستثمرة
                    <span class="section-badge">Environnement</span>
                </div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-item-label">167. وجود مقدمي الخدمات</div>
                        <div class="details-item-value">${f.fournisseurs === 'نعم' ? 'نعم ✓' : f.fournisseurs === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">168. مؤسسات قريبة</div>
                        <div class="details-item-value">
                            ${f.proximiteBanque ? 'بنك ✓ ' : ''}${f.proximitePoste ? 'بريد ✓ ' : ''}${f.proximiteVet ? 'عيادة بيطرية ✓ ' : ''}
                            ${f.proximiteAssurances ? 'تأمينات ✓ ' : ''}${f.proximiteLaboRatoire ? 'مخبر ✓ ' : ''}${f.proximiteBET ? 'مكتب دراسات ✓ ' : ''}
                            ${f.proximiteCooperative ? 'تعاونية ✓ ' : ''}${f.proximiteFournisseur ? 'مورد ✓ ' : ''}
                        </div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">169. تسويق المنتجات</div>
                        <div class="details-item-value">
                            ${f.ventePied ? 'بيع على الجذع ✓ ' : ''}${f.venteGros ? 'سوق الجملة ✓ ' : ''}
                            ${f.venteIntermediaire ? 'وسطاء ✓ ' : ''}${f.venteDirecte ? 'بيع مباشر ✓ ' : ''}
                        </div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">170. سوق التسويق</div>
                        <div class="details-item-value">
                            ${f.marcheLocal ? 'محلي ✓ ' : ''}${f.marcheNational ? 'وطني ✓ ' : ''}${f.marcheInternational ? 'دولي ✓ ' : ''}
                        </div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">171. الانخراط في المنظمات</div>
                        <div class="details-item-value">
                            ${f.cooperativeAgricole ? 'تعاونية فلاحية ✓ ' : ''}${f.associationProfessionnelle ? 'جمعية مهنية ✓ ' : ''}
                            ${f.groupeInteret ? 'مجموعة مصالح ✓ ' : ''}${f.conseilInterpro ? 'مجلس مهني ✓ ' : ''}
                            ${f.autresAssociations ? 'جمعيات أخرى ✓ ' : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 16: معلومات الإرسال والمراجعة ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-info-circle"></i> XVI - معلومات الإرسال والمراجعة
                    <span class="section-badge">Informations d'envoi</span>
                </div>
                <div class="details-grid">
                    <div class="details-item">
                        <div class="details-item-label">مرسل بواسطة</div>
                        <div class="details-item-value">${f.submittedBy || 'غير محدد'}</div>
                    </div>
                    <div class="details-item">
                        <div class="details-item-label">تاريخ الإرسال</div>
                        <div class="details-item-value">${new Date(f.submittedDate || f.date).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    ${f.reviewedBy ? `<div class="details-item"><div class="details-item-label">مراجع بواسطة</div><div class="details-item-value">${f.reviewedBy}</div></div>` : ''}
                    ${f.reviewedDate ? `<div class="details-item"><div class="details-item-label">تاريخ المراجعة</div><div class="details-item-value">${new Date(f.reviewedDate).toLocaleDateString('ar-DZ')}</div></div>` : ''}
                    ${f.reviewNotes ? `<div class="details-item"><div class="details-item-label">ملاحظات المراجعة</div><div class="details-item-value">${f.reviewNotes}</div></div>` : ''}
                    ${f.priority ? `<div class="details-item"><div class="details-item-label">الأولوية</div><div class="details-item-value">${f.priority === 'high' ? 'عالية' : f.priority === 'medium' ? 'متوسطة' : 'منخفضة'}</div></div>` : ''}
                </div>
            </div>
        `;
    }
    
    modal.classList.add('active');
}

// ===== إغلاق نافذة التفاصيل =====
function closeDetailsModal() {
    let modal = document.getElementById('detailsModal');
    if (modal) modal.classList.remove('active');
}

        // ===== تبديل الإشعارات =====
        function toggleNotifications() {
            let panel = document.getElementById('notificationsPanel');
            if (panel.style.display === 'none') {
                let pending = farmers.filter(f => f.status === 'pending').length;
                panel.innerHTML = `
                    <div class="notifications-header">
                        <h3>الإشعارات</h3>
                    </div>
                    ${pending > 0 ? `
                        <div class="notification-item unread">
                            <div class="notification-dot"></div>
                            <div class="notification-content">
                                <p>لديك ${pending} ملف ${pending === 1 ? 'قيد الانتظار' : 'قيد الانتظار'}</p>
                                <div class="notification-time">الآن</div>
                            </div>
                        </div>
                    ` : `
                        <div class="notification-item">
                            <div class="notification-content">
                                <p>لا توجد إشعارات جديدة</p>
                            </div>
                        </div>
                    `}
                `;
                panel.style.display = 'block';
            } else {
                panel.style.display = 'none';
            }
        }

        // ===== رسائل التنبيه =====
        function showToast(message, type) {
            let toast = document.createElement("div");
            toast.className = "toast-message";
            if (type === "error") toast.classList.add("error");
            if (type === "success") toast.classList.add("success");
            if (type === "warning") toast.classList.add("warning");
            toast.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : type === "warning" ? "exclamation-triangle" : "exclamation-circle"}"></i> ${message}`;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
// ===== التهيئة =====
window.onload = function() {
    console.log('تم تحميل الصفحة - بدء التهيئة');
    
    // تحديث العدادات
    updateCounters();
    
    // عرض لوحة التحكم
    showPage('dashboard');
    
    // إغلاق النوافذ المنبثقة
    window.onclick = function(event) {
        let reviewModal = document.getElementById("reviewModal");
        let detailsModal = document.getElementById("detailsModal");
        let notificationsPanel = document.getElementById("notificationsPanel");
        
        if (event.target === reviewModal) {
            closeReviewModal();
        }
        if (event.target === detailsModal) {
            closeDetailsModal();
        }
        if (notificationsPanel && event.target !== notificationsPanel && !event.target.closest('.notification-badge')) {
            notificationsPanel.style.display = 'none';
        }
    };
    
    // تحديث البيانات كل 5 ثواني
    setInterval(() => {
        let newFarmers = JSON.parse(localStorage.getItem('farmers')) || [];
        if (JSON.stringify(newFarmers) !== JSON.stringify(farmers)) {
            farmers = newFarmers;
            updateCounters();
            // تحديث الصفحة الحالية
            let activePage = document.querySelector('.menu-item.active')?.getAttribute('onclick')?.match(/'([^']+)'/)?.[1] || 'dashboard';
            showPage(activePage);
        }
    }, 5000);
};
