// Academy Platform - Complete Edition

document.addEventListener('DOMContentLoaded', () => {
    console.log('App Started...');
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

        // Admin Setup
        this.ADMIN_EMAIL = 'admin@gmail.com';
        this.ensureAdminExists();

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
        } catch (e) {
            console.error('Storage Error', e);
            return defaultVal;
        }
    }

    ensureAdminExists() {
        const adminIndex = this.users.findIndex(u => u.email === this.ADMIN_EMAIL);
        const adminData = {
            id: 'admin_001',
            name: 'المدير العام',
            email: this.ADMIN_EMAIL,
            password: 'admin123',
            role: 'admin',
            joined: new Date().toLocaleDateString()
        };

        if (adminIndex === -1) {
            this.users.push(adminData);
        } else {
            this.users[adminIndex] = adminData;
        }
        this.saveUsers();
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
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value.trim();
                const pass = document.getElementById('login-password').value.trim();
                this.handleLogin(email, pass);
            });
        }

        const signupForm = document.getElementById('form-signup');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('signup-name').value.trim();
                const email = document.getElementById('signup-email').value.trim();
                const pass = document.getElementById('signup-password').value.trim();
                this.handleSignup(name, email, pass);
            });
        }
    }

    // --- Actions ---

    handleLogin(email, password) {
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            this.createSession(user);
        } else {
            alert('❌ خطأ: البريد الإلكتروني أو كلمة السر غير صحيحة.\n\nتلميح: admin@gmail.com / admin123');
        }
    }

    handleSignup(name, email, password) {
        if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            alert('هذا البريد مسجل مسبقاً!');
            return;
        }
        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email,
            password: password,
            role: 'student',
            joined: new Date().toLocaleDateString()
        };
        this.users.push(newUser);
        this.saveUsers();
        this.createSession(newUser);
        alert('تم إنشاء الحساب بنجاح!');
    }

    createSession(user) {
        this.currentUser = user;
        localStorage.setItem(this.KEY_SESSION, JSON.stringify(user));
        this.renderDashboard();
    }

    logout() {
        if (confirm('هل أنت متأكد من الخروج؟')) {
            this.currentUser = null;
            localStorage.removeItem(this.KEY_SESSION);
            window.location.reload();
        }
    }

    saveUsers() {
        localStorage.setItem(this.KEY_USERS, JSON.stringify(this.users));
    }

    // --- UI Rendering ---

    showAuth(view) {
        this.dashboardContainer.style.display = 'none';
        this.authContainer.style.display = 'flex';
        document.getElementById('login-view').style.display = view === 'login' ? 'block' : 'none';
        document.getElementById('signup-view').style.display = view === 'signup' ? 'block' : 'none';
    }

    renderDashboard() {
        this.authContainer.style.display = 'none';
        this.dashboardContainer.style.display = 'flex';

        this.renderSidebar();

        // Load default page based on role
        if (this.currentUser.role === 'admin') {
            this.loadPage('admin-users');
        } else {
            this.loadPage('home'); // Load the new Home content
        }
    }

    renderSidebar() {
        let content = `
            <div class="user-info">
                <h3>${this.currentUser.name}</h3>
                <span style="color:#888; font-size:0.8rem;">${this.currentUser.role === 'admin' ? 'مدير النظام 🛡️' : 'طالب 🎓'}</span>
            </div>
        `;

        // ADMIN MENU
        if (this.currentUser.role === 'admin') {
            content += `
                <div class="nav-label">لوحة التحكم</div>
                <button onclick="app.loadPage('admin-users')" class="nav-btn">👥 إدارة المستخدمين</button>
                <button onclick="app.loadPage('admin-support')" class="nav-btn">📩 تذاكر الدعم</button>
            `;
        }
        // STUDENT MENU (The Grand Curriculum)
        else {
            content += `
                <div class="nav-label">الرئيسية</div>
                <button onclick="app.loadPage('home')" class="nav-btn">🏠 الرئيسية</button>
                <button onclick="app.loadPage('about')" class="nav-btn">ℹ️ من نحن</button>

                <div class="nav-label">المسار التعليمي</div>
                <button onclick="app.loadPage('lessons-hub')" class="nav-btn">📚 دروس مجانية</button>
                <div class="sub-nav" style="padding-right: 15px; font-size: 0.9em; color: #666;">
                    • المستوى 1 إلى 5
                </div>

                <div class="nav-label">مكتبة المتداول</div>
                <button onclick="app.loadPage('strategies')" class="nav-btn">⚡ استراتيجيات</button>
                <button onclick="app.loadPage('psychology')" class="nav-btn">🧘 سيكولوجية</button>
                <button onclick="app.loadPage('risk_management')" class="nav-btn">🛡️ إدارة المخاطر</button>
                <button onclick="app.loadPage('forbidden_trading')" class="nav-btn" style="color: #ff4d4d;">⚠️ منصات محرمة</button>
                <button onclick="app.loadPage('analysis')" class="nav-btn">📰 الأخبار والتحليل</button>
                <button onclick="app.loadPage('tools')" class="nav-btn">🛠️ أدوات ومنصات</button>

                <div class="nav-label">الدعم والمساعدة</div>
                <button onclick="app.loadPage('faq')" class="nav-btn">❓ الأسئلة الشائعة</button>
                <button onclick="app.loadPage('contact')" class="nav-btn">✉️ تواصل معنا</button>
                <button onclick="app.loadPage('student-support')" class="nav-btn">💬 تذاكر الدعم</button>
            `;
        }

        content += `<button onclick="app.logout()" class="nav-btn logout" style="margin-top:20px; background:#333;">تسجيل الخروج</button>`;
        this.sidebar.innerHTML = content;
    }

    loadPage(pageId) {
        this.mainContent.innerHTML = '';
        window.scrollTo(0, 0);

        // 1. Admin System Pages
        if (pageId === 'admin-users') { this.renderAdminUsers(); return; }
        if (pageId === 'admin-support') { this.renderAdminSupport(); return; }

        // 2. Student System Pages (Dynamic)
        if (pageId === 'student-support') { this.renderStudentSupport(); return; }

        // 3. Content Pages (From content.js)
        if (typeof pages !== 'undefined' && pages[pageId]) {
            this.mainContent.innerHTML = pages[pageId];
            if (window.lucide) window.lucide.createIcons();
        } else {
            this.mainContent.innerHTML = `<div class="content-block"><h1>404</h1><p>الصفحة غير موجودة أو قيد الإنشاء.</p></div>`;
        }
    }

    // --- Dynamic Feature Pages ---

    renderAdminUsers() {
        const students = this.users.filter(u => u.role !== 'admin');
        let rows = students.length ? students.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.joined}</td></tr>`).join('') : '<tr><td colspan="3" style="text-align:center;">لا يوجد طلاب</td></tr>';
        this.mainContent.innerHTML = `<div class="page-header"><h1>إدارة المستخدمين</h1></div><table class="data-table"><thead><tr><th>الاسم</th><th>البريد</th><th>تاريخ التسجيل</th></tr></thead><tbody>${rows}</tbody></table>`;
    }

    renderAdminSupport() {
        this.mainContent.innerHTML = `<div class="page-header"><h1>رسائل الدعم الواردة</h1></div><div id="admin-msgs-list">${this.messages.map(m => this.createMessageHTML(m, true)).join('')}</div>`;
    }

    renderStudentSupport() {
        this.mainContent.innerHTML = `
            <div class="page-header"><h1>طلب دعم فني</h1></div>
            <div class="auth-card" style="width:100%; max-width:600px; text-align:right;">
                <textarea id="support-msg" style="width:100%; height:100px; background:#222; color:#fff; border:1px solid #444; padding:10px;" placeholder="اكتب سؤالك..."></textarea>
                <button onclick="app.sendSupportMessage()" class="auth-btn" style="width:auto; margin-top:10px;">إرسال التذكرة</button>
            </div>
            <div style="margin-top:30px;"><h3>تذاكري السابقة</h3>${this.messages.filter(m => m.userId === this.currentUser.id).map(m => this.createMessageHTML(m, false)).join('')}</div>
        `;
    }

    sendSupportMessage() {
        const txt = document.getElementById('support-msg').value;
        if (!txt) return;
        const msg = { id: Date.now(), userId: this.currentUser.id, userName: this.currentUser.name, text: txt, reply: null, date: new Date().toLocaleDateString() };
        this.messages.push(msg);
        localStorage.setItem(this.KEY_MSGS, JSON.stringify(this.messages));
        this.loadPage('student-support');
    }

    createMessageHTML(msg, isAdmin) {
        return `
            <div class="msg-card" style="background:#1a1a1a; padding:15px; margin-bottom:10px; border-radius:8px; border-right:3px solid ${msg.reply ? '#00ff41' : '#d4af37'}">
                <p><small>${msg.date}</small> <strong>${msg.userName}:</strong> ${msg.text}</p>
                ${msg.reply ? `<p style="color:#d4af37; margin-top:10px; background:rgba(212,175,55,0.1); padding:10px; border-radius:5px;"><strong>الرد:</strong> ${msg.reply}</p>` :
                (isAdmin ? `<div style="margin-top:10px;"><input id="reply-${msg.id}" placeholder="اكتب الرد..." style="padding:5px; background:#333; color:#fff; border:1px solid #555;"><button onclick="app.replyMsg(${msg.id})" style="padding:5px 10px; background:#d4af37; border:none; cursor:pointer; margin-right:5px;">رد</button></div>` : '<p style="color:#666; margin-top:5px;">[في انتظار المراجعة]</p>')}
            </div>
        `;
    }

    replyMsg(id) {
        const text = document.getElementById(`reply-${id}`).value;
        const m = this.messages.find(msg => msg.id === id);
        if (m) { m.reply = text; localStorage.setItem(this.KEY_MSGS, JSON.stringify(this.messages)); this.loadPage('admin-support'); }
    }

    // --- Candlestick Quiz Logic ---
    startCandleQuiz() {
        this.quizState = {
            current: 0,
            score: 0,
            total: 10,
            questions: this.generateCandleQuestions()
        };
        this.loadPage('candle-quiz');
        setTimeout(() => this.renderCandleQuiz(), 100);
    }

    generateCandleQuestions() {
        // Pool of questions with SVGs
        const pool = [
            { name: 'Hammer (المطرقة)', svg: '<rect x="30" y="10" width="20" height="20" fill="#00ff41"/><line x1="40" y1="30" x2="40" y2="80" stroke="#00ff41" stroke-width="2"/>' },
            { name: 'Shooting Star (الشهاب)', svg: '<line x1="40" y1="20" x2="40" y2="70" stroke="#ff4d4d" stroke-width="2"/><rect x="30" y="70" width="20" height="20" fill="#ff4d4d"/>' },
            { name: 'Doji (دوجي)', svg: '<line x1="40" y1="20" x2="40" y2="80" stroke="#fff" stroke-width="2"/><line x1="25" y1="50" x2="55" y2="50" stroke="#fff" stroke-width="2"/>' },
            { name: 'Bullish Engulfing (ابتلاع صاعد)', svg: '<rect x="10" y="40" width="15" height="30" fill="#ff4d4d"/><rect x="35" y="10" width="25" height="80" fill="#00ff41"/>' },
            { name: 'Bearish Engulfing (ابتلاع هابط)', svg: '<rect x="10" y="10" width="25" height="80" fill="#00ff41"/><rect x="45" y="40" width="15" height="30" fill="#ff4d4d"/>' },
            { name: 'Tweezer Top (الملقاط العلوي)', svg: '<line x1="30" y1="10" x2="30" y2="40" stroke="#fff" stroke-width="2"/><rect x="20" y="40" width="20" height="40" fill="#00ff41"/><line x1="60" y1="10" x2="60" y2="40" stroke="#fff" stroke-width="2"/><rect x="50" y="40" width="20" height="40" fill="#ff4d4d"/>' },
            { name: 'Three White Soldiers (الجنود الثلاثة)', svg: '<rect x="10" y="60" width="20" height="30" fill="#00ff41"/><rect x="45" y="35" width="20" height="30" fill="#00ff41"/><rect x="80" y="10" width="20" height="30" fill="#00ff41"/>' },
            { name: 'Marubozu (ماروبوزو)', svg: '<rect x="30" y="10" width="20" height="80" fill="#00ff41"/>' },
            { name: 'Morning Star (نجم الصباح)', svg: '<rect x="10" y="10" width="20" height="60" fill="#ff4d4d"/><rect x="45" y="75" width="20" height="10" fill="#fff"/><rect x="80" y="10" width="20" height="50" fill="#00ff41"/>' },
            { name: 'Inverted Hammer (مطرقة مقلوبة)', svg: '<line x1="40" y1="20" x2="40" y2="70" stroke="#00ff41" stroke-width="2"/><rect x="30" y="70" width="20" height="20" fill="#00ff41"/>' }
        ];
        return pool.sort(() => 0.5 - Math.random()).slice(0, 10);
    }

    renderCandleQuiz() {
        const container = document.getElementById('quiz-dynamic-area');
        if (!container) return;

        if (this.quizState.current >= this.quizState.total) {
            this.showQuizResult();
            return;
        }

        const q = this.quizState.questions[this.quizState.current];
        const options = this.generateOptions(q.name);

        container.innerHTML = `
            <div style="text-align:center; padding: 20px;">
                <h4 style="color: #888; margin-bottom: 20px;">السؤال ${this.quizState.current + 1} من ${this.quizState.total}</h4>
                <div style="background: #000; padding: 40px; border-radius: 20px; display: inline-block; border: 2px solid #333; margin-bottom: 30px;">
                    <svg width="150" height="120" viewBox="0 0 150 120">
                        ${q.svg}
                    </svg>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; max-width: 500px; margin: 0 auto;">
                    ${options.map(opt => `
                        <button onclick="app.checkCandleAnswer('${opt}', '${q.name}')" 
                                style="background: #1a1a1a; color: #fff; border: 1px solid #444; padding: 15px; border-radius: 10px; cursor: pointer; transition: 0.3s; font-size: 1rem;">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    generateOptions(correctName) {
        const allNames = [
            'Hammer (المطرقة)', 'Shooting Star (الشهاب)', 'Doji (دوجي)', 'Marubozu (ماروبوزو)',
            'Bullish Engulfing (ابتلاع صاعد)', 'Bearish Engulfing (ابتلاع هابط)',
            'Tweezer Top (الملقاط العلوي)', 'Three White Soldiers (الجنود الثلاثة)',
            'Morning Star (نجم الصباح)', 'Evening Star (نجم المساء)', 'Inverted Hammer (مطرقة مقلوبة)',
            'Harami (هرامي)', 'Pin Bar (بين بار)', 'Rising Three Methods (طرق الارتفاع الثلاتة)'
        ];
        let options = [correctName];
        while (options.length < 4) {
            const rand = allNames[Math.floor(Math.random() * allNames.length)];
            if (!options.includes(rand)) options.push(rand);
        }
        return options.sort(() => 0.5 - Math.random());
    }

    checkCandleAnswer(selected, correct) {
        const buttons = document.querySelectorAll('#quiz-dynamic-area button');
        buttons.forEach(btn => btn.disabled = true);

        const selectedBtn = Array.from(buttons).find(b => b.innerText.trim() === selected.trim());
        const correctBtn = Array.from(buttons).find(b => b.innerText.trim() === correct.trim());

        if (selected === correct) {
            this.quizState.score++;
            if (selectedBtn) {
                selectedBtn.style.background = '#00ff41';
                selectedBtn.style.color = '#000';
                selectedBtn.style.borderColor = '#00ff41';
            }
            this.showFeedback(true);
        } else {
            if (selectedBtn) {
                selectedBtn.style.background = '#ff4d4d';
                selectedBtn.style.borderColor = '#ff4d4d';
            }
            if (correctBtn) {
                correctBtn.style.background = '#00ff41';
                correctBtn.style.color = '#000';
                correctBtn.style.borderColor = '#00ff41';
            }
            this.showFeedback(false, correct);
        }

        setTimeout(() => {
            this.quizState.current++;
            this.renderCandleQuiz();
        }, 2000);
    }

    showFeedback(isCorrect, correctName) {
        const area = document.getElementById('quiz-feedback');
        area.innerHTML = isCorrect
            ? '<div style="color: #00ff41; font-weight: bold; font-size: 1.4rem; text-shadow: 0 0 10px rgba(0,255,65,0.4);">✅ إجابة صحيحة! أحسنت.</div>'
            : `<div style="color: #ff4d4d; font-weight: bold; font-size: 1.4rem; text-shadow: 0 0 10px rgba(255,77,77,0.4);">❌ خطأ! الإجابة هي: ${correctName}</div>`;
        setTimeout(() => area.innerHTML = '', 1900);
    }

    showQuizResult() {
        const container = document.getElementById('quiz-dynamic-area');
        const percentage = (this.quizState.score / this.quizState.total) * 100;
        const passed = percentage >= 80;

        let title = passed ? '� تهانينا! لقد اجتزت الاختبار' : '⚠️ لم يحالفك الحظ هذه المرة';
        let msg = passed
            ? 'أنت الآن تتقن قراءة الشموع اليابانية بشكل ممتاز. يمكنك المتابعة في الدروس القادمة.'
            : 'يبدو أنك بحاجة لمراجعة الدرس جيداً قبل الانتقال للمستويات المتقدمة.';

        container.innerHTML = `
            <div style="text-align:center; padding: 40px;">
                <h2 style="color: ${passed ? '#00ff41' : '#ff4d4d'}; margin-bottom: 20px;">${title}</h2>
                <div style="font-size: 4rem; color: #fff; margin-bottom: 10px; font-weight: bold;">${this.quizState.score} / ${this.quizState.total}</div>
                <p style="color: #ccc; font-size: 1.2rem; margin-bottom: 40px; line-height: 1.6; max-width: 500px; margin-left: auto; margin-right: auto;">${msg}</p>
                
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    ${passed ? `
                        <button onclick="app.loadPage('level-3')" class="btn btn-primary" style="background: #00ff41; color: #000; font-weight: bold; padding: 18px 45px; border: none; border-radius: 50px; cursor: pointer; font-size: 1.1rem; box-shadow: 0 5px 20px rgba(0,255,65,0.3);">متابعة الدروس القادمة 🚀</button>
                        <button onclick="app.startCandleQuiz()" class="btn" style="background: #333; color: #fff; padding: 18px 30px; border: none; border-radius: 50px; cursor: pointer; font-size: 1.1rem;">إعادة الاختبار للتدريب 🔄</button>
                    ` : `
                        <button onclick="app.startCandleQuiz()" class="btn btn-primary" style="background: #ff4d4d; color: #fff; padding: 18px 45px; border: none; border-radius: 50px; cursor: pointer; font-size: 1.1rem; box-shadow: 0 5px 20px rgba(255,77,77,0.3);">إعادة المحاولة 🔄</button>
                        <button onclick="app.loadPage('level-2')" class="btn" style="background: #333; color: #fff; padding: 18px 30px; border: none; border-radius: 50px; cursor: pointer; font-size: 1.1rem;">مراجعة الدرس 📚</button>
                    `}
                </div>
            </div>
        `;
    }
}

window.authSwitch = (view) => {
    document.getElementById('login-view').style.display = view === 'login' ? 'block' : 'none';
    document.getElementById('signup-view').style.display = view === 'signup' ? 'block' : 'none';
};
