// Academy Platform - ORIGINAL BACKUP (RESTORED & RENDER-READY)
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Restoration Complete: Original Backup Loaded.');
    window.app = new AcademyPlatform();
});

class AcademyPlatform {
    constructor() {
        // Storage Keys
        this.KEY_USERS = 'academy_users_db_v3';
        this.KEY_SESSION = 'academy_current_session_v3';
        this.KEY_MSGS = 'academy_messages_v3';

        // Initialize Data
        this.users = this.loadData(this.KEY_USERS, []);
        this.currentUser = this.loadData(this.KEY_SESSION, null);
        this.messages = this.loadData(this.KEY_MSGS, []);

        // Bind DOM Elements
        this.authContainer = document.getElementById('auth-container');
        this.dashboardContainer = document.getElementById('dashboard-container');
        this.sidebar = document.getElementById('app-sidebar');
        this.mainContent = document.getElementById('main-content');

        this.init();
    }

    loadData(key, defaultVal) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultVal;
        } catch (e) { return defaultVal; }
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
                this.handleLogin(document.getElementById('login-email').value.trim(), document.getElementById('login-password').value.trim());
            };
        }

        const signupForm = document.getElementById('form-signup');
        if (signupForm) {
            signupForm.onsubmit = (e) => {
                e.preventDefault();
                this.handleSignup(
                    document.getElementById('signup-name').value.trim(),
                    document.getElementById('signup-email').value.trim(),
                    document.getElementById('signup-password').value.trim()
                );
            };
        }
    }

    // --- Database Actions ---

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
            } else { alert(`❌ خطأ: ${data.error}`); }
        } catch (err) { alert('❌ فشل الاتصال بقاعدة البيانات.'); }
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
            } else { alert(`❌ خطأ: ${data.error}`); }
        } catch (err) { alert('❌ فشل الاتصال بالسيرفر.'); }
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

    // --- UI Logic ---

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
        let notifyCount = 0;
        if (this.currentUser.role === 'admin') {
            notifyCount = this.messages.filter(m => !m.reply).length;
        } else {
            notifyCount = this.messages.filter(m => m.userId === this.currentUser.id && m.reply && !m.seen).length;
        }

        let content = `
            <div class="user-info">
                <div class="user-avatar" style="width:60px; height:60px; background:#d4af37; border-radius:50%; margin:0 auto 10px; display:flex; align-items:center; justify-content:center; color:#000; font-weight:bold; font-size:1.5rem;">
                    ${this.currentUser.name.charAt(0)}
                </div>
                <h3>${this.currentUser.name}</h3>
                <span style="color:#888; font-size:0.8rem;">${this.currentUser.role === 'admin' ? '🛡️ مدير النظام' : '🎓 طالـــب'}</span>
            </div>
        `;

        if (this.currentUser.role === 'admin') {
            content += `
                <div class="nav-label" style="color:#d4af37;">🛡️ أدوات الإدارة</div>
                <button onclick="app.loadPage('admin-users')" class="nav-btn">👥 إدارة المستخدمين</button>
                <button onclick="app.loadPage('admin-support')" class="nav-btn" style="position:relative;">
                    📩 تذاكر الدعم 
                    ${notifyCount > 0 ? `<span style="position:absolute; left:10px; top:15px; background:#ff4d4d; color:white; border-radius:10px; padding:2px 8px; font-size:0.7rem;">${notifyCount}</span>` : ''}
                </button>
            `;
        }

        content += `
            <div class="nav-label">الرئيسية</div>
            <button onclick="app.loadPage('home')" class="nav-btn">🏠 الرئيسية</button>
            <div class="nav-label">الأكاديمية</div>
            <button onclick="app.loadPage('lessons-hub')" class="nav-btn">📚 الدروس</button>
            <button onclick="app.loadPage('strategies')" class="nav-btn">⚡ استراتيجيات</button>
            <button onclick="app.loadPage('indicators')" class="nav-btn">📉 مؤشرات</button>
            <button onclick="app.loadPage('psychology')" class="nav-btn">🧘 سيكولوجية</button>
            <button onclick="app.loadPage('risk_management')" class="nav-btn">🛡️ إدارة المخاطر</button>
            <button onclick="app.loadPage('tools')" class="nav-btn">🛠️ أدوات ومنصات</button>
            <div class="nav-label">المساعدة</div>
            <button onclick="app.loadPage('student-support')" class="nav-btn">💬 تذاكر الدعم</button>
            <button onclick="app.startCandleQuiz()" class="nav-btn">🕯️ اختبار الشموع</button>
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

    // --- Feature Rendering ---

    renderAdminUsers() {
        const students = (this.users || []).filter(u => u.role !== 'admin');
        let rows = students.length ? students.map(u => `
            <tr>
                <td style="padding:12px;">${u.name}</td>
                <td style="padding:12px;">${u.email}</td>
                <td style="padding:12px; color:#00ff41;">${u.password || '******'}</td>
                <td style="padding:12px;"><button onclick="app.deleteUser('${u.id}')" style="background:#ff4d4d; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">حذف 🗑️</button></td>
            </tr>`).join('') : '<tr><td colspan="4" style="text-align:center; padding:20px;">لا يوجد طلاب حالياً</td></tr>';

        this.mainContent.innerHTML = `<div class="page-header"><h1>👥 إدارة المستخدمين</h1></div>
            <div style="background:#111; padding:20px; border-radius:15px; border:1px solid #333;">
                <table style="width:100%; text-align:right;">
                    <thead><tr style="border-bottom:2px solid #222;"><th>الاسم</th><th>البريد</th><th>كلمة السر</th><th>تحكم</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
    }

    renderAdminSupport() {
        const pending = this.messages.filter(m => !m.reply).reverse();
        this.mainContent.innerHTML = `<div class="page-header"><h1>إدارة الدعم</h1></div>
            <div id="admin-pending-list">${pending.map(m => this.createMessageHTML(m, true)).join('') || '<p>لا توجد رسائل جديدة.</p>'}</div>`;
    }

    renderStudentSupport() {
        this.mainContent.innerHTML = `<div class="page-header"><h1>الدعم الفني 💬</h1></div>
            <div style="background:#111; padding:20px; border-radius:12px; border:1px solid #333; margin-bottom:20px;">
                <textarea id="support-msg" style="width:100%; height:100px; background:#000; color:#fff; border:1px solid #444; border-radius:8px; padding:10px;" placeholder="اكتب رسالتك للمدير..."></textarea>
                <button onclick="app.sendSupportMessage()" class="auth-btn" style="width:auto; margin-top:10px;">إرسال 📤</button>
            </div>
            <div id="msgs-list">${this.messages.filter(m => m.userId === this.currentUser.id).reverse().map(m => this.createMessageHTML(m, false)).join('')}</div>`;
    }

    sendSupportMessage() {
        const txt = document.getElementById('support-msg').value.trim();
        if (!txt) return;
        const msg = { id: Date.now(), userId: this.currentUser.id, userName: this.currentUser.name, text: txt, reply: null, date: new Date().toLocaleString('ar-EG') };
        this.messages.push(msg); this.saveMessages(); this.renderStudentSupport();
    }

    createMessageHTML(msg, isAdmin) {
        return `<div class="msg-card" style="background:#000; padding:15px; border:1px solid #222; border-radius:10px; margin-bottom:10px;">
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:#888;"><strong>${msg.userName}</strong><span>${msg.date}</span></div>
            <p>${msg.text}</p>
            ${msg.reply ? `<div style="background:#111; padding:10px; border-left:3px solid #d4af37; margin-top:10px;"><strong>الرد:</strong> ${msg.reply}</div>` :
                (isAdmin ? `<div style="margin-top:10px;"><input id="reply-${msg.id}" style="background:#111; color:#fff; border:1px solid #333; padding:5px;" placeholder="اكتب الرد..."><button onclick="app.replyMsg(${msg.id})" style="margin-right:10px;">رد</button></div>` : '<p style="color:#d4af37;">⏳ في انتظار الرد...</p>')}
        </div>`;
    }

    replyMsg(id) {
        const reply = document.getElementById(`reply-${id}`).value;
        const m = this.messages.find(msg => msg.id === id);
        if (m) { m.reply = reply; this.saveMessages(); this.renderAdminSupport(); }
    }

    startCandleQuiz() {
        this.quizState = {
            current: 0, score: 0, questions: [
                { name: 'Hammer (المطرقة)', svg: '<rect x="30" y="10" width="20" height="20" fill="#00ff41"/><line x1="40" y1="30" x2="40" y2="80" stroke="#00ff41" stroke-width="2"/>' },
                { name: 'Doji (دوجي)', svg: '<line x1="40" y1="20" x2="40" y2="80" stroke="#fff" stroke-width="2"/><line x1="25" y1="50" x2="55" y2="50" stroke="#fff" stroke-width="2"/>' }
            ]
        };
        this.loadPage('candle-quiz-room');
    }

    renderCandleQuiz() {
        const q = this.quizState.questions[this.quizState.current];
        this.mainContent.innerHTML = `<div class="page-header"><h1>اختبر مهاراتك 🕯️</h1></div>
            <div style="text-align:center; background:#111; padding:30px; border-radius:15px;">
                <div style="margin-bottom:20px;"><svg width="100" height="100" viewBox="0 0 100 100">${q.svg}</svg></div>
                <div style="display:grid; gap:10px; max-width:300px; margin:0 auto;">
                    ${['Hammer (المطرقة)', 'Doji (دوجي)', 'Engulfing'].map(opt => `<button onclick="app.checkCandle('${opt}', '${q.name}')" class="nav-btn">${opt}</button>`).join('')}
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
window.startQuiz = (type) => app.startCandleQuiz();
