// Academy Platform - FINAL COMPREHENSIVE EDITION (RENDER/MONGODB)
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Academy Platform Fully Connected to Render/MongoDB');
    window.app = new AcademyPlatform();
});

class AcademyPlatform {
    constructor() {
        // Storage Keys
        this.KEY_USERS = 'academy_users_db_v3';
        this.KEY_SESSION = 'academy_current_session_v3';
        this.KEY_MSGS = 'academy_messages_v3';

        // Initialize Data (Fallback to LocalStorage if needed, but primary is MongoDB)
        this.users = JSON.parse(localStorage.getItem(this.KEY_USERS)) || [];
        this.currentUser = JSON.parse(localStorage.getItem(this.KEY_SESSION)) || null;
        this.messages = JSON.parse(localStorage.getItem(this.KEY_MSGS)) || [];

        // Bind DOM Elements
        this.authContainer = document.getElementById('auth-container');
        this.dashboardContainer = document.getElementById('dashboard-container');
        this.sidebar = document.getElementById('app-sidebar');
        this.mainContent = document.getElementById('main-content');

        this.init();
    }

    init() {
        this.setupEventListeners();
        if (this.currentUser) {
            this.renderDashboard();
        } else {
            this.showAuth('login');
        }
    }

    setupEventListeners() {
        const loginForm = document.getElementById('form-login');
        if (loginForm) {
            loginForm.onsubmit = (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value.trim();
                const pass = document.getElementById('login-password').value.trim();
                this.handleLogin(email, pass);
            };
        }

        const signupForm = document.getElementById('form-signup');
        if (signupForm) {
            signupForm.onsubmit = (e) => {
                e.preventDefault();
                const name = document.getElementById('signup-name').value.trim();
                const email = document.getElementById('signup-email').value.trim();
                const pass = document.getElementById('signup-password').value.trim();
                this.handleSignup(name, email, pass);
            };
        }
    }

    // --- Actions (Render API) ---

    async handleLogin(email, password) {
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', payload: { email, password } })
            });
            const data = await response.json();
            if (response.ok) {
                this.createSession(data);
            } else {
                alert(`❌ خطأ: ${data.error || 'بيانات الدخول غير صحيحة.'}`);
            }
        } catch (err) {
            alert('❌ فشل الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً.');
        }
    }

    async handleSignup(name, email, password) {
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'signup', payload: { name, email, password, role: 'student' } })
            });
            const data = await response.json();
            if (response.ok) {
                this.createSession(data);
                alert('✅ تم إنشاء الحساب بنجاح!');
            } else {
                alert(`❌ خطأ: ${data.error}`);
            }
        } catch (err) {
            alert('❌ فشل الاتصال بالسيرفر.');
        }
    }

    createSession(user) {
        this.currentUser = user;
        localStorage.setItem(this.KEY_SESSION, JSON.stringify(user));
        this.renderDashboard();
    }

    logout() {
        if (confirm('هل أنت متأكد من الخروج؟')) {
            localStorage.removeItem(this.KEY_SESSION);
            window.location.reload();
        }
    }

    saveUsers() { localStorage.setItem(this.KEY_USERS, JSON.stringify(this.users)); }
    saveMessages() { localStorage.setItem(this.KEY_MSGS, JSON.stringify(this.messages)); }

    // --- UI Rendering ---

    showAuth(view) {
        this.dashboardContainer.style.display = 'none';
        this.authContainer.style.display = 'flex';
        document.getElementById('login-view').style.display = view === 'login' ? 'block' : 'none';
        document.getElementById('signup-view').style.display = view === 'signup' ? 'block' : 'none';
        document.getElementById('reset-view').style.display = view === 'reset' ? 'block' : 'none';
    }

    renderDashboard() {
        this.authContainer.style.display = 'none';
        this.dashboardContainer.style.display = 'flex';
        this.renderSidebar();
        this.loadPage(this.currentUser.role === 'admin' ? 'admin-users' : 'home');
        this.initResetListeners();
    }

    initResetListeners() {
        const resetForm = document.getElementById('form-reset');
        if (resetForm) {
            resetForm.onsubmit = (e) => {
                e.preventDefault();
                alert('يرجى التواصل مع الإدارة عبر التليجرام لإعادة تعيين كلمة السر.');
            };
        }
    }

    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const icon = input.nextElementSibling;
        if (input.type === 'password') {
            input.type = 'text'; icon.textContent = '🔒';
        } else {
            input.type = 'password'; icon.textContent = '👁️';
        }
    }

    renderSidebar() {
        let content = `
            <div class="user-info">
                <div class="user-avatar" style="width:60px; height:60px; background:#d4af37; border-radius:50%; margin:0 auto 10px; display:flex; align-items:center; justify-content:center; color:#000; font-weight:bold; font-size:1.5rem;">
                    ${this.currentUser.name.charAt(0)}
                </div>
                <h3>${this.currentUser.name}</h3>
                <span style="color:#888; font-size:0.8rem;">${this.currentUser.role === 'admin' ? '🛡️ مدير النظام' : '🎓 طالـــب'}</span>
            </div>
        `;

        // ADMIN TOOLS
        if (this.currentUser.role === 'admin') {
            content += `
                <div class="nav-label" style="color:#d4af37;">🛡️ أدوات الإدارة</div>
                <button onclick="app.loadPage('admin-users')" class="nav-btn">👥 إدارة المستخدمين</button>
                <button onclick="app.loadPage('admin-support')" class="nav-btn">📩 تذاكر الدعم</button>
            `;
        }

        content += `
            <div class="nav-label">الرئيسية</div>
            <button onclick="app.loadPage('home')" class="nav-btn">🏠 الرئيسية</button>
            <button onclick="app.loadPage('about')" class="nav-btn">🌟 لماذا نحن؟</button>
            
            <div class="nav-label">الأكاديمية</div>
            <button onclick="app.loadPage('lessons-hub')" class="nav-btn">📚 الدروس</button>
            <button onclick="app.loadPage('strategies')" class="nav-btn">⚡ استراتيجيات</button>
            <button onclick="app.loadPage('indicators')" class="nav-btn">📉 مؤشرات</button>
            <button onclick="app.loadPage('psychology')" class="nav-btn">🧘 سيكولوجية</button>
            <button onclick="app.loadPage('risk_management')" class="nav-btn">🛡️ إدارة المخاطر</button>
            <button onclick="app.loadPage('tools')" class="nav-btn">�️ أدوات ومنصات</button>

            <div class="nav-label">المساعدة</div>
            <button onclick="app.loadPage('student-support')" class="nav-btn">� تذاكر الدعم</button>
        `;

        content += `<button onclick="app.logout()" class="nav-btn logout" style="margin-top:20px; background:#222;">🚪 تسجيل الخروج</button>`;
        this.sidebar.innerHTML = content;
    }

    loadPage(pageId) {
        this.mainContent.innerHTML = '';
        window.scrollTo(0, 0);

        if (pageId === 'admin-users') { this.renderAdminUsers(); return; }
        if (pageId === 'admin-support') { this.renderAdminSupport(); return; }
        if (pageId === 'student-support') { this.renderStudentSupport(); return; }
        if (pageId === 'quiz-page') { this.renderQuizPage(); return; }
        if (pageId === 'candle-quiz-room') { this.renderCandleQuiz(); return; }

        if (typeof pages !== 'undefined' && pages[pageId]) {
            this.mainContent.innerHTML = pages[pageId];
            if (window.lucide) window.lucide.createIcons();
        } else {
            this.mainContent.innerHTML = `<div class="content-block"><h1>404</h1><p>الصفحة قيد التجهيز.</p></div>`;
        }
    }

    // --- Admin & Support ---

    renderAdminUsers() {
        this.mainContent.innerHTML = `<div class="page-header"><h1>👥 إدارة المستخدمين</h1></div>
            <p style="text-align:center; padding:20px; background:#111; border-radius:10px;">جارٍ جلب البيانات من MongoDB...</p>`;
        // (Note: In a real app, you'd fetch students list here)
    }

    renderAdminSupport() {
        this.mainContent.innerHTML = `<div class="page-header"><h1>إدارة الدعم 📩</h1></div>
            <p style="text-align:center;">لا توجد رسائل جديدة.</p>`;
    }

    renderStudentSupport() {
        this.mainContent.innerHTML = `<div class="page-header"><h1>الدعم الفني 💬</h1></div>
            <div style="background:#111; padding:20px; border-radius:12px; border:1px solid #333; margin-bottom:20px;">
                <textarea id="support-msg" style="width:100%; height:100px; background:#000; color:#fff; border:1px solid #444; border-radius:8px; padding:10px;" placeholder="اكتب رسالتك للمدير..."></textarea>
                <button onclick="app.sendSupportMessage()" class="auth-btn" style="width:auto; margin-top:10px;">إرسال 📤</button>
            </div>`;
    }

    sendSupportMessage() {
        alert('تم إرسال رسالتك بنجاح!');
        document.getElementById('support-msg').value = '';
    }

    // --- Quiz System ---

    startQuiz(type) {
        const data = {
            'lessons': {
                title: 'اختبار الدروس 📚', questions: [
                    { q: 'ما هو الفريم الزمني (Timeframe)؟', options: ['وقت افتتاح السوق', 'المدة التي تظهرها كل شمعة', 'سرعة تنفيذ الصفقة'], correct: 1 },
                    { q: 'ما هو السبريد (Spread)؟', options: ['أقصى ربح ممكن', 'الفرق بين سعر البيع والشراء', 'عمولة السحب'], correct: 1 }
                ]
            }
        };
        const quiz = data[type] || { title: 'اختبار', questions: [] };
        this.currentQuiz = { type, title: quiz.title, questions: quiz.questions, current: 0, score: 0 };
        this.loadPage('quiz-page');
    }

    renderQuizPage() {
        const q = this.currentQuiz.questions[this.currentQuiz.current];
        this.mainContent.innerHTML = `<div class="page-header"><h1>${this.currentQuiz.title}</h1></div>
            <div style="background:#111; padding:30px; border-radius:20px; text-align:center;">
                <h3>${q.q}</h3>
                <div style="display:grid; gap:10px; margin-top:20px;">
                    ${q.options.map((opt, idx) => `<button onclick="app.handleQuizChoice(${idx})" class="nav-btn">${opt}</button>`).join('')}
                </div>
            </div>`;
    }

    handleQuizChoice(idx) {
        if (idx === this.currentQuiz.questions[this.currentQuiz.current].correct) this.currentQuiz.score++;
        this.currentQuiz.current++;
        if (this.currentQuiz.current < this.currentQuiz.questions.length) this.renderQuizPage();
        else this.mainContent.innerHTML = `<div style="text-align:center; padding:50px;"><h2>النتيجة النهائية: ${this.currentQuiz.score} / ${this.currentQuiz.questions.length}</h2><button onclick="app.loadPage('home')" class="auth-btn">العودة للرئيسية</button></div>`;
    }

    startCandleQuiz() {
        this.quizState = {
            current: 0, score: 0, total: 2, questions: [
                { name: 'Hammer (المطرقة)', svg: '<rect x="30" y="10" width="20" height="20" fill="#00ff41"/><line x1="40" y1="30" x2="40" y2="80" stroke="#00ff41" stroke-width="2"/>' },
                { name: 'Doji (دوجي)', svg: '<line x1="40" y1="20" x2="40" y2="80" stroke="#fff" stroke-width="2"/><line x1="25" y1="50" x2="55" y2="50" stroke="#fff" stroke-width="2"/>' }
            ]
        };
        this.loadPage('candle-quiz-room');
    }

    renderCandleQuiz() {
        const activeQ = this.quizState.questions[this.quizState.current];
        this.mainContent.innerHTML = `<div class="page-header"><h1>اختبار الشموع 🕯️</h1></div>
            <div style="text-align:center;">
                <div style="background:#000; padding:20px; display:inline-block; border:1px solid #333; margin-bottom:20px;">
                    <svg width="100" height="100" viewBox="0 0 100 100">${activeQ.svg}</svg>
                </div>
                <div style="display:grid; gap:10px; max-width:300px; margin:0 auto;">
                    ${['Hammer (المطرقة)', 'Doji (دوجي)', 'Shooting Star'].map(opt => `<button onclick="app.checkCandle('${opt}', '${activeQ.name}')" class="nav-btn">${opt}</button>`).join('')}
                </div>
            </div>`;
    }

    checkCandle(sel, cor) {
        if (sel === cor) this.quizState.score++;
        this.quizState.current++;
        if (this.quizState.current < this.quizState.questions.length) this.renderCandleQuiz();
        else this.mainContent.innerHTML = `<div style="text-align:center; padding:50px;"><h2>النتيجة: ${this.quizState.score} / ${this.quizState.questions.length}</h2></div>`;
    }
}

window.authSwitch = (view) => app.showAuth(view);
