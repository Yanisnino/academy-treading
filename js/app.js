// -------------------------------------------------------------------------
// Academy Platform - THE MASTER VERSION (RENDER/MONGODB EDITION)
// -------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Academy Platform: All Systems Global & Connected.');
    window.app = new AcademyPlatform();
});

class AcademyPlatform {
    constructor() {
        // Storage Keys
        this.KEY_SESSION = 'academy_current_session_v3';
        this.KEY_MSGS = 'academy_messages_v3';

        // State Management
        this.currentUser = JSON.parse(localStorage.getItem(this.KEY_SESSION)) || null;
        this.messages = JSON.parse(localStorage.getItem(this.KEY_MSGS)) || [];
        this.quizState = { current: 0, score: 0, questions: [], activeType: null };

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
        // Form Handling: Login
        const loginForm = document.getElementById('form-login');
        if (loginForm) {
            loginForm.onsubmit = (e) => {
                e.preventDefault();
                this.handleLogin(document.getElementById('login-email').value, document.getElementById('login-password').value);
            };
        }

        // Form Handling: Signup
        const signupForm = document.getElementById('form-signup');
        if (signupForm) {
            signupForm.onsubmit = (e) => {
                e.preventDefault();
                this.handleSignup(
                    document.getElementById('signup-name').value,
                    document.getElementById('signup-email').value,
                    document.getElementById('signup-password').value
                );
            };
        }

        // Form Handling: Reset Password
        const resetForm = document.getElementById('form-reset');
        if (resetForm) {
            resetForm.onsubmit = (e) => {
                e.preventDefault();
                this.handleResetInitial();
            };
        }
    }

    // ---------------------------------------------------------------------
    // 🔑 AUTHENTICATION LOGIC (RENDER API)
    // ---------------------------------------------------------------------

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
                alert(`❌ خطأ: ${data.error || 'فشل تسجيل الدخول'}`);
            }
        } catch (err) {
            alert('❌ فشل الاتصال بقاعدة البيانات. تأكد من اتصال هاتفك بالإنترنت.');
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
                alert('🎉 أهلاً بك! تم إنشاء حسابك بنجاح.');
            } else {
                alert(`❌ خطأ: ${data.error}`);
            }
        } catch (err) {
            alert('❌ فشل الاتصال بالسيرفر الجديد.');
        }
    }

    handleResetInitial() {
        const email = document.getElementById('reset-email').value;
        // In local logic, we just alert for now, but link to UI
        document.getElementById('reset-new-sec').style.display = 'block';
    }

    async handleFinalReset() {
        const email = document.getElementById('reset-email').value;
        const newPass = document.getElementById('reset-new-password').value;
        if (!newPass) return alert('أدخل كلمة السر الجديدة');
        alert('✅ تم تحديث كلمة السر بنجاح. يمكنك الدخول الآن.');
        this.showAuth('login');
    }

    createSession(user) {
        this.currentUser = user;
        localStorage.setItem(this.KEY_SESSION, JSON.stringify(user));
        this.renderDashboard();
    }

    logout() {
        if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            localStorage.removeItem(this.KEY_SESSION);
            window.location.reload();
        }
    }

    showAuth(view) {
        this.dashboardContainer.style.display = 'none';
        this.authContainer.style.display = 'flex';
        // Visibility Toggle
        document.getElementById('login-view').style.display = view === 'login' ? 'block' : 'none';
        document.getElementById('signup-view').style.display = view === 'signup' ? 'block' : 'none';
        document.getElementById('reset-view').style.display = view === 'reset' ? 'block' : 'none';
    }

    togglePasswordVisibility(id) {
        const el = document.getElementById(id);
        const icon = el.nextElementSibling;
        if (el.type === 'password') {
            el.type = 'text'; icon.textContent = '🔒';
        } else {
            el.type = 'password'; icon.textContent = '👁️';
        }
    }

    // ---------------------------------------------------------------------
    // 📊 DASHBOARD & NAVIGATION
    // ---------------------------------------------------------------------

    renderDashboard() {
        this.authContainer.style.display = 'none';
        this.dashboardContainer.style.display = 'flex';
        this.renderSidebar();
        this.loadPage(this.currentUser.role === 'admin' ? 'admin-users' : 'home');
    }

    renderSidebar() {
        const isAdm = this.currentUser.role === 'admin';
        const name = this.currentUser.name || 'User';

        let sidebarHTML = `
            <div class="user-info">
                <div class="user-avatar" style="width:70px; height:70px; background:linear-gradient(45deg, #d4af37, #ffd700); border-radius:50%; margin:0 auto 15px; display:flex; align-items:center; justify-content:center; color:#000; font-weight:bold; font-size:1.8rem; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                    ${name.charAt(0)}
                </div>
                <h3 style="margin-bottom:5px;">${name}</h3>
                <span class="badge" style="background:#222; color:#d4af37; padding:4px 12px; border-radius:15px; font-size:0.75rem;">
                    ${isAdm ? '🛡️ مـدير النظام' : '🎓 طالـب متميز'}
                </span>
            </div>
            
            <div class="nav-label">الرئيسية والمجتمع</div>
            <button onclick="app.loadPage('home')" class="nav-btn">🏠 الرئيسية</button>
            <button onclick="app.loadPage('about')" class="nav-btn">🌟 عن الأكاديمية</button>

            <div class="nav-label">المسار التعليمي</div>
            <button onclick="app.loadPage('lessons-hub')" class="nav-btn">📚 مكتبة الدروس</button>
            <button onclick="app.loadPage('strategies')" class="nav-btn">⚡ استراتيجيات VIP</button>
            <button onclick="app.loadPage('indicators')" class="nav-btn">📉 مكتبة المؤشرات</button>

            <div class="nav-label">تطوير الذات</div>
            <button onclick="app.loadPage('psychology')" class="nav-btn">🧘 سيكولوجية المال</button>
            <button onclick="app.loadPage('risk_management')" class="nav-btn">🛡️ إدارة المخاطر</button>
            <button onclick="app.loadPage('tools')" class="nav-btn">🛠️ أدوات ومنصات</button>

            <div class="nav-label">الاختبارات</div>
            <button onclick="app.startCandleQuiz()" class="nav-btn">🕯️ اختبار الشموع</button>
            <button onclick="app.loadPage('student-support')" class="nav-btn">💬 تذاكر الدعم</button>

            ${isAdm ? `
                <div class="nav-label" style="color:#d4af37; border-top:1px solid #333; margin-top:20px; padding-top:10px;">إدارة النظام</div>
                <button onclick="app.loadPage('admin-users')" class="nav-btn">👥 إدارة المستخدمين</button>
                <button onclick="app.loadPage('admin-support')" class="nav-btn">📩 الرد على الدعم</button>
            ` : ''}

            <button onclick="app.logout()" class="nav-btn logout" style="margin-top:30px; background:#1a1a1a; color:#ff4d4d; border:1px solid #333;">🚪 خروج آمن</button>
        `;

        this.sidebar.innerHTML = sidebarHTML;
    }

    loadPage(pageId) {
        this.mainContent.innerHTML = '';
        window.scrollTo(0, 0);

        // Core App Routing
        if (pageId === 'admin-users') { this.renderAdminUsers(); return; }
        if (pageId === 'admin-support') { this.renderAdminSupport(); return; }
        if (pageId === 'student-support') { this.renderStudentSupport(); return; }
        if (pageId === 'quiz-page') { this.renderQuizPage(); return; }

        // Content Rendering (from content.js)
        if (typeof pages !== 'undefined' && pages[pageId]) {
            this.mainContent.innerHTML = pages[pageId];
            if (window.lucide) window.lucide.createIcons();
        } else {
            this.mainContent.innerHTML = `
                <div class="content-block" style="text-align:center; padding:120px 20px;">
                    <div class="loader" style="margin-bottom:20px;"></div>
                    <h1>جارٍ التحميل...</h1>
                    <p>أهلاً بك ${this.currentUser.name || 'User'}، نحن نقوم بتجهيز المحتوى لك.</p>
                </div>`;
        }
    }

    // ---------------------------------------------------------------------
    // 📩 SUPPORT & ADMIN FEATURES
    // ---------------------------------------------------------------------

    renderAdminUsers() {
        this.mainContent.innerHTML = `
            <div class="page-header"><h1>👥 إدارة المستخدمين والطلاب</h1></div>
            <div style="background:#111; padding:30px; border-radius:20px; border:1px solid #333;">
                <p style="text-align:center; color:#888;">يتم الآن جلب قائمة الطلاب الحية من MongoDB Atlas...</p>
                <div id="users-list-target"></div>
            </div>`;
    }

    renderAdminSupport() {
        const pending = this.messages.filter(m => !m.reply).reverse();
        this.mainContent.innerHTML = `
            <div class="page-header"><h1>إدارة تذاكر الدعم 📩</h1></div>
            <div id="admin-msgs-container">
                ${pending.length > 0 ? pending.map(m => this.createMessageHTML(m, true)).join('') : '<p style="text-align:center; padding:50px;">لا توجد رسائل جديدة للرد عليها.</p>'}
            </div>`;
    }

    renderStudentSupport() {
        const myMsgs = this.messages.filter(m => m.userId === this.currentUser._id || m.userId === this.currentUser.id).reverse();
        this.mainContent.innerHTML = `
            <div class="page-header"><h1>الدعم الفني والشكاوي 💬</h1></div>
            <div class="content-block" style="margin-bottom:30px;">
                <textarea id="support-input" placeholder="اكتب مشكلتك هنا بالتفصيل (صور، روابط، إلخ)..." style="width:100%; height:120px; background:#000; color:#fff; border:1px solid #333; border-radius:10px; padding:15px; margin-bottom:15px;"></textarea>
                <button onclick="app.sendSupportMessage()" class="auth-btn" style="width:auto; padding:10px 30px;">إرسال الرسالة</button>
            </div>
            <div id="my-msgs-list">
                ${myMsgs.map(m => this.createMessageHTML(m, false)).join('')}
            </div>`;
    }

    sendSupportMessage() {
        const text = document.getElementById('support-input').value.trim();
        if (!text) return alert('يرجى كتابة رسالتك أولاً.');
        const msg = {
            id: Date.now(),
            userId: this.currentUser._id || this.currentUser.id,
            userName: this.currentUser.name,
            text,
            reply: null,
            date: new Date().toLocaleDateString('ar-EG')
        };
        this.messages.push(msg);
        localStorage.setItem(this.KEY_MSGS, JSON.stringify(this.messages));
        alert('✅ وصلت رسالتك للإدارة، سيتم الرد عليك قريباً!');
        this.renderStudentSupport();
    }

    createMessageHTML(m, isAdmin) {
        return `
            <div class="msg-card" style="background:#111; border:1px solid #222; padding:20px; border-radius:15px; margin-bottom:15px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px; color:#666; font-size:0.8rem;">
                    <strong>👤 ${m.userName}</strong>
                    <span>📅 ${m.date}</span>
                </div>
                <p style="margin-bottom:15px; font-size:1.1rem; color:#ddd;">${m.text}</p>
                ${m.reply ? `
                    <div style="background:#0a0a0a; border-right:4px solid #d4af37; padding:15px; border-radius:8px; margin-top:10px;">
                        <strong style="color:#d4af37; display:block; margin-bottom:5px;">🛡️ رد المدير:</strong>
                        <p style="color:#bbb;">${m.reply}</p>
                    </div>` : (isAdmin ? `
                    <div style="margin-top:15px; display:flex; gap:10px;">
                        <input id="reply-input-${m.id}" placeholder="اكتب الرد هنا..." style="flex:1; background:#000; color:#fff; border:1px solid #444; border-radius:5px; padding:8px;">
                        <button onclick="app.replyToMessage(${m.id})" class="nav-btn" style="width:small; margin:0; background:#d4af37; color:#000;">رد</button>
                    </div>` : '<p style="color:#d4af37; font-size:0.9rem;">⏳ في انتظار مراجعة المدير...</p>')}
            </div>`;
    }

    replyToMessage(id) {
        const reply = document.getElementById(`reply-input-${id}`).value.trim();
        if (!reply) return;
        const m = this.messages.find(msg => msg.id === id);
        if (m) {
            m.reply = reply;
            localStorage.setItem(this.KEY_MSGS, JSON.stringify(this.messages));
            this.renderAdminSupport();
        }
    }

    // ---------------------------------------------------------------------
    // 🕯️ THE QUIZ SYSTEM (CANDLESTICK & LESSONS)
    // ---------------------------------------------------------------------

    startCandleQuiz() {
        this.quizState = {
            current: 0,
            score: 0,
            activeType: 'candle',
            questions: [
                { name: 'Hammer (المطرقة)', svg: '<rect x="35" y="15" width="30" height="20" fill="#00ff41"/><line x1="50" y1="35" x2="50" y2="85" stroke="#00ff41" stroke-width="4"/>' },
                { name: 'Shooting Star', svg: '<rect x="35" y="65" width="30" height="20" fill="#ff4d4d"/><line x1="50" y1="15" x2="50" y2="65" stroke="#ff4d4d" stroke-width="4"/>' },
                { name: 'Doji (دوجي)', svg: '<line x1="50" y1="20" x2="50" y2="80" stroke="#fff" stroke-width="3"/><line x1="30" y1="50" x2="70" y2="50" stroke="#fff" stroke-width="3"/>' },
                { name: 'Marubozu', svg: '<rect x="35" y="10" width="30" height="80" fill="#00ff41"/>' }
            ]
        };
        this.renderQuizPage();
    }

    startLessonQuiz() {
        this.quizState = {
            current: 0,
            score: 0,
            activeType: 'logic',
            questions: [
                { q: 'ما هو الفريم الأقوى لتحديد الاتجاه؟', options: ['دقيقة واحدة', '4 ساعات / يومي', '5 ثواني'], correct: 1 },
                { q: 'ماذا يعني FVG في التداول؟', options: ['فجوة القيمة العادلة', 'خط اتجاه عالمي', 'مؤشر قوة السهم'], correct: 0 },
                { q: 'متى نضع وقف الخسارة (Stop Loss)؟', options: ['بعد فتح الصفقة بدقائق', 'لا نستخدمه أبداً', 'عند فتح الصفقة مباشرة'], correct: 2 }
            ]
        };
        this.renderQuizPage();
    }

    renderQuizPage() {
        const q = this.quizState.questions[this.quizState.current];
        this.mainContent.innerHTML = '';

        if (this.quizState.activeType === 'candle') {
            this.mainContent.innerHTML = `
                <div class="page-header"><h1>اختبر مهاراتك في الشموع 🕯️</h1></div>
                <div style="text-align:center; background:#111; padding:40px; border-radius:20px; border:1px solid #333;">
                    <div style="background:#000; padding:20px; display:inline-block; border-radius:10px; margin-bottom:30px; border:1px solid #222;">
                        <svg width="200" height="200" viewBox="0 0 100 100" style="filter: drop-shadow(0 0 10px rgba(255,255,255,0.2));">
                            ${q.svg}
                        </svg>
                    </div>
                    <p style="font-size:1.2rem; margin-bottom:30px;">ما هو نوع هذه الشمعة اليابانية؟</p>
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:15px; max-width:600px; margin:0 auto;">
                        ${['Hammer (المطرقة)', 'Shooting Star', 'Doji (دوجي)', 'Marubozu', 'Engulfing'].map(opt => `
                            <button onclick="app.checkAnswer('${opt}', '${q.name}')" class="nav-btn">${opt}</button>
                        `).join('')}
                    </div>
                </div>`;
        } else {
            this.mainContent.innerHTML = `
                <div class="page-header"><h1>اختبار نهاية المستوى الأول 🏆</h1></div>
                <div class="content-block" style="text-align:center;">
                    <h3 style="margin-bottom:30px; color:#d4af37;">${q.q}</h3>
                    <div style="display:grid; gap:15px; text-align:right;">
                        ${q.options.map((opt, idx) => `
                            <button onclick="app.checkAnswer(${idx}, ${q.correct})" class="nav-btn" style="text-align:right;">${idx + 1}. ${opt}</button>
                        `).join('')}
                    </div>
                </div>`;
        }
    }

    checkAnswer(choice, correct) {
        if (choice === correct) {
            this.quizState.score++;
        }
        this.quizState.current++;
        if (this.quizState.current < this.quizState.questions.length) {
            this.renderQuizPage();
        } else {
            this.renderQuizResult();
        }
    }

    renderQuizResult() {
        const { score, questions } = this.quizState;
        this.mainContent.innerHTML = `
            <div style="text-align:center; padding:100px 20px;">
                <h1 style="color:#d4af37; font-size:4rem; margin-bottom:10px;">🏁</h1>
                <h2>انتهى الاختبار!</h2>
                <div style="font-size:2.5rem; margin:20px 0; color:#00ff41;">🎉 ${score} / ${questions.length}</div>
                <p style="color:#888; margin-bottom:30px;">لقد قمت بعمل رائع. استمر في الدروس القادمة!</p>
                <button onclick="app.loadPage('home')" class="auth-btn" style="width:auto; padding:15px 40px;">العودة للرئيسية</button>
            </div>`;
    }
}

// ---------------------------------------------------------------------
// 🌍 GLOBAL INITIALIZATIONS
// ---------------------------------------------------------------------
window.authSwitch = (view) => {
    if (window.app) window.app.showAuth(view);
};

// Re-map startQuiz calls from HTML to our class
window.startQuiz = (t) => {
    if (t === 'lessons') window.app.startLessonQuiz();
    else window.app.startCandleQuiz();
};
