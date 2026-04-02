// ===== INITIALIZATION =====
        let currentLang = 'fr';
        let chatOpen = false;
        let bubbleHidden = false;

        // Hide loading screen (guard: element may not exist)
        window.addEventListener('load', function() {
            setTimeout(() => {
                const loadingScreen = document.getElementById('loadingScreen');
                if (loadingScreen) loadingScreen.classList.add('hidden');
            }, 2000);
        });

        // ===== CURSOR EFFECT =====
        const cursor = document.getElementById('cursor');
        const cursorFollower = document.getElementById('cursorFollower');

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            setTimeout(() => {
                cursorFollower.style.left = e.clientX + 'px';
                cursorFollower.style.top = e.clientY + 'px';
            }, 100);
        });

        document.addEventListener('mousedown', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(0.5)';
            cursorFollower.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });

        document.addEventListener('mouseup', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        // ===== PARALLAX EFFECT =====
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const layer1 = document.getElementById('layer1');
            const layer2 = document.getElementById('layer2');
            
            if (layer1 && layer2) {
                layer1.style.transform = `translateY(${scrolled * 0.3}px)`;
                layer2.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });

        // ===== SMOOTH SCROLL =====
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // ===== LANGUAGE TOGGLE =====
        function toggleLanguage() {
            currentLang = currentLang === 'fr' ? 'ar' : 'fr';
            document.body.classList.toggle('rtl', currentLang === 'ar');
            
            // Update all text elements
            document.querySelectorAll('.lang-text').forEach(el => {
                const text = el.getAttribute(`data-${currentLang}`);
                if (text) {
                    if (el.innerHTML.includes('<') && !el.classList.contains('chat-msg')) {
                        el.innerHTML = text;
                    } else {
                        el.textContent = text;
                    }
                }
            });

            // Update placeholders
            document.querySelectorAll('.lang-placeholder').forEach(el => {
                const ph = el.getAttribute(`data-placeholder-${currentLang}`);
                if (ph) el.placeholder = ph;
            });

            // Update toggle button
            const toggleBtn = document.getElementById('lang-toggle');
            toggleBtn.innerHTML = `<i class="fas fa-globe"></i><span>${currentLang === 'fr' ? 'AR / FR' : 'FR / AR'}</span>`;
            
            document.documentElement.lang = currentLang;
            document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        }

        // ===== CHAT FUNCTIONS =====
        function toggleChat() {
            chatOpen = !chatOpen;
            const win = document.getElementById('chatWindow');
            const btn = document.getElementById('chatToggle');
            const bubble = document.getElementById('chatBubble');

            if (chatOpen) {
                win.classList.add('open');
                btn.innerHTML = '<i class="fas fa-times"></i>';
                bubble.style.display = 'none';
                bubbleHidden = true;
            } else {
                win.classList.remove('open');
                btn.innerHTML = '<i class="fas fa-comment-dots"></i>';
            }
        }

        function sendChat() {
            const input = document.getElementById('chatInput');
            const text = input.value.trim();
            if (!text) return;

            const messages = document.getElementById('chatMessages');
            
            // Add user message
            const userMsg = document.createElement('div');
            userMsg.className = 'chat-msg user';
            userMsg.textContent = text;
            messages.appendChild(userMsg);

            // Clear input
            input.value = '';

            // Scroll to bottom
            messages.scrollTop = messages.scrollHeight;

            // Simulate bot response
            setTimeout(() => {
                const botMsg = document.createElement('div');
                botMsg.className = 'chat-msg bot';
                
                const responses = {
                    fr: [
                        "Merci pour votre message. Un agent vous répondra bientôt.",
                        "Je vous remercie. Votre demande a été enregistrée.",
                        "Un conseiller va vous contacter dans les plus brefs délais."
                    ],
                    ar: [
                        "شكراً لرسالتك. سيرد عليك أحد الممثلين قريباً.",
                        "شكراً جزيلاً. تم تسجيل طلبك.",
                        "سيتواصل معك مستشار في أقرب وقت ممكن."
                    ]
                };
                
                const randomIndex = Math.floor(Math.random() * 3);
                botMsg.textContent = responses[currentLang][randomIndex];
                
                messages.appendChild(botMsg);
                messages.scrollTop = messages.scrollHeight;
            }, 1000);
        }

        // Auto-hide chat bubble after 5 seconds
        setTimeout(() => {
            const bubble = document.getElementById('chatBubble');
            if (!bubbleHidden && bubble) {
                bubble.style.display = 'none';
                bubbleHidden = true;
            }
        }, 5000);

        // ===== FORM HANDLING =====
        document.getElementById('contactForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const btn = this.querySelector('.submit-btn');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> ' + (currentLang === 'fr' ? 'Envoyé!' : 'تم الإرسال!');
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    this.reset();
                }, 2000);
            }, 1500);
        });

        // ===== 3D TILT EFFECT ON CARDS =====
        document.querySelectorAll('.feature-card, .testimonial-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.05)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
            });
        });

        // ===== COUNT UP ANIMATION FOR STATS =====
        function animateValue(element, start, end, duration) {
            const range = end - start;
            const increment = range / (duration / 16);
            let current = start;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= end) {
                    current = end;
                    clearInterval(timer);
                }
                element.textContent = Math.round(current).toLocaleString() + (element.classList.contains('stat-number') && end > 1000 ? '+' : '');
            }, 16);
        }

        // Intersection Observer for stats
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number');
                    statNumbers.forEach(stat => {
                        const value = parseInt(stat.textContent.replace(/[^0-9]/g, ''));
                        animateValue(stat, 0, value, 2000);
                    });
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelector('.stats')?.forEach(stats => {
            statsObserver.observe(stats);
        });

        // ===== PARTICLE EFFECT ON HERO =====
        function createParticle() {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '2px';
            particle.style.height = '2px';
            particle.style.background = `rgba(212, 175, 55, ${Math.random() * 0.5})`;
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = Math.random() * window.innerHeight + 'px';
            
            document.body.appendChild(particle);
            
            const animation = particle.animate([
                { transform: 'translateY(0) scale(1)', opacity: 1 },
                { transform: `translateY(-${Math.random() * 100 + 50}px) scale(0)`, opacity: 0 }
            ], {
                duration: Math.random() * 2000 + 1000,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });
            
            animation.onfinish = () => particle.remove();
        }

        // Create particles on hero hover
        const hero = document.querySelector('.hero');
        if (hero) {
            let particleInterval;
            
            hero.addEventListener('mouseenter', () => {
                particleInterval = setInterval(createParticle, 100);
            });
            
            hero.addEventListener('mouseleave', () => {
                clearInterval(particleInterval);
            });
        }

        // ===== MAGNETIC BUTTONS =====
        document.querySelectorAll('.cta-button, #login-btn, #lang-toggle').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });

        // ===== TEXT REVEAL ON SCROLL =====
        const revealElements = document.querySelectorAll('.section-title, .feature-card, .testimonial-card');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(50px)';
            el.style.transition = 'all 0.6s ease';
            revealObserver.observe(el);
        });

        // ===== DYNAMIC BACKGROUND =====
        function updateBackground() {
            const hour = new Date().getHours();
            const root = document.documentElement;
            
            if (hour >= 6 && hour < 18) {
                // Day
                root.style.setProperty('--cream', '#FAF7F0');
                root.style.setProperty('--primary-dark', '#0B2D1C');
            } else {
                // Night
                root.style.setProperty('--cream', '#1A2A1A');
                root.style.setProperty('--primary-dark', '#0A1F0A');
                document.body.style.color = '#E0E0E0';
            }
        }
        
        updateBackground();

        // ===== KEYBOARD SHORTCUTS =====
        document.addEventListener('keydown', (e) => {
            // Ctrl+L to toggle language
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                toggleLanguage();
            }
            
            // Ctrl+C to toggle chat
            if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
                toggleChat();
            }
            
            // Esc to close chat
            if (e.key === 'Escape' && chatOpen) {
                toggleChat();
            }
        });

        // ===== TOUCH DEVICE OPTIMIZATION =====
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
            
            // Disable custom cursor on touch devices
            cursor.style.display = 'none';
            cursorFollower.style.display = 'none';
        }

        // ===== PERFORMANCE OPTIMIZATION =====
        // Debounce scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }
            
            scrollTimeout = window.requestAnimationFrame(() => {
                // Update parallax
                const scrolled = window.pageYOffset;
                const layer1 = document.getElementById('layer1');
                const layer2 = document.getElementById('layer2');
                
                if (layer1 && layer2) {
                    layer1.style.transform = `translateY(${scrolled * 0.3}px)`;
                    layer2.style.transform = `translateY(${scrolled * 0.5}px)`;
                }
            });
        });

        // ===== PRELOAD IMAGES =====
        function preloadImages() {
            const images = [
                'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600',
                'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=600',
                'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=600'
            ];
            
            images.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        }
        
        preloadImages();

        console.log('✨ Site chargé avec succès! Bienvenue sur le portail agricole 2026.');
    
    
    
    
    
    
    
    
    
    
    // ===== تفعيل تأثير اللمس على البطاقات =====
document.addEventListener('DOMContentLoaded', function() {
    // حدد كل البطاقات
    const featureCards = document.querySelectorAll('.feature-card');
    
    console.log('عدد البطاقات:', featureCards.length); // للتأكد من وجود البطاقات
    
    // أضف حدث النقر لكل بطاقة
    featureCards.forEach(card => {
        card.addEventListener('click', function(event) {
            // منع انتشار الحدث
            event.stopPropagation();
            
            // إزالة التأثير من البطاقات الأخرى
            featureCards.forEach(c => {
                c.classList.remove('touched');
                c.classList.remove('active-3d');
            });
            
            // إضافة التأثير للبطاقة الحالية
            this.classList.add('touched');
            this.classList.add('active-3d');
            
            console.log('تم النقر على البطاقة'); // للتأكد من عمل الحدث
            
            // إنشاء تأثير الجسيمات
            createParticles(event, this);
            
            // إنشاء تأثير التموج
            createRipple(event, this);
            
            // إنشاء النقاط المتوهجة
            createGlowDots(this);
            
            // تحديث انعكاس الضوء
            updateLightReflection(event, this);
            
            // إزالة التأثير بعد ثانيتين
            setTimeout(() => {
                this.classList.remove('touched');
                this.classList.remove('active-3d');
            }, 2000);
        });
        
        // تأثير حركة الماوس ثلاثي الأبعاد
        card.addEventListener('mousemove', function(e) {
            if (!this.classList.contains('active-3d')) return;
            
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 15;
            const rotateY = (centerX - x) / 15;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05) translateZ(20px)`;
        });
        
        // إعادة التعيين عند خروج الماوس
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active-3d')) {
                this.style.transform = '';
            }
        });
    });
});

// دالة إنشاء الجسيمات
function createParticles(event, card) {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 80 + 30;
            const xMove = Math.cos(angle) * distance;
            const yMove = Math.sin(angle) * distance;
            
            particle.style.setProperty('--x', xMove + 'px');
            particle.style.setProperty('--y', yMove + 'px');
            particle.style.left = (x + rect.left) + 'px';
            particle.style.top = (y + rect.top) + 'px';
            
            // ألوان عشوائية
            const colors = ['#d4af37', '#f5c542', '#ffd700', '#ffa500'];
            particle.style.background = `radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]}, transparent)`;
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }, i * 30);
    }
}

// دالة إنشاء التموج
function createRipple(event, card) {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.width = '40px';
    ripple.style.height = '40px';
    ripple.style.marginLeft = '-20px';
    ripple.style.marginTop = '-20px';
    
    card.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 800);
}

// دالة إنشاء النقاط المتوهجة
function createGlowDots(card) {
    const glowDots = card.querySelector('.glow-dots');
    if (!glowDots) return;
    
    glowDots.innerHTML = '';
    
    for (let i = 0; i < 12; i++) {
        const dot = document.createElement('span');
        const x = Math.random();
        const y = Math.random();
        
        dot.style.setProperty('--x', (Math.random() - 0.5) * 2);
        dot.style.setProperty('--y', (Math.random() - 0.5) * 2);
        dot.style.left = (x * 100) + '%';
        dot.style.top = (y * 100) + '%';
        
        // تأخير عشوائي للحركة
        dot.style.animationDelay = (Math.random() * 2) + 's';
        
        glowDots.appendChild(dot);
    }
}

// دالة تحديث انعكاس الضوء
function updateLightReflection(event, card) {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    const reflection = card.querySelector('.light-reflection');
    if (reflection) {
        reflection.style.setProperty('--mouse-x', x + '%');
        reflection.style.setProperty('--mouse-y', y + '%');
    }
}

// دالة تبديل اللغة (احتفظ بالوظيفة الأصلية)
function toggleLanguage() {
    currentLang = currentLang === 'fr' ? 'ar' : 'fr';
    document.body.classList.toggle('rtl', currentLang === 'ar');
    
    document.querySelectorAll('.lang-text').forEach(el => {
        const text = el.getAttribute(`data-${currentLang}`);
        if (text) {
            el.textContent = text;
        }
    });

    const langToggleBtn = document.getElementById('lang-toggle');
    if (langToggleBtn) langToggleBtn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:5px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> ${currentLang === 'fr' ? 'AR / FR' : 'FR / AR'}</span>`;
}

// دالة تبديل الشات (احتفظ بالوظيفة الأصلية)
function toggleChat() {
    chatOpen = !chatOpen;
    const win = document.getElementById('chatWindow');
    const btn = document.getElementById('chatToggle');
    const bubble = document.getElementById('chatBubble');

    if (chatOpen) {
        win.classList.add('open');
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
        bubble.style.display = 'none';
        bubbleHidden = true;
    } else {
        win.classList.remove('open');
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';
    }
}

// دالة إرسال الشات (احتفظ بالوظيفة الأصلية)
function sendChat() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    
    const messages = document.getElementById('chatMessages');
    
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg user';
    userMsg.textContent = text;
    messages.appendChild(userMsg);
    
    input.value = '';
    
    setTimeout(() => {
        const botMsg = document.createElement('div');
        botMsg.className = 'chat-msg bot';
        botMsg.textContent = currentLang === 'fr' ? 'Merci pour votre message.' : 'شكراً لرسالتك.';
        messages.appendChild(botMsg);
        messages.scrollTop = messages.scrollHeight;
    }, 1000);
}

// متغيرات عامة


// إخفاء فقاعة الشات بعد 5 ثواني
setTimeout(() => {
    const bubble = document.getElementById('chatBubble');
    if (!bubbleHidden && bubble) {
        bubble.style.display = 'none';
        bubbleHidden = true;
    }
}, 5000);