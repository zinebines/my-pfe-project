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

    // التحقق من تاريخ الميلاد
    let birthYear = document.getElementById('birthYear');
    if (birthYear) {
        birthYear.addEventListener('change', function() {
            let year = parseInt(this.value);
            let warning = document.getElementById('birthYearWarning');
            if (year && (2025 - year) < 18) {
                if (warning) warning.style.display = 'flex';
            } else {
                if (warning) warning.style.display = 'none';
            }
        });
    }

    // التحقق من المساحة
    let superficie = document.getElementById('superficie');
    if (superficie) {
        superficie.addEventListener('change', function() {
            let area = parseFloat(this.value);
            let warning = document.getElementById('superficieWarning');
            if (area > 1000) {
                if (warning) warning.style.display = 'flex';
            } else {
                if (warning) warning.style.display = 'none';
            }
        });
    }

    // إظهار/إخفاء حقل الشعبة التعاقدية
    let contractuelleOui = document.getElementById('contractuelleOui');
    let contractuelleNon = document.getElementById('contractuelleNon');
    let filiereGroup = document.getElementById('filiereContractuelleGroup');
    
    if (contractuelleOui && contractuelleNon) {
        contractuelleOui.addEventListener('change', function() {
            if (filiereGroup) filiereGroup.style.display = 'block';
        });
        contractuelleNon.addEventListener('change', function() {
            if (filiereGroup) filiereGroup.style.display = 'none';
        });
    }
});

// ===== تحديث الإحصائيات =====
function updateStats() {
    let countEl = document.getElementById("farmerCount");
    if (countEl) countEl.textContent = farmers.length;
    
    let totalArea = farmers.reduce((sum, f) => sum + (parseFloat(f.superficie) || 0), 0);
    let totalAreaEl = document.getElementById("totalArea");
    if (totalAreaEl) totalAreaEl.textContent = totalArea.toFixed(2);
    
    let totalCrops = farmers.filter(f => f.herbaceeIrriguee || f.herbaceeSec).length;
    let totalCropsEl = document.getElementById("totalCrops");
    if (totalCropsEl) totalCropsEl.textContent = totalCrops;
    
    let totalAnimals = farmers.reduce((sum, f) => sum + (parseInt(f.bovins) || 0) + (parseInt(f.ovins) || 0) + (parseInt(f.caprins) || 0) + (parseInt(f.camelins) || 0), 0);
    let totalAnimalsEl = document.getElementById("totalAnimals");
    if (totalAnimalsEl) totalAnimalsEl.textContent = totalAnimals;
    
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
function showGroup(group) {
    for (let i = 1; i <= 4; i++) {
        let g = document.getElementById(`group${i}`);
        if (g) g.style.display = "none";
    }
    
    let current = document.getElementById(`group${group}`);
    if (current) current.style.display = "block";
    
    updateProgressSteps(group);
    
    let prevBtn = document.getElementById("prevBtn");
    let nextBtn = document.getElementById("nextBtn");
    if (prevBtn) prevBtn.disabled = (group === 1);
    if (nextBtn) nextBtn.disabled = (group === 4);
    
    currentGroup = group;
}

function nextGroup() {
    if (currentGroup < 4) {
        showGroup(currentGroup + 1);
    }
}

function prevGroup() {
    if (currentGroup > 1) {
        showGroup(currentGroup - 1);
    }
}

function updateProgressSteps(active) {
    for (let i = 1; i <= 4; i++) {
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

// ===== التنقل بين الصفحات =====
function showPage(page) {
    let dashboard = document.getElementById("dashboard");
    let survey = document.getElementById("survey");
    let farmersPage = document.getElementById("farmers");
    let draftsPage = document.getElementById("drafts");
    
    if (dashboard) dashboard.style.display = "none";
    if (survey) survey.style.display = "none";
    if (farmersPage) farmersPage.style.display = "none";
    if (draftsPage) draftsPage.style.display = "none";
    
    let target = document.getElementById(page);
    if (target) target.style.display = "block";
    
    let menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach((m, idx) => {
        m.classList.remove("active");
        if (page === "dashboard" && idx === 0) m.classList.add("active");
        if (page === "survey" && idx === 1) m.classList.add("active");
        if (page === "farmers" && idx === 2) m.classList.add("active");
        if (page === "drafts" && idx === 3) m.classList.add("active");
    });
    
    if (page === "farmers") renderFarmers();
    if (page === "drafts") renderDrafts();
    if (page === "survey") {
        if (!currentDraftId) {
            clearForm();
        }
        showGroup(1);
        for (let i = 1; i <= 4; i++) {
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
        
        // معلومات عامة
        name: getValue("name"),
        phone: getValue("phone"),
        wilaya: getValue("wilaya"),
        passDay: getValue("passDay"),
        passMonth: getValue("passMonth"),
        passYear: getValue("passYear", "2025"),
        recenseurNom: getValue("recenseurNom"),
        recenseurPrenom: getValue("recenseurPrenom"),
        controlDay: getValue("controlDay"),
        controlMonth: getValue("controlMonth"),
        controlYear: getValue("controlYear"),
        controleurNom: getValue("controleurNom"),
        controleurPrenom: getValue("controleurPrenom"),
        wilaya2: getValue("wilaya2"),
        commune: getValue("commune"),
        code1: getValue("code1"),
        code2: getValue("code2"),
        code3: getValue("code3"),
        code4: getValue("code4"),
        lieuDit: getValue("lieuDit"),
        district1: getValue("district1"),
        district2: getValue("district2"),
        numExploitation: getValue("numExploitation"),
        
        // تعريف المستثمر
        exploitantNom: getValue("exploitantNom"),
        exploitantPrenom: getValue("exploitantPrenom"),
        birthYear: getValue("birthYear"),
        sexe: getRadioValue("sexe"),
        education: getRadioValue("education"),
        formation: getRadioValue("formation"),
        adresse: getValue("adresse"),
        phone1: getValue("phone1"),
        phone2: getValue("phone2"),
        phone3: getValue("phone3"),
        phone4: getValue("phone4"),
        phone5: getValue("phone5"),
        email: getValue("email"),
        nin1: getValue("nin1"),
        nin2: getValue("nin2"),
        nin3: getValue("nin3"),
        nin4: getValue("nin4"),
        nin5: getValue("nin5"),
        nin6: getValue("nin6"),
        nis1: getValue("nis1"),
        nis2: getValue("nis2"),
        nis3: getValue("nis3"),
        nis4: getValue("nis4"),
        nis5: getValue("nis5"),
        carte1: getValue("carte1"),
        carte2: getValue("carte2"),
        carte3: getValue("carte3"),
        carte4: getValue("carte4"),
        inscritCAW: getCheckboxValue("inscritCAW"),
        inscritCAPA: getCheckboxValue("inscritCAPA"),
        inscritUNPA: getCheckboxValue("inscritUNPA"),
        inscritCARM: getCheckboxValue("inscritCARM"),
        inscritCCW: getCheckboxValue("inscritCCW"),
        assuranceType26: getRadioValue("assuranceType26"),
        famille: getRadioValue("famille"),
        roleExploitant: getRadioValue("roleExploitant"),
        coExploitantsCount: getValue("coExploitantsCount", "0"),
        nature: getRadioValue("nature"),
        
        // تعريف المستثمرة
        nomExploitation: getValue("nomExploitation"),
        adresseExploitation: getValue("adresseExploitation"),
        statut: getRadioValue("statut"),
        longitude: getValue("longitude"),
        latitude: getValue("latitude"),
        vocation: getRadioValue("vocation"),
        terreAnimal: getRadioValue("terreAnimal"),
        access: getRadioValue("access"),
        electricite: getRadioValue("electricite"),
        telephone: getRadioValue("telephone"),
        typeTel: getRadioValue("typeTel"),
        internet: getRadioValue("internet"),
        internetAgricole: getRadioValue("internetAgricole"),
        
        // المساحات
        herbaceeIrriguee: getValue("herbaceeIrriguee"),
        herbaceeSec: getValue("herbaceeSec"),
        jacherIrriguee: getValue("jacherIrriguee"),
        jacherSec: getValue("jacherSec"),
        perenesIrriguee: getValue("perenesIrriguee"),
        perenesSec: getValue("perenesSec"),
        prairieIrriguee: getValue("prairieIrriguee"),
        prairieSec: getValue("prairieSec"),
        sauIrriguee: getValue("sauIrriguee"),
        sauSec: getValue("sauSec"),
        pacages: getValue("pacages"),
        superficieNonProductive: getValue("superficieNonProductive"),
        superficie: getValue("superficie"),
        forets: getValue("forets"),
        superficieTotale: getValue("superficieTotale"),
        unBloc: getRadioValue("unBloc"),
        nombreBlocs: getValue("nombreBlocs"),
        indusOccupants: getRadioValue("indusOccupants"),
        surfaceBatie: getValue("surfaceBatie"),
        energieReseau: getCheckboxValue("energieReseau"),
        energieGroupe: getCheckboxValue("energieGroupe"),
        energieSolaire: getCheckboxValue("energieSolaire"),
        energieEolienne: getCheckboxValue("energieEolienne"),
        energieAutres: getCheckboxValue("energieAutres"),
        
        // الأشجار المتفرقة
        arbresOliviers: getValue("arbresOliviers"),
        arbresFiguiers: getValue("arbresFiguiers"),
        arbresNoyaux: getValue("arbresNoyaux"),
        arbresVigne: getValue("arbresVigne"),
        arbresGrenadiers: getValue("arbresGrenadiers"),
        arbresAmandiers: getValue("arbresAmandiers"),
        arbresCongnassiers: getValue("arbresCongnassiers"),
        arbresPalmiers: getValue("arbresPalmiers"),
        arbresCaroubier: getValue("arbresCaroubier"),
        arbresAutres: getValue("arbresAutres"),
        
        // الممارسات الزراعية
        biologique: getRadioValue("biologique"),
        certificatBio: getRadioValue("certificatBio"),
        aquaculture: getRadioValue("aquaculture"),
        helicicult: getRadioValue("helicicult"),
        myciculture: getRadioValue("myciculture"),
        contractuelle: getRadioValue("contractuelle"),
        filiereTomate: getCheckboxValue("filiereTomate"),
        filiereHuile: getCheckboxValue("filiereHuile"),
        filiereAviculture: getCheckboxValue("filiereAviculture"),
        filiereMaraichage: getCheckboxValue("filiereMaraichage"),
        filierePomme: getCheckboxValue("filierePomme"),
        filiereAutre: getCheckboxValue("filiereAutre"),
        
        // المواشي
        bovins: getValue("bovins"),
        bovinsBLL: getValue("bovinsBLL"),
        bovinsBLA: getValue("bovinsBLA"),
        bovinsBLM: getValue("bovinsBLM"),
        ovins: getValue("ovins"),
        ovinsBrebis: getValue("ovinsBrebis"),
        caprins: getValue("caprins"),
        caprinsChevres: getValue("caprinsChevres"),
        camelins: getValue("camelins"),
        camelinsFemelles: getValue("camelinsFemelles"),
        equins: getValue("equins"),
        equinsFemelles: getValue("equinsFemelles"),
        pouletsChair: getValue("pouletsChair"),
        dindes: getValue("dindes"),
        autreAviculture: getValue("autreAviculture"),
        mulets: getValue("mulets"),
        anes: getValue("anes"),
        lapins: getValue("lapins"),
        ruchesModernes: getValue("ruchesModernes"),
        ruchesModernesPleines: getValue("ruchesModernesPleines"),
        ruchesTraditionnelles: getValue("ruchesTraditionnelles"),
        ruchesTraditionnellesPleines: getValue("ruchesTraditionnellesPleines"),
        
        // المباني
        batimentsHabitationNb: getValue("batimentsHabitationNb"),
        batimentsHabitationSurface: getValue("batimentsHabitationSurface"),
        bergeriesNb: getValue("bergeriesNb"),
        bergeriesCapacite: getValue("bergeriesCapacite"),
        etablesNb: getValue("etablesNb"),
        etablesCapacite: getValue("etablesCapacite"),
        ecurieschNb: getValue("ecurieschNb"),
        ecurieschCapacite: getValue("ecurieschCapacite"),
        PoulaillerNb: getValue("PoulaillerNb"),
        PoulaillerCapacite: getValue("PoulaillerCapacite"),
        PserresNb: getValue("PserresNb"),
        PserresCapacite: getValue("PserresCapacite"),
        serresTunnelNb: getValue("serresTunnelNb"),
        serresTunnelSurface: getValue("serresTunnelSurface"),
        mulserresNb: getValue("mulserresNb"),
        mulserresSurface: getValue("mulserresSurface"),
        BatimentsStockageNb: getValue("BatimentsStockageNb"),
        BatimentsStockageCapacite: getValue("BatimentsStockageCapacite"),
        BatimentsProdAgriNb: getValue("BatimentsProdAgriNb"),
        BatimentsProdAgriCapacite: getValue("BatimentsProdAgriCapacite"),
        uniteDeConNb: getValue("uniteDeConNb"),
        uniteDeConCapacite: getValue("uniteDeConCapacite"),
        uniteTransfoNb: getValue("uniteTransfoNb"),
        uniteTransfoCapacite: getValue("uniteTransfoCapacite"),
        centreCollecteLaitNb: getValue("centreCollecteLaitNb"),
        centreCollecteLaitCapacite: getValue("centreCollecteLaitCapacite"),
        autresBatimentsNb: getValue("autresBatimentsNb"),
        autresBatimentsCapacite: getValue("autresBatimentsCapacite"),
        chambresFroidesNb: getValue("chambresFroidesNb"),
        chambresFroidesCapacite: getValue("chambresFroidesCapacite"),
        
        // العتاد
        tracteursMoins45: getValue("tracteursMoins45"),
        tracteurs40a90: getValue("tracteurs40a90"),
        tracteurs65: getValue("tracteurs65"),
        tracteursChenille80: getValue("tracteursChenille80"),
        tracteursChenillePlus: getValue("tracteursChenillePlus"),
        moissonneuse: getValue("moissonneuse"),
        pompeEau: getValue("pompeEau"),
        pompeElectrique: getValue("pompeElectrique"),
        vehiculesLegers: getValue("vehiculesLegers"),
        vehiculesLourds: getValue("vehiculesLourds"),
        remorques: getValue("remorques"),
        autreMateriel: getValue("autreMateriel"),
        
        // الموارد المائية
        sourcePuits: getCheckboxValue("sourcePuits"),
        sourceForage: getCheckboxValue("sourceForage"),
        sourcePompage: getCheckboxValue("sourcePompage"),
        sourceCrues: getCheckboxValue("sourceCrues"),
        sourceBarrage: getCheckboxValue("sourceBarrage"),
        sourceRetenu: getCheckboxValue("sourceRetenu"),
        sourceFoggara: getCheckboxValue("sourceFoggara"),
        sourceSource: getCheckboxValue("sourceSource"),
        sourceEpuration: getCheckboxValue("sourceEpuration"),
        sourceAutres: getCheckboxValue("sourceAutres"),
        irrigation: getRadioValue("irrigation"),
        areaIrriguee: getValue("areaIrriguee"),
        culturesIrriguees: getValue("culturesIrriguees"),
        
        // اليد العاملة
        coexplMalePlein: getValue("coexplMalePlein"),
        coexplFemalePlein: getValue("coexplFemalePlein"),
        coexplMalePartiel: getValue("coexplMalePartiel"),
        coexplFemalePartiel: getValue("coexplFemalePartiel"),
        ouvMaleP: getValue("ouvMaleP"),
        ouvFemaleP: getValue("ouvFemaleP"),
        ouvMaleJ: getValue("ouvMaleJ"),
        ouvFemaleJ: getValue("ouvFemaleJ"),
        etrangMaleP: getValue("etrangMaleP"),
        etrangFemaleP: getValue("etrangFemaleP"),
        etrangMaleJ: getValue("etrangMaleJ"),
        etrangFemaleJ: getValue("etrangFemaleJ"),
        indivMaleP: getValue("indivMaleP"),
        indivFemaleP: getValue("indivFemaleP"),
        childMale: getValue("childMale"),
        childFemale: getValue("childFemale"),
        sansEmploiM: getValue("sansEmploiM"),
        sansEmploiF: getValue("sansEmploiF"),
        filetSocial: getValue("filetSocial"),
        
        // الأسرة الفلاحية
        familyMale: getValue("familyMale"),
        familyFemale: getValue("familyFemale"),
        adulteMale: getValue("adulteMale"),
        adultesFemale: getValue("adultesFemale"),
        familyChildMale: getValue("familyChildMale"),
        familyChildFemale: getValue("familyChildFemale"),
        
        // المدخلات
        semencesSelectionnees: getCheckboxValue("semencesSelectionnees"),
        semencesCertifiees: getCheckboxValue("semencesCertifiees"),
        semencesBio: getCheckboxValue("semencesBio"),
        semencesFerme: getCheckboxValue("semencesFerme"),
        engraisAzotes: getCheckboxValue("engraisAzotes"),
        engraisPhosphates: getCheckboxValue("engraisPhosphates"),
        fumureOrganique: getCheckboxValue("fumureOrganique"),
        produitsPhyto: getCheckboxValue("produitsPhyto"),
        autresEngrais: getCheckboxValue("autresEngrais"),
        
        // التمويل
        financePropress: getCheckboxValue("financePropress"),
        financeCredit: getCheckboxValue("financeCredit"),
        financeSoutien: getCheckboxValue("financeSoutien"),
        financeEmprunt: getCheckboxValue("financeEmprunt"),
        typeCredit: getRadioValue("typeCredit"),
        typeSoutien: getRadioValue("typeSoutien"),
        assuranceAgricole: getRadioValue("assuranceAgricole"),
        compagnieAssurance: getRadioValue("compagnieAssurance"),
        assuranceTerre: getCheckboxValue("assuranceTerre"),
        assuranceMaterial: getCheckboxValue("assuranceMaterial"),
        assuranceMahassel: getCheckboxValue("assuranceMahassel"),
        assurancePersonnel: getCheckboxValue("assurancePersonnel"),
        assuranceMabani: getCheckboxValue("assuranceMabani"),
        assuranceMawachi: getCheckboxValue("assuranceMawachi"),
        
        // محيط المستثمرة
        fournisseurs: getRadioValue("fournisseurs"),
        proximiteBanque: getCheckboxValue("proximiteBanque"),
        proximitePoste: getCheckboxValue("proximitePoste"),
        proximiteVet: getCheckboxValue("proximiteVet"),
        proximiteAssurances: getCheckboxValue("proximiteAssurances"),
        proximiteLaboRatoire: getCheckboxValue("proximiteLaboRatoire"),
        proximiteBET: getCheckboxValue("proximiteBET"),
        proximiteCooperative: getCheckboxValue("proximiteCooperative"),
        proximiteFournisseur: getCheckboxValue("proximiteFournisseur"),
        ventePied: getCheckboxValue("ventePied"),
        venteGros: getCheckboxValue("venteGros"),
        venteIntermediaire: getCheckboxValue("venteIntermediaire"),
        venteDirecte: getCheckboxValue("venteDirecte"),
        marcheLocal: getCheckboxValue("marcheLocal"),
        marcheNational: getCheckboxValue("marcheNational"),
        marcheInternational: getCheckboxValue("marcheInternational"),
        cooperativeAgricole: getCheckboxValue("cooperativeAgricole"),
        associationProfessionnelle: getCheckboxValue("associationProfessionnelle"),
        groupeInteret: getCheckboxValue("groupeInteret"),
        conseilInterpro: getCheckboxValue("conseilInterpro"),
        autresAssociations: getCheckboxValue("autresAssociations")
    };
    return data;
}

// دوال مساعدة لجلب القيم
function getValue(id, defaultValue = "") {
    let element = document.getElementById(id);
    return element ? element.value : defaultValue;
}

function getRadioValue(name) {
    let radios = document.getElementsByName(name);
    for (let radio of radios) {
        if (radio.checked) return radio.value;
    }
    return "";
}

function getCheckboxValue(id) {
    let element = document.getElementById(id);
    return element ? element.checked : false;
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

// ===== تعبئة النموذج من بيانات المسودة =====
function populateFormFromDraft(draft) {
    // معلومات عامة
    setFieldValue("name", draft.name);
    setFieldValue("phone", draft.phone);
    setFieldValue("wilaya", draft.wilaya);
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
    setFieldValue("numExploitation", draft.numExploitation);
    
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
    setFieldValue("email", draft.email);
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
    setCheckboxValue("inscritCCW", draft.inscritCCW);
    setRadioValue("assuranceType26", draft.assuranceType26);
    setRadioValue("famille", draft.famille);
    setRadioValue("roleExploitant", draft.roleExploitant);
    setFieldValue("coExploitantsCount", draft.coExploitantsCount);
    setRadioValue("nature", draft.nature);
    
    // تعريف المستثمرة
    setFieldValue("nomExploitation", draft.nomExploitation);
    setFieldValue("adresseExploitation", draft.adresseExploitation);
    setRadioValue("statut", draft.statut);
    setFieldValue("longitude", draft.longitude);
    setFieldValue("latitude", draft.latitude);
    setRadioValue("vocation", draft.vocation);
    setRadioValue("terreAnimal", draft.terreAnimal);
    setRadioValue("access", draft.access);
    setRadioValue("electricite", draft.electricite);
    setRadioValue("telephone", draft.telephone);
    setRadioValue("typeTel", draft.typeTel);
    setRadioValue("internet", draft.internet);
    setRadioValue("internetAgricole", draft.internetAgricole);
    
    // المساحات
    setFieldValue("herbaceeIrriguee", draft.herbaceeIrriguee);
    setFieldValue("herbaceeSec", draft.herbaceeSec);
    setFieldValue("jacherIrriguee", draft.jacherIrriguee);
    setFieldValue("jacherSec", draft.jacherSec);
    setFieldValue("perenesIrriguee", draft.perenesIrriguee);
    setFieldValue("perenesSec", draft.perenesSec);
    setFieldValue("prairieIrriguee", draft.prairieIrriguee);
    setFieldValue("prairieSec", draft.prairieSec);
    setFieldValue("sauIrriguee", draft.sauIrriguee);
    setFieldValue("sauSec", draft.sauSec);
    setFieldValue("pacages", draft.pacages);
    setFieldValue("superficieNonProductive", draft.superficieNonProductive);
    setFieldValue("superficie", draft.superficie);
    setFieldValue("forets", draft.forets);
    setFieldValue("superficieTotale", draft.superficieTotale);
    setRadioValue("unBloc", draft.unBloc);
    setFieldValue("nombreBlocs", draft.nombreBlocs);
    setRadioValue("indusOccupants", draft.indusOccupants);
    setFieldValue("surfaceBatie", draft.surfaceBatie);
    setCheckboxValue("energieReseau", draft.energieReseau);
    setCheckboxValue("energieGroupe", draft.energieGroupe);
    setCheckboxValue("energieSolaire", draft.energieSolaire);
    setCheckboxValue("energieEolienne", draft.energieEolienne);
    setCheckboxValue("energieAutres", draft.energieAutres);
    
    // الأشجار المتفرقة
    setFieldValue("arbresOliviers", draft.arbresOliviers);
    setFieldValue("arbresFiguiers", draft.arbresFiguiers);
    setFieldValue("arbresNoyaux", draft.arbresNoyaux);
    setFieldValue("arbresVigne", draft.arbresVigne);
    setFieldValue("arbresGrenadiers", draft.arbresGrenadiers);
    setFieldValue("arbresAmandiers", draft.arbresAmandiers);
    setFieldValue("arbresCongnassiers", draft.arbresCongnassiers);
    setFieldValue("arbresPalmiers", draft.arbresPalmiers);
    setFieldValue("arbresCaroubier", draft.arbresCaroubier);
    setFieldValue("arbresAutres", draft.arbresAutres);
    
    // الممارسات الزراعية
    setRadioValue("biologique", draft.biologique);
    setRadioValue("certificatBio", draft.certificatBio);
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
    setFieldValue("dindes", draft.dindes);
    setFieldValue("autreAviculture", draft.autreAviculture);
    setFieldValue("mulets", draft.mulets);
    setFieldValue("anes", draft.anes);
    setFieldValue("lapins", draft.lapins);
    setFieldValue("ruchesModernes", draft.ruchesModernes);
    setFieldValue("ruchesModernesPleines", draft.ruchesModernesPleines);
    setFieldValue("ruchesTraditionnelles", draft.ruchesTraditionnelles);
    setFieldValue("ruchesTraditionnellesPleines", draft.ruchesTraditionnellesPleines);
    
    // المباني
    setFieldValue("batimentsHabitationNb", draft.batimentsHabitationNb);
    setFieldValue("batimentsHabitationSurface", draft.batimentsHabitationSurface);
    setFieldValue("bergeriesNb", draft.bergeriesNb);
    setFieldValue("bergeriesCapacite", draft.bergeriesCapacite);
    setFieldValue("etablesNb", draft.etablesNb);
    setFieldValue("etablesCapacite", draft.etablesCapacite);
    setFieldValue("ecurieschNb", draft.ecurieschNb);
    setFieldValue("ecurieschCapacite", draft.ecurieschCapacite);
    setFieldValue("PoulaillerNb", draft.PoulaillerNb);
    setFieldValue("PoulaillerCapacite", draft.PoulaillerCapacite);
    setFieldValue("PserresNb", draft.PserresNb);
    setFieldValue("PserresCapacite", draft.PserresCapacite);
    setFieldValue("serresTunnelNb", draft.serresTunnelNb);
    setFieldValue("serresTunnelSurface", draft.serresTunnelSurface);
    setFieldValue("mulserresNb", draft.mulserresNb);
    setFieldValue("mulserresSurface", draft.mulserresSurface);
    setFieldValue("BatimentsStockageNb", draft.BatimentsStockageNb);
    setFieldValue("BatimentsStockageCapacite", draft.BatimentsStockageCapacite);
    setFieldValue("BatimentsProdAgriNb", draft.BatimentsProdAgriNb);
    setFieldValue("BatimentsProdAgriCapacite", draft.BatimentsProdAgriCapacite);
    setFieldValue("uniteDeConNb", draft.uniteDeConNb);
    setFieldValue("uniteDeConCapacite", draft.uniteDeConCapacite);
    setFieldValue("uniteTransfoNb", draft.uniteTransfoNb);
    setFieldValue("uniteTransfoCapacite", draft.uniteTransfoCapacite);
    setFieldValue("centreCollecteLaitNb", draft.centreCollecteLaitNb);
    setFieldValue("centreCollecteLaitCapacite", draft.centreCollecteLaitCapacite);
    setFieldValue("autresBatimentsNb", draft.autresBatimentsNb);
    setFieldValue("autresBatimentsCapacite", draft.autresBatimentsCapacite);
    setFieldValue("chambresFroidesNb", draft.chambresFroidesNb);
    setFieldValue("chambresFroidesCapacite", draft.chambresFroidesCapacite);
    
    // العتاد
    setFieldValue("tracteursMoins45", draft.tracteursMoins45);
    setFieldValue("tracteurs40a90", draft.tracteurs40a90);
    setFieldValue("tracteurs65", draft.tracteurs65);
    setFieldValue("tracteursChenille80", draft.tracteursChenille80);
    setFieldValue("tracteursChenillePlus", draft.tracteursChenillePlus);
    setFieldValue("moissonneuse", draft.moissonneuse);
    setFieldValue("pompeEau", draft.pompeEau);
    setFieldValue("pompeElectrique", draft.pompeElectrique);
    setFieldValue("vehiculesLegers", draft.vehiculesLegers);
    setFieldValue("vehiculesLourds", draft.vehiculesLourds);
    setFieldValue("remorques", draft.remorques);
    setFieldValue("autreMateriel", draft.autreMateriel);
    
    // الموارد المائية
    setCheckboxValue("sourcePuits", draft.sourcePuits);
    setCheckboxValue("sourceForage", draft.sourceForage);
    setCheckboxValue("sourcePompage", draft.sourcePompage);
    setCheckboxValue("sourceCrues", draft.sourceCrues);
    setCheckboxValue("sourceBarrage", draft.sourceBarrage);
    setCheckboxValue("sourceRetenu", draft.sourceRetenu);
    setCheckboxValue("sourceFoggara", draft.sourceFoggara);
    setCheckboxValue("sourceSource", draft.sourceSource);
    setCheckboxValue("sourceEpuration", draft.sourceEpuration);
    setCheckboxValue("sourceAutres", draft.sourceAutres);
    setRadioValue("irrigation", draft.irrigation);
    setFieldValue("areaIrriguee", draft.areaIrriguee);
    setFieldValue("culturesIrriguees", draft.culturesIrriguees);
    
    // اليد العاملة
    setFieldValue("coexplMalePlein", draft.coexplMalePlein);
    setFieldValue("coexplFemalePlein", draft.coexplFemalePlein);
    setFieldValue("coexplMalePartiel", draft.coexplMalePartiel);
    setFieldValue("coexplFemalePartiel", draft.coexplFemalePartiel);
    setFieldValue("ouvMaleP", draft.ouvMaleP);
    setFieldValue("ouvFemaleP", draft.ouvFemaleP);
    setFieldValue("ouvMaleJ", draft.ouvMaleJ);
    setFieldValue("ouvFemaleJ", draft.ouvFemaleJ);
    setFieldValue("etrangMaleP", draft.etrangMaleP);
    setFieldValue("etrangFemaleP", draft.etrangFemaleP);
    setFieldValue("etrangMaleJ", draft.etrangMaleJ);
    setFieldValue("etrangFemaleJ", draft.etrangFemaleJ);
    setFieldValue("indivMaleP", draft.indivMaleP);
    setFieldValue("indivFemaleP", draft.indivFemaleP);
    setFieldValue("childMale", draft.childMale);
    setFieldValue("childFemale", draft.childFemale);
    setFieldValue("sansEmploiM", draft.sansEmploiM);
    setFieldValue("sansEmploiF", draft.sansEmploiF);
    setFieldValue("filetSocial", draft.filetSocial);
    
    // الأسرة الفلاحية
    setFieldValue("familyMale", draft.familyMale);
    setFieldValue("familyFemale", draft.familyFemale);
    setFieldValue("adulteMale", draft.adulteMale);
    setFieldValue("adultesFemale", draft.adultesFemale);
    setFieldValue("familyChildMale", draft.familyChildMale);
    setFieldValue("familyChildFemale", draft.familyChildFemale);
    
    // المدخلات
    setCheckboxValue("semencesSelectionnees", draft.semencesSelectionnees);
    setCheckboxValue("semencesCertifiees", draft.semencesCertifiees);
    setCheckboxValue("semencesBio", draft.semencesBio);
    setCheckboxValue("semencesFerme", draft.semencesFerme);
    setCheckboxValue("engraisAzotes", draft.engraisAzotes);
    setCheckboxValue("engraisPhosphates", draft.engraisPhosphates);
    setCheckboxValue("fumureOrganique", draft.fumureOrganique);
    setCheckboxValue("produitsPhyto", draft.produitsPhyto);
    setCheckboxValue("autresEngrais", draft.autresEngrais);
    
    // التمويل
    setCheckboxValue("financePropress", draft.financePropress);
    setCheckboxValue("financeCredit", draft.financeCredit);
    setCheckboxValue("financeSoutien", draft.financeSoutien);
    setCheckboxValue("financeEmprunt", draft.financeEmprunt);
    setRadioValue("typeCredit", draft.typeCredit);
    setRadioValue("typeSoutien", draft.typeSoutien);
    setRadioValue("assuranceAgricole", draft.assuranceAgricole);
    setRadioValue("compagnieAssurance", draft.compagnieAssurance);
    setCheckboxValue("assuranceTerre", draft.assuranceTerre);
    setCheckboxValue("assuranceMaterial", draft.assuranceMaterial);
    setCheckboxValue("assuranceMahassel", draft.assuranceMahassel);
    setCheckboxValue("assurancePersonnel", draft.assurancePersonnel);
    setCheckboxValue("assuranceMabani", draft.assuranceMabani);
    setCheckboxValue("assuranceMawachi", draft.assuranceMawachi);
    
    // محيط المستثمرة
    setRadioValue("fournisseurs", draft.fournisseurs);
    setCheckboxValue("proximiteBanque", draft.proximiteBanque);
    setCheckboxValue("proximitePoste", draft.proximitePoste);
    setCheckboxValue("proximiteVet", draft.proximiteVet);
    setCheckboxValue("proximiteAssurances", draft.proximiteAssurances);
    setCheckboxValue("proximiteLaboRatoire", draft.proximiteLaboRatoire);
    setCheckboxValue("proximiteBET", draft.proximiteBET);
    setCheckboxValue("proximiteCooperative", draft.proximiteCooperative);
    setCheckboxValue("proximiteFournisseur", draft.proximiteFournisseur);
    setCheckboxValue("ventePied", draft.ventePied);
    setCheckboxValue("venteGros", draft.venteGros);
    setCheckboxValue("venteIntermediaire", draft.venteIntermediaire);
    setCheckboxValue("venteDirecte", draft.venteDirecte);
    setCheckboxValue("marcheLocal", draft.marcheLocal);
    setCheckboxValue("marcheNational", draft.marcheNational);
    setCheckboxValue("marcheInternational", draft.marcheInternational);
    setCheckboxValue("cooperativeAgricole", draft.cooperativeAgricole);
    setCheckboxValue("associationProfessionnelle", draft.associationProfessionnelle);
    setCheckboxValue("groupeInteret", draft.groupeInteret);
    setCheckboxValue("conseilInterpro", draft.conseilInterpro);
    setCheckboxValue("autresAssociations", draft.autresAssociations);
    
    // إظهار/إخفاء حقل الشعبة التعاقدية
    let filiereGroup = document.getElementById("filiereContractuelleGroup");
    if (filiereGroup && draft.contractuelle === "نعم") {
        filiereGroup.style.display = "block";
    } else if (filiereGroup) {
        filiereGroup.style.display = "none";
    }
}

// ===== حفظ مسودة =====
function saveDraft() {
    let data = collectFormData();
    
    if (currentDraftId) {
        let index = drafts.findIndex(d => d.id == currentDraftId);
        if (index !== -1) {
            drafts[index] = data;
        } else {
            drafts.push(data);
        }
    } else {
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
                <p><i class="fas fa-map-marker-alt"></i> الولاية: ${d.wilaya2 || d.wilaya || "غير محدد"}</p>
                <p><i class="fas fa-phone"></i> الهاتف: ${d.phone || d.phone1 || "غير محدد"}</p>
                <p><i class="fas fa-ruler"></i> المساحة: ${d.superficie || "0"} هكتار</p>
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
    
    let passYear = document.getElementById('passYear');
    if (passYear) passYear.value = "2025";
    
    currentDraftId = null;
    editingID = null;
    
    let filiereGroup = document.getElementById("filiereContractuelleGroup");
    if (filiereGroup) filiereGroup.style.display = "none";
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
                <p><i class="fas fa-map-marker-alt"></i> الولاية: ${f.wilaya2 || f.wilaya || "غير محدد"}</p>
                <p><i class="fas fa-phone"></i> الهاتف: ${f.phone || f.phone1 || "غير محدد"}</p>
                <p><i class="fas fa-ruler"></i> المساحة: ${f.superficie || "0"} هكتار</p>
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

// ===== بروفايل الفلاح الكامل (جميع الحقول الـ 171+) =====
function viewProfile(id) {
    let f = farmers.find(x => x.id == id);
    if (!f) return;
    
    let profileName = document.getElementById("profileName");
    let profileBadge = document.getElementById("profileBadge");
    let profileSummary = document.getElementById("profileSummary");
    let profileDetails = document.getElementById("profileDetails");
    
    if (profileName) profileName.innerHTML = f.name || "غير محدد";
    if (profileBadge) profileBadge.innerHTML = `فلاح مسجل منذ ${new Date(f.date).toLocaleDateString('ar-DZ')}`;
    
    // حساب إجمالي المواشي
    let totalAnimals = (parseInt(f.bovins) || 0) + (parseInt(f.ovins) || 0) + (parseInt(f.caprins) || 0) + 
                       (parseInt(f.camelins) || 0) + (parseInt(f.equins) || 0) + (parseInt(f.mulets) || 0) + 
                       (parseInt(f.anes) || 0) + (parseInt(f.pouletsChair) || 0) + (parseInt(f.dindes) || 0) +
                       (parseInt(f.lapins) || 0);
    
    // حساب إجمالي المساحات
    let totalHerbacee = (parseFloat(f.herbaceeIrriguee) || 0) + (parseFloat(f.herbaceeSec) || 0);
    let totalJacher = (parseFloat(f.jacherIrriguee) || 0) + (parseFloat(f.jacherSec) || 0);
    let totalPerenes = (parseFloat(f.perenesIrriguee) || 0) + (parseFloat(f.perenesSec) || 0);
    let totalPrairie = (parseFloat(f.prairieIrriguee) || 0) + (parseFloat(f.prairieSec) || 0);
    let totalSAU = (parseFloat(f.sauIrriguee) || 0) + (parseFloat(f.sauSec) || 0);
    
    if (profileSummary) {
        profileSummary.innerHTML = `
            <div class="profile-summary-card">
                <div class="profile-summary-icon"><i class="fas fa-user"></i></div>
                <div class="profile-summary-label">الاسم الكامل</div>
                <div class="profile-summary-value">${f.exploitantNom || ""} ${f.exploitantPrenom || ""}</div>
            </div>
            <div class="profile-summary-card">
                <div class="profile-summary-icon"><i class="fas fa-ruler-combined"></i></div>
                <div class="profile-summary-label">المساحة الإجمالية (SAT)</div>
                <div class="profile-summary-value">${f.superficie || "0"} هكتار</div>
            </div>
            <div class="profile-summary-card">
                <div class="profile-summary-icon"><i class="fas fa-paw"></i></div>
                <div class="profile-summary-label">إجمالي المواشي</div>
                <div class="profile-summary-value">${totalAnimals} رأس</div>
            </div>
            <div class="profile-summary-card">
                <div class="profile-summary-icon"><i class="fas fa-phone"></i></div>
                <div class="profile-summary-label">رقم الهاتف</div>
                <div class="profile-summary-value">${f.phone || f.phone1 || "غير محدد"}</div>
            </div>
        `;
    }
    
    if (profileDetails) {
        profileDetails.innerHTML = `
            <!-- ========== القسم 1: المعلومات العامة (الحقول 1-12) ========== -->
            <div class="profile-section">
                <div class="profile-section-title">
                    <i class="fas fa-info-circle"></i> I - المعلومات العامة
                    <span class="section-badge">Générales</span>
                </div>
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-item-label">1. تاريخ المرور</div>
                        <div class="profile-item-value">${f.passDay || "00"}/${f.passMonth || "00"}/${f.passYear || "2025"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">2. لقب المحصي</div>
                        <div class="profile-item-value">${f.recenseurNom || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">3. اسم المحصي</div>
                        <div class="profile-item-value">${f.recenseurPrenom || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">4. تاريخ المراقبة</div>
                        <div class="profile-item-value">${f.controlDay || "00"}/${f.controlMonth || "00"}/${f.controlYear || ""}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">5. لقب المراقب</div>
                        <div class="profile-item-value">${f.controleurNom || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">6. اسم المراقب</div>
                        <div class="profile-item-value">${f.controleurPrenom || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">7. الولاية</div>
                        <div class="profile-item-value">${f.wilaya2 || f.wilaya || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">8. البلدية</div>
                        <div class="profile-item-value">${f.commune || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">9. رمز البلدية/الولاية</div>
                        <div class="profile-item-value">${f.code1 || ""}${f.code2 || ""}${f.code3 || ""}${f.code4 || ""}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">10. اسم المكان/المنطقة</div>
                        <div class="profile-item-value">${f.lieuDit || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">11. رقم المنطقة</div>
                        <div class="profile-item-value">${f.district1 || ""}${f.district2 || ""}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">12. رقم المستثمرة</div>
                        <div class="profile-item-value">${f.numExploitation || "غير محدد"}</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 2: تعريف المستثمر (الحقول 13-31) ========== -->
            <div class="profile-section">
                <div class="profile-section-title">
                    <i class="fas fa-user-tie"></i> II - تعريف المستثمر (الفلاح)
                    <span class="section-badge">Identification de l'exploitant</span>
                </div>
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-item-label">13. اللقب</div>
                        <div class="profile-item-value">${f.exploitantNom || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">14. الاسم</div>
                        <div class="profile-item-value">${f.exploitantPrenom || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">15. سنة الميلاد</div>
                        <div class="profile-item-value">${f.birthYear || "غير محدد"} (العمر: ${f.birthYear ? (2025 - parseInt(f.birthYear)) : "?"} سنة)</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">16. الجنس</div>
                        <div class="profile-item-value">${f.sexe === 'male' ? 'ذكر ♂' : f.sexe === 'female' ? 'أنثى ♀' : 'غير محدد'}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">17. المستوى التعليمي</div>
                        <div class="profile-item-value">${f.education || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">18. مستوى التكوين الفلاحي</div>
                        <div class="profile-item-value">${f.formation || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">19. عنوان المستغل الفلاحي</div>
                        <div class="profile-item-value">${f.adresse || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">20. رقم الهاتف</div>
                        <div class="profile-item-value">${f.phone1 || ""}${f.phone2 || ""}${f.phone3 || ""}${f.phone4 || ""}${f.phone5 || ""}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">21. البريد الإلكتروني</div>
                        <div class="profile-item-value">${f.email || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">22. رقم التعريف الوطني (NIN)</div>
                        <div class="profile-item-value">${f.nin1 || ""}${f.nin2 || ""}${f.nin3 || ""}${f.nin4 || ""}${f.nin5 || ""}${f.nin6 || ""}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">23. رقم التعريف الإحصائي (NIS)</div>
                        <div class="profile-item-value">${f.nis1 || ""}${f.nis2 || ""}${f.nis3 || ""}${f.nis4 || ""}${f.nis5 || ""}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">24. رقم بطاقة الفلاح</div>
                        <div class="profile-item-value">${f.carte1 || ""}${f.carte2 || ""}${f.carte3 || ""}${f.carte4 || ""}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">25. التسجيل في المنظمات</div>
                        <div class="profile-item-value">
                            ${f.inscritCAW ? 'CAW ✓ ' : ''}${f.inscritCAPA ? 'CAPA ✓ ' : ''}${f.inscritUNPA ? 'UNPA ✓ ' : ''}${f.inscritCARM ? 'CARM ✓ ' : ''}${f.inscritCCW ? 'CCW ✓ ' : ''}
                            ${!f.inscritCAW && !f.inscritCAPA && !f.inscritUNPA && !f.inscritCARM && !f.inscritCCW ? 'غير مسجل' : ''}
                        </div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">26. نوع التأمين</div>
                        <div class="profile-item-value">${f.assuranceType26 || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">28. منحدر من عائلة فلاحية</div>
                        <div class="profile-item-value">${f.famille === 'نعم' ? 'نعم ✓' : f.famille === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">29. الفلاح الرئيسي</div>
                        <div class="profile-item-value">${f.roleExploitant || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">30. عدد المتداولين (الشركاء)</div>
                        <div class="profile-item-value">${f.coExploitantsCount || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">31. طبيعة الفلاح</div>
                        <div class="profile-item-value">${f.nature || "غير محدد"}</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 3: تعريف المستثمرة (الحقول 32-43) ========== -->
            <div class="profile-section">
                <div class="profile-section-title">
                    <i class="fas fa-tractor"></i> III - تعريف المستثمرة
                    <span class="section-badge">Identification de l'exploitation</span>
                </div>
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-item-label">32. اسم المستثمرة</div>
                        <div class="profile-item-value">${f.nomExploitation || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">33. عنوان المستثمرة</div>
                        <div class="profile-item-value">${f.adresseExploitation || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">34. الوضع القانوني</div>
                        <div class="profile-item-value">${f.statut || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">35. الإحداثيات الجغرافية</div>
                        <div class="profile-item-value">${f.latitude || "..."} , ${f.longitude || "..."}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">36. نشاط المستثمرة</div>
                        <div class="profile-item-value">${f.vocation === 'نباتي' ? '🌱 نباتي' : f.vocation === 'حيواني' ? '🐄 حيواني' : f.vocation === 'مختلط' ? '🌾🐄 مختلط' : 'غير محدد'}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">37. إذا حيواني: هل لديه أراضٍ؟</div>
                        <div class="profile-item-value">${f.terreAnimal || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">38. إمكانية الوصول</div>
                        <div class="profile-item-value">${f.access || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">39. متصلة بشبكة الكهرباء؟</div>
                        <div class="profile-item-value">${f.electricite === 'نعم' ? 'نعم ✓' : f.electricite === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">40. متصلة بشبكة الهاتف؟</div>
                        <div class="profile-item-value">${f.telephone === 'نعم' ? 'نعم ✓' : f.telephone === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">41. نوع الهاتف</div>
                        <div class="profile-item-value">${f.typeTel || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">42. متصلة بالإنترنت؟</div>
                        <div class="profile-item-value">${f.internet === 'نعم' ? 'نعم ✓' : f.internet === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">43. استخدام الإنترنت للفلاحة؟</div>
                        <div class="profile-item-value">${f.internetAgricole === 'نعم' ? 'نعم ✓' : f.internetAgricole === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 4: مساحة المستثمرة (الحقول 47-63) ========== -->
            <div class="profile-section">
                <div class="profile-section-title">
                    <i class="fas fa-ruler-combined"></i> IV - مساحة المستثمرة (هكتار)
                    <span class="section-badge">Superficie de l'exploitation</span>
                </div>
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-item-label">47. محاصيل عشبية</div>
                        <div class="profile-item-value">مروية: ${f.herbaceeIrriguee || "0"} | جافة: ${f.herbaceeSec || "0"} | المجموع: ${totalHerbacee}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">48. أراضي مستريحة (البور)</div>
                        <div class="profile-item-value">مروية: ${f.jacherIrriguee || "0"} | جافة: ${f.jacherSec || "0"} | المجموع: ${totalJacher}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">49. محاصيل دائمة</div>
                        <div class="profile-item-value">مروية: ${f.perenesIrriguee || "0"} | جافة: ${f.perenesSec || "0"} | المجموع: ${totalPerenes}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">50. مروج طبيعية</div>
                        <div class="profile-item-value">مروية: ${f.prairieIrriguee || "0"} | جافة: ${f.prairieSec || "0"} | المجموع: ${totalPrairie}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">51. المساحة الفلاحية المستخدمة SAU</div>
                        <div class="profile-item-value">مروية: ${f.sauIrriguee || "0"} | جافة: ${f.sauSec || "0"} | المجموع: ${totalSAU}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">52. المراعي والمسارح</div>
                        <div class="profile-item-value">${f.pacages || "0"} هكتار</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">53. مساحات غير منتجة</div>
                        <div class="profile-item-value">${f.superficieNonProductive || "0"} هكتار</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">54. المساحة الفلاحية الإجمالية SAT</div>
                        <div class="profile-item-value"><strong>${f.superficie || "0"}</strong> هكتار</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">55. أراضي الغابات</div>
                        <div class="profile-item-value">${f.forets || "0"} هكتار</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">56. المساحة الإجمالية ST</div>
                        <div class="profile-item-value">${f.superficieTotale || "0"} هكتار</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">57. المستثمرة قطعة واحدة؟</div>
                        <div class="profile-item-value">${f.unBloc === 'نعم' ? 'نعم ✓' : f.unBloc === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">58. عدد القطع</div>
                        <div class="profile-item-value">${f.nombreBlocs || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">59. وجود سكان غير شرعيين؟</div>
                        <div class="profile-item-value">${f.indusOccupants === 'نعم' ? 'نعم ✓' : f.indusOccupants === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">61. المساحة المبنية المشغولة</div>
                        <div class="profile-item-value">${f.surfaceBatie || "0"} م²</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">63. مصادر الطاقة</div>
                        <div class="profile-item-value">
                            ${f.energieReseau ? 'شبكة كهربائية ✓ ' : ''}${f.energieGroupe ? 'مولد ✓ ' : ''}${f.energieSolaire ? 'شمسية ✓ ' : ''}${f.energieEolienne ? 'رياح ✓ ' : ''}${f.energieAutres ? 'أخرى ✓ ' : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 5: الأشجار المتفرقة (الحقول 65-74) ========== -->
            <div class="profile-section">
                <div class="profile-section-title">
                    <i class="fas fa-tree"></i> V - الأشجار المتفرقة (عدد الأشجار)
                    <span class="section-badge">Arbres épars</span>
                </div>
                <div class="profile-grid">
                    <div class="profile-item"><div class="profile-item-label">65. أشجار الزيتون</div><div class="profile-item-value">${f.arbresOliviers || "0"}</div></div>
                    <div class="profile-item"><div class="profile-item-label">66. أشجار التين</div><div class="profile-item-value">${f.arbresFiguiers || "0"}</div></div>
                    <div class="profile-item"><div class="profile-item-label">67. ذوات النوى والبذور</div><div class="profile-item-value">${f.arbresNoyaux || "0"}</div></div>
                    <div class="profile-item"><div class="profile-item-label">68. أشجار العنب</div><div class="profile-item-value">${f.arbresVigne || "0"}</div></div>
                    <div class="profile-item"><div class="profile-item-label">69. الرمان</div><div class="profile-item-value">${f.arbresGrenadiers || "0"}</div></div>
                    <div class="profile-item"><div class="profile-item-label">70. اللوز</div><div class="profile-item-value">${f.arbresAmandiers || "0"}</div></div>
                    <div class="profile-item"><div class="profile-item-label">71. أشجار السفرجل</div><div class="profile-item-value">${f.arbresCongnassiers || "0"}</div></div>
                    <div class="profile-item"><div class="profile-item-label">72. نخيل التمر</div><div class="profile-item-value">${f.arbresPalmiers || "0"}</div></div>
                    <div class="profile-item"><div class="profile-item-label">73. الخروب</div><div class="profile-item-value">${f.arbresCaroubier || "0"}</div></div>
                    <div class="profile-item"><div class="profile-item-label">74. أشجار أخرى</div><div class="profile-item-value">${f.arbresAutres || "0"}</div></div>
                </div>
            </div>
            
            <!-- ========== القسم 6: الممارسات الزراعية (الحقول 75-81) ========== -->
            <div class="profile-section">
                <div class="profile-section-title">
                    <i class="fas fa-flask"></i> VI - الممارسات الزراعية
                    <span class="section-badge">Pratiques agricoles</span>
                </div>
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-item-label">75. الزراعة البيولوجية</div>
                        <div class="profile-item-value">${f.biologique === 'نعم' ? 'نعم ✓' : f.biologique === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">76. هل لديك شهادة؟</div>
                        <div class="profile-item-value">${f.certificatBio === 'نعم' ? 'نعم ✓' : f.certificatBio === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">77. الاستزراع المائي</div>
                        <div class="profile-item-value">${f.aquaculture === 'نعم' ? 'نعم ✓' : f.aquaculture === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">78. تربية الحلزون</div>
                        <div class="profile-item-value">${f.helicicult === 'نعم' ? 'نعم ✓' : f.helicicult === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">79. زراعة الفطريات</div>
                        <div class="profile-item-value">${f.myciculture === 'نعم' ? 'نعم ✓' : f.myciculture === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">80. الزراعة التعاقدية</div>
                        <div class="profile-item-value">${f.contractuelle === 'نعم' ? 'نعم ✓' : f.contractuelle === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">81. الشعبة المتعاقد عليها</div>
                        <div class="profile-item-value">
                            ${f.filiereTomate ? 'طماطم صناعية ' : ''}${f.filiereHuile ? 'حبوب ' : ''}${f.filiereAviculture ? 'دواجن ' : ''}
                            ${f.filiereMaraichage ? 'خضروات ' : ''}${f.filierePomme ? 'بطاطا ' : ''}${f.filiereAutre ? 'أخرى ' : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 7: المواشي (الحقول 82-105) ========== -->
            <div class="profile-section">
                <div class="profile-section-title">
                    <i class="fas fa-paw"></i> VII - المواشي
                    <span class="section-badge">Cheptel</span>
                </div>
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-item-label">82. الأبقار (Bovins)</div>
                        <div class="profile-item-value">الإجمالي: ${f.bovins || "0"} | BLL: ${f.bovinsBLL || "0"} | BLA: ${f.bovinsBLA || "0"} | BLM: ${f.bovinsBLM || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">86. الأغنام (Ovins)</div>
                        <div class="profile-item-value">الإجمالي: ${f.ovins || "0"} | منها النعاج: ${f.ovinsBrebis || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">88. الماعز (Caprins)</div>
                        <div class="profile-item-value">الإجمالي: ${f.caprins || "0"} | منها المعزات: ${f.caprinsChevres || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">90/91. الإبل (Camelins)</div>
                        <div class="profile-item-value">الإجمالي: ${f.camelins || "0"} | منها النوق: ${f.camelinsFemelles || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">92. الخيول (Equins)</div>
                        <div class="profile-item-value">الإجمالي: ${f.equins || "0"} | منها الأفراس: ${f.equinsFemelles || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">94. الدواجن (Aviculture)</div>
                        <div class="profile-item-value">دجاج: ${f.pouletsChair || "0"} | ديوك رومي: ${f.dindes || "0"} | أخرى: ${f.autreAviculture || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">97/98. البغال والحمير</div>
                        <div class="profile-item-value">بغال: ${f.mulets || "0"} | حمير: ${f.anes || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">99. الأرانب</div>
                        <div class="profile-item-value">${f.lapins || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">100-105. تربية النحل</div>
                        <div class="profile-item-value">خلايا عصرية: ${f.ruchesModernes || "0"} (ممتلئة: ${f.ruchesModernesPleines || "0"}) | تقليدية: ${f.ruchesTraditionnelles || "0"} (ممتلئة: ${f.ruchesTraditionnellesPleines || "0"})</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 8: مباني الاستغلال (الحقول 106-122) ========== -->
            <div class="profile-section">
                <div class="profile-section-title">
                    <i class="fas fa-warehouse"></i> VIII - مباني الاستغلال
                    <span class="section-badge">Bâtiments d'exploitation</span>
                </div>
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-item-label">106. مباني سكنية</div>
                        <div class="profile-item-value">العدد: ${f.batimentsHabitationNb || "0"} | المساحة: ${f.batimentsHabitationSurface || "0"} م²</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">107/108. مباني تربية الحيوانات</div>
                        <div class="profile-item-value">حظائر: ${f.bergeriesNb || "0"} (${f.bergeriesCapacite || "0"} م³) | إسطبلات: ${f.etablesNb || "0"} (${f.etablesCapacite || "0"} م³)</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">109. اسطبل خيول</div>
                        <div class="profile-item-value">العدد: ${f.ecurieschNb || "0"} | السعة: ${f.ecurieschCapacite || "0"} م³</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">110. مدجنة (مبنى صلب)</div>
                        <div class="profile-item-value">العدد: ${f.PoulaillerNb || "0"} | السعة: ${f.PoulaillerCapacite || "0"} م³</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">111. مدجنة تحت البيوت البلاستيكية</div>
                        <div class="profile-item-value">العدد: ${f.PserresNb || "0"} | السعة: ${f.PserresCapacite || "0"} م³</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">112. بيوت بلاستيكية نفقية</div>
                        <div class="profile-item-value">العدد: ${f.serresTunnelNb || "0"} | المساحة: ${f.serresTunnelSurface || "0"} م²</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">113. بيوت متعددة القبب</div>
                        <div class="profile-item-value">العدد: ${f.mulserresNb || "0"} | المساحة: ${f.mulserresSurface || "0"} م²</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">114. مباني التخزين</div>
                        <div class="profile-item-value">العدد: ${f.BatimentsStockageNb || "0"} | السعة: ${f.BatimentsStockageCapacite || "0"} م³</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">115. مباني تخزين المنتجات الفلاحية</div>
                        <div class="profile-item-value">العدد: ${f.BatimentsProdAgriNb || "0"} | السعة: ${f.BatimentsProdAgriCapacite || "0"} م³</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">118. وحدة التوظيب</div>
                        <div class="profile-item-value">العدد: ${f.uniteDeConNb || "0"} | السعة: ${f.uniteDeConCapacite || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">119. وحدة التحول</div>
                        <div class="profile-item-value">العدد: ${f.uniteTransfoNb || "0"} | السعة: ${f.uniteTransfoCapacite || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">120. مركز جمع الحليب</div>
                        <div class="profile-item-value">العدد: ${f.centreCollecteLaitNb || "0"} | السعة: ${f.centreCollecteLaitCapacite || "0"} لتر/يوم</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">121. مباني أخرى</div>
                        <div class="profile-item-value">العدد: ${f.autresBatimentsNb || "0"} | السعة: ${f.autresBatimentsCapacite || "0"} م³</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">122. غرف التبريد</div>
                        <div class="profile-item-value">العدد: ${f.chambresFroidesNb || "0"} | السعة: ${f.chambresFroidesCapacite || "0"} م³</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 9: العتاد الفلاحي ========== -->
            <div class="profile-section">
                <div class="profile-section-title">
                    <i class="fas fa-tractor"></i> IX - العتاد الفلاحي
                    <span class="section-badge">Matériel agricole</span>
                </div>
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-item-label">الجرارات ذات العجلات</div>
                        <div class="profile-item-value">≤45 CV: ${f.tracteursMoins45 || "0"} | 45-65 CV: ${f.tracteurs40a90 || "0"} | >65 CV: ${f.tracteurs65 || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">الجرارات الزاحفة</div>
                        <div class="profile-item-value">≤80 CV: ${f.tracteursChenille80 || "0"} | >80 CV: ${f.tracteursChenillePlus || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">آلات الحصاد</div>
                        <div class="profile-item-value">${f.moissonneuse || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">المضخات</div>
                        <div class="profile-item-value">موتوبومب: ${f.pompeEau || "0"} | إلكتروبومب: ${f.pompeElectrique || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">وسائل النقل</div>
                        <div class="profile-item-value">خفيفة: ${f.vehiculesLegers || "0"} | ثقيلة: ${f.vehiculesLourds || "0"} | مقطورات: ${f.remorques || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">معدات أخرى</div>
                        <div class="profile-item-value">${f.autreMateriel || "غير محدد"}</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 10: الموارد المائية (الحقول 127-144) ========== -->
            <div class="profile-section">
                <div class="profile-section-title">
                    <i class="fas fa-water"></i> X - الموارد المائية
                    <span class="section-badge">Ressources en eau</span>
                </div>
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-item-label">مصادر المياه</div>
                        <div class="profile-item-value">
                            ${f.sourcePuits ? '127- بئر ✓ ' : ''}${f.sourceForage ? '128- ثقب ✓ ' : ''}${f.sourcePompage ? '129- ضخ من الوادي ✓ ' : ''}
                            ${f.sourceCrues ? '130- فيض الوادي ✓ ' : ''}${f.sourceBarrage ? '131- سد صغير ✓ ' : ''}${f.sourceRetenu ? '132- خزان التلال ✓ ' : ''}
                            ${f.sourceFoggara ? '133- الفقارة ✓ ' : ''}${f.sourceSource ? '134- منبع ✓ ' : ''}${f.sourceEpuration ? '135- محطة تصفية ✓ ' : ''}
                            ${f.sourceAutres ? '136- مصادر أخرى ✓ ' : ''}
                        </div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">طريقة الري</div>
                        <div class="profile-item-value">${f.irrigation || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">المساحة المسقية</div>
                        <div class="profile-item-value">${f.areaIrriguee || "0"} هكتار</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">المزروعات المسقية</div>
                        <div class="profile-item-value">${f.culturesIrriguees || "غير محدد"}</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 11: اليد العاملة (الحقول 147-156) ========== -->
            <div class="profile-section">
                <div class="profile-section-title">
                    <i class="fas fa-users"></i> XI - اليد العاملة
                    <span class="section-badge">Main d'œuvre</span>
                </div>
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-item-label">147. المستثمرون المشاركون</div>
                        <div class="profile-item-value">ذكور دوام كلي: ${f.coexplMalePlein || "0"} | إناث دوام كلي: ${f.coexplFemalePlein || "0"} | ذكور جزئي: ${f.coexplMalePartiel || "0"} | إناث جزئي: ${f.coexplFemalePartiel || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">148. العمال الفلاحيون</div>
                        <div class="profile-item-value">ذكور دوام كلي: ${f.ouvMaleP || "0"} | إناث دوام كلي: ${f.ouvFemaleP || "0"} | ذكور جزئي: ${f.ouvMaleJ || "0"} | إناث جزئي: ${f.ouvFemaleJ || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">149. العمال الأجانب</div>
                        <div class="profile-item-value">ذكور دوام كلي: ${f.etrangMaleP || "0"} | إناث دوام كلي: ${f.etrangFemaleP || "0"} | ذكور جزئي: ${f.etrangMaleJ || "0"} | إناث جزئي: ${f.etrangFemaleJ || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">150. فلاح فردي</div>
                        <div class="profile-item-value">ذكور: ${f.indivMaleP || "0"} | إناث: ${f.indivFemaleP || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">152. أطفال (-15 سنة)</div>
                        <div class="profile-item-value">ذكور: ${f.childMale || "0"} | إناث: ${f.childFemale || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">155. بدون عمل</div>
                        <div class="profile-item-value">ذكور: ${f.sansEmploiM || "0"} | إناث: ${f.sansEmploiF || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">156. المستفيدون من الشبكة الاجتماعية</div>
                        <div class="profile-item-value">${f.filetSocial || "0"}</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 12: الأسرة الفلاحية (الحقول 157-159) ========== -->
            <div class="profile-section">
                <div class="profile-section-title">
                    <i class="fas fa-home"></i> XII - الأسرة الفلاحية
                    <span class="section-badge">Ménage agricole</span>
                </div>
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-item-label">157. عدد الأشخاص</div>
                        <div class="profile-item-value">ذكور: ${f.familyMale || "0"} | إناث: ${f.familyFemale || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">158. كبار (+15 سنة)</div>
                        <div class="profile-item-value">ذكور: ${f.adulteMale || "0"} | إناث: ${f.adultesFemale || "0"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">159. أطفال (-15 سنة)</div>
                        <div class="profile-item-value">ذكور: ${f.familyChildMale || "0"} | إناث: ${f.familyChildFemale || "0"}</div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 13: استخدام المدخلات (الحقل 160) ========== -->
            <div class="profile-section">
                <div class="profile-section-title">
                    <i class="fas fa-seedling"></i> XIII - استخدام المدخلات
                    <span class="section-badge">Intrants</span>
                </div>
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-item-label">160. البذور</div>
                        <div class="profile-item-value">
                            ${f.semencesSelectionnees ? 'بذور مختارة ✓ ' : ''}${f.semencesCertifiees ? 'بذور معتمدة ✓ ' : ''}
                            ${f.semencesBio ? 'بيولوجية ✓ ' : ''}${f.semencesFerme ? 'بذور المزرعة ✓ ' : ''}
                        </div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">الأسمدة والمبيدات</div>
                        <div class="profile-item-value">
                            ${f.engraisAzotes ? 'أسمدة آزوتية ✓ ' : ''}${f.engraisPhosphates ? 'أسمدة فوسفاتية ✓ ' : ''}
                            ${f.fumureOrganique ? 'سماد عضوي ✓ ' : ''}${f.produitsPhyto ? 'مبيدات ✓ ' : ''}
                            ${f.autresEngrais ? 'أسمدة أخرى ✓ ' : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 14: تمويل النشاط الفلاحي والتأمينات (الحقول 161-166) ========== -->
            <div class="profile-section">
                <div class="profile-section-title">
                    <i class="fas fa-coins"></i> XIV - التمويل والتأمينات
                    <span class="section-badge">Financement & Assurances</span>
                </div>
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-item-label">161. مصادر التمويل</div>
                        <div class="profile-item-value">
                            ${f.financePropress ? 'موارد ذاتية ✓ ' : ''}${f.financeCredit ? 'قرض بنكي ✓ ' : ''}
                            ${f.financeSoutien ? 'دعم عمومي ✓ ' : ''}${f.financeEmprunt ? 'استلاف من الغير ✓ ' : ''}
                        </div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">162. نوع القرض البنكي</div>
                        <div class="profile-item-value">${f.typeCredit || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">163. نوع الدعم العمومي</div>
                        <div class="profile-item-value">${f.typeSoutien || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">164. التأمين الفلاحي</div>
                        <div class="profile-item-value">${f.assuranceAgricole === 'نعم' ? 'نعم ✓' : f.assuranceAgricole === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">165. شركة التأمين</div>
                        <div class="profile-item-value">${f.compagnieAssurance || "غير محدد"}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">166. نوع التأمين</div>
                        <div class="profile-item-value">
                            ${f.assuranceTerre ? 'الأرض ✓ ' : ''}${f.assuranceMaterial ? 'المعدات ✓ ' : ''}${f.assuranceMahassel ? 'المحاصيل ✓ ' : ''}
                            ${f.assurancePersonnel ? 'العمال ✓ ' : ''}${f.assuranceMabani ? 'المباني ✓ ' : ''}${f.assuranceMawachi ? 'المواشي ✓ ' : ''}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ========== القسم 15: محيط المستثمرة (الحقول 167-171) ========== -->
            <div class="profile-section">
                <div class="profile-section-title">
                    <i class="fas fa-building"></i> XV - محيط المستثمرة
                    <span class="section-badge">Environnement</span>
                </div>
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-item-label">167. وجود مقدمي الخدمات</div>
                        <div class="profile-item-value">${f.fournisseurs === 'نعم' ? 'نعم ✓' : f.fournisseurs === 'لا' ? 'لا ✗' : 'غير محدد'}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">168. مؤسسات قريبة</div>
                        <div class="profile-item-value">
                            ${f.proximiteBanque ? 'بنك ✓ ' : ''}${f.proximitePoste ? 'بريد ✓ ' : ''}${f.proximiteVet ? 'عيادة بيطرية ✓ ' : ''}
                            ${f.proximiteAssurances ? 'تأمينات ✓ ' : ''}${f.proximiteLaboRatoire ? 'مخبر ✓ ' : ''}${f.proximiteBET ? 'مكتب دراسات ✓ ' : ''}
                            ${f.proximiteCooperative ? 'تعاونية ✓ ' : ''}${f.proximiteFournisseur ? 'مورد ✓ ' : ''}
                        </div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">169. تسويق المنتجات</div>
                        <div class="profile-item-value">
                            ${f.ventePied ? 'بيع على الجذع ✓ ' : ''}${f.venteGros ? 'سوق الجملة ✓ ' : ''}
                            ${f.venteIntermediaire ? 'وسطاء ✓ ' : ''}${f.venteDirecte ? 'بيع مباشر ✓ ' : ''}
                        </div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">170. سوق التسويق</div>
                        <div class="profile-item-value">
                            ${f.marcheLocal ? 'محلي ✓ ' : ''}${f.marcheNational ? 'وطني ✓ ' : ''}${f.marcheInternational ? 'دولي ✓ ' : ''}
                        </div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-item-label">171. الانخراط في المنظمات</div>
                        <div class="profile-item-value">
                            ${f.cooperativeAgricole ? 'تعاونية فلاحية ✓ ' : ''}${f.associationProfessionnelle ? 'جمعية مهنية ✓ ' : ''}
                            ${f.groupeInteret ? 'مجموعة مصالح ✓ ' : ''}${f.conseilInterpro ? 'مجلس مهني ✓ ' : ''}
                            ${f.autresAssociations ? 'جمعيات أخرى ✓ ' : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    let modal = document.getElementById("profileModal");
    if (modal) modal.classList.add("active");
}

function closeProfile() {
    let modal = document.getElementById("profileModal");
    if (modal) modal.classList.remove("active");
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
    if (toggle) toggle.classList.toggle('light');
}