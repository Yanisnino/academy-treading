
const theoryQuestions = [
    {
        category: "💰 إدارة مالية",
        question: "رأس مالك 1000$، وقررت المخاطرة بـ 2% فقط في الصفقة. كم المبلغ الأقصى الذي مسموح لك بخسارته؟",
        options: ["20$", "50$", "200$", "2$"],
        correct: 0,
        explanation: "1000 × 0.02 = 20$. هذه هي حدود السلامة."
    },
    {
        category: "🧠 نفسية المتداول",
        question: "خسرت 3 صفقات متتالية وتشعر برغبة قوية في تعويض الخسارة فوراً. ماذا تفعل؟",
        options: [
            "أدخل صفقة بحجم (Lot) مضاعف لأعوض بسرعة",
            "أستمر بنفس الخطة ولا أتوقف",
            "أغلق الشاشة فوراً وأتوقف عن التداول اليوم",
            "أبحث عن استراتيجية جديدة في اليوتيوب"
        ],
        correct: 2,
        explanation: "أفضل حل هو 'إيقاف النزيف'. مشاعر الانتقام ستؤدي لتصفير الحساب حتماً."
    },
    {
        category: "💰 حساب اللوت",
        question: "تريد دخول صفقة والستوب لوس (Stop Loss) يبعد 50 نقطة. ومسموح لك بخسارة 50$ فقط. كم حجم العقد (Lot) المناسب؟",
        options: ["1.0 Lot", "0.1 Lot", "0.01 Lot", "0.5 Lot"],
        correct: 1,
        explanation: "القاعدة: مبلغ الخسارة ÷ عدد النقاط = قيمة النقطة. 50$ ÷ 50 = 1$ للنقطة. وهذا يساوي 0.1 Lot (ميني)."
    },
    {
        category: "📈 تحليل فني",
        question: "السعر يشكل (قمم أعلى من قمم) و (قيعان أعلى من قيعان). ما هو الاتجاه؟",
        options: ["اتجاه هابط", "اتجاه صاعد", "اتجاه عرضي", "تصحيح"],
        correct: 1,
        explanation: "تعريف الاتجاه الصاعد هو سلسلة من القمم والقيعان الصاعدة (Higher Highs & Higher Lows)."
    },
    {
        category: "🧠 إدارة الصفقات",
        question: "دخلت صفقة وتحرك السعر في صالحك وحققت ربح 1:1 (يساوي المخاطرة). ما التصرف الاحترافي؟",
        options: [
            "أغلق الصفقة كاملة وأهرب بالربح",
            "أحرك الستوب لوس إلى منطقة الدخول (Break Even) وأحجز جزء من الربح",
            "أزيد حجم العقود لتعظيم الربح",
            "أحذف الستوب لوس نهائياً"
        ],
        correct: 1,
        explanation: "تأمين الصفقة (Break Even) هو سر الاستمرار. الآن أصبحت صفقة مجانية (Risk Free)."
    },
    {
        category: "⚠️ أخطاء شائعة",
        question: "ماذا يعني مصطلح FOMO؟",
        options: [
            "الخوف من ضياع الفرصة (Fear Of Missing Out)",
            "استراتيجية تداول الأخبار",
            "مؤشر قياس السيولة",
            "منظمة الأسواق المالية"
        ],
        correct: 0,
        explanation: "الـ FOMO هو العدو رقم 1 الذي يجعلك تدخل صفقات متأخرة عند القمة وتخسر."
    }
];

let quizCurrentStep = 0;
let quizScore = 0;

function startQuiz() {
    quizCurrentStep = 0;
    quizScore = 0;

    document.getElementById('quiz-interface').style.display = 'block';
    document.getElementById('quiz-start-screen').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'none';

    loadQuizQuestion(0);
}

function loadQuizQuestion(index) {
    if (index >= theoryQuestions.length) {
        finishQuiz();
        return;
    }

    const q = theoryQuestions[index];

    // Update UI
    document.getElementById('quiz-step').innerText = `سؤال ${index + 1} من ${theoryQuestions.length}`;
    document.getElementById('quiz-category').innerText = q.category;
    document.getElementById('quiz-question-text').innerText = q.question;

    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = ''; // Clear previous

    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.innerText = opt;
        btn.onclick = () => checkQuizAnswer(i, index, btn);
        optionsContainer.appendChild(btn);
    });

    document.getElementById('quiz-feedback').style.display = 'none';
    document.getElementById('quiz-next-btn').style.display = 'none';
}

function checkQuizAnswer(selectedOption, questionIndex, btnElement) {
    const q = theoryQuestions[questionIndex];
    const feedbackEl = document.getElementById('quiz-feedback');
    const allBtns = document.querySelectorAll('.quiz-option-btn');

    // Disable all buttons
    allBtns.forEach(b => b.disabled = true);

    if (selectedOption === q.correct) {
        quizScore++;
        btnElement.style.background = '#00ff41'; // Green
        btnElement.style.color = '#000';
        feedbackEl.innerHTML = `<h4 style="color:#00ff41">✅ إجابة صحيحة!</h4><p>${q.explanation}</p>`;
    } else {
        btnElement.style.background = '#ff4d4d'; // Red
        btnElement.style.color = '#fff';
        // Highlight correct one
        allBtns[q.correct].style.background = '#00ff41';
        allBtns[q.correct].style.color = '#000';
        feedbackEl.innerHTML = `<h4 style="color:#ff4d4d">❌ إجابة خاطئة</h4><p>${q.explanation}</p>`;
    }

    feedbackEl.style.display = 'block';
    document.getElementById('quiz-next-btn').style.display = 'block';
}

function nextQuizQuestion() {
    quizCurrentStep++;
    loadQuizQuestion(quizCurrentStep);
}

function finishQuiz() {
    document.getElementById('quiz-interface').style.display = 'none';
    const resultEl = document.getElementById('quiz-result');
    resultEl.style.display = 'block';

    const percent = Math.round((quizScore / theoryQuestions.length) * 100);
    let levelTitle = "";
    let msg = "";
    let color = "";
    let icon = "";

    if (percent === 100) {
        levelTitle = "نخبة النخبة 💎";
        msg = "أنت أسطورة! إجاباتك مثالية. إدارة مالية حديدية ونفسية فولاذية.";
        color = "#00ff41; text-shadow: 0 0 10px #00ff41";
        icon = "👑";
    } else if (percent >= 80) {
        levelTitle = "متداول محترف 🦁";
        msg = "ممتاز جداً! لديك العقلية والأدوات اللازمة للنجاح في السوق.";
        color = "#00ff41";
        icon = "🦁";
    } else if (percent >= 60) {
        levelTitle = "مستوى متوسط 📊";
        msg = "جيد، لديك الأساسيات ولكن تحتاج لضبط إدارة المخاطر أكثر.";
        color = "gold";
        icon = "⚖️";
    } else {
        levelTitle = "مستجد في السوق 🐣";
        msg = "تحذير: لا تتداول بمال حقيقي الآن. راجع دروس 'الإدارة المالية' مرة أخرى.";
        color = "#ff4d4d";
        icon = "🛑";
    }

    resultEl.innerHTML = `
        <div style="background: rgba(255,255,255,0.05); padding: 30px; border-radius: 15px; border: 1px solid #333;">
            <div style="font-size: 4rem; margin-bottom: 10px;">${icon}</div>
            <h2 style="color: #fff; margin-bottom: 5px;">مستواك الحالي:</h2>
            <h1 style="color: ${color}; font-size: 2.5rem; margin: 10px 0;">${levelTitle}</h1>
            
            <div style="width: 100%; height: 10px; background: #333; border-radius: 5px; margin: 20px auto; max-width: 300px; overflow: hidden;">
                <div style="width: ${percent}%; height: 100%; background: ${percent >= 60 ? '#00ff41' : '#ff4d4d'}; transition: width 1s;"></div>
            </div>
            
            <h3 style="color: #ccc;">النتيجة: ${percent}% (${quizScore} من ${theoryQuestions.length})</h3>
            
            <p style="font-size: 1.1rem; margin: 20px 0; color: #aaa; line-height: 1.6; border-top: 1px solid #444; padding-top: 20px;">
                💡 <strong>نصيحة روبوت الأكاديمية:</strong><br>${msg}
            </p>
            
            <button class="btn btn-primary" onclick="startQuiz()" style="margin-top: 10px; width: 200px;">إعادة الاختبار ↺</button>
        </div>
    `;
}

// Attach styles dynamically for quiz buttons
const style = document.createElement('style');
style.innerHTML = `
    .quiz-option-btn {
        display: block;
        width: 100%;
        padding: 15px;
        margin: 10px 0;
        background: #252525;
        border: 1px solid #444;
        color: #fff;
        border-radius: 8px;
        cursor: pointer;
        text-align: right;
        font-size: 1rem;
        transition: 0.2s;
    }
    .quiz-option-btn:hover:not(:disabled) {
        background: #333;
        border-color: var(--primary);
    }
`;
document.head.appendChild(style);

// Window binding
window.startQuiz = startQuiz;
window.nextQuizQuestion = nextQuizQuestion;
