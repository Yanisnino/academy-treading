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

    async ensureAdminExists() {
        // Admin is handled on the server side in MongoDB
        // We just ensure the admin session can be created locally if needed
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

    async handleLogin(email, password) {
        try {
            const response = await fetch('/.netlify/functions/auth', {
                method: 'POST',
                body: JSON.stringify({ action: 'login', payload: { email, password } })
            });
            const data = await response.json();
            if (response.ok) {
                this.createSession(data);
            } else {
                alert(`❌ خطأ: ${data.error || 'البريد الإلكتروني أو كلمة السر غير صحيحة.'}`);
            }
        } catch (err) {
            console.error(err);
            alert('❌ فشل الاتصال بقاعدة البيانات. تأكد من رفع الموقع على Netlify.');
        }
    }

    async handleSignup(name, email, password) {
        try {
            const response = await fetch('/.netlify/functions/auth', {
                method: 'POST',
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
            console.error(err);
            alert('❌ فشل الاتصال بقاعدة البيانات.');
        }
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

    saveMessages() {
        localStorage.setItem(this.KEY_MSGS, JSON.stringify(this.messages));
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

        // Reset system listeners
        this.initResetListeners();
    }

    initResetListeners() {
        const resetForm = document.getElementById('form-reset');
        if (resetForm) {
            resetForm.onsubmit = (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            };
        }
    }

    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const icon = input.nextElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            icon.textContent = '🔒';
        } else {
            input.type = 'password';
            icon.textContent = '👁️';
        }
    }

    handleForgotPassword() {
        const email = document.getElementById('reset-email').value;
        const user = this.users.find(u => u.email === email);
        if (user) {
            document.getElementById('reset-email').disabled = true;
            document.getElementById('reset-new-sec').style.display = 'block';
            this.resetTargetUserId = user.id;
        } else {
            alert('❌ عذراً، هذا البريد غير مسجل لدينا.');
        }
    }

    handleFinalReset() {
        const newPass = document.getElementById('reset-new-password').value;
        if (newPass.length < 4) {
            alert('⚠️ كلمة السر يجب أن تكون 4 أحرف على الأقل.');
            return;
        }
        const user = this.users.find(u => u.id === this.resetTargetUserId);
        if (user) {
            user.password = newPass;
            this.saveUsers();
            alert('✅ تم تحديث كلمة السر بنجاح! يمكنك الآن تسجيل الدخول.');
            authSwitch('login');
        }
    }

    renderSidebar() {
        // Find how many messages need attention
        let notifyCount = 0;
        if (this.currentUser.role === 'admin') {
            notifyCount = this.messages.filter(m => !m.reply).length;
        } else {
            notifyCount = this.messages.filter(m => m.userId === this.currentUser.id && m.reply && !m.seen).length;
        }

        let content = `
            <div class="user-info">
                <div style="width:50px; height:50px; background:#d4af37; border-radius:50%; margin:0 auto 10px; display:flex; align-items:center; justify-content:center; color:#000; font-weight:bold; font-size:1.2rem;">
                    ${this.currentUser.name.charAt(0)}
                </div>
                <h3>${this.currentUser.name}</h3>
                <span style="color:#888; font-size:0.8rem;">${this.currentUser.role === 'admin' ? 'مدير النظام 🛡️' : 'طالب 🎓'}</span>
            </div>
        `;

        // ADMIN TOOLS (Always on top for Admin)
        if (this.currentUser.role === 'admin') {
            content += `
                <div class="nav-label" style="color:#d4af37;">🛡️ أدوات الإدارة</div>
                <button onclick="app.loadPage('admin-users')" class="nav-btn">👥 إدارة المستخدمين</button>
                <button onclick="app.loadPage('admin-support')" class="nav-btn" style="position:relative;">
                    📩 تذاكر الدعم 
                    ${notifyCount > 0 ? `<span style="position:absolute; left:10px; top:15px; background:#ff4d4d; color:white; border-radius:10px; padding:2px 8px; font-size:0.7rem;">${notifyCount}</span>` : ''}
                </button>
                <div style="border-bottom: 1px solid #222; margin: 15px 0;"></div>
            `;
        }

        // COMMON CONTENT (For both Admin and Student)
        content += `
            <div class="nav-label">الرئيسية</div>
            <button onclick="app.loadPage('home')" class="nav-btn">🏠 الرئيسية</button>
            <button onclick="app.loadPage('about')" class="nav-btn">ℹ️ من نحن</button>

            <div class="nav-label">الأكاديمية</div>
            <button onclick="app.loadPage('lessons-hub')" class="nav-btn">📚 الدروس</button>
            <button onclick="app.loadPage('strategies')" class="nav-btn">⚡ الاستراتيجيات</button>
            <button onclick="app.loadPage('psychology')" class="nav-btn">🧘 سيكولوجية</button>
            <button onclick="app.loadPage('risk_management')" class="nav-btn">🛡️ إدارة المخاطر</button>
            <button onclick="app.loadPage('analysis')" class="nav-btn">📰 الأخبار والتحليل</button>
            <button onclick="app.loadPage('indicators')" class="nav-btn">📉 قسم المؤشرات</button>
            <button onclick="app.loadPage('tools')" class="nav-btn">🛠️ أدوات ومنصات</button>

            <div class="nav-label">المساعدة</div>
            <button onclick="app.loadPage('student-support')" class="nav-btn" style="position:relative;">
                💬 تذاكر الدعم 
                ${this.currentUser.role !== 'admin' && notifyCount > 0 ? `<span style="position:absolute; left:10px; top:15px; background:#00ff41; color:black; border-radius:10px; padding:2px 8px; font-size:0.7rem; font-weight:bold;">${notifyCount}</span>` : ''}
            </button>
        `;

        content += `<button onclick="app.logout()" class="nav-btn logout" style="margin-top:20px; background:#222;">تسجيل الخروج</button>`;
        this.sidebar.innerHTML = content;
    }

    loadPage(pageId) {
        this.mainContent.innerHTML = '';
        window.scrollTo(0, 0);

        if (pageId === 'admin-users') { this.renderAdminUsers(); return; }
        if (pageId === 'admin-support') { this.renderAdminSupport(); return; }
        if (pageId === 'student-support') { this.renderStudentSupport(); return; }
        if (pageId === 'quiz-page') { this.renderQuizPage(); return; }

        // Clear notifications when user sees support
        if (pageId === 'student-support' && this.currentUser.role !== 'admin') {
            this.messages.forEach(m => { if (m.userId === this.currentUser.id && m.reply) m.seen = true; });
            this.saveMessages();
            this.renderSidebar();
        }

        if (typeof pages !== 'undefined' && pages[pageId]) {
            this.mainContent.innerHTML = pages[pageId];
            if (window.lucide) window.lucide.createIcons();
        } else {
            this.mainContent.innerHTML = `<div class="content-block"><h1>404</h1><p>الصفحة غير موجودة.</p></div>`;
        }
    }

    // --- Dynamic Feature Pages ---

    renderAdminUsers() {
        // ALWAYS reload from storage before rendering to sync data
        this.users = this.loadData(this.KEY_USERS, []);
        const students = this.users.filter(u => u.role !== 'admin');

        let rows = students.length ? students.map(u => `
            <tr>
                <td style="padding:12px;">${u.name}</td>
                <td style="padding:12px;">${u.email}</td>
                <td style="padding:12px; color:#00ff41; font-weight:bold; font-family:monospace;">${u.password || '123456'}</td>
                <td style="padding:12px;">${u.joined}</td>
                <td style="padding:12px;">
                    <button onclick="app.deleteUser('${u.id}')" style="background:#ff4d4d; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">حذف</button>
                    <button onclick="alert('كلمة مرور ${u.name} هي: ${u.password || '123456'}')" style="background:#333; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; margin-right:5px;">كشف 👁️</button>
                </td>
            </tr>`).join('') : '<tr><td colspan="5" style="text-align:center; padding:20px;">لا يوجد طلاب حالياً</td></tr>';

        this.mainContent.innerHTML = `
            <div class="page-header">
                <h1>👥 إدارة المستخدمين</h1>
                <button onclick="app.renderAdminUsers()" style="background:#d4af37; color:#000; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; font-weight:bold;">تحديث البيانات 🔄</button>
            </div>
            <div style="background:#111; padding:20px; border-radius:15px; border:1px solid #333;">
                <table class="data-table" style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="text-align:right; border-bottom:2px solid #222;">
                            <th style="padding:10px;">الاسم</th>
                            <th style="padding:10px;">البريد</th>
                            <th style="padding:10px; color:#d4af37;">كلمة السر 🔑</th>
                            <th style="padding:10px;">تاريخ التسجيل</th>
                            <th style="padding:10px;">تحكم</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>`;
    }

    deleteUser(id) {
        if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
            this.users = this.users.filter(u => u.id !== id);
            this.saveUsers();
            this.renderAdminUsers();
        }
    }

    renderAdminSupport() {
        // Reload messages from storage
        this.messages = this.loadData(this.KEY_MSGS, []);
        const pending = this.messages.filter(m => !m.reply).reverse();
        const handled = this.messages.filter(m => m.reply).reverse();

        this.mainContent.innerHTML = `
            <div class="page-header">
                <h1>إدارة طلبات الدعم</h1>
                <button onclick="app.renderAdminSupport()" style="background:#d4af37; color:#000; border:none; padding:8px 15px; border-radius:5px; cursor:pointer; font-weight:bold;">تحديث الرسائل 🔄</button>
            </div>
            <h3 style="color:#d4af37; margin-bottom:15px;">📥 طلبات معلقة (${pending.length})</h3>
            <div id="admin-pending-list">${pending.map(m => this.createMessageHTML(m, true)).join('') || '<p style="color:#666;">لا توجد طلبات معلقة.</p>'}</div>
            
            <h3 style="color:#555; margin:40px 0 15px;">✅ طلبات تمت معالجتها (${handled.length})</h3>
            <div id="admin-handled-list">${handled.map(m => this.createMessageHTML(m, true)).join('')}</div>
        `;
    }

    renderStudentSupport() {
        this.mainContent.innerHTML = `
            <div class="page-header"><h1>الدعم والمساعدة 💬</h1></div>
            <div style="background:#111; padding:25px; border-radius:12px; border:1px solid #333; margin-bottom:30px;">
                <h3 style="color:#d4af37; margin-bottom:10px;">إرسال طلب جديد</h3>
                <textarea id="support-msg" style="width:100%; height:120px; background:#000; color:#fff; border:1px solid #444; border-radius:8px; padding:15px; font-family:inherit;" placeholder="اكتب مشكلتك هنا بالتفصيل..."></textarea>
                <button onclick="app.sendSupportMessage()" class="auth-btn" style="width:auto; margin-top:15px; padding:10px 30px;">إرسال التذكرة 📤</button>
            </div>
            <h3>تذاكري السابقة</h3>
            <div id="msgs-list">${this.messages.filter(m => m.userId === this.currentUser.id).reverse().map(m => this.createMessageHTML(m, false)).join('') || '<p style="color:#666;">لم ترسل أي طلبات بعد.</p>'}</div>
        `;
    }

    sendSupportMessage() {
        const txt = document.getElementById('support-msg').value.trim();
        if (!txt) return;
        const msg = {
            id: Date.now(),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            text: txt,
            reply: null,
            seen: false,
            date: new Date().toLocaleString('ar-EG')
        };
        this.messages.push(msg);
        this.saveMessages();
        this.loadPage('student-support');
    }

    createMessageHTML(msg, isAdmin) {
        return `
            <div class="msg-card" style="background:#111; padding:20px; margin-bottom:15px; border-radius:12px; border-right:4px solid ${msg.reply ? '#00ff41' : '#d4af37'}">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <strong style="color:#fff;">${isAdmin ? `من: ${msg.userName}` : 'رسالتي'}</strong>
                    <span style="font-size:0.8rem; color:#666;">${msg.date}</span>
                </div>
                <p style="color:#ddd; line-height:1.6;">${msg.text}</p>
                ${msg.reply ? `
                    <div style="margin-top:15px; padding:15px; background:rgba(212,175,55,0.05); border-radius:8px; border:1px solid rgba(212,175,55,0.2);">
                        <strong style="color:#d4af37; display:block; margin-bottom:5px;">رد الإدارة:</strong>
                        <p style="color:#eee; margin:0;">${msg.reply}</p>
                    </div>
                ` : (isAdmin ? `
                    <div style="margin-top:15px; display:flex; gap:10px;">
                        <input id="reply-${msg.id}" placeholder="اكتب ردك..." style="flex:1; padding:10px; background:#000; border:1px solid #444; border-radius:8px; color:#fff;">
                        <button onclick="app.replyMsg(${msg.id})" style="padding:10px 20px; background:#d4af37; color:#000; font-weight:bold; border:none; border-radius:8px; cursor:pointer;">إرسال الرد</button>
                    </div>
                ` : '<p style="color:#d4af37; font-size:0.9rem; margin-top:10px;">⏳ في انتظار رد الإدارة...</p>')}
            </div>
        `;
    }

    replyMsg(id) {
        const input = document.getElementById(`reply-${id}`);
        const text = input.value.trim();
        if (!text) return;
        const m = this.messages.find(msg => msg.id === id);
        if (m) {
            m.reply = text;
            m.seen = false;
            this.saveMessages();
            this.loadPage('admin-support');
        }
    }

    // --- Generic Quiz System ---

    startQuiz(quizType) {
        const quizData = {
            'lessons': {
                title: 'اختبار المسار التعليمي الشامل 📚',
                desc: 'هذا الاختبار يقيم فهمك للمستويات من 1 إلى 4.',
                questions: [
                    { q: 'ما هو "الفوركس" باختصار؟', options: ['سوق تبادل العملات الأجنبية', 'سوق الأسهم المحلية', 'منصة للمراهنات'], correct: 0 },
                    { q: 'ماذا يعني اتجاه (Trend) صاعد؟', options: ['قمم هابطة وقيعان هابطة', 'قمم صاعدة وقيعان صاعدة', 'تذبذب في نطاق ضيق'], correct: 1 },
                    { q: 'ما هي وظيفة "أمر وقف الخسارة" (Stop Loss)؟', options: ['زيادة الأرباح', 'حماية رأس المال من الخسائر الكبيرة', 'تأمين الاتصال بالإنترنت'], correct: 1 },
                    { q: 'ما هو الـ "Spread" في التداول؟', options: ['الفرق بين سعر البيع وسعر الشراء', 'سرعة تنفيذ الصفقة', 'حجم اللوت المستخدم'], correct: 0 },
                    { q: 'أين نضع عادةً الستوب لوز في صفقة شراء؟', options: ['فوق السعر الحالي', 'أسفل أقرب منطقة دعم', 'في منتصف الشمعة'], correct: 1 },
                    { q: 'ما هي "سيكولوجية التداول"؟', options: ['دراسة الرسوم البيانية', 'التحكم في العواطف (الخوف والطمع)', 'سرعة التنقل بين الفريمات'], correct: 1 },
                    { q: 'ماذا يمثل "عرض وطلب" في السوق؟', options: ['كميات البيع والشراء من البنوك والمتداولين', 'توصيات القنوات', 'وقت افتتاح السوق'], correct: 0 }
                ]
            },
            'strategies': {
                title: 'اختبار المفاهيم المتقدمة (ICT/SMC) ⚡',
                desc: 'اختبر مدى استيعابك لاستراتيجيات الأموال الذكية.',
                questions: [
                    { q: 'ماذا يعني مصطلح FVG؟', options: ['فجوة القيمة العادلة (Fair Value Gap)', 'نقطة الدخول الذهبية', 'نهاية الاتجاه'], correct: 0 },
                    { q: 'ما هو الـ Order Block؟', options: ['شمعة تمثل بصمة صناع السوق', 'حجز صفقات معلقة', 'نوع من أنواع المؤشرات'], correct: 0 },
                    { q: 'أين تتواجد "السيولة" (Liquidity) عادةً؟', options: ['فوق القمم وأسفل القيعان السابقة', 'داخل الشموع الكبيرة فقط', 'في منتصف الاتجاه'], correct: 0 },
                    { q: 'ماذا يعني اختصار BOS؟', options: ['كسر الهيكل (Break of Structure)', 'بداية الصفقة', 'تذبذب عرضي'], correct: 0 },
                    { q: 'متى نعتبر أن هناك Change of Character (CHoCH)؟', options: ['عند كسر أول قاع/قمة معاكس للاتجاه', 'عند استمرار الاتجاه القديم', 'عند صدور خبر اقتصادي'], correct: 0 },
                    { q: 'ما هي الـ Premium Zone؟', options: ['منطقة بيع (السعر مرتفع)', 'منطقة شراء (السعر رخيص)', 'منطقة توازن'], correct: 0 },
                    { q: 'ما الهدف من تداول الـ Kill Zones؟', options: ['التداول في أوقات ذروة السيولة', 'تجنب الخسارة تماماً', 'التداول وقت النوم'], correct: 0 }
                ]
            }
        };

        const quiz = quizData[quizType];
        if (!quiz) return;

        this.currentQuiz = {
            type: quizType,
            title: quiz.title,
            questions: quiz.questions.sort(() => 0.5 - Math.random()),
            current: 0,
            score: 0
        };

        this.loadPage('quiz-page');
    }

    renderQuizPage() {
        if (!this.currentQuiz) return;
        const q = this.currentQuiz.questions[this.currentQuiz.current];

        this.mainContent.innerHTML = `
            <div class="page-header">
                <h1>${this.currentQuiz.title}</h1>
            </div>
            <div id="quiz-container" style="max-width: 800px; margin: 0 auto; background: #111; padding: 40px; border-radius: 20px; border: 1px solid #333;">
                <div style="display: flex; justify-content: space-between; color: #666; margin-bottom: 30px;">
                    <span>السؤال ${this.currentQuiz.current + 1} من ${this.currentQuiz.questions.length}</span>
                    <span>النتيجة الحالية: ${this.currentQuiz.score}</span>
                </div>
                
                <h2 style="color: #fff; margin-bottom: 40px; line-height: 1.4;">${q.q}</h2>
                
                <div id="quiz-options" style="display: grid; gap: 15px;">
                    ${q.options.map((opt, idx) => `
                        <button onclick="app.handleQuizChoice(${idx})" class="nav-btn" style="text-align: right; border: 1px solid #333; padding: 20px; font-size: 1.1rem; background: #1a1a1a;">
                            ${opt}
                        </button>
                    `).join('')}
                </div>

                <div id="quiz-feedback" style="margin-top: 30px; text-align: center; height: 30px;"></div>
            </div>
        `;
    }

    handleQuizChoice(choiceIdx) {
        const quiz = this.currentQuiz;
        const q = quiz.questions[quiz.current];
        const feedbackArea = document.getElementById('quiz-feedback');
        const buttons = document.querySelectorAll('#quiz-options button');

        buttons.forEach(btn => btn.disabled = true);

        if (choiceIdx === q.correct) {
            quiz.score++;
            buttons[choiceIdx].style.background = 'rgba(0, 255, 65, 0.2)';
            buttons[choiceIdx].style.borderColor = '#00ff41';
            feedbackArea.innerHTML = '<span style="color: #00ff41; font-weight: bold;">✅ إجابة صحيحة!</span>';
        } else {
            buttons[choiceIdx].style.background = 'rgba(255, 77, 77, 0.2)';
            buttons[choiceIdx].style.borderColor = '#ff4d4d';
            buttons[q.correct].style.background = 'rgba(0, 255, 65, 0.1)';
            buttons[q.correct].style.borderColor = '#00ff41';
            feedbackArea.innerHTML = `<span style="color: #ff4d4d; font-weight: bold;">❌ خطأ! الإجابة الصحيحة هي: ${q.options[q.correct]}</span>`;
        }

        setTimeout(() => {
            quiz.current++;
            if (quiz.current < quiz.questions.length) {
                this.renderQuizPage();
            } else {
                this.showQuizFinalResult();
            }
        }, 2000);
    }

    showQuizFinalResult() {
        const quiz = this.currentQuiz;
        const percent = (quiz.score / quiz.questions.length) * 100;
        const passed = percent >= 70;

        this.mainContent.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <h1 style="font-size: 3rem; color: #d4af37; margin-bottom: 20px;">${passed ? ' نتيجة رائعة!' : '⚠️ حاول مرة أخرى'}</h1>
                <div style="font-size: 5rem; color: #fff; margin: 30px 0; font-weight: 800;">${quiz.score} / ${quiz.questions.length}</div>
                <p style="font-size: 1.3rem; color: #888; margin-bottom: 40px; max-width: 600px; margin-left: auto; margin-right: auto;">
                    ${passed ? 'لقد أثبتّ أنك تملك فهماً قوياً للمادة العلمية. أنت جاهز للانتقال للخطوة التالية في مسارك!' : 'يبدو أنك لا تزال بحاجة لمراجعة بعض المفاهيم. لا تقلق، التداول رحلة تحتاج صبر وتكرار.'}
                </p>
                
                <div style="display: flex; gap: 20px; justify-content: center;">
                    <button onclick="app.startQuiz('${quiz.type}')" class="auth-btn" style="width: auto; padding: 15px 40px;">إعادة الاختبار 🔄</button>
                    <button onclick="app.loadPage('${quiz.type === 'lessons' ? 'lessons-hub' : 'strategies'}')" class="btn" style="background: #333; color: white; border: none; padding: 15px 40px; border-radius: 8px; cursor: pointer;">العودة للمسار 🔙</button>
                </div>
            </div>
        `;
    }

    // --- Candlestick Quiz Logic ---
    startCandleQuiz() {
        this.quizState = {
            current: 0,
            score: 0,
            total: 10,
            questions: this.generateCandleQuestions()
        };
        this.loadPage('candle-quiz-room'); // Unique page ID to avoid collisions
        setTimeout(() => this.renderCandleQuiz(), 100);
    }

    renderCandleQuiz() {
        // Updated to use mainContent directly if needed or specialized IDs
        this.mainContent.innerHTML = `
            <div class="page-header"><h1>اختبار قراءة الشموع اليابانية 🕯️</h1></div>
            <div id="quiz-dynamic-area"></div>
            <div id="quiz-feedback" style="text-align:center; height:40px; margin-top:20px;"></div>
        `;

        const container = document.getElementById('quiz-dynamic-area');
        if (this.quizState.current >= this.quizState.total) {
            this.showCandleResult();
            return;
        }

        const q = this.quizState.questions[this.currentQuiz ? 0 : this.quizState.current]; // Fallback safety
        // Re-using logic but ensuring it renders into mainContent
        const activeQ = this.quizState.questions[this.quizState.current];
        const options = this.generateOptions(activeQ.name);

        container.innerHTML = `
            <div style="text-align:center; padding: 20px;">
                <h4 style="color: #888; margin-bottom: 20px;">السؤال ${this.quizState.current + 1} من ${this.quizState.total}</h4>
                <div style="background: #000; padding: 40px; border-radius: 20px; display: inline-block; border: 2px solid #333; margin-bottom: 30px;">
                    <svg width="150" height="120" viewBox="0 0 150 120">${activeQ.svg}</svg>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; max-width: 500px; margin: 0 auto;">
                    ${options.map(opt => `
                        <button onclick="app.checkCandleAnswer('${opt}', '${activeQ.name}')" 
                                class="nav-btn" style="text-align:center;">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    generateCandleQuestions() {
        const pool = [
            { name: 'Hammer (المطرقة)', svg: '<rect x="30" y="10" width="20" height="20" fill="#00ff41"/><line x1="40" y1="30" x2="40" y2="80" stroke="#00ff41" stroke-width="2"/>' },
            { name: 'Shooting Star (الشهاب)', svg: '<line x1="40" y1="20" x2="40" y2="70" stroke="#ff4d4d" stroke-width="2"/><rect x="30" y="70" width="20" height="20" fill="#ff4d4d"/>' },
            { name: 'Doji (دوجي)', svg: '<line x1="40" y1="20" x2="40" y2="80" stroke="#fff" stroke-width="2"/><line x1="25" y1="50" x2="55" y2="50" stroke="#fff" stroke-width="2"/>' },
            { name: 'Bullish Engulfing (ابتلاع صاعد)', svg: '<rect x="10" y="40" width="15" height="30" fill="#ff4d4d"/><rect x="35" y="10" width="25" height="80" fill="#00ff41"/>' },
            { name: 'Bearish Engulfing (ابتلاع هابط)', svg: '<rect x="10" y="10" width="25" height="80" fill="#00ff41"/><rect x="45" y="40" width="15" height="30" fill="#ff4d4d"/>' }
        ];
        return pool.sort(() => 0.5 - Math.random()).slice(0, 10);
    }

    checkCandleAnswer(selected, correct) {
        if (selected === correct) {
            this.quizState.score++;
        }
        this.quizState.current++;
        this.renderCandleQuiz();
    }

    showCandleResult() {
        // Redacted for brevity in summary but functionally kept
        this.mainContent.innerHTML = `<div style="text-align:center; padding:60px;"><h2>النتيجة: ${this.quizState.score} / ${this.quizState.total}</h2><button onclick="app.loadPage('lessons-hub')" class="auth-btn" style="width:auto; padding:10px 30px;">عودة للدروس</button></div>`;
    }
}

window.authSwitch = (view) => {
    document.getElementById('login-view').style.display = view === 'login' ? 'block' : 'none';
    document.getElementById('signup-view').style.display = view === 'signup' ? 'block' : 'none';
    document.getElementById('reset-view').style.display = view === 'reset' ? 'block' : 'none';

    if (view === 'reset') {
        document.getElementById('reset-email').value = '';
        document.getElementById('reset-email').disabled = false;
        document.getElementById('reset-new-sec').style.display = 'none';
        document.getElementById('reset-new-password').value = '';
    }
};
