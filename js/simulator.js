
// Mock Scenarios Database with SVG Charts
const scenarios = [
    {
        id: 1,
        title: "اختراق المقاومة",
        question: "السعر في اتجاه صاعد واخترق المقاومة بشمعة كبيرة. ماذا تفعل؟",
        correct: "buy",
        explanation: "✅ ممتاز! الاختراق القوي علامة شراء.",
        svg: `<svg width="100%" height="300" viewBox="0 0 400 300"><rect x="0" y="0" width="400" height="300" fill="#000"/><line x1="0" y1="200" x2="400" y2="100" stroke="#333" stroke-width="2" stroke-dasharray="5"/><rect x="50" y="100" width="300" height="20" fill="rgba(255,77,77,0.2)" stroke="#ff4d4d" stroke-dasharray="3"/><text x="360" y="115" fill="#ff4d4d" font-size="12">مقاومة</text><rect x="50" y="250" width="20" height="40" fill="#00ff41"/><rect x="80" y="230" width="20" height="30" fill="#ff4d4d"/><rect x="110" y="200" width="20" height="50" fill="#00ff41"/><rect x="140" y="180" width="20" height="30" fill="#00ff41"/><rect x="170" y="90" width="25" height="100" fill="#00ff41" stroke="#fff" stroke-width="2"/><text x="180" y="80" fill="#00ff41" font-size="12" text-anchor="middle">اختراق!</text></svg>`
    },
    {
        id: 2,
        title: "الترند الهابط",
        question: "ملامسة ثالثة لخط ترند هابط مع شمعة انعكاسية. القرار؟",
        correct: "sell",
        explanation: "✅ صحيح! الترند هابط والملامسة فرصة بيع.",
        svg: `<svg width="100%" height="300" viewBox="0 0 400 300"><rect x="0" y="0" width="400" height="300" fill="#000"/><line x1="20" y1="20" x2="350" y2="250" stroke="gold" stroke-width="3"/><circle cx="50" cy="40" r="5" fill="#ff4d4d"/><circle cx="150" cy="110" r="5" fill="#ff4d4d"/><line x1="240" y1="170" x2="240" y2="140" stroke="#ff4d4d" stroke-width="2"/><rect x="235" y="170" width="10" height="5" fill="#ff4d4d"/><text x="250" y="130" fill="gold" font-size="12">Shooting Star</text></svg>`
    },
    {
        id: 3,
        title: "سوق عرضي",
        question: "سوق ممل وشموع صغيرة متداخلة. القرار؟",
        correct: "wait",
        explanation: "✅ أحسنت! الانتظار أفضل في الأسواق العرضية.",
        svg: `<svg width="100%" height="300" viewBox="0 0 400 300"><rect x="0" y="0" width="400" height="300" fill="#000"/><rect x="50" y="100" width="300" height="100" fill="rgba(255,255,255,0.05)" stroke="#666" stroke-width="2"/><rect x="70" y="120" width="15" height="20" fill="#00ff41"/><rect x="90" y="130" width="15" height="20" fill="#ff4d4d"/><text x="200" y="80" fill="#aaa" text-anchor="middle">سوق عرضي</text></svg>`
    },
    {
        id: 4,
        title: "إعادة اختبار",
        question: "السعر كسر الدعم ثم عاد إليه (إعادة اختبار). القرار؟",
        correct: "sell",
        explanation: "✅ ممتاز! الدعم المكسور يصبح مقاومة.",
        svg: `<svg width="100%" height="300" viewBox="0 0 400 300"><rect x="0" y="0" width="400" height="300" fill="#000"/><rect x="50" y="150" width="300" height="20" fill="rgba(255,255,255,0.1)" stroke="#fff" stroke-dasharray="3"/><polyline points="50,140 80,150 110,130 140,150" fill="none" stroke="#fff" stroke-width="2"/><line x1="140" y1="150" x2="160" y2="220" stroke="#ff4d4d" stroke-width="3"/><polyline points="160,220 180,180 200,160" fill="none" stroke="#00ff41" stroke-width="2"/><circle cx="200" cy="160" r="5" fill="#ff4d4d" stroke="#fff" stroke-width="2"/><text x="210" y="150" fill="#fff" font-size="12">إعادة اختبار</text></svg>`
    },
    {
        id: 5,
        title: "قاع مزدوج",
        question: "نموذج W (قاع مزدوج) عند منطقة طلب. هل تشتري؟",
        correct: "buy",
        explanation: "✅ رائع! القاع المزدوج نموذج شرائي قوي.",
        svg: `<svg width="100%" height="300" viewBox="0 0 400 300"><rect x="0" y="0" width="400" height="300" fill="#000"/><rect x="50" y="250" width="300" height="30" fill="rgba(0,255,65,0.2)" stroke="#00ff41"/><polyline points="50,100 100,250 150,150 200,250 250,120" fill="none" stroke="#00ff41" stroke-width="3"/><text x="100" y="280" fill="#00ff41" font-size="12" text-anchor="middle">قاع 1</text><text x="200" y="280" fill="#00ff41" font-size="12" text-anchor="middle">قاع 2</text></svg>`
    }
];

let currentStep = 0;
let score = 0;

function startSimulator() {
    console.log("Starting simulator...");
    currentStep = 0;
    score = 0;

    const interfaceEl = document.getElementById('sim-interface');
    const startScreen = document.getElementById('start-screen');

    if (!interfaceEl) {
        alert("خطأ: لم يتم العثور على واجهة المحاكي. الرجاء تحديث الصفحة.");
        console.error("Interface not found");
        return;
    }

    // Toggle Visibility
    if (startScreen) startScreen.style.display = 'none';
    interfaceEl.style.display = 'block';

    // Reset basics
    document.getElementById('sim-chart-container').innerHTML = '';
    document.getElementById('sim-question').style.display = 'block';
    document.getElementById('sim-controls').style.display = 'flex';
    document.getElementById('sim-feedback').style.display = 'none';
    document.getElementById('certificate-display').style.display = 'none';

    // Load first scenario
    setTimeout(() => {
        loadScenario(0);
    }, 100);
}

function loadScenario(index) {
    console.log("Loading scenario " + index);

    if (index >= scenarios.length) {
        finishSimulator();
        return;
    }

    const scenario = scenarios[index];
    if (!scenario) {
        alert("خطأ في تحميل بيانات السؤال");
        return;
    }

    // 1. Update Text Elements
    const stepEl = document.getElementById('sim-step');
    const scoreEl = document.getElementById('sim-score');
    const questionEl = document.getElementById('sim-question');

    if (stepEl) stepEl.innerText = index + 1;
    if (scoreEl) scoreEl.innerText = score;
    if (questionEl) questionEl.innerText = scenario.question;

    // 2. Update Progress
    const progressEl = document.getElementById('sim-progress');
    if (progressEl) progressEl.style.width = (((index) / scenarios.length) * 100) + '%';

    // 3. Inject Chart
    const chartContainer = document.getElementById('sim-chart-container');
    if (chartContainer) {
        try {
            chartContainer.innerHTML = scenario.svg;
        } catch (e) {
            console.error("SVG Injection Error", e);
            chartContainer.innerText = "خطأ في تحميل الشارت";
        }
    }

    // 4. Reset Interaction elements
    const feedbackEl = document.getElementById('sim-feedback');
    const controlsEl = document.getElementById('sim-controls');
    const nextBtn = document.getElementById('sim-next-btn');

    if (feedbackEl) feedbackEl.style.display = 'none';
    if (controlsEl) controlsEl.style.display = 'flex';
    if (nextBtn) nextBtn.style.display = 'none';
}


function checkAnswer(userChoice) {
    const scenario = scenarios[currentStep];
    const feedbackEl = document.getElementById('sim-feedback');
    const controlsEl = document.getElementById('sim-controls');
    const nextBtn = document.getElementById('sim-next-btn'); // Get next button only

    if (controlsEl) controlsEl.style.display = 'none';
    if (feedbackEl) feedbackEl.style.display = 'block';

    if (userChoice === scenario.correct) {
        score++;
        feedbackEl.style.background = 'rgba(0,255,65,0.2)';
        feedbackEl.style.border = '1px solid #00ff41';
        feedbackEl.innerHTML = `<h3 style="color: #00ff41;">إجابة صحيحة! 🎉</h3><p>${scenario.explanation}</p>`;
    } else {
        feedbackEl.style.background = 'rgba(255,77,77,0.2)';
        feedbackEl.style.border = '1px solid #ff4d4d';
        feedbackEl.innerHTML = `<h3 style="color: #ff4d4d;">إجابة خاطئة ❌</h3><p>الإجابة الصحيحة كانت <strong>${getArabicAction(scenario.correct)}</strong>.<br>${scenario.explanation}</p>`;
    }

    if (nextBtn) nextBtn.style.display = 'block';

    const scoreEl = document.getElementById('sim-score');
    if (scoreEl) scoreEl.innerText = score;
}

function nextScenario() {
    currentStep++;
    loadScenario(currentStep);
}

function finishSimulator() {
    const interfaceEl = document.getElementById('sim-interface');
    const certDisplay = document.getElementById('certificate-display');
    const startScreen = document.getElementById('start-screen');

    if (score >= 4) {
        if (interfaceEl) interfaceEl.style.display = 'none';
        if (certDisplay) certDisplay.style.display = 'block';

        setTimeout(() => {
            let name = prompt("🎉 مبروك! لقد اجتزت الاختبار بنجاح.\nأدخل اسمك الكامل لطباعة الشهادة:");
            if (!name || name.trim() === "") name = "البطل المجهول";
            const nameEl = document.getElementById('cert-name');
            const dateEl = document.getElementById('cert-date');
            if (nameEl) nameEl.innerText = name;
            if (dateEl) dateEl.innerText = new Date().toLocaleDateString('ar-EG');
        }, 500);

    } else {
        // Failed: Reset interface to show "Try Again"
        if (interfaceEl) interfaceEl.style.display = 'none';
        if (startScreen) {
            startScreen.style.display = 'block';
            startScreen.innerHTML = `
                <div style="font-size: 4rem; margin-bottom: 20px;">😢</div>
                <h3 style="margin-bottom: 20px; color: #ff4d4d;">للأسف لم تنجح</h3>
                <p>لقد حصلت على ${score} من 5</p>
                <p>تحتاج إلى 4 نقاط على الأقل.</p>
                <button class="btn btn-primary" onclick="startSimulator()" style="background: #ff4d4d; color: #fff; font-weight: bold; margin-top:20px;">
                    حاول مرة أخرى ↺
                </button>
            `;
        }
    }
}

function resetSimulator() {
    // Reload page simple method to ensure clean state or just reset
    const startScreen = document.getElementById('start-screen');
    const interfaceEl = document.getElementById('sim-interface');
    const certDisplay = document.getElementById('certificate-display');

    if (interfaceEl) interfaceEl.style.display = 'none';
    if (certDisplay) certDisplay.style.display = 'none';
    if (startScreen) {
        startScreen.style.display = 'block';
        // HTML might be modified by finishSimulator, so restore good text? 
        // Or just let startSimulator handle it next time.
        // Let's restore original text for clean restart
        startScreen.innerHTML = `
            <div style="font-size: 4rem; margin-bottom: 20px;">🕹️</div>
            <h3 style="margin-bottom: 20px;">هل أنت جاهز لاختبار مهاراتك؟</h3>
            <button class="btn btn-primary" onclick="startSimulator()" style="background: #00ff41; color: #000; font-weight: bold; padding: 15px 40px; font-size: 1.2rem;">
                ابدأ الاختبار الآن 🚀
            </button>
        `;
    }
}

function getArabicAction(action) {
    if (action === 'buy') return 'شراء (Buy)';
    if (action === 'sell') return 'بيع (Sell)';
    return 'انتظار (Wait)';
}

// Bind Global
window.startSimulator = startSimulator;
window.checkAnswer = checkAnswer;
window.nextScenario = nextScenario;
window.resetSimulator = resetSimulator;
