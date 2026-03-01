// Academy Platform - COMPLETE RENDER VERSION
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AcademyPlatform();
});

class AcademyPlatform {
    constructor() {
        this.KEY_SESSION = 'academy_current_session_v3';
        this.KEY_MSGS = 'academy_messages_v3';

        this.currentUser = JSON.parse(localStorage.getItem(this.KEY_SESSION)) || null;
        this.messages = JSON.parse(localStorage.getItem(this.KEY_MSGS)) || [];

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
                this.handleLogin(document.getElementById('login-email').value, document.getElementById('login-password').value);
            };
        }

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
    }

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
            alert('❌ فشل الاتصال بالسيرفر.');
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
        this.loadPage(this.currentUser.role === 'admin' ? 'admin-users' : 'home');
    }

    renderSidebar() {
        const isAdm = this.currentUser.role === 'admin';
        this.sidebar.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">${this.currentUser.name.charAt(0)}</div>
                <h3>${this.currentUser.name}</h3>
                <p>${isAdm ? '🛡️ مدير النظام' : '🎓 طالب'}</p>
            </div>
            <div class="nav-label">الرئيسية</div>
            <button onclick="app.loadPage('home')" class="nav-btn">🏠 الرئيسية</button>
            <button onclick="app.loadPage('lessons-hub')" class="nav-btn">📚 الدروس التعليمية</button>
            
            <div class="nav-label">الأدوات</div>
            <button onclick="app.loadPage('strategies')" class="nav-btn">⚡ استراتيجيات</button>
            <button onclick="app.loadPage('indicators')" class="nav-btn">📉 مؤشرات</button>

            ${isAdm ? `
                <div class="nav-label" style="color:#d4af37;">إدارة النظام</div>
                <button onclick="app.loadPage('admin-users')" class="nav-btn">👥 المستخدمين</button>
                <button onclick="app.loadPage('admin-support')" class="nav-btn">📩 رسائل الدعم</button>
            ` : ''}

            <button onclick="app.logout()" class="nav-btn logout" style="margin-top:20px;">🚪 تسجيل الخروج</button>
        `;
    }

    loadPage(pageId) {
        this.mainContent.innerHTML = '';
        window.scrollTo(0, 0);

        if (typeof pages !== 'undefined' && pages[pageId]) {
            this.mainContent.innerHTML = pages[pageId];
            if (window.lucide) window.lucide.createIcons();
        } else {
            this.mainContent.innerHTML = `
                <div class="content-block" style="text-align:center; padding:100px;">
                    <h1>🚧 محتوى قيد التطوير</h1>
                    <p>أهلاً بك ${this.currentUser.name}، العمل جارٍ على تجهيز هذا القسم.</p>
                </div>`;
        }
    }

    togglePasswordVisibility(id) {
        const el = document.getElementById(id);
        el.type = el.type === 'password' ? 'text' : 'password';
    }
}

window.authSwitch = (view) => app.showAuth(view);
