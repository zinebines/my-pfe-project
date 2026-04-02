
        // ===== قاعدة البيانات المحاكية =====
        let farmers = JSON.parse(localStorage.getItem('farmers')) || [];
        let drafts = JSON.parse(localStorage.getItem('drafts')) || [];
        let notifications = [];

        // بيانات أولية إذا كانت القاعدة فارغة
        if (farmers.length === 0) {
            // إضافة بعض البيانات التجريبية المنطقية
            farmers = [
                {
                    id: 1,
                    name: "علي بن محمد",
                    phone: "0550123456",
                    wilaya: "16",
                    wilayaName: "الجزائر",
                    area: 15.5,
                    birthYear: 1985,
                    sexe: "male",
                    education: "جامعي",
                    formation: "مهندس",
                    adresse: "حي الرياض, الجزائر العاصمة",
                    bovins: 12,
                    ovins: 45,
                    caprins: 8,
                    equins: 2,
                    pouletsChair: 500,
                    ruchesModernes: 15,
                    superficieSeche: 10,
                    superficieIrriguee: 5.5,
                    date: "2025-01-15T10:30:00.000Z",
                    status: "active"
                },
                {
                    id: 2,
                    name: "فاطمة الزهراء",
                    phone: "0555123789",
                    wilaya: "31",
                    wilayaName: "وهران",
                    area: 8.2,
                    birthYear: 1990,
                    sexe: "female",
                    education: "ثانوي",
                    formation: "تقني",
                    adresse: "حي السلام, وهران",
                    bovins: 5,
                    ovins: 20,
                    caprins: 12,
                    pouletsPondeuses: 200,
                    superficieSeche: 3,
                    superficieIrriguee: 5.2,
                    date: "2025-02-20T14:45:00.000Z",
                    status: "active"
                },
                {
                    id: 3,
                    name: "عبد الرحمان بن أحمد",
                    phone: "0559988776",
                    wilaya: "25",
                    wilayaName: "قسنطينة",
                    area: 25,
                    birthYear: 1978,
                    sexe: "male",
                    education: "متوسط",
                    formation: "لا شيء",
                    adresse: "الخروب, قسنطينة",
                    bovins: 25,
                    ovins: 120,
                    caprins: 30,
                    equins: 5,
                    camelins: 2,
                    superficieSeche: 20,
                    superficieIrriguee: 5,
                    date: "2025-03-05T09:15:00.000Z",
                    status: "active"
                },
                {
                    id: 4,
                    name: "سارة بنت أحمد",
                    phone: "0556345123",
                    wilaya: "23",
                    wilayaName: "عنابة",
                    area: 12,
                    birthYear: 1995,
                    sexe: "female",
                    education: "جامعي",
                    formation: "تقني سامي",
                    adresse: "حي البوني, عنابة",
                    bovins: 8,
                    ovins: 35,
                    caprins: 15,
                    pouletsChair: 300,
                    pouletsPondeuses: 150,
                    superficieSeche: 4,
                    superficieIrriguee: 8,
                    date: "2025-04-10T11:20:00.000Z",
                    status: "pending"
                },
                {
                    id: 5,
                    name: "محمد الأمين",
                    phone: "0554123789",
                    wilaya: "19",
                    wilayaName: "سطيف",
                    area: 30.5,
                    birthYear: 1982,
                    sexe: "male",
                    education: "ثانوي",
                    formation: "عون تقني",
                    adresse: "عين أرنات, سطيف",
                    bovins: 18,
                    ovins: 85,
                    caprins: 22,
                    equins: 3,
                    ruchesModernes: 25,
                    ruchesTraditionnelles: 10,
                    superficieSeche: 22,
                    superficieIrriguee: 8.5,
                    date: "2025-05-18T16:30:00.000Z",
                    status: "active"
                }
            ];
            localStorage.setItem('farmers', JSON.stringify(farmers));
        }

        // ===== تحديث جميع الإحصائيات =====
        function updateAllStats() {
            // تحديث أعداد الفلاحين
            document.querySelectorAll('#sidebarFarmerCount, #farmerCount, #dashboardFarmerCount').forEach(el => {
                if (el) el.textContent = farmers.length;
            });

            // حساب الإحصائيات
            let totalArea = farmers.reduce((sum, f) => sum + (parseFloat(f.area) || 0), 0);
            let totalBovins = farmers.reduce((sum, f) => sum + (parseInt(f.bovins) || 0), 0);
            let totalOvins = farmers.reduce((sum, f) => sum + (parseInt(f.ovins) || 0), 0);
            let totalCaprins = farmers.reduce((sum, f) => sum + (parseInt(f.caprins) || 0), 0);
            let totalAnimals = totalBovins + totalOvins + totalCaprins;
            
            let totalPoulets = farmers.reduce((sum, f) => sum + (parseInt(f.pouletsChair) || 0) + (parseInt(f.pouletsPondeuses) || 0), 0);
            let totalRuches = farmers.reduce((sum, f) => sum + (parseInt(f.ruchesModernes) || 0) + (parseInt(f.ruchesTraditionnelles) || 0), 0);
            
            let totalSuperficieSeche = farmers.reduce((sum, f) => sum + (parseFloat(f.superficieSeche) || 0), 0);
            let totalSuperficieIrriguee = farmers.reduce((sum, f) => sum + (parseFloat(f.superficieIrriguee) || 0), 0);

            // تحديث العناصر في الصفحة
            document.querySelectorAll('#totalArea').forEach(el => {
                if (el) el.textContent = totalArea.toFixed(1);
            });
            
            document.querySelectorAll('#totalAnimals').forEach(el => {
                if (el) el.textContent = totalAnimals;
            });
            
            document.querySelectorAll('#totalBovins').forEach(el => {
                if (el) el.textContent = totalBovins;
            });
            
            document.querySelectorAll('#totalOvins').forEach(el => {
                if (el) el.textContent = totalOvins;
            });
            
            document.querySelectorAll('#totalCaprins').forEach(el => {
                if (el) el.textContent = totalCaprins;
            });
            
            document.querySelectorAll('#totalPoulets').forEach(el => {
                if (el) el.textContent = totalPoulets;
            });
            
            document.querySelectorAll('#totalRuches').forEach(el => {
                if (el) el.textContent = totalRuches;
            });
            
            document.querySelectorAll('#totalSuperficieSeche').forEach(el => {
                if (el) el.textContent = totalSuperficieSeche.toFixed(1);
            });
            
            document.querySelectorAll('#totalSuperficieIrriguee').forEach(el => {
                if (el) el.textContent = totalSuperficieIrriguee.toFixed(1);
            });

            // حساب النسب المئوية
            let activeFarmers = farmers.filter(f => f.status === 'active').length;
            let pendingFarmers = farmers.filter(f => f.status === 'pending').length;
            
            document.querySelectorAll('#activePercentage').forEach(el => {
                if (el) el.textContent = farmers.length ? Math.round((activeFarmers / farmers.length) * 100) : 0;
            });
            
            document.querySelectorAll('#pendingCount').forEach(el => {
                if (el) el.textContent = pendingFarmers;
            });

            // تحديث الرسم البياني إذا كان موجوداً
            updateCharts();
        }

        // ===== تحديث الرسوم البيانية =====
        function updateCharts() {
            if (typeof Chart === 'undefined') return;

            // بيانات التسجيلات الشهرية
            const monthlyData = [0, 0, 0, 0, 0, 0];
            farmers.forEach(f => {
                let month = new Date(f.date).getMonth();
                if (month >= 0 && month < 6) monthlyData[month]++;
            });

            // تحديث الرسم البياني للتسجيلات
            const registrationsCtx = document.getElementById('registrationsChart')?.getContext('2d');
            if (registrationsCtx) {
                if (window.registrationsChart) window.registrationsChart.destroy();
                window.registrationsChart = new Chart(registrationsCtx, {
                    type: 'line',
                    data: {
                        labels: ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان'],
                        datasets: [{
                            label: 'عدد التسجيلات',
                            data: monthlyData,
                            borderColor: '#1C4B2D',
                            backgroundColor: 'rgba(28, 75, 45, 0.1)',
                            borderWidth: 3,
                            pointBackgroundColor: '#D4AF37',
                            pointBorderColor: '#1C4B2D',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } }
                    }
                });
            }

            // بيانات المحاصيل
            const cropsData = [0, 0, 0, 0];
            farmers.forEach(f => {
                if (f.grandesCultures) cropsData[0] += parseFloat(f.grandesCultures) || 0;
                if (f.legumes) cropsData[1] += parseFloat(f.legumes) || 0;
                if (f.arbresFruitiers) cropsData[2] += parseFloat(f.arbresFruitiers) || 0;
            });
            
            // إذا لا توجد بيانات، استخدم بيانات افتراضية
            if (cropsData.every(v => v === 0)) {
                cropsData[0] = 45;
                cropsData[1] = 25;
                cropsData[2] = 20;
                cropsData[3] = 10;
            }

            const cropsCtx = document.getElementById('cropsChart')?.getContext('2d');
            if (cropsCtx) {
                if (window.cropsChart) window.cropsChart.destroy();
                window.cropsChart = new Chart(cropsCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['حبوب', 'خضروات', 'أشجار مثمرة', 'أعلاف'],
                        datasets: [{
                            data: cropsData,
                            backgroundColor: ['#1C4B2D', '#2E6B3E', '#D4AF37', '#8B4513'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { color: '#1C4B2D', font: { family: 'Cairo' } }
                            }
                        },
                        cutout: '70%'
                    }
                });
            }
        }

        // ===== إنشاء إشعار جديد =====
        function addNotification(message, type = 'info') {
            let notification = {
                id: Date.now(),
                message: message,
                time: new Date(),
                read: false
            };
            notifications.unshift(notification);
            if (notifications.length > 10) notifications.pop();
            
            updateNotifications();
        }

        // ===== تحديث لوحة الإشعارات =====
        function updateNotifications() {
            let list = document.getElementById('notificationsList');
            let count = document.getElementById('notificationCount');
            
            if (list) {
                if (notifications.length === 0) {
                    list.innerHTML = '<p style="text-align: center; color: var(--primary); padding: 20px;">لا توجد إشعارات جديدة</p>';
                } else {
                    list.innerHTML = notifications.map(n => `
                        <div class="notification-item ${n.read ? '' : 'unread'}">
                            <div class="notification-dot"></div>
                            <div class="notification-content">
                                <p>${n.message}</p>
                                <div class="notification-time">${getTimeAgo(n.time)}</div>
                            </div>
                        </div>
                    `).join('');
                }
            }
            
            if (count) {
                let unread = notifications.filter(n => !n.read).length;
                count.textContent = unread;
                count.style.display = unread > 0 ? 'flex' : 'none';
            }
        }

        // ===== حساب الوقت المنقضي =====
        function getTimeAgo(date) {
            let seconds = Math.floor((new Date() - new Date(date)) / 1000);
            let intervals = [
                { label: 'سنة', seconds: 31536000 },
                { label: 'شهر', seconds: 2592000 },
                { label: 'أسبوع', seconds: 604800 },
                { label: 'يوم', seconds: 86400 },
                { label: 'ساعة', seconds: 3600 },
                { label: 'دقيقة', seconds: 60 }
            ];
            
            for (let interval of intervals) {
                let count = Math.floor(seconds / interval.seconds);
                if (count > 0) {
                    return `منذ ${count} ${interval.label}${count > 2 ? 'ات' : count > 1 ? 'ين' : ''}`;
                }
            }
            return 'منذ لحظات';
        }

       // ===== عرض قائمة الفلاحين مع زر البروفايل =====
function renderFarmersList() {
    let container = document.getElementById('farmersList');
    if (!container) return;
    
    if (farmers.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--primary)">لا يوجد فلاحين مسجلين بعد</p>';
        return;
    }
    
    container.innerHTML = farmers.map(f => {
        let totalAnimals = (parseInt(f.bovins)||0) + (parseInt(f.ovins)||0) + (parseInt(f.caprins)||0);
        
        return `
            <div class="farmer-card" data-id="${f.id}">
                <div class="farmer-header">
                    <div class="farmer-avatar">
                        <i class="fas fa-${f.sexe === 'female' ? 'user-circle' : 'user-tie'}"></i>
                    </div>
                    <div class="farmer-info">
                        <h4>${f.exploitantNom || f.name || 'غير محدد'} ${f.exploitantPrenom || ''}</h4>
                        <p><i class="fas fa-map-marker-alt"></i> ${f.wilayaName || f.wilaya2 || 'ولاية ' + f.wilaya}</p>
                    </div>
                </div>
                <div class="farmer-stats">
                    <div class="farmer-stat">
                        <i class="fas fa-tractor"></i>
                        <span>${f.superficie || f.area || '0'}</span>
                        <small>هكتار</small>
                    </div>
                    <div class="farmer-stat">
                        <i class="fas fa-paw"></i>
                        <span>${totalAnimals}</span>
                        <small>رأس</small>
                    </div>
                    <div class="farmer-stat">
                        <i class="fas fa-phone"></i>
                        <span>${f.phone || f.phone1 || 'غير محدد'}</span>
                        <small>الهاتف</small>
                    </div>
                </div>
                <div class="farmer-footer">
                    <span class="farmer-status ${f.status === 'approved' ? 'approved' : f.status === 'rejected' ? 'rejected' : 'pending'}">
                        ${f.status === 'approved' ? 'مقبول' : f.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                    </span>
                    <div class="farmer-actions">
                     <button class="btn btn-view" onclick="viewFileDetails(${f.id})">
                                <i class="fas fa-eye"></i> عرض التفاصيل
                            </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}


        // ===== حفظ فلاح جديد =====
        function saveFarmer() {
            let name = document.getElementById('farmerName')?.value;
            if (!name) {
                alert('الرجاء إدخال اسم الفلاح');
                return;
            }
            
            let farmer = {
                id: Date.now(),
                name: name,
                phone: document.getElementById('farmerPhone')?.value || '',
                wilaya: document.getElementById('farmerWilaya')?.value || '',
                area: parseFloat(document.getElementById('farmerArea')?.value) || 0,
                birthYear: parseInt(document.getElementById('farmerBirthYear')?.value) || 1980,
                sexe: document.querySelector('input[name="farmerSexe"]:checked')?.value || 'male',
                bovins: parseInt(document.getElementById('farmerBovins')?.value) || 0,
                ovins: parseInt(document.getElementById('farmerOvins')?.value) || 0,
                caprins: parseInt(document.getElementById('farmerCaprins')?.value) || 0,
                date: new Date().toISOString(),
                status: 'pending'
            };
            
            farmers.push(farmer);
            localStorage.setItem('farmers', JSON.stringify(farmers));
            
            addNotification(`تم تسجيل فلاح جديد: ${name}`);
            updateAllStats();
            
            // العودة إلى لوحة التحكم
            showPage('dashboard');
        }

        // ===== التنقل بين الصفحات =====
        function showPage(page) {
            // تحديث القائمة النشطة
            document.querySelectorAll('nav a, .menu-item').forEach(el => {
                el.classList.remove('active');
            });
            
            document.querySelectorAll(`[onclick="showPage('${page}')"]`).forEach(el => {
                el.classList.add('active');
            });

            // تحميل المحتوى المناسب
            let content = document.getElementById('mainContent');
            
            switch(page) {
                case 'dashboard':
                    content.innerHTML = getDashboardHTML();
                    setTimeout(() => {
                        updateAllStats();
                        updateCharts();
                    }, 100);
                    break;
                case 'survey':
                    content.innerHTML = getSurveyHTML();
                    break;
                case 'farmers':
                    content.innerHTML = getFarmersHTML();
                    setTimeout(renderFarmersList, 100);
                    break;
                case 'reports':
                    content.innerHTML = getReportsHTML();
                    setTimeout(() => {
                        updateAllStats();
                        updateCharts();
                    }, 100);
                    break;
                case 'statistics':
                    content.innerHTML = getStatisticsHTML();
                    setTimeout(updateAllStats, 100);
                    break;
                case 'maps':
                    content.innerHTML = getMapsHTML();
                    break;
            }
        }

        // ===== قوالب الصفحات =====
        function getDashboardHTML() {
            return `
                <div class="page-header">
                    <div class="page-title">
                        <h2>لوحة التحكم</h2>
                        <p>نظرة عامة على النظام والإحصائيات الفعلية</p>
                    </div>
                    <div class="date-range">
                        <i class="fas fa-calendar-alt"></i>
                        <span>آخر تحديث: ${new Date().toLocaleDateString('ar-DZ')}</span>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-users"></i></div>
                            <div class="stat-change positive">+${farmers.length > 0 ? Math.round(farmers.filter(f => new Date(f.date) > new Date(Date.now() - 30*24*60*60*1000)).length / farmers.length * 100) : 0}%</div>
                        </div>
                        <div class="stat-value" id="dashboardFarmerCount">${farmers.length}</div>
                        <div class="stat-label">إجمالي الفلاحين</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-tractor"></i></div>
                            <div class="stat-change positive">+15%</div>
                        </div>
                        <div class="stat-value" id="totalArea">${farmers.reduce((sum, f) => sum + (parseFloat(f.area) || 0), 0).toFixed(1)}</div>
                        <div class="stat-label">المساحة الإجمالية (هكتار)</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-paw"></i></div>
                            <div class="stat-change positive">+8%</div>
                        </div>
                        <div class="stat-value" id="totalAnimals">${farmers.reduce((sum, f) => sum + (parseInt(f.bovins) || 0) + (parseInt(f.ovins) || 0) + (parseInt(f.caprins) || 0), 0)}</div>
                        <div class="stat-label">إجمالي المواشي</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
                            <div class="stat-change positive">+12%</div>
                        </div>
                        <div class="stat-value" id="activePercentage">${farmers.length ? Math.round(farmers.filter(f => f.status === 'active').length / farmers.length * 100) : 0}%</div>
                        <div class="stat-label">نسبة النشاط</div>
                    </div>
                </div>

                <div class="charts-grid">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>تطور التسجيلات الشهرية</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="registrationsChart"></canvas>
                        </div>
                    </div>

                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>توزيع المحاصيل</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="cropsChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="recent-activity" style="background: rgba(255,255,255,0.8); border-radius: 25px; padding: 20px; margin-top: 20px;">
                    <h3 style="color: var(--primary-dark); margin-bottom: 20px;">آخر الفلاحين المسجلين</h3>
                    <div style="display: grid; gap: 15px;">
                        ${farmers.slice(-3).reverse().map(f => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255,255,255,0.5); border-radius: 15px;">
                                <div>
                                    <strong style="color: var(--primary-dark);">${f.name}</strong>
                                    <p style="color: var(--primary); font-size: 13px;">${f.wilayaName || 'ولاية ' + f.wilaya}</p>
                                </div>
                                <span style="color: var(--secondary); font-size: 13px;">${getTimeAgo(new Date(f.date))}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function getSurveyHTML() {
            return `
                <div class="page-header">
                    <div class="page-title">
                        <h2>تسجيل فلاح جديد</h2>
                        <p>أدخل بيانات الفلاح والمستثمرة الفلاحية</p>
                    </div>
                </div>

                <div class="survey-form">
                    <form onsubmit="event.preventDefault(); saveFarmer();">
                        <div class="form-row">
                            <div class="form-group">
                                <label>اسم الفلاح الكامل</label>
                                <input type="text" class="form-control" id="farmerName" placeholder="أدخل الاسم الكامل" required>
                            </div>
                            <div class="form-group">
                                <label>رقم الهاتف</label>
                                <input type="tel" class="form-control" id="farmerPhone" placeholder="05XX XX XX XX">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>الولاية</label>
                                <select class="form-control" id="farmerWilaya">
                                    <option value="">اختر الولاية</option>
                                    <option value="16">الجزائر</option>
                                    <option value="31">وهران</option>
                                    <option value="25">قسنطينة</option>
                                    <option value="23">عنابة</option>
                                    <option value="19">سطيف</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>المساحة (هكتار)</label>
                                <input type="number" step="0.1" class="form-control" id="farmerArea" placeholder="مثال: 15.5">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>سنة الميلاد</label>
                                <input type="number" class="form-control" id="farmerBirthYear" placeholder="1990" min="1900" max="2025">
                            </div>
                            <div class="form-group">
                                <label>الجنس</label>
                                <div style="display: flex; gap: 20px; padding: 10px 0;">
                                    <label><input type="radio" name="farmerSexe" value="male" checked> ذكر</label>
                                    <label><input type="radio" name="farmerSexe" value="female"> أنثى</label>
                                </div>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>عدد الأبقار</label>
                                <input type="number" class="form-control" id="farmerBovins" value="0" min="0">
                            </div>
                            <div class="form-group">
                                <label>عدد الأغنام</label>
                                <input type="number" class="form-control" id="farmerOvins" value="0" min="0">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>عدد الماعز</label>
                                <input type="number" class="form-control" id="farmerCaprins" value="0" min="0">
                            </div>
                            <div class="form-group">
                                <label>عدد الدواجن</label>
                                <input type="number" class="form-control" id="farmerPoulets" value="0" min="0">
                            </div>
                        </div>

                        <div style="display: flex; gap: 15px; margin-top: 30px;">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> حفظ الفلاح
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="showPage('dashboard')">
                                <i class="fas fa-times"></i> إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            `;
        }

        function getFarmersHTML() {
            return `
                <div class="page-header">
                    <div class="page-title">
                        <h2>قائمة الفلاحين</h2>
                        <p>عرض جميع الفلاحين المسجلين في النظام</p>
                    </div>
                    <button class="btn btn-primary" onclick="showPage('survey')">
                        <i class="fas fa-plus"></i> إضافة فلاح جديد
                    </button>
                </div>

                <div id="farmersList" class="farmers-grid"></div>
            `;
        }

        function getReportsHTML() {
            let totalArea = farmers.reduce((sum, f) => sum + (parseFloat(f.area) || 0), 0);
            let totalBovins = farmers.reduce((sum, f) => sum + (parseInt(f.bovins) || 0), 0);
            let totalOvins = farmers.reduce((sum, f) => sum + (parseInt(f.ovins) || 0), 0);
            let totalCaprins = farmers.reduce((sum, f) => sum + (parseInt(f.caprins) || 0), 0);

            return `
                <div class="page-header">
                    <div class="page-title">
                        <h2>التقارير الإحصائية</h2>
                        <p>تقارير مفصلة عن النشاط الفلاحي</p>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
                        </div>
                        <div class="stat-value">${new Date().toLocaleDateString('ar-DZ')}</div>
                        <div class="stat-label">تاريخ التقرير</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-chart-pie"></i></div>
                        </div>
                        <div class="stat-value">${farmers.length}</div>
                        <div class="stat-label">إجمالي الفلاحين</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-tractor"></i></div>
                        </div>
                        <div class="stat-value">${totalArea.toFixed(1)}</div>
                        <div class="stat-label">المساحة (هكتار)</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-paw"></i></div>
                        </div>
                        <div class="stat-value">${totalBovins + totalOvins + totalCaprins}</div>
                        <div class="stat-label">إجمالي المواشي</div>
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.8); border-radius: 25px; padding: 30px; margin-top: 20px;">
                    <h3 style="color: var(--primary-dark); margin-bottom: 20px;">تفاصيل الثروة الحيوانية</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                        <div style="text-align: center; padding: 20px; background: rgba(28,75,45,0.05); border-radius: 20px;">
                            <i class="fas fa-cow" style="font-size: 40px; color: var(--secondary); margin-bottom: 10px;"></i>
                            <h4 style="color: var(--primary-dark);">الأبقار</h4>
                            <p style="font-size: 24px; font-weight: 800; color: var(--primary);">${totalBovins}</p>
                        </div>
                        <div style="text-align: center; padding: 20px; background: rgba(28,75,45,0.05); border-radius: 20px;">
                            <i class="fas fa-sheep" style="font-size: 40px; color: var(--secondary); margin-bottom: 10px;"></i>
                            <h4 style="color: var(--primary-dark);">الأغنام</h4>
                            <p style="font-size: 24px; font-weight: 800; color: var(--primary);">${totalOvins}</p>
                        </div>
                        <div style="text-align: center; padding: 20px; background: rgba(28,75,45,0.05); border-radius: 20px;">
                            <i class="fas fa-goat" style="font-size: 40px; color: var(--secondary); margin-bottom: 10px;"></i>
                            <h4 style="color: var(--primary-dark);">الماعز</h4>
                            <p style="font-size: 24px; font-weight: 800; color: var(--primary);">${totalCaprins}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        function getStatisticsHTML() {
            return `
                <div class="page-header">
                    <div class="page-title">
                        <h2>الإحصائيات التفصيلية</h2>
                        <p>تحليل متقدم للبيانات الفلاحية</p>
                    </div>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-water"></i></div>
                        </div>
                        <div class="stat-value" id="totalSuperficieIrriguee">0</div>
                        <div class="stat-label">المساحات المسقية</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-drumstick-bite"></i></div>
                        </div>
                        <div class="stat-value" id="totalPoulets">0</div>
                        <div class="stat-label">الدواجن</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-bug"></i></div>
                        </div>
                        <div class="stat-value" id="totalRuches">0</div>
                        <div class="stat-label">خلايا النحل</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <div class="stat-icon"><i class="fas fa-clock"></i></div>
                        </div>
                        <div class="stat-value" id="pendingCount">0</div>
                        <div class="stat-label">قيد الانتظار</div>
                    </div>
                </div>
            `;
        }

        function getMapsHTML() {
            return `
                <div class="page-header">
                    <div class="page-title">
                        <h2>الخريطة التفاعلية</h2>
                        <p>توزيع المستثمرات الفلاحية على الخريطة</p>
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.8); border-radius: 25px; padding: 50px; text-align: center;">
                    <i class="fas fa-map-marked-alt" style="font-size: 80px; color: var(--secondary); margin-bottom: 20px;"></i>
                    <h3 style="color: var(--primary-dark); margin-bottom: 10px;">الخريطة التفاعلية قريباً</h3>
                    <p style="color: var(--primary);">سيتم إضافة الخريطة التفاعلية في التحديث القادم</p>
                </div>
            `;
        }

        // ===== دوال مساعدة =====
        function toggleNotifications() {
            document.getElementById('notificationsPanel').classList.toggle('active');
        }

        // تهيئة الصفحة
        window.onload = function() {
            // إضافة بعض الإشعارات التجريبية
            addNotification('تم تحديث النظام إلى الإصدار 2.5.0');
            addNotification('اكتمال 80% من الإحصاء الوطني');
            
            if (farmers.length > 0) {
                addNotification(`تم تسجيل ${farmers.length} فلاح حتى الآن`);
            }
            
            updateAllStats();
            showPage('dashboard');
        };

        // إغلاق الإشعارات عند النقر خارجها
        document.addEventListener('click', function(event) {
            let panel = document.getElementById('notificationsPanel');
            let bell = document.querySelector('.notification-badge');
            
            if (panel && bell && !panel.contains(event.target) && !bell.contains(event.target)) {
                panel.classList.remove('active');
            }
        });
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
window.onclick = function(event) {
    let modal = document.getElementById('detailsModal');
    
    if (event.target === modal) {
        modal.style.display = "none";
    }
}