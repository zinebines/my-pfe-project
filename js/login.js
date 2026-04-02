/* ═══════════════════════════════════════════
           PARTICLES
           ═══════════════════════════════════════════ */
        (function spawnParticles() {
            const container = document.getElementById('particles');
            const colors = [
                'rgba(212,175,55,0.55)',
                'rgba(90,124,58,0.35)',
                'rgba(212,175,55,0.28)',
                'rgba(255,255,255,0.18)',
            ];
            for (let i = 0; i < 30; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                const size  = 4 + Math.random() * 9;
                const left  = Math.random() * 100;
                const dur   = 7 + Math.random() * 13;
                const delay = Math.random() * dur;
                const color = colors[Math.floor(Math.random() * colors.length)];
                p.style.cssText = `
                    width:${size}px; height:${size}px;
                    left:${left}%;
                    animation-duration:${dur}s;
                    animation-delay:-${delay}s;
                    background:${color};
                `;
                container.appendChild(p);
            }
        })();

        /* ═══════════════════════════════════════════
           LANGUAGE TOGGLE — mirrors index exactly
           ═══════════════════════════════════════════ */
        let currentLang = 'fr';

        function toggleLanguage() {
            currentLang = currentLang === 'fr' ? 'ar' : 'fr';
            document.body.classList.toggle('rtl', currentLang === 'ar');
            document.documentElement.lang = currentLang;
            document.documentElement.dir  = currentLang === 'ar' ? 'rtl' : 'ltr';

            document.querySelectorAll('.lang-text').forEach(el => {
                const text = el.getAttribute('data-' + currentLang);
                if (text) el.textContent = text;
            });

            document.querySelectorAll('.lang-placeholder').forEach(el => {
                const ph = el.getAttribute('data-placeholder-' + currentLang);
                if (ph) el.placeholder = ph;
            });

            document.getElementById('lang-toggle').textContent =
                currentLang === 'fr' ? '🌐 AR / FR' : '🌐 FR / AR';

            // Update page title
            document.title = currentLang === 'ar'
                ? 'تسجيل الدخول - الإحصاء الفلاحي الجزائري'
                : 'Connexion - Statistiques Agricoles Algériennes';
        }

        /* ═══════════════════════════════════════════
           TAB SWITCHING
           ═══════════════════════════════════════════ */
        function switchTab(tab) {
            document.getElementById('loginSection').classList.toggle('active', tab === 'login');
            document.getElementById('registerSection').classList.toggle('active', tab === 'register');
            document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
            document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
        }

        /* ═══════════════════════════════════════════
           PASSWORD STRENGTH
           ═══════════════════════════════════════════ */
        const strengthLabels = {
            fr: ['Entrez un mot de passe', 'Faible', 'Moyen', 'Bon', 'Très fort ✓'],
            ar: ['أدخل كلمة المرور', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية جداً ✓'],
        };

        function checkPasswordStrength(val) {
            const fill = document.getElementById('strengthFill');
            const text = document.getElementById('strengthText');
            let s = 0;
            if (val.length >= 8)           s++;
            if (/[A-Z]/.test(val))         s++;
            if (/[0-9]/.test(val))         s++;
            if (/[^A-Za-z0-9]/.test(val))  s++;

            const pcts   = ['0%','25%','50%','75%','100%'];
            const colors = ['','#e53935','#fb8c00','#fdd835','#5a7c3a'];
            const idx    = val.length === 0 ? 0 : s;

            fill.style.width      = pcts[idx];
            fill.style.background = colors[idx];
            text.textContent      = strengthLabels[currentLang][idx];
            text.style.color      = colors[idx] || '#aaa';
        }

        /* ═══════════════════════════════════════════
           FORM HANDLERS
           ═══════════════════════════════════════════ */
        function handleLogin(e) {
            e.preventDefault();
            const btn = e.target.querySelector('.submit-btn');
            const originalText = btn ? btn.textContent : '';
            if (btn) {
                btn.textContent = currentLang === 'ar' ? 'جاري الدخول...' : 'Connexion...';
                btn.disabled = true;
            }
            setTimeout(function() {
                window.location.href = 'admin-2.html';
            }, 800);
        }

        function handleRegister(e) {
            e.preventDefault();
            const pass = document.getElementById('registerPassword').value;
            const conf = document.getElementById('registerConfirmPassword').value;
            if (pass !== conf) {
                alert(currentLang === 'ar'
                    ? '⚠️ كلمتا المرور غير متطابقتين'
                    : '⚠️ Les mots de passe ne correspondent pas');
                return;
            }
            const btn = e.target.querySelector('.submit-btn');
            if (btn) {
                btn.textContent = currentLang === 'ar' ? 'جاري الإنشاء...' : 'Création...';
                btn.disabled = true;
            }
            setTimeout(function() {
                window.location.href = 'admin-2.html';
            }, 800);
        }
