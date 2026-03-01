// Academy Platform - RENDER FIX FINAL
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ RENDER VERSION CONNECTED');
    window.app = new AcademyPlatform();
});

class AcademyPlatform {
    constructor() {
        this.KEY_SESSION = 'academy_current_session_v3';
        this.currentUser = JSON.parse(localStorage.getItem(this.KEY_SESSION)) || null;
        this.authContainer = document.getElementById('auth-container');
        this.dashboardContainer = document.getElementById('dashboard-container');
        this.mainContent = document.getElementById('main-content');
        this.init();
    }

    init() {
        this.setupEventListeners();
        if (this.currentUser) { this.renderDashboard(); } else { this.showAuth('login'); }
    }

    setupEventListeners() {
        const signupForm = document.getElementById('form-signup');
        if (signupForm) {
            signupForm.onsubmit = async (e) => {
                e.preventDefault();
                const name = document.getElementById('signup-name').value.trim();
                const email = document.getElementById('signup-email').value.trim();
                const pass = document.getElementById('signup-password').value.trim();

                try {
                    console.log('Sending request to /api/auth ...');
                    const response = await fetch('/api/auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'signup', payload: { name, email, password: pass, role: 'student' } })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        this.currentUser = data;
                        localStorage.setItem(this.KEY_SESSION, JSON.stringify(data));
                        alert('✅ تم إنشاء الحساب بنجاح!');
                        this.renderDashboard();
                    } else {
                        alert(`❌ خطأ: ${data.error}`);
                    }
                } catch (err) {
                    alert('❌ فشل الاتصال. تأكد من عمل Refresh للمتصفح بـ Ctrl+F5');
                }
            };
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
        this.mainContent.innerHTML = `<div class="content-block"><h1>مرحباً بك ${this.currentUser.name} 🎓</h1><p>تم الاتصال بنجاح بقاعدة البيانات!</p></div>`;
    }
}
window.authSwitch = (view) => app.showAuth(view);
