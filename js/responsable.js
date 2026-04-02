
    // ============================================
    // قاعدة البيانات الموحدة - تقرأ من localStorage
    // ============================================
    
    // قراءة البيانات من localStorage (نفس المصادر)
    let farmers = JSON.parse(localStorage.getItem('farmers')) || [];
    let controllers = JSON.parse(localStorage.getItem('controllers')) || [];
    let receptionReviews = JSON.parse(localStorage.getItem('reception_reviews')) || [];
    let settings = JSON.parse(localStorage.getItem('reception_settings')) || {};

    // إضافة حقل reception_status إذا لم يكن موجوداً
    farmers.forEach(f => {
        if (!f.reception_status) {
            f.reception_status = 'pending_review';
        }
    });
    localStorage.setItem('farmers', JSON.stringify(farmers));

    // ===== حساب الإحصائيات =====
    function calculateStats() {
        let pending = farmers.filter(f => f.reception_status === 'pending_review').length;
        let validated = farmers.filter(f => f.reception_status === 'validated').length;
        let rejected = farmers.filter(f => f.reception_status === 'rejected').length;
        let total = farmers.length;
        let rate = total > 0 ? Math.round((validated / total) * 100) : 0;
        
        return { pending, validated, rejected, rate, total };
    }

    // ===== تحديث الإحصائيات =====
    function updateStats() {
        let stats = calculateStats();
        
        document.getElementById('s-pending').textContent = stats.pending;
        document.getElementById('s-validated').textContent = stats.validated;
        document.getElementById('s-rejected').textContent = stats.rejected;
        document.getElementById('s-rate').textContent = stats.rate + '%';
        
        document.getElementById('sidebarPendingCount').textContent = stats.pending;
        document.getElementById('sidebarValidatedCount').textContent = stats.validated;
        document.getElementById('sidebarRejectedCount').textContent = stats.rejected;
        document.getElementById('notificationCount').textContent = stats.pending;
        
        document.getElementById('statChangePending').innerHTML = stats.pending > 0 ? '<i class="fas fa-exclamation-circle"></i> ' + stats.pending : '0';
        document.getElementById('statChangeValidated').innerHTML = '<i class="fas fa-arrow-up"></i> +' + Math.floor(Math.random() * 10);
        document.getElementById('statChangeRejected').innerHTML = '<i class="fas fa-arrow-down"></i> -' + Math.floor(Math.random() * 5);
        document.getElementById('statChangeRate').innerHTML = '<i class="fas fa-arrow-up"></i> +' + Math.floor(Math.random() * 5) + '%';
    }

    // ===== عرض قائمة الملفات =====
    function renderPendingList() {
        let container = document.getElementById('pendingList');
        if (!container) return;
        
        let searchTerm = document.getElementById('searchPending')?.value.toLowerCase() || '';
        let pending = farmers.filter(f => f.reception_status === 'pending_review');
        
        if (searchTerm) {
            pending = pending.filter(f => 
                f.name.toLowerCase().includes(searchTerm) || 
                (f.reviewedBy && f.reviewedBy.toLowerCase().includes(searchTerm))
            );
        }
        
        if (pending.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--primary)">لا توجد ملفات بانتظار المصادقة</p>';
            return;
        }
        
        container.innerHTML = pending.map(f => {
            let totalAnimals = (parseInt(f.bovins)||0) + (parseInt(f.ovins)||0) + (parseInt(f.caprins)||0);
            
            return `
            <div class="review-card pending_review" id="review-${f.id}">
                <div class="review-header">
                    <div class="review-title">
                        <div class="review-icon"><i class="fas fa-file-alt"></i></div>
                        <div class="review-info">
                            <h3>${f.name}</h3>
                            <div class="review-meta">
                                <span><i class="fas fa-map-marker-alt"></i> ${f.wilayaName || 'ولاية ' + f.wilaya}</span>
                                <span><i class="fas fa-user-check"></i> مراجع: ${f.reviewedBy || 'غير محدد'}</span>
                                <span><i class="fas fa-calendar"></i> ${new Date(f.submittedDate || f.date).toLocaleDateString('ar-DZ')}</span>
                            </div>
                        </div>
                    </div>
                    <div class="review-status pending_review"><i class="fas fa-clock"></i> بانتظار المصادقة</div>
                </div>
                
                <div class="review-details">
                    <div class="review-detail">
                        <div class="review-detail-label">المساحة</div>
                        <div class="review-detail-value">${f.area || 0} هكتار</div>
                    </div>
                    <div class="review-detail">
                        <div class="review-detail-label">المواشي</div>
                        <div class="review-detail-value">${totalAnimals} رأس</div>
                    </div>
                    <div class="review-detail">
                        <div class="review-detail-label">ملاحظات المراقب</div>
                        <div class="review-detail-value">${f.reviewNotes || 'لا توجد ملاحظات'}</div>
                    </div>
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-validate" onclick="openValidateModal(${f.id})">
                        <i class="fas fa-stamp"></i> مصادقة
                    </button>
                    <button class="btn btn-reject-final" onclick="openRejectModal(${f.id})">
                        <i class="fas fa-times-circle"></i> رفض
                    </button>
                    <button class="btn btn-view" onclick="viewFarmerDetails(${f.id})">
                        <i class="fas fa-eye"></i> عرض التفاصيل
                    </button>
                </div>
            </div>`;
        }).join('');
    }
    
    function renderValidatedList() {
        let container = document.getElementById('validatedList');
        if (!container) return;
        
        let searchTerm = document.getElementById('searchValidated')?.value.toLowerCase() || '';
        let validated = farmers.filter(f => f.reception_status === 'validated');
        
        if (searchTerm) {
            validated = validated.filter(f => f.name.toLowerCase().includes(searchTerm));
        }
        
        if (validated.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--primary)">لا توجد ملفات مصادق عليها</p>';
            return;
        }
        
        container.innerHTML = validated.map(f => `
            <div class="review-card validated">
                <div class="review-header">
                    <div class="review-title">
                        <div class="review-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="review-info">
                            <h3>${f.name}</h3>
                            <div class="review-meta">
                                <span><i class="fas fa-map-marker-alt"></i> ${f.wilayaName || 'ولاية ' + f.wilaya}</span>
                                <span><i class="fas fa-user-check"></i> مراجع: ${f.reviewedBy || 'غير محدد'}</span>
                                <span><i class="fas fa-stamp"></i> مصادق: ${f.receptionBy || 'مدير الاستقبال'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="review-status validated"><i class="fas fa-check-circle"></i> مصادق عليها</div>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-view" onclick="viewFarmerDetails(${f.id})"><i class="fas fa-eye"></i> عرض التفاصيل</button>
                </div>
            </div>
        `).join('');
    }
    
    function renderRejectedList() {
        let container = document.getElementById('rejectedList');
        if (!container) return;
        
        let searchTerm = document.getElementById('searchRejected')?.value.toLowerCase() || '';
        let rejected = farmers.filter(f => f.reception_status === 'rejected');
        
        if (searchTerm) {
            rejected = rejected.filter(f => f.name.toLowerCase().includes(searchTerm));
        }
        
        if (rejected.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:40px;color:var(--primary)">لا توجد ملفات مرفوضة</p>';
            return;
        }
        
        container.innerHTML = rejected.map(f => `
            <div class="review-card rejected">
                <div class="review-header">
                    <div class="review-title">
                        <div class="review-icon"><i class="fas fa-times-circle"></i></div>
                        <div class="review-info">
                            <h3>${f.name}</h3>
                            <div class="review-meta">
                                <span><i class="fas fa-map-marker-alt"></i> ${f.wilayaName || 'ولاية ' + f.wilaya}</span>
                                <span><i class="fas fa-user-check"></i> مراجع: ${f.reviewedBy || 'غير محدد'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="review-status rejected"><i class="fas fa-times-circle"></i> مرفوضة</div>
                </div>
                <div class="review-details">
                    <div class="review-detail">
                        <div class="review-detail-label">سبب الرفض</div>
                        <div class="review-detail-value">${f.receptionNotes || 'غير محدد'}</div>
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-view" onclick="viewFarmerDetails(${f.id})"><i class="fas fa-eye"></i> عرض التفاصيل</button>
                    <button class="btn btn-validate" onclick="reopenForValidation(${f.id})"><i class="fas fa-undo-alt"></i> إعادة فتح</button>
                </div>
            </div>
        `).join('');
    }
    
    function renderRecentPending() {
        let container = document.getElementById('recentPending');
        if (!container) return;
        
        let recent = farmers.filter(f => f.reception_status === 'pending_review').slice(0, 3);
        
        if (recent.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:20px;">لا توجد ملفات بانتظار المصادقة</p>';
            return;
        }
        
        container.innerHTML = recent.map(f => `
            <div class="review-card pending_review" style="margin-bottom:12px">
                <div class="review-header">
                    <div class="review-title">
                        <div class="review-icon"><i class="fas fa-file-alt"></i></div>
                        <div class="review-info">
                            <h4>${f.name}</h4>
                            <p style="font-size:13px;color:var(--primary)">مراجع: ${f.reviewedBy || 'غير محدد'}</p>
                        </div>
                    </div>
                    <div class="action-buttons" style="margin-top:0">
                        <button class="btn btn-validate btn-sm" onclick="openValidateModal(${f.id})"><i class="fas fa-stamp"></i> مصادقة</button>
                        <button class="btn btn-view btn-sm" onclick="viewFarmerDetails(${f.id})"><i class="fas fa-eye"></i></button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // ===== المصادقة والرفض =====
    let currentFileId = null;
    
    function openValidateModal(id) {
        currentFileId = id;
        let file = farmers.find(f => f.id == id);
        document.getElementById('validateFileName').textContent = file.name;
        document.getElementById('validateNotes').value = '';
        document.getElementById('validateModal').classList.add('active');
    }
    
    function openRejectModal(id) {
        currentFileId = id;
        let file = farmers.find(f => f.id == id);
        document.getElementById('validateFileName').textContent = file.name;
        document.getElementById('validateNotes').value = '';
        document.getElementById('validateModal').classList.add('active');
    }
    
    function confirmValidate() {
        if (!currentFileId) return;
        let index = farmers.findIndex(f => f.id == currentFileId);
        if (index !== -1) {
            farmers[index].reception_status = 'validated';
            farmers[index].receptionBy = 'مدير الاستقبال';
            farmers[index].receptionDate = new Date().toISOString();
            farmers[index].receptionNotes = document.getElementById('validateNotes').value || 'تمت المصادقة النهائية';
            
            localStorage.setItem('farmers', JSON.stringify(farmers));
            showToast(`تمت المصادقة على ملف ${farmers[index].name}`, 'success');
            closeValidateModal();
            refreshData();
        }
    }
    
    function confirmRejectFinal() {
        if (!currentFileId) return;
        let notes = document.getElementById('validateNotes').value;
        if (!notes) {
            showToast('الرجاء إدخال سبب الرفض', 'error');
            return;
        }
        let index = farmers.findIndex(f => f.id == currentFileId);
        if (index !== -1) {
            farmers[index].reception_status = 'rejected';
            farmers[index].receptionBy = 'مدير الاستقبال';
            farmers[index].receptionDate = new Date().toISOString();
            farmers[index].receptionNotes = notes;
            
            localStorage.setItem('farmers', JSON.stringify(farmers));
            showToast(`تم رفض ملف ${farmers[index].name}`, 'warning');
            closeValidateModal();
            refreshData();
        }
    }
    
    function reopenForValidation(id) {
        let index = farmers.findIndex(f => f.id == id);
        if (index !== -1) {
            farmers[index].reception_status = 'pending_review';
            localStorage.setItem('farmers', JSON.stringify(farmers));
            showToast('تم إعادة فتح الملف للمصادقة', 'success');
            refreshData();
        }
    }
    
    function validateAll() {
        let pending = farmers.filter(f => f.reception_status === 'pending_review');
        pending.forEach(f => {
            f.reception_status = 'validated';
            f.receptionBy = 'مدير الاستقبال';
            f.receptionDate = new Date().toISOString();
            f.receptionNotes = 'تمت المصادقة الشاملة';
        });
        localStorage.setItem('farmers', JSON.stringify(farmers));
        showToast(`تمت مصادقة ${pending.length} ملف`, 'success');
        refreshData();
    }
   // ===== عرض تفاصيل الملف الكاملة (جميع الحقول الـ 171) =====
function viewFarmerDetails(id) {
    let f = farmers.find(x => x.id == id);
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
                    <div class="details-item"><div class="details-item-label">1. تاريخ المرور</div><div class="details-item-value">${f.passDay || "00"}/${f.passMonth || "00"}/${f.passYear || "2025"}</div></div>
                    <div class="details-item"><div class="details-item-label">2. لقب المحصي</div><div class="details-item-value">${f.recenseurNom || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">3. اسم المحصي</div><div class="details-item-value">${f.recenseurPrenom || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">4. تاريخ المراقبة</div><div class="details-item-value">${f.controlDay || "00"}/${f.controlMonth || "00"}/${f.controlYear || ""}</div></div>
                    <div class="details-item"><div class="details-item-label">5. لقب المراقب</div><div class="details-item-value">${f.controleurNom || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">6. اسم المراقب</div><div class="details-item-value">${f.controleurPrenom || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">7. الولاية</div><div class="details-item-value">${f.wilaya2 || f.wilaya || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">8. البلدية</div><div class="details-item-value">${f.commune || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">9. رمز البلدية/الولاية</div><div class="details-item-value">${f.code1 || ""}${f.code2 || ""}${f.code3 || ""}${f.code4 || ""}</div></div>
                    <div class="details-item"><div class="details-item-label">10. اسم المكان/المنطقة</div><div class="details-item-value">${f.lieuDit || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">11. رقم المنطقة</div><div class="details-item-value">${f.district1 || ""}${f.district2 || ""}</div></div>
                    <div class="details-item"><div class="details-item-label">12. رقم المستثمرة</div><div class="details-item-value">${f.numExploitation || "غير محدد"}</div></div>
                </div>
            </div>
            
            <!-- ========== القسم 2: تعريف المستثمر (الحقول 13-31) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-user-tie"></i> II - تعريف المستثمر (الفلاح)
                    <span class="section-badge">Identification de l'exploitant</span>
                </div>
                <div class="details-grid">
                    <div class="details-item"><div class="details-item-label">13. اللقب</div><div class="details-item-value">${f.exploitantNom || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">14. الاسم</div><div class="details-item-value">${f.exploitantPrenom || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">15. سنة الميلاد</div><div class="details-item-value">${f.birthYear || "غير محدد"} (العمر: ${f.birthYear ? (2025 - parseInt(f.birthYear)) : "?"} سنة)</div></div>
                    <div class="details-item"><div class="details-item-label">16. الجنس</div><div class="details-item-value">${f.sexe === 'male' ? 'ذكر ♂' : f.sexe === 'female' ? 'أنثى ♀' : 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">17. المستوى التعليمي</div><div class="details-item-value">${f.education || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">18. مستوى التكوين الفلاحي</div><div class="details-item-value">${f.formation || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">19. عنوان المستغل الفلاحي</div><div class="details-item-value">${f.adresse || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">20. رقم الهاتف</div><div class="details-item-value">${f.phone1 || ""}${f.phone2 || ""}${f.phone3 || ""}${f.phone4 || ""}${f.phone5 || ""}</div></div>
                    <div class="details-item"><div class="details-item-label">21. البريد الإلكتروني</div><div class="details-item-value">${f.email || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">22. رقم التعريف الوطني (NIN)</div><div class="details-item-value">${f.nin1 || ""}${f.nin2 || ""}${f.nin3 || ""}${f.nin4 || ""}${f.nin5 || ""}${f.nin6 || ""}</div></div>
                    <div class="details-item"><div class="details-item-label">23. رقم التعريف الإحصائي (NIS)</div><div class="details-item-value">${f.nis1 || ""}${f.nis2 || ""}${f.nis3 || ""}${f.nis4 || ""}${f.nis5 || ""}</div></div>
                    <div class="details-item"><div class="details-item-label">24. رقم بطاقة الفلاح</div><div class="details-item-value">${f.carte1 || ""}${f.carte2 || ""}${f.carte3 || ""}${f.carte4 || ""}</div></div>
                    <div class="details-item"><div class="details-item-label">25. التسجيل في المنظمات</div><div class="details-item-value">${f.inscritCAW ? 'CAW ✓ ' : ''}${f.inscritCAPA ? 'CAPA ✓ ' : ''}${f.inscritUNPA ? 'UNPA ✓ ' : ''}${f.inscritCARM ? 'CARM ✓ ' : ''}${f.inscritCCW ? 'CCW ✓ ' : ''}${!f.inscritCAW && !f.inscritCAPA && !f.inscritUNPA && !f.inscritCARM && !f.inscritCCW ? 'غير مسجل' : ''}</div></div>
                    <div class="details-item"><div class="details-item-label">26. نوع التأمين</div><div class="details-item-value">${f.assuranceType26 || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">28. منحدر من عائلة فلاحية</div><div class="details-item-value">${f.famille === 'نعم' ? 'نعم ✓' : f.famille === 'لا' ? 'لا ✗' : 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">29. الفلاح الرئيسي</div><div class="details-item-value">${f.roleExploitant || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">30. عدد المتداولين (الشركاء)</div><div class="details-item-value">${f.coExploitantsCount || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">31. طبيعة الفلاح</div><div class="details-item-value">${f.nature || "غير محدد"}</div></div>
                </div>
            </div>
            
            <!-- ========== القسم 3: تعريف المستثمرة (الحقول 32-43) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-tractor"></i> III - تعريف المستثمرة
                    <span class="section-badge">Identification de l'exploitation</span>
                </div>
                <div class="details-grid">
                    <div class="details-item"><div class="details-item-label">32. اسم المستثمرة</div><div class="details-item-value">${f.nomExploitation || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">33. عنوان المستثمرة</div><div class="details-item-value">${f.adresseExploitation || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">34. الوضع القانوني</div><div class="details-item-value">${f.statut || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">35. الإحداثيات الجغرافية</div><div class="details-item-value">${f.latitude || "..."} , ${f.longitude || "..."}</div></div>
                    <div class="details-item"><div class="details-item-label">36. نشاط المستثمرة</div><div class="details-item-value">${f.vocation === 'نباتي' ? '🌱 نباتي' : f.vocation === 'حيواني' ? '🐄 حيواني' : f.vocation === 'مختلط' ? '🌾🐄 مختلط' : 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">37. إذا حيواني: هل لديه أراضٍ؟</div><div class="details-item-value">${f.terreAnimal || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">38. إمكانية الوصول</div><div class="details-item-value">${f.access || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">39. متصلة بشبكة الكهرباء؟</div><div class="details-item-value">${f.electricite === 'نعم' ? 'نعم ✓' : f.electricite === 'لا' ? 'لا ✗' : 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">40. متصلة بشبكة الهاتف؟</div><div class="details-item-value">${f.telephone === 'نعم' ? 'نعم ✓' : f.telephone === 'لا' ? 'لا ✗' : 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">41. نوع الهاتف</div><div class="details-item-value">${f.typeTel || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">42. متصلة بالإنترنت؟</div><div class="details-item-value">${f.internet === 'نعم' ? 'نعم ✓' : f.internet === 'لا' ? 'لا ✗' : 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">43. استخدام الإنترنت للفلاحة؟</div><div class="details-item-value">${f.internetAgricole === 'نعم' ? 'نعم ✓' : f.internetAgricole === 'لا' ? 'لا ✗' : 'غير محدد'}</div></div>
                </div>
            </div>
            
            <!-- ========== القسم 4: مساحة المستثمرة (الحقول 47-63) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-ruler-combined"></i> IV - مساحة المستثمرة (هكتار)
                    <span class="section-badge">Superficie de l'exploitation</span>
                </div>
                <div class="details-grid">
                    <div class="details-item"><div class="details-item-label">47. محاصيل عشبية</div><div class="details-item-value">مروية: ${f.herbaceeIrriguee || "0"} | جافة: ${f.herbaceeSec || "0"} | المجموع: ${totalHerbacee}</div></div>
                    <div class="details-item"><div class="details-item-label">48. أراضي مستريحة (البور)</div><div class="details-item-value">مروية: ${f.jacherIrriguee || "0"} | جافة: ${f.jacherSec || "0"} | المجموع: ${totalJacher}</div></div>
                    <div class="details-item"><div class="details-item-label">49. محاصيل دائمة</div><div class="details-item-value">مروية: ${f.perenesIrriguee || "0"} | جافة: ${f.perenesSec || "0"} | المجموع: ${totalPerenes}</div></div>
                    <div class="details-item"><div class="details-item-label">50. مروج طبيعية</div><div class="details-item-value">مروية: ${f.prairieIrriguee || "0"} | جافة: ${f.prairieSec || "0"} | المجموع: ${totalPrairie}</div></div>
                    <div class="details-item"><div class="details-item-label">51. المساحة الفلاحية المستخدمة SAU</div><div class="details-item-value">مروية: ${f.sauIrriguee || "0"} | جافة: ${f.sauSec || "0"} | المجموع: ${totalSAU}</div></div>
                    <div class="details-item"><div class="details-item-label">52. المراعي والمسارح</div><div class="details-item-value">${f.pacages || "0"} هكتار</div></div>
                    <div class="details-item"><div class="details-item-label">53. مساحات غير منتجة</div><div class="details-item-value">${f.superficieNonProductive || "0"} هكتار</div></div>
                    <div class="details-item"><div class="details-item-label">54. المساحة الفلاحية الإجمالية SAT</div><div class="details-item-value"><strong style="color: #2d6a4f; font-size: 16px;">${f.superficie || "0"}</strong> هكتار</div></div>
                    <div class="details-item"><div class="details-item-label">55. أراضي الغابات</div><div class="details-item-value">${f.forets || "0"} هكتار</div></div>
                    <div class="details-item"><div class="details-item-label">56. المساحة الإجمالية ST</div><div class="details-item-value">${f.superficieTotale || "0"} هكتار</div></div>
                    <div class="details-item"><div class="details-item-label">57. المستثمرة قطعة واحدة؟</div><div class="details-item-value">${f.unBloc === 'نعم' ? 'نعم ✓' : f.unBloc === 'لا' ? 'لا ✗' : 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">58. عدد القطع</div><div class="details-item-value">${f.nombreBlocs || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">59. وجود سكان غير شرعيين؟</div><div class="details-item-value">${f.indusOccupants === 'نعم' ? 'نعم ✓' : f.indusOccupants === 'لا' ? 'لا ✗' : 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">61. المساحة المبنية المشغولة</div><div class="details-item-value">${f.surfaceBatie || "0"} م²</div></div>
                    <div class="details-item"><div class="details-item-label">63. مصادر الطاقة</div><div class="details-item-value">${f.energieReseau ? 'شبكة كهربائية ✓ ' : ''}${f.energieGroupe ? 'مولد ✓ ' : ''}${f.energieSolaire ? 'شمسية ✓ ' : ''}${f.energieEolienne ? 'رياح ✓ ' : ''}${f.energieAutres ? 'أخرى ✓ ' : ''}</div></div>
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
                    <div class="details-item"><div class="details-item-label">75. الزراعة البيولوجية</div><div class="details-item-value">${f.biologique === 'نعم' ? 'نعم ✓' : f.biologique === 'لا' ? 'لا ✗' : 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">76. هل لديك شهادة؟</div><div class="details-item-value">${f.certificatBio === 'نعم' ? 'نعم ✓' : f.certificatBio === 'لا' ? 'لا ✗' : 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">77. الاستزراع المائي</div><div class="details-item-value">${f.aquaculture === 'نعم' ? 'نعم ✓' : f.aquaculture === 'لا' ? 'لا ✗' : 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">78. تربية الحلزون</div><div class="details-item-value">${f.helicicult === 'نعم' ? 'نعم ✓' : f.helicicult === 'لا' ? 'لا ✗' : 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">79. زراعة الفطريات</div><div class="details-item-value">${f.myciculture === 'نعم' ? 'نعم ✓' : f.myciculture === 'لا' ? 'لا ✗' : 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">80. الزراعة التعاقدية</div><div class="details-item-value">${f.contractuelle === 'نعم' ? 'نعم ✓' : f.contractuelle === 'لا' ? 'لا ✗' : 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">81. الشعبة المتعاقد عليها</div><div class="details-item-value">${f.filiereTomate ? 'طماطم صناعية ' : ''}${f.filiereHuile ? 'حبوب ' : ''}${f.filiereAviculture ? 'دواجن ' : ''}${f.filiereMaraichage ? 'خضروات ' : ''}${f.filierePomme ? 'بطاطا ' : ''}${f.filiereAutre ? 'أخرى ' : ''}</div></div>
                </div>
            </div>
            
            <!-- ========== القسم 7: المواشي (الحقول 82-105) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-paw"></i> VII - المواشي
                    <span class="section-badge">Cheptel</span>
                </div>
                <div class="details-grid">
                    <div class="details-item"><div class="details-item-label">82. الأبقار (Bovins)</div><div class="details-item-value">الإجمالي: ${f.bovins || "0"} | BLL: ${f.bovinsBLL || "0"} | BLA: ${f.bovinsBLA || "0"} | BLM: ${f.bovinsBLM || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">86. الأغنام (Ovins)</div><div class="details-item-value">الإجمالي: ${f.ovins || "0"} | منها النعاج: ${f.ovinsBrebis || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">88. الماعز (Caprins)</div><div class="details-item-value">الإجمالي: ${f.caprins || "0"} | منها المعزات: ${f.caprinsChevres || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">90/91. الإبل (Camelins)</div><div class="details-item-value">الإجمالي: ${f.camelins || "0"} | منها النوق: ${f.camelinsFemelles || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">92. الخيول (Equins)</div><div class="details-item-value">الإجمالي: ${f.equins || "0"} | منها الأفراس: ${f.equinsFemelles || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">94. الدواجن (Aviculture)</div><div class="details-item-value">دجاج: ${f.pouletsChair || "0"} | ديوك رومي: ${f.dindes || "0"} | أخرى: ${f.autreAviculture || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">97/98. البغال والحمير</div><div class="details-item-value">بغال: ${f.mulets || "0"} | حمير: ${f.anes || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">99. الأرانب</div><div class="details-item-value">${f.lapins || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">100-105. تربية النحل</div><div class="details-item-value">خلايا عصرية: ${f.ruchesModernes || "0"} (ممتلئة: ${f.ruchesModernesPleines || "0"}) | تقليدية: ${f.ruchesTraditionnelles || "0"} (ممتلئة: ${f.ruchesTraditionnellesPleines || "0"})</div></div>
                </div>
            </div>
            
            <!-- ========== القسم 8: مباني الاستغلال (الحقول 106-122) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-warehouse"></i> VIII - مباني الاستغلال
                    <span class="section-badge">Bâtiments d'exploitation</span>
                </div>
                <div class="details-grid">
                    <div class="details-item"><div class="details-item-label">106. مباني سكنية</div><div class="details-item-value">العدد: ${f.batimentsHabitationNb || "0"} | المساحة: ${f.batimentsHabitationSurface || "0"} م²</div></div>
                    <div class="details-item"><div class="details-item-label">107/108. مباني تربية الحيوانات</div><div class="details-item-value">حظائر: ${f.bergeriesNb || "0"} (${f.bergeriesCapacite || "0"} م³) | إسطبلات: ${f.etablesNb || "0"} (${f.etablesCapacite || "0"} م³)</div></div>
                    <div class="details-item"><div class="details-item-label">109. اسطبل خيول</div><div class="details-item-value">العدد: ${f.ecurieschNb || "0"} | السعة: ${f.ecurieschCapacite || "0"} م³</div></div>
                    <div class="details-item"><div class="details-item-label">110. مدجنة (مبنى صلب)</div><div class="details-item-value">العدد: ${f.PoulaillerNb || "0"} | السعة: ${f.PoulaillerCapacite || "0"} م³</div></div>
                    <div class="details-item"><div class="details-item-label">111. مدجنة تحت البيوت البلاستيكية</div><div class="details-item-value">العدد: ${f.PserresNb || "0"} | السعة: ${f.PserresCapacite || "0"} م³</div></div>
                    <div class="details-item"><div class="details-item-label">112. بيوت بلاستيكية نفقية</div><div class="details-item-value">العدد: ${f.serresTunnelNb || "0"} | المساحة: ${f.serresTunnelSurface || "0"} م²</div></div>
                    <div class="details-item"><div class="details-item-label">113. بيوت متعددة القبب</div><div class="details-item-value">العدد: ${f.mulserresNb || "0"} | المساحة: ${f.mulserresSurface || "0"} م²</div></div>
                    <div class="details-item"><div class="details-item-label">114. مباني التخزين</div><div class="details-item-value">العدد: ${f.BatimentsStockageNb || "0"} | السعة: ${f.BatimentsStockageCapacite || "0"} م³</div></div>
                    <div class="details-item"><div class="details-item-label">115. مباني تخزين المنتجات الفلاحية</div><div class="details-item-value">العدد: ${f.BatimentsProdAgriNb || "0"} | السعة: ${f.BatimentsProdAgriCapacite || "0"} م³</div></div>
                    <div class="details-item"><div class="details-item-label">118. وحدة التوظيب</div><div class="details-item-value">العدد: ${f.uniteDeConNb || "0"} | السعة: ${f.uniteDeConCapacite || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">119. وحدة التحول</div><div class="details-item-value">العدد: ${f.uniteTransfoNb || "0"} | السعة: ${f.uniteTransfoCapacite || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">120. مركز جمع الحليب</div><div class="details-item-value">العدد: ${f.centreCollecteLaitNb || "0"} | السعة: ${f.centreCollecteLaitCapacite || "0"} لتر/يوم</div></div>
                    <div class="details-item"><div class="details-item-label">121. مباني أخرى</div><div class="details-item-value">العدد: ${f.autresBatimentsNb || "0"} | السعة: ${f.autresBatimentsCapacite || "0"} م³</div></div>
                    <div class="details-item"><div class="details-item-label">122. غرف التبريد</div><div class="details-item-value">العدد: ${f.chambresFroidesNb || "0"} | السعة: ${f.chambresFroidesCapacite || "0"} م³</div></div>
                </div>
            </div>
            
            <!-- ========== القسم 9: العتاد الفلاحي ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-tractor"></i> IX - العتاد الفلاحي
                    <span class="section-badge">Matériel agricole</span>
                </div>
                <div class="details-grid">
                    <div class="details-item"><div class="details-item-label">الجرارات ذات العجلات</div><div class="details-item-value">≤45 CV: ${f.tracteursMoins45 || "0"} | 45-65 CV: ${f.tracteurs40a90 || "0"} | >65 CV: ${f.tracteurs65 || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">الجرارات الزاحفة</div><div class="details-item-value">≤80 CV: ${f.tracteursChenille80 || "0"} | >80 CV: ${f.tracteursChenillePlus || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">آلات الحصاد</div><div class="details-item-value">${f.moissonneuse || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">المضخات</div><div class="details-item-value">موتوبومب: ${f.pompeEau || "0"} | إلكتروبومب: ${f.pompeElectrique || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">وسائل النقل</div><div class="details-item-value">خفيفة: ${f.vehiculesLegers || "0"} | ثقيلة: ${f.vehiculesLourds || "0"} | مقطورات: ${f.remorques || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">معدات أخرى</div><div class="details-item-value">${f.autreMateriel || "غير محدد"}</div></div>
                </div>
            </div>
            
            <!-- ========== القسم 10: الموارد المائية (الحقول 127-144) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-water"></i> X - الموارد المائية
                    <span class="section-badge">Ressources en eau</span>
                </div>
                <div class="details-grid">
                    <div class="details-item"><div class="details-item-label">مصادر المياه</div><div class="details-item-value">${f.sourcePuits ? '127- بئر ✓ ' : ''}${f.sourceForage ? '128- ثقب ✓ ' : ''}${f.sourcePompage ? '129- ضخ من الوادي ✓ ' : ''}${f.sourceCrues ? '130- فيض الوادي ✓ ' : ''}${f.sourceBarrage ? '131- سد صغير ✓ ' : ''}${f.sourceRetenu ? '132- خزان التلال ✓ ' : ''}${f.sourceFoggara ? '133- الفقارة ✓ ' : ''}${f.sourceSource ? '134- منبع ✓ ' : ''}${f.sourceEpuration ? '135- محطة تصفية ✓ ' : ''}${f.sourceAutres ? '136- مصادر أخرى ✓ ' : ''}</div></div>
                    <div class="details-item"><div class="details-item-label">طريقة الري</div><div class="details-item-value">${f.irrigation || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">المساحة المسقية</div><div class="details-item-value">${f.areaIrriguee || "0"} هكتار</div></div>
                    <div class="details-item"><div class="details-item-label">المزروعات المسقية</div><div class="details-item-value">${f.culturesIrriguees || "غير محدد"}</div></div>
                </div>
            </div>
            
            <!-- ========== القسم 11: اليد العاملة (الحقول 147-156) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-users"></i> XI - اليد العاملة
                    <span class="section-badge">Main d'œuvre</span>
                </div>
                <div class="details-grid">
                    <div class="details-item"><div class="details-item-label">147. المستثمرون المشاركون</div><div class="details-item-value">ذكور دوام كلي: ${f.coexplMalePlein || "0"} | إناث دوام كلي: ${f.coexplFemalePlein || "0"} | ذكور جزئي: ${f.coexplMalePartiel || "0"} | إناث جزئي: ${f.coexplFemalePartiel || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">148. العمال الفلاحيون</div><div class="details-item-value">ذكور دوام كلي: ${f.ouvMaleP || "0"} | إناث دوام كلي: ${f.ouvFemaleP || "0"} | ذكور جزئي: ${f.ouvMaleJ || "0"} | إناث جزئي: ${f.ouvFemaleJ || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">149. العمال الأجانب</div><div class="details-item-value">ذكور دوام كلي: ${f.etrangMaleP || "0"} | إناث دوام كلي: ${f.etrangFemaleP || "0"} | ذكور جزئي: ${f.etrangMaleJ || "0"} | إناث جزئي: ${f.etrangFemaleJ || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">150. فلاح فردي</div><div class="details-item-value">ذكور: ${f.indivMaleP || "0"} | إناث: ${f.indivFemaleP || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">152. أطفال (-15 سنة)</div><div class="details-item-value">ذكور: ${f.childMale || "0"} | إناث: ${f.childFemale || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">155. بدون عمل</div><div class="details-item-value">ذكور: ${f.sansEmploiM || "0"} | إناث: ${f.sansEmploiF || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">156. المستفيدون من الشبكة الاجتماعية</div><div class="details-item-value">${f.filetSocial || "0"}</div></div>
                </div>
            </div>
            
            <!-- ========== القسم 12: الأسرة الفلاحية (الحقول 157-159) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-home"></i> XII - الأسرة الفلاحية
                    <span class="section-badge">Ménage agricole</span>
                </div>
                <div class="details-grid">
                    <div class="details-item"><div class="details-item-label">157. عدد الأشخاص</div><div class="details-item-value">ذكور: ${f.familyMale || "0"} | إناث: ${f.familyFemale || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">158. كبار (+15 سنة)</div><div class="details-item-value">ذكور: ${f.adulteMale || "0"} | إناث: ${f.adultesFemale || "0"}</div></div>
                    <div class="details-item"><div class="details-item-label">159. أطفال (-15 سنة)</div><div class="details-item-value">ذكور: ${f.familyChildMale || "0"} | إناث: ${f.familyChildFemale || "0"}</div></div>
                </div>
            </div>
            
            <!-- ========== القسم 13: استخدام المدخلات (الحقل 160) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-seedling"></i> XIII - استخدام المدخلات
                    <span class="section-badge">Intrants</span>
                </div>
                <div class="details-grid">
                    <div class="details-item"><div class="details-item-label">160. البذور</div><div class="details-item-value">${f.semencesSelectionnees ? 'بذور مختارة ✓ ' : ''}${f.semencesCertifiees ? 'بذور معتمدة ✓ ' : ''}${f.semencesBio ? 'بيولوجية ✓ ' : ''}${f.semencesFerme ? 'بذور المزرعة ✓ ' : ''}</div></div>
                    <div class="details-item"><div class="details-item-label">الأسمدة والمبيدات</div><div class="details-item-value">${f.engraisAzotes ? 'أسمدة آزوتية ✓ ' : ''}${f.engraisPhosphates ? 'أسمدة فوسفاتية ✓ ' : ''}${f.fumureOrganique ? 'سماد عضوي ✓ ' : ''}${f.produitsPhyto ? 'مبيدات ✓ ' : ''}${f.autresEngrais ? 'أسمدة أخرى ✓ ' : ''}</div></div>
                </div>
            </div>
            
            <!-- ========== القسم 14: تمويل النشاط الفلاحي والتأمينات (الحقول 161-166) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-coins"></i> XIV - التمويل والتأمينات
                    <span class="section-badge">Financement & Assurances</span>
                </div>
                <div class="details-grid">
                    <div class="details-item"><div class="details-item-label">161. مصادر التمويل</div><div class="details-item-value">${f.financePropress ? 'موارد ذاتية ✓ ' : ''}${f.financeCredit ? 'قرض بنكي ✓ ' : ''}${f.financeSoutien ? 'دعم عمومي ✓ ' : ''}${f.financeEmprunt ? 'استلاف من الغير ✓ ' : ''}</div></div>
                    <div class="details-item"><div class="details-item-label">162. نوع القرض البنكي</div><div class="details-item-value">${f.typeCredit || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">163. نوع الدعم العمومي</div><div class="details-item-value">${f.typeSoutien || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">164. التأمين الفلاحي</div><div class="details-item-value">${f.assuranceAgricole === 'نعم' ? 'نعم ✓' : f.assuranceAgricole === 'لا' ? 'لا ✗' : 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">165. شركة التأمين</div><div class="details-item-value">${f.compagnieAssurance || "غير محدد"}</div></div>
                    <div class="details-item"><div class="details-item-label">166. نوع التأمين</div><div class="details-item-value">${f.assuranceTerre ? 'الأرض ✓ ' : ''}${f.assuranceMaterial ? 'المعدات ✓ ' : ''}${f.assuranceMahassel ? 'المحاصيل ✓ ' : ''}${f.assurancePersonnel ? 'العمال ✓ ' : ''}${f.assuranceMabani ? 'المباني ✓ ' : ''}${f.assuranceMawachi ? 'المواشي ✓ ' : ''}</div></div>
                </div>
            </div>
            
            <!-- ========== القسم 15: محيط المستثمرة (الحقول 167-171) ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-building"></i> XV - محيط المستثمرة
                    <span class="section-badge">Environnement</span>
                </div>
                <div class="details-grid">
                    <div class="details-item"><div class="details-item-label">167. وجود مقدمي الخدمات</div><div class="details-item-value">${f.fournisseurs === 'نعم' ? 'نعم ✓' : f.fournisseurs === 'لا' ? 'لا ✗' : 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">168. مؤسسات قريبة</div><div class="details-item-value">${f.proximiteBanque ? 'بنك ✓ ' : ''}${f.proximitePoste ? 'بريد ✓ ' : ''}${f.proximiteVet ? 'عيادة بيطرية ✓ ' : ''}${f.proximiteAssurances ? 'تأمينات ✓ ' : ''}${f.proximiteLaboRatoire ? 'مخبر ✓ ' : ''}${f.proximiteBET ? 'مكتب دراسات ✓ ' : ''}${f.proximiteCooperative ? 'تعاونية ✓ ' : ''}${f.proximiteFournisseur ? 'مورد ✓ ' : ''}</div></div>
                    <div class="details-item"><div class="details-item-label">169. تسويق المنتجات</div><div class="details-item-value">${f.ventePied ? 'بيع على الجذع ✓ ' : ''}${f.venteGros ? 'سوق الجملة ✓ ' : ''}${f.venteIntermediaire ? 'وسطاء ✓ ' : ''}${f.venteDirecte ? 'بيع مباشر ✓ ' : ''}</div></div>
                    <div class="details-item"><div class="details-item-label">170. سوق التسويق</div><div class="details-item-value">${f.marcheLocal ? 'محلي ✓ ' : ''}${f.marcheNational ? 'وطني ✓ ' : ''}${f.marcheInternational ? 'دولي ✓ ' : ''}</div></div>
                    <div class="details-item"><div class="details-item-label">171. الانخراط في المنظمات</div><div class="details-item-value">${f.cooperativeAgricole ? 'تعاونية فلاحية ✓ ' : ''}${f.associationProfessionnelle ? 'جمعية مهنية ✓ ' : ''}${f.groupeInteret ? 'مجموعة مصالح ✓ ' : ''}${f.conseilInterpro ? 'مجلس مهني ✓ ' : ''}${f.autresAssociations ? 'جمعيات أخرى ✓ ' : ''}</div></div>
                </div>
            </div>
            
            <!-- ========== القسم 16: معلومات المراجعة والمصادقة ========== -->
            <div class="details-section">
                <div class="details-section-title">
                    <i class="fas fa-clipboard-list"></i> XVI - معلومات المراجعة والمصادقة
                    <span class="section-badge">Informations de révision</span>
                </div>
                <div class="details-grid">
                    <div class="details-item"><div class="details-item-label">مراجع بواسطة</div><div class="details-item-value">${f.reviewedBy || 'غير محدد'}</div></div>
                    <div class="details-item"><div class="details-item-label">ملاحظات المراقب</div><div class="details-item-value">${f.reviewNotes || 'لا توجد'}</div></div>
                    <div class="details-item"><div class="details-item-label">حالة المصادقة النهائية</div><div class="details-item-value">${f.reception_status === 'pending_review' ? '⏳ بانتظار المصادقة' : f.reception_status === 'validated' ? '✅ مصادق عليها' : '❌ مرفوضة'}</div></div>
                    ${f.receptionBy ? `<div class="details-item"><div class="details-item-label">مصادق بواسطة</div><div class="details-item-value">${f.receptionBy}</div></div>` : ''}
                    ${f.receptionDate ? `<div class="details-item"><div class="details-item-label">تاريخ المصادقة</div><div class="details-item-value">${new Date(f.receptionDate).toLocaleDateString('ar-DZ')}</div></div>` : ''}
                    ${f.receptionNotes ? `<div class="details-item"><div class="details-item-label">ملاحظات المصادقة</div><div class="details-item-value">${f.receptionNotes}</div></div>` : ''}
                    <div class="details-item"><div class="details-item-label">تاريخ الإرسال</div><div class="details-item-value">${new Date(f.submittedDate || f.date).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div></div>
                </div>
            </div>
        `;
    }
    
    modal.classList.add('active');
}

function closeDetailsModal() {
    let modal = document.getElementById('detailsModal');
    if (modal) modal.classList.remove('active');
}
    
   
    
    function closeValidateModal() {
        document.getElementById('validateModal').classList.remove('active');
        currentFileId = null;
    }
    
    // ===== دوال التصفية =====
    function filterPending() { renderPendingList(); }
    function filterValidated() { renderValidatedList(); }
    function filterRejected() { renderRejectedList(); }
    
    // ===== الرسوم البيانية =====
    let charts = {};
    
    function destroyChart(id) {
        if (charts[id]) { charts[id].destroy(); delete charts[id]; }
    }
    
    function initCharts() {
        let stats = calculateStats();
        
        destroyChart('status');
        const statusCtx = document.getElementById('chartStatus')?.getContext('2d');
        if (statusCtx) {
            charts.status = new Chart(statusCtx, {
                type: 'doughnut',
                data: { labels: ['بانتظار المصادقة', 'مصادق عليها', 'مرفوضة'], datasets: [{ data: [stats.pending, stats.validated, stats.rejected], backgroundColor: ['#ffc107', '#28a745', '#dc3545'], borderWidth: 0 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, cutout: '70%' }
            });
        }
        
        destroyChart('controllers');
        const controllersCtx = document.getElementById('chartControllers')?.getContext('2d');
        if (controllersCtx) {
            let controllerData = controllers.map(c => ({ name: c.name.split(' ')[0], reviewed: farmers.filter(f => f.reviewedBy === c.name).length }));
            charts.controllers = new Chart(controllersCtx, {
                type: 'bar',
                data: { labels: controllerData.map(d => d.name), datasets: [{ label: 'مراجعات', data: controllerData.map(d => d.reviewed), backgroundColor: '#1C4B2D', borderRadius: 10 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }
        
        destroyChart('monthly');
        const monthlyCtx = document.getElementById('chartMonthly')?.getContext('2d');
        if (monthlyCtx) {
            charts.monthly = new Chart(monthlyCtx, {
                type: 'line',
                data: { labels: ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان'], datasets: [{ label: 'المصادقات', data: [12, 25, 48, 72, 95, stats.validated], borderColor: '#28a745', backgroundColor: 'rgba(40,167,69,0.1)', fill: true, tension: 0.4 }] },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
        
        let reportStats = document.getElementById('reportStats');
        if (reportStats) {
            reportStats.innerHTML = `
                <div class="stat-card"><div class="stat-header"><div class="stat-icon"><i class="fas fa-users-cog"></i></div></div><div class="stat-value">${controllers.length}</div><div class="stat-label">المراقبين</div></div>
                <div class="stat-card"><div class="stat-header"><div class="stat-icon"><i class="fas fa-file-alt"></i></div></div><div class="stat-value">${farmers.length}</div><div class="stat-label">إجمالي الملفات</div></div>
                <div class="stat-card"><div class="stat-header"><div class="stat-icon"><i class="fas fa-check-circle"></i></div></div><div class="stat-value">${stats.validated}</div><div class="stat-label">مصادق عليها</div></div>
                <div class="stat-card"><div class="stat-header"><div class="stat-icon"><i class="fas fa-percent"></i></div></div><div class="stat-value">${stats.rate}%</div><div class="stat-label">نسبة المصادقة</div></div>
            `;
        }
    }
    
    // ===== دوال مساعدة =====
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`page-${pageId}`).classList.add('active');
        document.querySelectorAll('.menu-item, nav a').forEach(el => el.classList.remove('active'));
        document.querySelectorAll(`[onclick="showPage('${pageId}')"]`).forEach(el => el.classList.add('active'));
        
        if (pageId === 'pending') renderPendingList();
        if (pageId === 'validated') renderValidatedList();
        if (pageId === 'rejected') renderRejectedList();
        if (pageId === 'reports') initCharts();
        if (pageId === 'settings') loadSettings();
    }
    
    function refreshData() {
        farmers = JSON.parse(localStorage.getItem('farmers')) || [];
        controllers = JSON.parse(localStorage.getItem('controllers')) || [];
        updateStats();
        renderPendingList();
        renderValidatedList();
        renderRejectedList();
        renderRecentPending();
        initCharts();
        showToast('تم تحديث البيانات', 'success');
    }
    
    function toggleNotifications() {
        document.getElementById('notifsPanel').classList.toggle('open');
        renderNotifications();
    }
    
    function renderNotifications() {
        let pending = farmers.filter(f => f.reception_status === 'pending_review').length;
        let list = document.getElementById('notifsList');
        if (!list) return;
        
        list.innerHTML = `
            <div class="notif-item ${pending > 0 ? 'unread' : ''}">
                <div class="notif-dot"></div>
                <div class="notif-text"><p>لديك ${pending} ملف ${pending === 1 ? 'بانتظار' : 'بانتظار'} المصادقة</p><small>الآن</small></div>
            </div>
        `;
    }
    
    function showToast(msg, type) {
        let toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i><span>${msg}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    function loadSettings() {
        document.getElementById('settingsName').value = settings.name || 'مدير الاستقبال';
        document.getElementById('settingsEmail').value = settings.email || 'reception@example.com';
        document.getElementById('notifNew').checked = settings.notifNew !== false;
        document.getElementById('notifDelay').checked = settings.notifDelay !== false;
        document.getElementById('notifDaily').checked = settings.notifDaily || false;
    }
    
    function saveSettings() {
        settings = {
            name: document.getElementById('settingsName').value,
            email: document.getElementById('settingsEmail').value,
            notifNew: document.getElementById('notifNew').checked,
            notifDelay: document.getElementById('notifDelay').checked,
            notifDaily: document.getElementById('notifDaily').checked
        };
        localStorage.setItem('reception_settings', JSON.stringify(settings));
        showToast('تم حفظ الإعدادات', 'success');
    }
    
    function exportReport() {
        showToast('جاري تحضير التقرير...', 'info');
        setTimeout(() => showToast('تم تصدير التقرير بنجاح', 'success'), 1500);
    }
    
    // ===== التهيئة =====
    window.onload = function() {
        updateStats();
        renderPendingList();
        renderValidatedList();
        renderRejectedList();
        renderRecentPending();
        initCharts();
        
        setInterval(() => {
            let newFarmers = JSON.parse(localStorage.getItem('farmers')) || [];
            if (JSON.stringify(newFarmers) !== JSON.stringify(farmers)) {
                farmers = newFarmers;
                refreshData();
            }
        }, 5000);
        
        window.onclick = function(event) {
            if (event.target.classList.contains('details-modal')) closeDetailsModal();
            if (event.target.classList.contains('validate-modal')) closeValidateModal();
            let panel = document.getElementById('notifsPanel');
            if (panel && !panel.contains(event.target) && !event.target.closest('.notification-badge')) {
                panel.classList.remove('open');
            }
        };
    };
