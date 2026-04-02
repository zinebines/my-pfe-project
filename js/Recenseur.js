// ===== قاعدة البيانات =====
        let farmers = JSON.parse(localStorage.getItem("farmers") || "[]");
        let drafts = JSON.parse(localStorage.getItem("drafts") || "[]");
        let editingID = null;
        let currentGroup = 1;
        let currentDraftId = null;

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
                    splashProgress.style.width = progress + '%';
                    splashText.textContent = 'تم التحميل بنجاح!';
                    
                    setTimeout(function() {
                        splashScreen.classList.add('fade-out');
                        setTimeout(function() {
                            splashScreen.style.display = 'none';
                        }, 1500);
                    }, 500);
                    
                    clearInterval(interval);
                } else {
                    splashProgress.style.width = progress + '%';
                    splashText.textContent = 'جاري تحميل النظام... ' + Math.floor(progress) + '%';
                }
            }, 200);
            
            // تحديث الإحصائيات
            updateStats();
            showGroup(1);
            showPage("dashboard");
            
            // إغلاق النافذة المنبثقة عند الضغط خارجها
            window.onclick = function(event) {
                let modal = document.getElementById("profileModal");
                if (event.target === modal) {
                    closeProfile();
                }
            };

            // إضافة التحقق من تاريخ الميلاد
            document.getElementById('birthYear')?.addEventListener('change', function() {
                let year = parseInt(this.value);
                let warning = document.getElementById('birthYearWarning');
                if (year && (2026 - year) < 18) {
                    warning.style.display = 'flex';
                } else {
                    warning.style.display = 'none';
                }
            });

            // إضافة التحقق من المساحة
            document.getElementById('superficie')?.addEventListener('change', function() {
                let area = parseFloat(this.value);
                let warning = document.getElementById('superficieWarning');
                if (area > 1000) {
                    warning.style.display = 'flex';
                } else {
                    warning.style.display = 'none';
                }
            });
        });

        // ===== تحديث الإحصائيات =====
        function updateStats() {
            let countEl = document.getElementById("farmerCount");
            if (countEl) countEl.textContent = farmers.length;
            
            let totalArea = farmers.reduce((sum, f) => sum + (parseFloat(f.area) || 0), 0);
            let totalAreaEl = document.getElementById("totalArea");
            if (totalAreaEl) totalAreaEl.textContent = totalArea.toFixed(2);
            
            let totalCrops = farmers.filter(f => f.crops).length;
            let totalCropsEl = document.getElementById("totalCrops");
            if (totalCropsEl) totalCropsEl.textContent = totalCrops;
            
            let totalAnimals = farmers.reduce((sum, f) => sum + (parseInt(f.bovins) || 0) + (parseInt(f.ovins) || 0) + (parseInt(f.caprins) || 0), 0);
            let totalAnimalsEl = document.getElementById("totalAnimals");
            if (totalAnimalsEl) totalAnimalsEl.textContent = totalAnimals;
            
            // إحصائيات المسودات
            let draftCountEl = document.getElementById("draftCount");
            if (draftCountEl) draftCountEl.textContent = drafts.length;
            
            let lastDraftEl = document.getElementById("lastDraft");
            if (lastDraftEl) {
                if (drafts.length > 0) {
                    let lastDraft = drafts.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                    lastDraftEl.textContent = new Date(lastDraft.date).toLocaleDateString('ar-DZ');
                } else {
                    lastDraftEl.textContent = '-';
                }
            }
        }

        // ===== التنقل بين المجموعات =====
        const TOTAL_GROUPS = 5;

        function showGroup(group) {
            // إخفاء كل المجموعات (1-4 + 5)
            [1, 2, 3, 4, 5].forEach(i => {
                let g = document.getElementById(`group${i}`);
                if (g) g.style.display = "none";
            });
            
            // إظهار المجموعة المطلوبة
            let current = document.getElementById(`group${group}`);
            if (current) current.style.display = "block";
            
            // تحديث مؤشر التقدم
            updateProgressSteps(group);
            
            // تحديث أزرار التنقل
            document.getElementById("prevBtn").disabled = (group === 1);
            document.getElementById("nextBtn").disabled = (group === TOTAL_GROUPS);
            
            currentGroup = group;

            // حساب إجماليات جدول المحاصيل عند الدخول للمجموعة 5
            if (group === 5) {
                recalcCropTotals();
                setupCropListeners();
                // إظهار حقل الفيلير إن كانت الزراعة التعاقدية نعم
                let contractVal = document.querySelector('input[name="contractuelle"]:checked');
                let fg = document.getElementById('filiereContractuelleGroup');
                if (fg) fg.style.display = (contractVal?.value === 'نعم') ? 'block' : 'none';
            }
        }

        function nextGroup() {
            if (currentGroup < TOTAL_GROUPS) {
                showGroup(currentGroup + 1);
            }
        }

        function prevGroup() {
            if (currentGroup > 1) {
                showGroup(currentGroup - 1);
            }
        }

        function updateProgressSteps(active) {
            for (let i = 1; i <= TOTAL_GROUPS; i++) {
                let step = document.getElementById(`step${i}`);
                if (step) {
                    step.classList.remove("active", "completed");
                    if (i === active) {
                        step.classList.add("active");
                    } else if (i < active) {
                        step.classList.add("completed");
                        let circle = step.querySelector('.step-circle');
                        if (circle) circle.innerHTML = '<i class="fas fa-check"></i>';
                    } else {
                        let circle = step.querySelector('.step-circle');
                        if (circle) circle.innerHTML = i;
                    }
                }
            }
        }

        // ===== جدول المحاصيل - إجماليات تلقائية =====
        let cropListenersSet = false;
        function recalcCropTotals() {
            let totalSec = 0, totalIrr = 0, totalInt = 0;
            document.querySelectorAll('.crop-input').forEach(inp => {
                let v = parseFloat(inp.value) || 0;
                if (inp.id.endsWith('_sec')) totalSec += v;
                if (inp.id.endsWith('_irr')) totalIrr += v;
                if (inp.id.endsWith('_int')) totalInt += v;
            });
            let ts = document.getElementById('totalSec');
            let ti = document.getElementById('totalIrr');
            let tn = document.getElementById('totalInt');
            if (ts) ts.textContent = totalSec.toFixed(2);
            if (ti) ti.textContent = totalIrr.toFixed(2);
            if (tn) tn.textContent = totalInt.toFixed(2);
        }
        function setupCropListeners() {
            if (cropListenersSet) return;
            cropListenersSet = true;
            document.querySelectorAll('.crop-input').forEach(inp => {
                inp.addEventListener('input', recalcCropTotals);
            });
            // إظهار/إخفاء فيلير التعاقد
            document.querySelectorAll('input[name="contractuelle"]').forEach(r => {
                r.addEventListener('change', function() {
                    let fg = document.getElementById('filiereContractuelleGroup');
                    if (fg) fg.style.display = (this.value === 'نعم') ? 'block' : 'none';
                });
            });
        }

        // ===== التنقل بين الصفحات =====
        function showPage(page) {
            document.getElementById("dashboard").style.display = "none";
            document.getElementById("survey").style.display = "none";
            document.getElementById("farmers").style.display = "none";
            document.getElementById("drafts").style.display = "none";
            
            document.getElementById(page).style.display = "block";
            
            // تحديث القائمة النشطة
            document.querySelectorAll(".menu-item").forEach(m => m.classList.remove("active"));
            if (page === "dashboard") document.querySelectorAll(".menu-item")[0].classList.add("active");
            if (page === "survey") document.querySelectorAll(".menu-item")[1].classList.add("active");
            if (page === "farmers") document.querySelectorAll(".menu-item")[2].classList.add("active");
            if (page === "drafts") document.querySelectorAll(".menu-item")[3].classList.add("active");
            
            if (page === "farmers") renderFarmers();
            if (page === "drafts") renderDrafts();
            if (page === "survey") {
                if (!currentDraftId) {
                    clearForm();
                }
                showGroup(1);
                // إعادة تعيين مؤشر التقدم
                for (let i = 1; i <= TOTAL_GROUPS; i++) {
                    let step = document.getElementById(`step${i}`);
                    if (step) {
                        let circle = step.querySelector('.step-circle');
                        if (circle) circle.innerHTML = i;
                    }
                }
            }
        }

        // ===== جمع جميع بيانات النموذج =====
        function collectFormData() {
            let data = {
                id: currentDraftId || Date.now(),
                date: new Date().toISOString(),
                // المعلومات الأساسية
                name: document.getElementById("name")?.value || "",
                phone: document.getElementById("phone")?.value || "",
                wilaya: document.getElementById("wilaya")?.value || "",
                area: document.getElementById("area")?.value || "",
                
                // معلومات عامة
                passDay: document.getElementById("passDay")?.value || "",
                passMonth: document.getElementById("passMonth")?.value || "",
                passYear: document.getElementById("passYear")?.value || "2026",
                recenseurNom: document.getElementById("recenseurNom")?.value || "",
                recenseurPrenom: document.getElementById("recenseurPrenom")?.value || "",
                controlDay: document.getElementById("controlDay")?.value || "",
                controlMonth: document.getElementById("controlMonth")?.value || "",
                controlYear: document.getElementById("controlYear")?.value || "",
                controleurNom: document.getElementById("controleurNom")?.value || "",
                controleurPrenom: document.getElementById("controleurPrenom")?.value || "",
                wilaya2: document.getElementById("wilaya2")?.value || "",
                commune: document.getElementById("commune")?.value || "",
                code1: document.getElementById("code1")?.value || "",
                code2: document.getElementById("code2")?.value || "",
                code3: document.getElementById("code3")?.value || "",
                code4: document.getElementById("code4")?.value || "",
                lieuDit: document.getElementById("lieuDit")?.value || "",
                district1: document.getElementById("district1")?.value || "",
                district2: document.getElementById("district2")?.value || "",
                
                // تعريف المستثمر
                exploitantNom: document.getElementById("exploitantNom")?.value || "",
                exploitantPrenom: document.getElementById("exploitantPrenom")?.value || "",
                birthYear: document.getElementById("birthYear")?.value || "",
                sexe: document.querySelector('input[name="sexe"]:checked')?.value || "",
                education: document.querySelector('input[name="education"]:checked')?.value || "",
                formation: document.querySelector('input[name="formation"]:checked')?.value || "",
                adresse: document.getElementById("adresse")?.value || "",
                phone1: document.getElementById("phone1")?.value || "",
                phone2: document.getElementById("phone2")?.value || "",
                phone3: document.getElementById("phone3")?.value || "",
                phone4: document.getElementById("phone4")?.value || "",
                phone5: document.getElementById("phone5")?.value || "",
                nin1: document.getElementById("nin1")?.value || "",
                nin2: document.getElementById("nin2")?.value || "",
                nin3: document.getElementById("nin3")?.value || "",
                nin4: document.getElementById("nin4")?.value || "",
                nin5: document.getElementById("nin5")?.value || "",
                nin6: document.getElementById("nin6")?.value || "",
                nis1: document.getElementById("nis1")?.value || "",
                nis2: document.getElementById("nis2")?.value || "",
                nis3: document.getElementById("nis3")?.value || "",
                nis4: document.getElementById("nis4")?.value || "",
                nis5: document.getElementById("nis5")?.value || "",
                carte1: document.getElementById("carte1")?.value || "",
                carte2: document.getElementById("carte2")?.value || "",
                carte3: document.getElementById("carte3")?.value || "",
                carte4: document.getElementById("carte4")?.value || "",
                inscritCAW: document.getElementById("inscritCAW")?.checked || false,
                inscritCAPA: document.getElementById("inscritCAPA")?.checked || false,
                inscritUNPA: document.getElementById("inscritUNPA")?.checked || false,
                inscritCARM: document.getElementById("inscritCARM")?.checked || false,
                famille: document.querySelector('input[name="famille"]:checked')?.value || "",
                coExploitantsCount: document.getElementById("coExploitantsCount")?.value || "0",
                nature: document.querySelector('input[name="nature"]:checked')?.value || "",
                
                // تعريف المستثمرة
                nomExploitation: document.getElementById("nomExploitation")?.value || "",
                statut: document.querySelector('input[name="statut"]:checked')?.value || "",
                latitude: document.getElementById("latitude")?.value || "",
                longitude: document.getElementById("longitude")?.value || "",
                electricite: document.querySelector('input[name="electricite"]:checked')?.value || "",
                internet: document.querySelector('input[name="internet"]:checked')?.value || "",
                access: document.querySelector('input[name="access"]:checked')?.value || "",
                vocation: document.querySelector('input[name="vocation"]:checked')?.value || "",
                
                // المساحة
                superficieSeche: document.getElementById("superficieSeche")?.value || "",
                superficieIrriguee: document.getElementById("superficieIrriguee")?.value || "",
                superficie: document.getElementById("superficie")?.value || "",
                superficieNonProductive: document.getElementById("superficieNonProductive")?.value || "",
                energieReseau: document.getElementById("energieReseau")?.checked || false,
                energieGroupe: document.getElementById("energieGroupe")?.checked || false,
                energieSolaire: document.getElementById("energieSolaire")?.checked || false,
                energieAutres: document.getElementById("energieAutres")?.checked || false,
                
                // استخدام الأراضي
                terresAgricoles: document.getElementById("terresAgricoles")?.value || "",
                arbresFruitiers: document.getElementById("arbresFruitiers")?.value || "",
                grandesCultures: document.getElementById("grandesCultures")?.value || "",
                legumes: document.getElementById("legumes")?.value || "",
                
                // المواشي
                bovins: document.getElementById("bovins")?.value || "",
                bovinsBLL: document.getElementById("bovinsBLL")?.value || "",
                bovinsBLA: document.getElementById("bovinsBLA")?.value || "",
                bovinsBLM: document.getElementById("bovinsBLM")?.value || "",
                ovins: document.getElementById("ovins")?.value || "",
                ovinsBrebis: document.getElementById("ovinsBrebis")?.value || "",
                caprins: document.getElementById("caprins")?.value || "",
                caprinsChevres: document.getElementById("caprinsChevres")?.value || "",
                camelins: document.getElementById("camelins")?.value || "",
                camelinsFemelles: document.getElementById("camelinsFemelles")?.value || "",
                equins: document.getElementById("equins")?.value || "",
                equinsFemelles: document.getElementById("equinsFemelles")?.value || "",
                pouletsChair: document.getElementById("pouletsChair")?.value || "",
                pouletsPondeuses: document.getElementById("pouletsPondeuses")?.value || "",
                dindes: document.getElementById("dindes")?.value || "",
                ruchesModernes: document.getElementById("ruchesModernes")?.value || "",
                ruchesModernesPleines: document.getElementById("ruchesModernesPleines")?.value || "",
                ruchesTraditionnelles: document.getElementById("ruchesTraditionnelles")?.value || "",
                ruchesTraditionnellesPleines: document.getElementById("ruchesTraditionnellesPleines")?.value || "",
                mulets: document.getElementById("mulets")?.value || "",
                anes: document.getElementById("anes")?.value || "",
                
                // المباني
                batimentsHabitationNb: document.getElementById("batimentsHabitationNb")?.value || "",
                batimentsHabitationSurface: document.getElementById("batimentsHabitationSurface")?.value || "",
                etables: document.getElementById("etables")?.value || "",
                bergeries: document.getElementById("bergeries")?.value || "",
                ecuries: document.getElementById("ecuries")?.value || "",
                serresPlastique: document.getElementById("serresPlastique")?.value || "",
                serresTunnel: document.getElementById("serresTunnel")?.value || "",
                serresMulti: document.getElementById("serresMulti")?.value || "",
                stockageProduits: document.getElementById("stockageProduits")?.value || "",
                stockageMateriel: document.getElementById("stockageMateriel")?.value || "",
                caves: document.getElementById("caves")?.value || "",
                uniteConditionnement: document.getElementById("uniteConditionnement")?.value || "",
                uniteTransformation: document.getElementById("uniteTransformation")?.value || "",
                centreLait: document.getElementById("centreLait")?.value || "",
                chambresFroidesNb: document.getElementById("chambresFroidesNb")?.value || "",
                chambresFroidesCapacite: document.getElementById("chambresFroidesCapacite")?.value || "",
                
                // العتاد
                tracteursMoins45: document.getElementById("tracteursMoins45")?.value || "",
                tracteurs40a90: document.getElementById("tracteurs40a90")?.value || "",
                tracteurs65: document.getElementById("tracteurs65")?.value || "",
                tracteursChenille80: document.getElementById("tracteursChenille80")?.value || "",
                tracteursChenillePlus: document.getElementById("tracteursChenillePlus")?.value || "",
                charrue: document.getElementById("charrue")?.value || "",
                charrue3m: document.getElementById("charrue3m")?.value || "",
                semoir: document.getElementById("semoir")?.value || "",
                epandeur: document.getElementById("epandeur")?.value || "",
                pulverisateur: document.getElementById("pulverisateur")?.value || "",
                pulverisateurTraine: document.getElementById("pulverisateurTraine")?.value || "",
                moissonneuse: document.getElementById("moissonneuse")?.value || "",
                moissonneuseBat: document.getElementById("moissonneuseBat")?.value || "",
                vehiculesLegers: document.getElementById("vehiculesLegers")?.value || "",
                vehiculesLourds: document.getElementById("vehiculesLourds")?.value || "",
                remorques: document.getElementById("remorques")?.value || "",
                pompeEau: document.getElementById("pompeEau")?.value || "",
                pompeElectrique: document.getElementById("pompeElectrique")?.value || "",
                autreMateriel: document.getElementById("autreMateriel")?.value || "",
                
                // الموارد المائية
                sourcePuits: document.getElementById("sourcePuits")?.checked || false,
                sourceForage: document.getElementById("sourceForage")?.checked || false,
                sourcePompage: document.getElementById("sourcePompage")?.checked || false,
                sourceBarrage: document.getElementById("sourceBarrage")?.checked || false,
                sourceSource: document.getElementById("sourceSource")?.checked || false,
                sourceFoggara: document.getElementById("sourceFoggara")?.checked || false,
                sourceEpuration: document.getElementById("sourceEpuration")?.checked || false,
                irrigation: document.querySelector('input[name="irrigation"]:checked')?.value || "",
                culturesIrriguees: document.getElementById("culturesIrriguees")?.value || "",
                
                // اليد العاملة
                totalWorkers: document.getElementById("totalWorkers")?.value || "",
                maleWorkers: document.getElementById("maleWorkers")?.value || "",
                femaleWorkers: document.getElementById("femaleWorkers")?.value || "",
                permanentMale: document.getElementById("permanentMale")?.value || "",
                permanentFemale: document.getElementById("permanentFemale")?.value || "",
                seasonalMale: document.getElementById("seasonalMale")?.value || "",
                seasonalFemale: document.getElementById("seasonalFemale")?.value || "",
                coExploitants: document.getElementById("coExploitants")?.value || "",
                
                // الأسرة الفلاحية
                familyMembers: document.getElementById("familyMembers")?.value || "",
                familyMale: document.getElementById("familyMale")?.value || "",
                familyFemale: document.getElementById("familyFemale")?.value || "",
                familyChildren: document.getElementById("familyChildren")?.value || "",
                familyWorkers: document.getElementById("familyWorkers")?.value || "",
                
                // المدخلات
                semencesSelectionnees: document.getElementById("semencesSelectionnees")?.value || "",
                semencesFerme: document.getElementById("semencesFerme")?.value || "",
                semencesPotentielles: document.getElementById("semencesPotentielles")?.value || "",
                engrais: document.getElementById("engrais")?.value || "",
                pesticides: document.getElementById("pesticides")?.value || "",
                eauIrrigation: document.getElementById("eauIrrigation")?.value || "",
                
                // التمويل
                totalFinance: document.getElementById("totalFinance")?.value || "",
                selfFinance: document.getElementById("selfFinance")?.value || "",
                bankFinance: document.getElementById("bankFinance")?.value || "",
                ressourcesPropres: document.getElementById("ressourcesPropres")?.value || "",
                creditBancaire: document.getElementById("creditBancaire")?.value || "",
                soutienPublic: document.getElementById("soutienPublic")?.value || "",
                empruntTiers: document.getElementById("empruntTiers")?.value || "",
                assuranceAgricole: document.querySelector('input[name="assuranceAgricole"]:checked')?.value || "",
                typeAssurance: document.querySelector('input[name="typeAssurance"]:checked')?.value || "",
                
                // محيط المستثمرة
                fournisseursServices: document.getElementById("fournisseursServices")?.checked || false,
                cooperativeAgricole: document.getElementById("cooperativeAgricole")?.checked || false,
                proximiteBanque: document.getElementById("proximiteBanque")?.checked || false,
                proximitePoste: document.getElementById("proximitePoste")?.checked || false,
                proximiteAssurances: document.getElementById("proximiteAssurances")?.checked || false,
                proximiteEquipements: document.getElementById("proximiteEquipements")?.checked || false,
                responsableVeterinaire: document.getElementById("responsableVeterinaire")?.checked || false,
                responsableLaboratoire: document.getElementById("responsableLaboratoire")?.checked || false,
                responsableMarketing: document.getElementById("responsableMarketing")?.checked || false,
                responsableTechnique: document.getElementById("responsableTechnique")?.checked || false,
                dic: document.querySelector('input[name="dic"]:checked')?.value || "",
                marcheLocal: document.getElementById("marcheLocal")?.checked || false,
                marcheNational: document.getElementById("marcheNational")?.checked || false,
                marcheInternational: document.getElementById("marcheInternational")?.checked || false,
                autresAssociations: document.getElementById("autresAssociations")?.value || "",

                // ===== جدول استخدام الأراضي (V) =====
                ...(() => {
                    let crops = {};
                    const ids = [1,2,3,4,5,7,8,9,10,11,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,34,35,36,37,38,39,40,41,42,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,65,71];
                    ids.forEach(n => {
                        ['sec','irr','int'].forEach(t => {
                            let el = document.getElementById(`c${n}_${t}`);
                            crops[`c${n}_${t}`] = el?.value || "0";
                        });
                    });
                    return crops;
                })(),
                arbresOliviers: document.getElementById("arbresOliviers")?.value || "",
                arbresFiguiers: document.getElementById("arbresFiguiers")?.value || "",
                arbresNoyaux: document.getElementById("arbresNoyaux")?.value || "",
                arbresVigne: document.getElementById("arbresVigne")?.value || "",
                arbresGrenadiers: document.getElementById("arbresGrenadiers")?.value || "",
                arbresAmandiers: document.getElementById("arbresAmandiers")?.value || "",
                arbresCognassiers: document.getElementById("arbresCognassiers")?.value || "",
                arbresPalmiers: document.getElementById("arbresPalmiers")?.value || "",
                arbresCaroubier: document.getElementById("arbresCaroubier")?.value || "",
                arbresAutres: document.getElementById("arbresAutres")?.value || "",
                biologique: document.querySelector('input[name="biologique"]:checked')?.value || "",
                aquaculture: document.querySelector('input[name="aquaculture"]:checked')?.value || "",
                helicicult: document.querySelector('input[name="helicicult"]:checked')?.value || "",
                myciculture: document.querySelector('input[name="myciculture"]:checked')?.value || "",
                contractuelle: document.querySelector('input[name="contractuelle"]:checked')?.value || "",
                filiereTomate: document.getElementById("filiereTomate")?.checked || false,
                filiereHuile: document.getElementById("filiereHuile")?.checked || false,
                filiereAviculture: document.getElementById("filiereAviculture")?.checked || false,
                filiereMaraichage: document.getElementById("filiereMaraichage")?.checked || false,
                filierePomme: document.getElementById("filierePomme")?.checked || false,
                filiereAutre: document.getElementById("filiereAutre")?.checked || false
            };
            return data;
        }

        // ===== تعبئة النموذج من بيانات المسودة =====
        function populateFormFromDraft(draft) {
            // المعلومات الأساسية
            setFieldValue("name", draft.name);
            setFieldValue("phone", draft.phone);
            setFieldValue("wilaya", draft.wilaya);
            setFieldValue("area", draft.area);
            
            // معلومات عامة
            setFieldValue("passDay", draft.passDay);
            setFieldValue("passMonth", draft.passMonth);
            setFieldValue("passYear", draft.passYear);
            setFieldValue("recenseurNom", draft.recenseurNom);
            setFieldValue("recenseurPrenom", draft.recenseurPrenom);
            setFieldValue("controlDay", draft.controlDay);
            setFieldValue("controlMonth", draft.controlMonth);
            setFieldValue("controlYear", draft.controlYear);
            setFieldValue("controleurNom", draft.controleurNom);
            setFieldValue("controleurPrenom", draft.controleurPrenom);
            setFieldValue("wilaya2", draft.wilaya2);
            setFieldValue("commune", draft.commune);
            setFieldValue("code1", draft.code1);
            setFieldValue("code2", draft.code2);
            setFieldValue("code3", draft.code3);
            setFieldValue("code4", draft.code4);
            setFieldValue("lieuDit", draft.lieuDit);
            setFieldValue("district1", draft.district1);
            setFieldValue("district2", draft.district2);
            
            // تعريف المستثمر
            setFieldValue("exploitantNom", draft.exploitantNom);
            setFieldValue("exploitantPrenom", draft.exploitantPrenom);
            setFieldValue("birthYear", draft.birthYear);
            setRadioValue("sexe", draft.sexe);
            setRadioValue("education", draft.education);
            setRadioValue("formation", draft.formation);
            setFieldValue("adresse", draft.adresse);
            setFieldValue("phone1", draft.phone1);
            setFieldValue("phone2", draft.phone2);
            setFieldValue("phone3", draft.phone3);
            setFieldValue("phone4", draft.phone4);
            setFieldValue("phone5", draft.phone5);
            setFieldValue("nin1", draft.nin1);
            setFieldValue("nin2", draft.nin2);
            setFieldValue("nin3", draft.nin3);
            setFieldValue("nin4", draft.nin4);
            setFieldValue("nin5", draft.nin5);
            setFieldValue("nin6", draft.nin6);
            setFieldValue("nis1", draft.nis1);
            setFieldValue("nis2", draft.nis2);
            setFieldValue("nis3", draft.nis3);
            setFieldValue("nis4", draft.nis4);
            setFieldValue("nis5", draft.nis5);
            setFieldValue("carte1", draft.carte1);
            setFieldValue("carte2", draft.carte2);
            setFieldValue("carte3", draft.carte3);
            setFieldValue("carte4", draft.carte4);
            setCheckboxValue("inscritCAW", draft.inscritCAW);
            setCheckboxValue("inscritCAPA", draft.inscritCAPA);
            setCheckboxValue("inscritUNPA", draft.inscritUNPA);
            setCheckboxValue("inscritCARM", draft.inscritCARM);
            setRadioValue("famille", draft.famille);
            setFieldValue("coExploitantsCount", draft.coExploitantsCount);
            setRadioValue("nature", draft.nature);
            
            // تعريف المستثمرة
            setFieldValue("nomExploitation", draft.nomExploitation);
            setRadioValue("statut", draft.statut);
            setFieldValue("latitude", draft.latitude);
            setFieldValue("longitude", draft.longitude);
            setRadioValue("electricite", draft.electricite);
            setRadioValue("internet", draft.internet);
            setRadioValue("access", draft.access);
            setRadioValue("vocation", draft.vocation);
            
            // المساحة
            setFieldValue("superficieSeche", draft.superficieSeche);
            setFieldValue("superficieIrriguee", draft.superficieIrriguee);
            setFieldValue("superficie", draft.superficie);
            setFieldValue("superficieNonProductive", draft.superficieNonProductive);
            setCheckboxValue("energieReseau", draft.energieReseau);
            setCheckboxValue("energieGroupe", draft.energieGroupe);
            setCheckboxValue("energieSolaire", draft.energieSolaire);
            setCheckboxValue("energieAutres", draft.energieAutres);
            
            // استخدام الأراضي
            setFieldValue("terresAgricoles", draft.terresAgricoles);
            setFieldValue("arbresFruitiers", draft.arbresFruitiers);
            setFieldValue("grandesCultures", draft.grandesCultures);
            setFieldValue("legumes", draft.legumes);
            
            // المواشي
            setFieldValue("bovins", draft.bovins);
            setFieldValue("bovinsBLL", draft.bovinsBLL);
            setFieldValue("bovinsBLA", draft.bovinsBLA);
            setFieldValue("bovinsBLM", draft.bovinsBLM);
            setFieldValue("ovins", draft.ovins);
            setFieldValue("ovinsBrebis", draft.ovinsBrebis);
            setFieldValue("caprins", draft.caprins);
            setFieldValue("caprinsChevres", draft.caprinsChevres);
            setFieldValue("camelins", draft.camelins);
            setFieldValue("camelinsFemelles", draft.camelinsFemelles);
            setFieldValue("equins", draft.equins);
            setFieldValue("equinsFemelles", draft.equinsFemelles);
            setFieldValue("pouletsChair", draft.pouletsChair);
            setFieldValue("pouletsPondeuses", draft.pouletsPondeuses);
            setFieldValue("dindes", draft.dindes);
            setFieldValue("ruchesModernes", draft.ruchesModernes);
            setFieldValue("ruchesModernesPleines", draft.ruchesModernesPleines);
            setFieldValue("ruchesTraditionnelles", draft.ruchesTraditionnelles);
            setFieldValue("ruchesTraditionnellesPleines", draft.ruchesTraditionnellesPleines);
            setFieldValue("mulets", draft.mulets);
            setFieldValue("anes", draft.anes);
            
            // المباني
            setFieldValue("batimentsHabitationNb", draft.batimentsHabitationNb);
            setFieldValue("batimentsHabitationSurface", draft.batimentsHabitationSurface);
            setFieldValue("etables", draft.etables);
            setFieldValue("bergeries", draft.bergeries);
            setFieldValue("ecuries", draft.ecuries);
            setFieldValue("serresPlastique", draft.serresPlastique);
            setFieldValue("serresTunnel", draft.serresTunnel);
            setFieldValue("serresMulti", draft.serresMulti);
            setFieldValue("stockageProduits", draft.stockageProduits);
            setFieldValue("stockageMateriel", draft.stockageMateriel);
            setFieldValue("caves", draft.caves);
            setFieldValue("uniteConditionnement", draft.uniteConditionnement);
            setFieldValue("uniteTransformation", draft.uniteTransformation);
            setFieldValue("centreLait", draft.centreLait);
            setFieldValue("chambresFroidesNb", draft.chambresFroidesNb);
            setFieldValue("chambresFroidesCapacite", draft.chambresFroidesCapacite);
            
            // العتاد
            setFieldValue("tracteursMoins45", draft.tracteursMoins45);
            setFieldValue("tracteurs40a90", draft.tracteurs40a90);
            setFieldValue("tracteurs65", draft.tracteurs65);
            setFieldValue("tracteursChenille80", draft.tracteursChenille80);
            setFieldValue("tracteursChenillePlus", draft.tracteursChenillePlus);
            setFieldValue("charrue", draft.charrue);
            setFieldValue("charrue3m", draft.charrue3m);
            setFieldValue("semoir", draft.semoir);
            setFieldValue("epandeur", draft.epandeur);
            setFieldValue("pulverisateur", draft.pulverisateur);
            setFieldValue("pulverisateurTraine", draft.pulverisateurTraine);
            setFieldValue("moissonneuse", draft.moissonneuse);
            setFieldValue("moissonneuseBat", draft.moissonneuseBat);
            setFieldValue("vehiculesLegers", draft.vehiculesLegers);
            setFieldValue("vehiculesLourds", draft.vehiculesLourds);
            setFieldValue("remorques", draft.remorques);
            setFieldValue("pompeEau", draft.pompeEau);
            setFieldValue("pompeElectrique", draft.pompeElectrique);
            setFieldValue("autreMateriel", draft.autreMateriel);
            
            // الموارد المائية
            setCheckboxValue("sourcePuits", draft.sourcePuits);
            setCheckboxValue("sourceForage", draft.sourceForage);
            setCheckboxValue("sourcePompage", draft.sourcePompage);
            setCheckboxValue("sourceBarrage", draft.sourceBarrage);
            setCheckboxValue("sourceSource", draft.sourceSource);
            setCheckboxValue("sourceFoggara", draft.sourceFoggara);
            setCheckboxValue("sourceEpuration", draft.sourceEpuration);
            setRadioValue("irrigation", draft.irrigation);
            setFieldValue("culturesIrriguees", draft.culturesIrriguees);
            
            // اليد العاملة
            setFieldValue("totalWorkers", draft.totalWorkers);
            setFieldValue("maleWorkers", draft.maleWorkers);
            setFieldValue("femaleWorkers", draft.femaleWorkers);
            setFieldValue("permanentMale", draft.permanentMale);
            setFieldValue("permanentFemale", draft.permanentFemale);
            setFieldValue("seasonalMale", draft.seasonalMale);
            setFieldValue("seasonalFemale", draft.seasonalFemale);
            setFieldValue("coExploitants", draft.coExploitants);
            
            // الأسرة الفلاحية
            setFieldValue("familyMembers", draft.familyMembers);
            setFieldValue("familyMale", draft.familyMale);
            setFieldValue("familyFemale", draft.familyFemale);
            setFieldValue("familyChildren", draft.familyChildren);
            setFieldValue("familyWorkers", draft.familyWorkers);
            
            // المدخلات
            setFieldValue("semencesSelectionnees", draft.semencesSelectionnees);
            setFieldValue("semencesFerme", draft.semencesFerme);
            setFieldValue("semencesPotentielles", draft.semencesPotentielles);
            setFieldValue("engrais", draft.engrais);
            setFieldValue("pesticides", draft.pesticides);
            setFieldValue("eauIrrigation", draft.eauIrrigation);
            
            // التمويل
            setFieldValue("totalFinance", draft.totalFinance);
            setFieldValue("selfFinance", draft.selfFinance);
            setFieldValue("bankFinance", draft.bankFinance);
            setFieldValue("ressourcesPropres", draft.ressourcesPropres);
            setFieldValue("creditBancaire", draft.creditBancaire);
            setFieldValue("soutienPublic", draft.soutienPublic);
            setFieldValue("empruntTiers", draft.empruntTiers);
            setRadioValue("assuranceAgricole", draft.assuranceAgricole);
            setRadioValue("typeAssurance", draft.typeAssurance);
            
            // محيط المستثمرة
            setCheckboxValue("fournisseursServices", draft.fournisseursServices);
            setCheckboxValue("cooperativeAgricole", draft.cooperativeAgricole);
            setCheckboxValue("proximiteBanque", draft.proximiteBanque);
            setCheckboxValue("proximitePoste", draft.proximitePoste);
            setCheckboxValue("proximiteAssurances", draft.proximiteAssurances);
            setCheckboxValue("proximiteEquipements", draft.proximiteEquipements);
            setCheckboxValue("responsableVeterinaire", draft.responsableVeterinaire);
            setCheckboxValue("responsableLaboratoire", draft.responsableLaboratoire);
            setCheckboxValue("responsableMarketing", draft.responsableMarketing);
            setCheckboxValue("responsableTechnique", draft.responsableTechnique);
            setRadioValue("dic", draft.dic);
            setCheckboxValue("marcheLocal", draft.marcheLocal);
            setCheckboxValue("marcheNational", draft.marcheNational);
            setCheckboxValue("marcheInternational", draft.marcheInternational);
            setFieldValue("autresAssociations", draft.autresAssociations);

            // ===== جدول المحاصيل (V) =====
            const cropIds = [1,2,3,4,5,7,8,9,10,11,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,34,35,36,37,38,39,40,41,42,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,65,71];
            cropIds.forEach(n => {
                ['sec','irr','int'].forEach(t => {
                    setFieldValue(`c${n}_${t}`, draft[`c${n}_${t}`]);
                });
            });
            setFieldValue("arbresOliviers", draft.arbresOliviers);
            setFieldValue("arbresFiguiers", draft.arbresFiguiers);
            setFieldValue("arbresNoyaux", draft.arbresNoyaux);
            setFieldValue("arbresVigne", draft.arbresVigne);
            setFieldValue("arbresGrenadiers", draft.arbresGrenadiers);
            setFieldValue("arbresAmandiers", draft.arbresAmandiers);
            setFieldValue("arbresCognassiers", draft.arbresCognassiers);
            setFieldValue("arbresPalmiers", draft.arbresPalmiers);
            setFieldValue("arbresCaroubier", draft.arbresCaroubier);
            setFieldValue("arbresAutres", draft.arbresAutres);
            setRadioValue("biologique", draft.biologique);
            setRadioValue("aquaculture", draft.aquaculture);
            setRadioValue("helicicult", draft.helicicult);
            setRadioValue("myciculture", draft.myciculture);
            setRadioValue("contractuelle", draft.contractuelle);
            setCheckboxValue("filiereTomate", draft.filiereTomate);
            setCheckboxValue("filiereHuile", draft.filiereHuile);
            setCheckboxValue("filiereAviculture", draft.filiereAviculture);
            setCheckboxValue("filiereMaraichage", draft.filiereMaraichage);
            setCheckboxValue("filierePomme", draft.filierePomme);
            setCheckboxValue("filiereAutre", draft.filiereAutre);
            recalcCropTotals();
        }

        function setFieldValue(id, value) {
            let element = document.getElementById(id);
            if (element) element.value = value || "";
        }

        function setRadioValue(name, value) {
            let radios = document.getElementsByName(name);
            radios.forEach(radio => {
                if (radio.value === value) {
                    radio.checked = true;
                }
            });
        }

        function setCheckboxValue(id, checked) {
            let element = document.getElementById(id);
            if (element) element.checked = checked || false;
        }

        // ===== حفظ مسودة =====
        function saveDraft() {
            let data = collectFormData();
            
            if (currentDraftId) {
                // تحديث مسودة موجودة
                let index = drafts.findIndex(d => d.id == currentDraftId);
                if (index !== -1) {
                    drafts[index] = data;
                } else {
                    drafts.push(data);
                }
            } else {
                // مسودة جديدة
                drafts.push(data);
                currentDraftId = data.id;
            }
            
            localStorage.setItem("drafts", JSON.stringify(drafts));
            updateStats();
            showToast("تم حفظ المسودة بنجاح", "success");
        }

        // ===== تحميل مسودة =====
        function loadDraft(draftId) {
            let draft = drafts.find(d => d.id == draftId);
            if (!draft) {
                showToast("لم يتم العثور على المسودة", "error");
                return;
            }
            
            currentDraftId = draftId;
            populateFormFromDraft(draft);
            showPage("survey");
            showToast("تم تحميل المسودة بنجاح", "success");
        }

        // ===== حذف مسودة =====
        function deleteDraft(draftId) {
            if (confirm("هل أنت متأكد من حذف هذه المسودة؟")) {
                drafts = drafts.filter(d => d.id != draftId);
                localStorage.setItem("drafts", JSON.stringify(drafts));
                
                if (currentDraftId == draftId) {
                    currentDraftId = null;
                }
                
                renderDrafts();
                updateStats();
                showToast("تم حذف المسودة بنجاح", "success");
            }
        }

        // ===== إنشاء مسودة جديدة =====
        function createNewDraft() {
            currentDraftId = null;
            clearForm();
            showPage("survey");
        }

        // ===== حذف جميع المسودات =====
        function clearAllDrafts() {
            if (drafts.length === 0) {
                showToast("لا توجد مسودات للحذف", "error");
                return;
            }
            
            if (confirm("هل أنت متأكد من حذف جميع المسودات؟")) {
                drafts = [];
                localStorage.setItem("drafts", JSON.stringify(drafts));
                currentDraftId = null;
                renderDrafts();
                updateStats();
                showToast("تم حذف جميع المسودات", "success");
            }
        }

        // ===== عرض المسودات =====
        function renderDrafts() {
            let list = document.getElementById("draftsList");
            if (!list) return;
            
            if (drafts.length === 0) {
                list.innerHTML = "<p style='color: #1C4B2D; opacity: 0.5; text-align:center; padding:20px;'>لا توجد مسودات محفوظة</p>";
                return;
            }
            
            // ترتيب المسودات من الأحدث إلى الأقدم
            let sortedDrafts = [...drafts].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            list.innerHTML = "";
            sortedDrafts.forEach(d => {
                let date = new Date(d.date).toLocaleDateString('ar-DZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                list.innerHTML += `
                    <div class="farmer-card">
                        <h3>
                            <i class="fas fa-file-alt"></i> 
                            ${d.name || "بدون اسم"}
                            <span class="draft-badge"><i class="fas fa-save"></i> مسودة</span>
                        </h3>
                        <p><i class="fas fa-map-marker-alt"></i> الولاية: ${d.wilaya || "غير محدد"}</p>
                        <p><i class="fas fa-phone"></i> الهاتف: ${d.phone || "غير محدد"}</p>
                        <p><i class="fas fa-ruler"></i> المساحة: ${d.area || "0"} هكتار</p>
                        <p class="draft-date"><i class="fas fa-clock"></i> آخر تحديث: ${date}</p>
                        <div class="btn-group">
                            <button class="btn btn-info" onclick="loadDraft(${d.id})">
                                <i class="fas fa-edit"></i> استكمال
                            </button>
                            <button class="btn btn-danger" onclick="deleteDraft(${d.id})">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        // ===== حفظ فلاح =====
        function saveFarmer() {
            let name = document.getElementById("name").value;
            if (!name) {
                showToast("الرجاء إدخال اسم الفلاح", "error");
                return;
            }
            
            let farmerData = collectFormData();
            
            if (editingID) {
                farmerData.id = editingID;
                farmers = farmers.map(f => f.id === editingID ? farmerData : f);
                showToast("تم تعديل بيانات الفلاح بنجاح", "success");
                editingID = null;
            } else {
                farmers.push(farmerData);
                showToast("تم حفظ الفلاح بنجاح", "success");
            }
            
            localStorage.setItem("farmers", JSON.stringify(farmers));
            
            // إذا كانت هناك مسودة مرتبطة بهذا الفلاح، حذفها
            if (currentDraftId) {
                drafts = drafts.filter(d => d.id != currentDraftId);
                localStorage.setItem("drafts", JSON.stringify(drafts));
                currentDraftId = null;
            }
            
            clearForm();
            renderFarmers();
            updateStats();
            showPage("farmers");
        }

        // ===== مسح الاستمارة =====
        function clearForm() {
            let inputs = document.querySelectorAll('#survey input, #survey select');
            inputs.forEach(input => {
                if (input.type === 'radio' || input.type === 'checkbox') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });
            
            // تعيين القيم الافتراضية
            let passYear = document.getElementById('passYear');
            if (passYear) passYear.value = "2025";
            
            currentDraftId = null;
            editingID = null;
        }

        // ===== عرض الفلاحين =====
        function renderFarmers() {
            let list = document.getElementById("farmersList");
            if (!list) return;
            
            if (farmers.length === 0) {
                list.innerHTML = "<p style='color: #1C4B2D; opacity: 0.5; text-align:center; padding:20px;'>لا يوجد فلاحين مسجلين بعد</p>";
                return;
            }
            
            list.innerHTML = "";
            farmers.forEach(f => {
                list.innerHTML += `
                    <div class="farmer-card">
                        <h3>
                            <i class="fas fa-user"></i> ${f.name || "غير محدد"}
                        </h3>
                        <p><i class="fas fa-map-marker-alt"></i> الولاية: ${f.wilaya || "غير محدد"}</p>
                        <p><i class="fas fa-phone"></i> الهاتف: ${f.phone || "غير محدد"}</p>
                        <p><i class="fas fa-ruler"></i> المساحة: ${f.area || "0"} هكتار</p>
                        <div class="btn-group">
                            <button class="btn btn-primary" onclick="editFarmer(${f.id})">
                                <i class="fas fa-edit"></i> تعديل
                            </button>
                            <button class="btn btn-danger" onclick="deleteFarmer(${f.id})">
                                <i class="fas fa-trash"></i> حذف
                            </button>
                            <button class="btn btn-secondary" onclick="viewProfile(${f.id})">
                                <i class="fas fa-eye"></i> عرض البروفيل الكامل
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        // ===== تعديل =====
        function editFarmer(id) {
            let f = farmers.find(x => x.id == id);
            if (!f) return;
            
            populateFormFromDraft(f);
            editingID = id;
            showPage("survey");
            showGroup(1);
        }

        // ===== حذف =====
        function deleteFarmer(id) {
            if (confirm("هل أنت متأكد من حذف هذا الفلاح؟")) {
                farmers = farmers.filter(f => f.id !== id);
                localStorage.setItem("farmers", JSON.stringify(farmers));
                renderFarmers();
                updateStats();
                showToast("تم حذف الفلاح بنجاح", "success");
            }
        }

        // ===== بروفيل الفلاح الكامل =====
        function viewProfile(id) {
            let f = farmers.find(x => x.id == id);
            if (!f) return;
            
            document.getElementById("profileName").innerHTML = f.name || "غير محدد";
            document.getElementById("profileBadge").innerHTML = `فلاح مسجل منذ ${new Date(f.date).toLocaleDateString('ar-DZ')}`;
            
            // الملخص السريع
            let totalAnimals = (parseInt(f.bovins) || 0) + (parseInt(f.ovins) || 0) + (parseInt(f.caprins) || 0);
            document.getElementById("profileSummary").innerHTML = `
                <div class="profile-summary-card">
                    <div class="profile-summary-icon"><i class="fas fa-ruler-combined"></i></div>
                    <div class="profile-summary-label">المساحة</div>
                    <div class="profile-summary-value">${f.area || f.superficie || "0"} هكتار</div>
                </div>
                <div class="profile-summary-card">
                    <div class="profile-summary-icon"><i class="fas fa-phone"></i></div>
                    <div class="profile-summary-label">الهاتف</div>
                    <div class="profile-summary-value">${f.phone || "غير محدد"}</div>
                </div>
                <div class="profile-summary-card">
                    <div class="profile-summary-icon"><i class="fas fa-paw"></i></div>
                    <div class="profile-summary-label">المواشي</div>
                    <div class="profile-summary-value">${totalAnimals}</div>
                </div>
                <div class="profile-summary-card">
                    <div class="profile-summary-icon"><i class="fas fa-calendar"></i></div>
                    <div class="profile-summary-label">تاريخ الميلاد</div>
                    <div class="profile-summary-value">${f.birthYear || "غير محدد"}</div>
                </div>
            `;
            
            // التفاصيل الكاملة
            document.getElementById("profileDetails").innerHTML = `
                <!-- معلومات عامة -->
                <div class="profile-section">
                    <div class="profile-section-title">
                        <i class="fas fa-info-circle"></i> معلومات عامة
                    </div>
                    <div class="profile-grid">
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-calendar"></i> تاريخ المرور</div>
                            <div class="profile-item-value">${f.passDay || "00"}/${f.passMonth || "00"}/${f.passYear || "2025"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-user-tag"></i> المحصي</div>
                            <div class="profile-item-value">${f.recenseurNom || ""} ${f.recenseurPrenom || "غير محدد"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-map-marker-alt"></i> الولاية</div>
                            <div class="profile-item-value">${f.wilaya2 || f.wilaya || "غير محدد"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-city"></i> البلدية</div>
                            <div class="profile-item-value">${f.commune || "غير محدد"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-map-pin"></i> المنطقة</div>
                            <div class="profile-item-value">${f.lieuDit || "غير محدد"}</div>
                        </div>
                    </div>
                </div>
                
                <!-- معلومات المستثمر -->
                <div class="profile-section">
                    <div class="profile-section-title">
                        <i class="fas fa-user-tie"></i> معلومات المستثمر
                    </div>
                    <div class="profile-grid">
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-user"></i> الاسم الكامل</div>
                            <div class="profile-item-value">${f.exploitantNom || ""} ${f.exploitantPrenom || ""}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-cake-candles"></i> سنة الميلاد</div>
                            <div class="profile-item-value">${f.birthYear || "غير محدد"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-venus-mars"></i> الجنس</div>
                            <div class="profile-item-value">${f.sexe === 'male' ? 'ذكر' : f.sexe === 'female' ? 'أنثى' : 'غير محدد'}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-graduation-cap"></i> المستوى التعليمي</div>
                            <div class="profile-item-value">${f.education || "غير محدد"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-leaf"></i> التكوين الفلاحي</div>
                            <div class="profile-item-value">${f.formation || "غير محدد"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-map-marker-alt"></i> العنوان</div>
                            <div class="profile-item-value">${f.adresse || "غير محدد"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-id-card"></i> رقم التعريف الوطني</div>
                            <div class="profile-item-value">${f.nin1 || ""}${f.nin2 || ""}${f.nin3 || ""}${f.nin4 || ""}${f.nin5 || ""}${f.nin6 || "غير محدد"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-id-badge"></i> رقم بطاقة الفلاح</div>
                            <div class="profile-item-value">${f.carte1 || ""}${f.carte2 || ""}${f.carte3 || ""}${f.carte4 || "غير محدد"}</div>
                        </div>
                    </div>
                </div>
                
                <!-- معلومات المستثمرة -->
                <div class="profile-section">
                    <div class="profile-section-title">
                        <i class="fas fa-tractor"></i> معلومات المستثمرة
                    </div>
                    <div class="profile-grid">
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-tag"></i> اسم المستثمرة</div>
                            <div class="profile-item-value">${f.nomExploitation || "غير محدد"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-gavel"></i> الوضع القانوني</div>
                            <div class="profile-item-value">${f.statut || "غير محدد"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-map-marked-alt"></i> الإحداثيات</div>
                            <div class="profile-item-value">${f.latitude || "..."}, ${f.longitude || "..."}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-bolt"></i> الكهرباء</div>
                            <div class="profile-item-value">${f.electricite || "غير محدد"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-wifi"></i> الإنترنت</div>
                            <div class="profile-item-value">${f.internet || "غير محدد"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-road"></i> إمكانية الوصول</div>
                            <div class="profile-item-value">${f.access || "غير محدد"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-seedling"></i> نشاط المستثمرة</div>
                            <div class="profile-item-value">${f.vocation || "غير محدد"}</div>
                        </div>
                    </div>
                </div>
                
                <!-- المساحات -->
                <div class="profile-section">
                    <div class="profile-section-title">
                        <i class="fas fa-ruler-combined"></i> المساحات (هكتار)
                    </div>
                    <div class="profile-grid">
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-globe"></i> مساحة جافة</div>
                            <div class="profile-item-value">${f.superficieSeche || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-water"></i> مساحة مسقية</div>
                            <div class="profile-item-value">${f.superficieIrriguee || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-chart-pie"></i> المساحة الإجمالية</div>
                            <div class="profile-item-value">${f.superficie || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-times-circle"></i> مساحة غير منتجة</div>
                            <div class="profile-item-value">${f.superficieNonProductive || "0"}</div>
                        </div>
                    </div>
                </div>
                
                <!-- المواشي -->
                <div class="profile-section">
                    <div class="profile-section-title">
                        <i class="fas fa-paw"></i> المواشي
                    </div>
                    <div class="profile-grid">
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-cow"></i> الأبقار</div>
                            <div class="profile-item-value">${f.bovins || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-sheep"></i> الأغنام</div>
                            <div class="profile-item-value">${f.ovins || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-goat"></i> الماعز</div>
                            <div class="profile-item-value">${f.caprins || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-camel"></i> الإبل</div>
                            <div class="profile-item-value">${f.camelins || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-horse"></i> الخيول</div>
                            <div class="profile-item-value">${f.equins || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-drumstick-bite"></i> الدواجن</div>
                            <div class="profile-item-value">لحوم: ${f.pouletsChair || "0"} | بياض: ${f.pouletsPondeuses || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-bug"></i> النحل</div>
                            <div class="profile-item-value">عصري: ${f.ruchesModernes || "0"} | تقليدي: ${f.ruchesTraditionnelles || "0"}</div>
                        </div>
                    </div>
                </div>
                
                <!-- المباني والمعدات -->
                <div class="profile-section">
                    <div class="profile-section-title">
                        <i class="fas fa-warehouse"></i> المباني والمعدات
                    </div>
                    <div class="profile-grid">
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-home"></i> مباني سكنية</div>
                            <div class="profile-item-value">${f.batimentsHabitationNb || "0"} (${f.batimentsHabitationSurface || "0"} م²)</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-egg"></i> مباني تربية</div>
                            <div class="profile-item-value">إسطبلات: ${f.etables || "0"} | أغنام: ${f.bergeries || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-seedling"></i> البيوت البلاستيكية</div>
                            <div class="profile-item-value">${f.serresPlastique || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-tractor"></i> الجرارات</div>
                            <div class="profile-item-value">${f.tracteursMoins45 || "0"} (<45) | ${f.tracteurs40a90 || "0"} (40-90)</div>
                        </div>
                    </div>
                </div>
                
                <!-- الموارد المائية -->
                <div class="profile-section">
                    <div class="profile-section-title">
                        <i class="fas fa-water"></i> الموارد المائية
                    </div>
                    <div class="profile-grid">
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-tint"></i> مصادر المياه</div>
                            <div class="profile-item-value">
                                ${f.sourcePuits ? 'بئر ' : ''}${f.sourceForage ? 'ثقب ' : ''}${f.sourceBarrage ? 'سد ' : ''}
                            </div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-hand-holding-water"></i> طريقة الري</div>
                            <div class="profile-item-value">${f.irrigation || "غير محدد"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-ruler-combined"></i> المساحة المسقية</div>
                            <div class="profile-item-value">${f.area || f.superficieIrriguee || "0"} هكتار</div>
                        </div>
                    </div>
                </div>
                
                <!-- اليد العاملة -->
                <div class="profile-section">
                    <div class="profile-section-title">
                        <i class="fas fa-users"></i> اليد العاملة
                    </div>
                    <div class="profile-grid">
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-clock"></i> عمال دائمون</div>
                            <div class="profile-item-value">ذكور: ${f.permanentMale || "0"} | إناث: ${f.permanentFemale || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-calendar-alt"></i> عمال موسميون</div>
                            <div class="profile-item-value">ذكور: ${f.seasonalMale || "0"} | إناث: ${f.seasonalFemale || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-hand-holding-heart"></i> المستثمرون المشاركون</div>
                            <div class="profile-item-value">${f.coExploitants || "0"}</div>
                        </div>
                    </div>
                </div>
                
                <!-- الأسرة الفلاحية -->
                <div class="profile-section">
                    <div class="profile-section-title">
                        <i class="fas fa-family"></i> الأسرة الفلاحية
                    </div>
                    <div class="profile-grid">
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-users"></i> عدد أفراد الأسرة</div>
                            <div class="profile-item-value">${f.familyMembers || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-venus-mars"></i> التوزيع</div>
                            <div class="profile-item-value">ذكور: ${f.familyMale || "0"} | إناث: ${f.familyFemale || "0"} | أطفال: ${f.familyChildren || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-baby"></i> النشطين في الأسرة</div>
                            <div class="profile-item-value">${f.familyWorkers || "0"}</div>
                        </div>
                    </div>
                </div>
                
                <!-- التمويل -->
                <div class="profile-section">
                    <div class="profile-section-title">
                        <i class="fas fa-coins"></i> التمويل (دج)
                    </div>
                    <div class="profile-grid">
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-hand-holding-usd"></i> موارد ذاتية</div>
                            <div class="profile-item-value">${f.ressourcesPropres || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-bank"></i> قرض بنكي</div>
                            <div class="profile-item-value">${f.creditBancaire || "0"}</div>
                        </div>
                        <div class="profile-item">
                            <div class="profile-item-label"><i class="fas fa-building-columns"></i> دعم عمومي</div>
                            <div class="profile-item-value">${f.soutienPublic || "0"}</div>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById("profileModal").classList.add("active");
        }

        function closeProfile() {
            document.getElementById("profileModal").classList.remove("active");
        }

        // ===== رسائل التنبيه =====
        function showToast(message, type) {
            let toast = document.createElement("div");
            toast.className = "toast-message";
            if (type === "error") toast.classList.add("error");
            toast.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"}"></i> ${message}`;
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        // ===== تبديل الثيم =====
        function toggleTheme() {
            document.body.classList.toggle('light-mode');
            let toggle = document.getElementById('themeToggle');
            toggle.classList.toggle('light');
        }