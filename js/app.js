// Trading Academy - Professional Restored Version (Modular & Styled)
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Academy Platform: Fully Organized Version Loaded.');
    window.app = new AcademyPlatform();
});

class AcademyPlatform {
    constructor() {
        this.KEY_SESSION = 'academy_current_session_v3';
        this.KEY_MSGS = 'academy_messages_v3';
        this.currentUser = JSON.parse(localStorage.getItem(this.KEY_SESSION)) || null;
        this.messages = JSON.parse(localStorage.getItem(this.KEY_MSGS)) || [];

        // DOM Elements
        this.authContainer = document.getElementById('auth-container');
        this.dashboardContainer = document.getElementById('dashboard-container');
        this.sidebarEl = document.getElementById('app-sidebar');
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

        const resetForm = document.getElementById('form-reset');
        if (resetForm) {
            resetForm.onsubmit = (e) => {
                e.preventDefault();
                this.handleResetInitial(document.getElementById('reset-email').value.trim());
            };
        }
    }

    // --- Authentication ---

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
                alert(`❌ خطأ: ${data.error}`);
            }
        } catch (err) {
            alert('❌ فشل الاتصال بالسيرفر. تأكد من تشغيل السيرفر المحلي أو الاتصال بـ Render.');
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

    async handleResetInitial(email) {
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'checkEmail', payload: { email } })
            });
            const data = await response.json();
            if (response.ok) {
                document.getElementById('reset-new-sec').style.display = 'block';
                this.resetEmail = email; // Store for final step
            } else {
                alert('❌ الحساب غير موجود. يرجى التأكد من البريد الإلكتروني.');
            }
        } catch (err) {
            alert('❌ فشل الاتصال.');
        }
    }

    async handleFinalReset() {
        const password = document.getElementById('reset-new-password').value.trim();
        if (password.length < 6) return alert('كلمة السر يجب أن تكون 6 أحرف على الأقل.');

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'updatePassword', payload: { email: this.resetEmail, password } })
            });
            if (response.ok) {
                alert('✅ تم تحديث كلمة السر بنجاح! يمكنك الآن تسجيل الدخول.');
                this.showAuth('login');
            } else {
                alert('❌ حدث خطأ في تحديث البيانات.');
            }
        } catch (err) { alert('❌ فشل الاتصال.'); }
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

    // --- Core UI logic ---

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

        // Default page based on role
        if (this.currentUser.role === 'admin') {
            this.loadPage('admin-users');
        } else {
            this.loadPage('home');
        }
    }

    renderSidebar() {
        if (!this.sidebarEl) return;

        const isAdm = this.currentUser.role === 'admin';
        const name = this.currentUser.name || 'مستخدم';
        const char = name.charAt(0).toUpperCase();

        // Calculate Notifications
        let notifyCount = 0;
        if (isAdm) {
            notifyCount = this.messages.filter(m => !m.reply).length;
        } else {
            notifyCount = this.messages.filter(m => m.userId === this.currentUser.id && m.reply && !m.seen).length;
        }

        let html = `
            <div class="user-profile">
                <div class="avatar" style="background:var(--primary); color:#000; font-weight:bold; font-size:1.2rem; display:flex; align-items:center; justify-content:center;">
                    ${char}
                </div>
                <div class="user-info">
                    <span class="name">${name}</span>
                    <span class="rank">${isAdm ? '🛡️ مدير النظام' : '🎓 طالـــب'}</span>
                </div>
            </div>

            <div class="nav-menu">
                ${isAdm ? `
                    <div class="nav-label">لوحة التحكم</div>
                    <a class="nav-item" id="nav-admin-users" onclick="app.loadPage('admin-users')">
                        <i data-lucide="users"></i> <span>إدارة الطلاب</span>
                    </a>
                    <a class="nav-item" id="nav-admin-support" onclick="app.loadPage('admin-support')">
                        <i data-lucide="mail"></i> <span>تذاكر الدعم</span>
                        ${notifyCount > 0 ? `<span class="notify-badge">${notifyCount}</span>` : ''}
                    </a>
                ` : ''}

                <div class="nav-label">الرئيسية</div>
                <a class="nav-item" id="nav-home" onclick="app.loadPage('home')">
                    <i data-lucide="home"></i> <span>الرئيسية 🏠</span>
                </a>
                <a class="nav-item" id="nav-about" onclick="app.loadPage('about')">
                    <i data-lucide="info"></i> <span>من نحن؟ 🌟</span>
                </a>

                <div class="nav-label">الأكاديمية الأكاديمية</div>
                <a class="nav-item" id="nav-lessons-hub" onclick="app.loadPage('lessons-hub')">
                    <i data-lucide="book-open"></i> <span>الدروس 📚</span>
                </a>
                <a class="nav-item" id="nav-strategies" onclick="app.loadPage('strategies')">
                    <i data-lucide="zap"></i> <span>استراتيجيات ⚡</span>
                </a>
                <a class="nav-item" id="nav-indicators" onclick="app.loadPage('indicators')">
                    <i data-lucide="line-chart"></i> <span>مؤشرات 📉</span>
                </a>
                <a class="nav-item" id="nav-psychology" onclick="app.loadPage('psychology')">
                    <i data-lucide="brain"></i> <span>سيكولوجية 🧘</span>
                </a>
                <a class="nav-item" id="nav-risk_management" onclick="app.loadPage('risk_management')">
                    <i data-lucide="shield"></i> <span>إدارة المخاطر 🛡️</span>
                </a>
                <a class="nav-item" id="nav-tools" onclick="app.loadPage('tools')">
                    <i data-lucide="wrench"></i> <span>أدوات ومنصات 🛠️</span>
                </a>

                <div class="nav-label">المساعدة</div>
                <a class="nav-item" id="nav-student-support" onclick="app.loadPage('student-support')">
                    <i data-lucide="message-circle"></i> <span>تذاكر الدعم 💬</span>
                </a>
                <a class="nav-item" onclick="app.startCandleQuiz()">
                    <i data-lucide="flame"></i> <span>اختبار الشموع 🕯️</span>
                </a>

                <div style="margin-top:2rem; border-top:1px solid var(--border); padding-top:1rem;">
                    <a class="nav-item" onclick="app.logout()" style="color:#ff4d4d;">
                        <i data-lucide="log-out"></i> <span>خروج 🚪</span>
                    </a>
                </div>
            </div>
        `;

        this.sidebarEl.innerHTML = html;
        if (window.lucide) window.lucide.createIcons();
    }

    loadPage(pageId) {
        console.log(`Loading Page: ${pageId}`);
        this.mainContent.innerHTML = ''; // Clear content
        window.scrollTo(0, 0);

        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const activeNav = document.getElementById(`nav-${pageId}`);
        if (activeNav) activeNav.classList.add('active');

        // Handle Special Dynamic Pages
        if (pageId === 'admin-users') return this.renderAdminUsers();
        if (pageId === 'admin-support') return this.renderAdminSupport();
        if (pageId === 'student-support') return this.renderStudentSupport();
        if (pageId === 'quiz-page') return this.renderQuizPage(); // From content.js but custom logic
        if (pageId === 'candle-quiz-room') return this.renderCandleQuiz();

        // Load content from content.js
        if (typeof pages !== 'undefined' && pages[pageId]) {
            this.mainContent.innerHTML = `<div class="content-wrapper">${pages[pageId]}</div>`;
            if (window.lucide) window.lucide.createIcons();

            // Re-bind any specific buttons in and content
            if (pageId === 'lessons-hub' || pageId === 'home') this.bindContentBtns();

        } else {
            this.mainContent.innerHTML = `<div style="padding:100px; text-align:center;">
                <h1 style="font-size:4rem; color:var(--primary);">404</h1>
                <p>عذراً، هذه الصفحة قيد التطوير أو غير موجودة.</p>
                <button class="btn btn-primary" onclick="app.loadPage('home')" style="margin-top:20px;">العودة للرئيسية</button>
            </div>`;
        }
    }

    bindContentBtns() {
        // Find any buttons that use loadPage or startQuiz inside the innerHTML and ensures they work
        // These are usually handled by global scope, but good to check.
    }

    // --- Admin & Support Logic ---

    renderAdminUsers() {
        this.mainContent.innerHTML = `
            <div class="page-header">
                <h1>👥 قائمة الطلاب</h1>
                <div class="stat-card">إجمالي الطلاب: ${this.messages.length}</div>
            </div>
            <p style="color:var(--text-muted); margin-bottom:2rem;">هنا يمكنك مراجعة الطلاب المسجلين وحساباتهم.</p>
            <div style="background:var(--card-bg); border-radius:16px; border:1px solid var(--border); overflow:hidden;">
                <table class="data-table">
                    <thead>
                        <tr><th>الاسم</th><th>البريد</th><th>التحكم</th></tr>
                    </thead>
                    <tbody id="admin-user-rows"></tbody>
                </table>
            </div>
        `;
        this.fetchAndRenderUsers();
    }

    async fetchAndRenderUsers() {
        try {
            const response = await fetch('/api/auth'); // GET call for users
            const users = await response.json();
            const tbody = document.getElementById('admin-user-rows');
            if (users && users.length) {
                tbody.innerHTML = users.filter(u => u.role !== 'admin').map(u => `
                    <tr>
                        <td>${u.name}</td>
                        <td>${u.email}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" style="background:#ff4d4d; color:#fff;" onclick="app.deleteUser('${u.id}')">حذف</button>
                        </td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:30px;">لا يوجد طلاب حالياً.</td></tr>';
            }
        } catch (err) { console.error(err); }
    }

    async deleteUser(id) {
        if (!confirm('هل أنت متأكد من حذف هذا الحساب؟')) return;
        try {
            const res = await fetch('/api/auth', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payload: { id } })
            });
            if (res.ok) { this.renderAdminUsers(); }
        } catch (e) { alert('خطأ في الحذف.'); }
    }

    renderStudentSupport() {
        this.mainContent.innerHTML = `
            <div class="page-header">
                <h1>الدعم الفني 💬</h1>
            </div>
            <div style="background:var(--card-bg); padding:2rem; border-radius:16px; border:1px solid var(--border); margin-bottom:2rem;">
                <h3 style="margin-bottom:1rem;">أرسل رسالة للمدير</h3>
                <textarea id="support-inp" placeholder="صف مشكلتك هنا..." style="width:100%; height:120px; background:#000; color:#fff; border:1px solid var(--border); border-radius:12px; padding:1rem; font-family:inherit;"></textarea>
                <button class="btn btn-primary" style="margin-top:1rem;" onclick="app.sendMsg()">إرسال الرسالة</button>
            </div>
            <div id="student-msgs-history"></div>
        `;
        this.renderMsgHistory();
    }

    renderMsgHistory() {
        const hist = document.getElementById('student-msgs-history');
        const myMsgs = this.messages.filter(m => m.userId === this.currentUser.id).reverse();
        hist.innerHTML = myMsgs.map(m => `
            <div class="msg-card">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span style="color:var(--primary); font-weight:bold;">أنت</span>
                    <span style="font-size:0.8rem; color:var(--text-muted);">${m.date}</span>
                </div>
                <p>${m.text}</p>
                ${m.reply ? `
                    <div class="admin-reply-box">
                        <strong style="color:var(--primary);">رد الإدارة:</strong>
                        <p>${m.reply}</p>
                    </div>
                ` : '<div style="margin-top:10px; color:var(--text-muted); font-size:0.85rem;">⏳ في انتظار الرد...</div>'}
            </div>
        `).join('');
    }

    sendMsg() {
        const txt = document.getElementById('support-inp').value.trim();
        if (!txt) return;
        const msg = {
            id: Date.now(),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            text: txt,
            reply: null,
            date: new Date().toLocaleString('ar-EG'),
            seen: false
        };
        this.messages.push(msg);
        localStorage.setItem(this.KEY_MSGS, JSON.stringify(this.messages));
        this.renderStudentSupport();
    }

    renderAdminSupport() {
        const pending = this.messages.filter(m => !m.reply).reverse();
        this.mainContent.innerHTML = `
            <div class="page-header">
                <h1>تذاكر الدعم الواردة 📩</h1>
            </div>
            <div id="admin-pending-msgs">
                ${pending.length ? pending.map(m => `
                    <div class="msg-card">
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                            <span style="color:var(--primary); font-weight:bold;">${m.userName}</span>
                            <span style="font-size:0.8rem; color:var(--text-muted);">${m.date}</span>
                        </div>
                        <p>${m.text}</p>
                        <div style="margin-top:15px; display:flex; gap:10px;">
                            <input id="rep-${m.id}" placeholder="اكتب الرد هنا..." style="flex:1; background:#000; color:#fff; border:1px solid var(--border); padding:8px; border-radius:8px;">
                            <button class="btn btn-primary btn-sm" onclick="app.replyMsg(${m.id})">رد</button>
                        </div>
                    </div>
                `).join('') : '<p style="text-align:center; padding:50px; color:var(--text-muted);">لا توجد رسائل جديدة.</p>'}
            </div>
        `;
    }

    replyMsg(id) {
        const txt = document.getElementById(`rep-${id}`).value.trim();
        if (!txt) return;
        const msg = this.messages.find(m => m.id === id);
        if (msg) {
            msg.reply = txt;
            localStorage.setItem(this.KEY_MSGS, JSON.stringify(this.messages));
            this.renderAdminSupport();
        }
    }

    // --- Quiz Systems ---

    startCandleQuiz() {
        this.candleGame = {
            step: 0,
            score: 0,
            items: [
                { name: 'Hammer (المطرقة)', svg: '<rect x="40" y="20" width="20" height="20" fill="#00ff41"/><line x1="50" y1="40" x2="50" y2="90" stroke="#00ff41" stroke-width="3"/>' },
                { name: 'Shooting Star', svg: '<rect x="40" y="70" width="20" height="20" fill="#ff4d4d"/><line x1="50" y1="10" x2="50" y2="70" stroke="#ff4d4d" stroke-width="3"/>' },
                { name: 'Doji', svg: '<line x1="50" y1="10" x2="50" y2="90" stroke="#fff" stroke-width="2"/><line x1="30" y1="50" x2="70" y2="50" stroke="#fff" stroke-width="3"/>' }
            ]
        };
        this.loadPage('candle-quiz-room');
    }

    renderCandleQuiz() {
        const q = this.candleGame.items[this.candleGame.step];
        this.mainContent.innerHTML = `
            <div class="page-header"><h1>اختبر بصرك في الشموع 🕯️</h1></div>
            <div style="background:var(--card-bg); padding:3rem; border-radius:24px; text-align:center; max-width:600px; margin:0 auto; border:1px solid var(--border);">
                <div style="margin-bottom:2rem; background:#000; padding:20px; border-radius:15px; display:inline-block;">
                    <svg width="100" height="100" viewBox="0 0 100 100">${q.svg}</svg>
                </div>
                <h2 style="margin-bottom:2rem;">ما هو نوع هذه الشمعة؟</h2>
                <div style="display:grid; grid-template-columns:1fr; gap:1rem;">
                    ${['Hammer (المطرقة)', 'Shooting Star', 'Doji', 'Engulfing'].map(opt => `
                        <button class="nav-btn" style="text-align:center; border:1px solid var(--border);" onclick="app.checkCandleAns('${opt}')">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    checkCandleAns(opt) {
        if (opt === this.candleGame.items[this.candleGame.step].name) {
            this.candleGame.score++;
        }
        this.candleGame.step++;
        if (this.candleGame.step < this.candleGame.items.length) {
            this.renderCandleQuiz();
        } else {
            this.mainContent.innerHTML = `<div style="text-align:center; padding:100px;">
                <h1>انتهى الاختبار!</h1>
                <h2 style="color:var(--primary); font-size:3rem;">النتيجة: ${this.candleGame.score} / ${this.candleGame.items.length}</h2>
                <button class="btn btn-primary" style="margin-top:2rem;" onclick="app.loadPage('home')">العودة للرئيسية</button>
            </div>`;
        }
    }

    startQuiz(type) {
        // Redirection to the Quiz Page using the content.js structure
        this.loadPage('quiz-page');
        // If the original quiz.js is loaded, it will handle it via startQuiz()
        if (typeof window.startQuiz === 'function' && window.startQuiz.toString().includes('quiz-interface')) {
            console.log("Calling specialized quiz function from quiz.js");
            setTimeout(() => window.startQuiz(), 100);
        }
    }

    togglePasswordVisibility(id) {
        const inp = document.getElementById(id);
        const icon = inp.parentNode.querySelector('.toggle-password');
        if (inp.type === 'password') {
            inp.type = 'text';
            icon.textContent = '🔒';
        } else {
            inp.type = 'password';
            icon.textContent = '👁️';
        }
    }
}

// Global Switches
window.authSwitch = (view) => app.showAuth(view);
window.startQuiz = (type) => app.startQuiz(type);
window.startSimulator = () => app.loadPage('quiz-page'); // Map to quiz if needed
