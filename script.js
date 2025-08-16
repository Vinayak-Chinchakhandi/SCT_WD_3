// ===== Utility =====
function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, m => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[m]);
}

// ===== Quiz Data =====
const quiz = [
    { type: "single", question: "Which HTML tag is used for the largest heading?", options: ["<h1>", "<h6>", "<header>", "<heading>"], correct: [0] },
    { type: "multi", question: "Which of these are programming languages?", options: ["Python", "HTML", "C++", "CSS"], correct: [0, 2] },
    { type: "fill", question: "Fill in the blank: CSS stands for ______.", correct: ["Cascading style sheets", "Cascading Style Sheets"] },
    { type: "single", question: "Which planet is known as the Red Planet?", options: ["Earth", "Venus", "Mars", "Jupiter"], correct: [2] },
    { type: "multi", question: "Which of the following are prime numbers?", options: ["2", "4", "5", "9"], correct: [0, 2] },
    { type: "fill", question: "In computing, CPU stands for ______.", correct: ["Central processing unit", "Central Processing Unit"] },
    { type: "single", question: "What is the capital of Japan?", options: ["Kyoto", "Tokyo", "Osaka", "Hiroshima"], correct: [1] },
    { type: "multi", question: "Which of these are mammals?", options: ["Dolphin", "Shark", "Bat", "Penguin"], correct: [0, 2] },
    { type: "fill", question: "The chemical symbol for water is ______.", correct: ["H2O"] },
    { type: "single", question: "Which continent is the Sahara Desert located in?", options: ["Asia", "Africa", "Australia", "South America"], correct: [1] }
];

// ===== State =====
let index = 0;
let user = []; // store answers per index (array or string for fill)
let pFill, pNow, pTotal, qText, optionsEl, typeChip, reqChip, nextBtn, backBtn;
let startBtn, playAgainBtn, homeBtn;
const homeEl = document.getElementById('home');
const quizEl = document.getElementById('quizContent');
const reviewEl = document.getElementById('review');

// ===== Init =====
window.addEventListener("DOMContentLoaded", () => {
    document.getElementById('totalCount').textContent = quiz.length;

    startBtn = document.getElementById('startBtn');
    playAgainBtn = document.getElementById('playAgain');
    homeBtn = document.getElementById('homeBtn');

    if (startBtn) startBtn.addEventListener('click', startQuiz);
    if (playAgainBtn) playAgainBtn.addEventListener('click', startQuiz);
    if (homeBtn) homeBtn.addEventListener('click', showHome);

    showHome();
});

// ===== Show Home =====
function showHome() {
    homeEl.classList.remove('hidden');
    quizEl.classList.add('hidden');
    reviewEl.classList.add('hidden');
    document.body.classList.add('home-active');
}

// ===== Start Quiz =====
function startQuiz() {
    index = 0;
    user = [];
    homeEl.classList.add('hidden');
    quizEl.classList.remove('hidden');
    reviewEl.classList.add('hidden');
    document.body.classList.remove('home-active');
    rebindElements();
    if (pFill) pFill.style.width = "0%";
    render();
}

// ===== Element Binding =====
function rebindElements() {
    pFill = document.getElementById('pFill');
    pNow = document.getElementById('pNow');
    pTotal = document.getElementById('pTotal');
    qText = document.getElementById('qText');
    optionsEl = document.getElementById('options');
    typeChip = document.getElementById('typeChip');
    reqChip = document.getElementById('reqChip');
    nextBtn = document.getElementById('nextBtn');
    backBtn = document.getElementById('backBtn');
    guardMsg = document.getElementById('guardMsg');

    nextBtn.removeEventListener('click', nextClickHandler);
    nextBtn.addEventListener('click', nextClickHandler);

    backBtn.removeEventListener('click', backClickHandler);
    backBtn.addEventListener('click', backClickHandler);
}

function backClickHandler() {
    if (index > 0) {
        index--;
        render();
    }
}

// ===== Render Question =====
function render() {
    const q = quiz[index];
    pNow.textContent = index + 1;
    pTotal.textContent = quiz.length;
    if (pFill) pFill.style.width = ((index + 1) / quiz.length) * 100 + "%";

    qText.textContent = q.question;
    typeChip.textContent = q.type === "single" ? "Single Select" :
        q.type === "multi" ? "Multi Select" : "Fill in the Blank";

    optionsEl.innerHTML = "";
    if (q.type === "fill") {
        const wrap = document.createElement('div');
        wrap.className = "fill";
        const input = document.createElement('input');
        input.type = "text";
        input.placeholder = "Type your answer here…";
        input.autocomplete = "off";
        input.value = typeof user[index] === "string" ? user[index] : "";
        input.addEventListener('input', () => {
            user[index] = input.value;
            guard((input.value.trim().length === 0));
        });
        wrap.appendChild(input);
        optionsEl.appendChild(wrap);
        guard((input.value.trim().length === 0));
    } else {
        q.options.forEach((opt, idx) => {
            optionsEl.appendChild(mkOption(opt, q.type === "single" ? "radio" : "checkbox", q.type, q, idx));
        });
    }

    nextBtn.textContent = (index === quiz.length - 1) ? "Submit Quiz" : "Next";
    guard(false);
}

// ===== mkOption =====
function mkOption(label, inputType, groupName, q, realIndex) {
    const div = document.createElement('label');
    div.className = "option";
    div.tabIndex = 0;

    const input = document.createElement('input');
    input.type = inputType;
    input.name = `q-${index}-${groupName}`;
    input.value = realIndex;

    const tag = document.createElement('span');
    tag.className = "tag";
    tag.textContent = inputType === "radio" ? "○" : "☑";

    const text = document.createElement('div');
    text.className = "opt-text";
    const codeEl = document.createElement('code');
    codeEl.textContent = label;
    text.appendChild(codeEl);

    div.appendChild(input);
    div.appendChild(tag);
    div.appendChild(text);

    const stored = user[index];
    if (Array.isArray(stored) && stored.includes(realIndex)) {
        input.checked = true; div.classList.add('selected');
    }

    div.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'input') return;
        input.checked = !input.checked;
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    div.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); input.checked = !input.checked;
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    input.addEventListener('change', () => {
        if (groupName === 'single') {
            user[index] = [realIndex];
            [...optionsEl.querySelectorAll('.option')].forEach(o => o.classList.remove('selected'));
            div.classList.add('selected');
            [...optionsEl.querySelectorAll('input[type="radio"]')].forEach(r => {
                if (Number(r.value) !== realIndex) r.checked = false;
            });
            guard(false);
        } else {
            let set = new Set(Array.isArray(user[index]) ? user[index] : []);
            input.checked ? set.add(realIndex) : set.delete(realIndex);
            user[index] = [...set];
            div.classList.toggle('selected', input.checked);
            guard(false);
        }
    });

    return div;
}

// ===== Navigation =====
function nextClickHandler() {
    const q = quiz[index];
    if (q.type === "fill") {
        if (!user[index] || !user[index].trim()) { guard(true); return; }
    } else if (q.type === "multi") {
        if (!Array.isArray(user[index]) || user[index].length === 0) { guard(true); return; }
    } else if (q.type === "single") {
        if (!Array.isArray(user[index]) || user[index].length !== 1) { guard(true); return; }
    }

    if (index < quiz.length - 1) {
        index++;
        render();
    } else {
        finish();
    }
}

function guard(state) {
    if (nextBtn) nextBtn.disabled = state;
}

// ===== Finish / Review =====
function finish() {
    quizEl.classList.add('hidden');
    reviewEl.classList.remove('hidden');

    let correctCount = 0;
    const reviewList = document.getElementById('reviewList');
    reviewList.innerHTML = '';

    quiz.forEach((q, i) => {
        let userAns = user[i] || (q.type === "fill" ? "" : []);
        let isCorrect = false;

        if (q.type === "fill") {
            isCorrect = q.correct.some(ans => 
                String(ans).trim().toLowerCase() === String(userAns).trim().toLowerCase()
            );
        }
        else if (q.type === "single") {
            isCorrect = Array.isArray(userAns) && userAns.length === 1 && userAns[0] === q.correct[0];
        }
        else if (q.type === "multi") {
            isCorrect = Array.isArray(userAns) &&
                userAns.length === q.correct.length &&
                q.correct.every(idx => userAns.includes(idx));
        }

        if (isCorrect) correctCount++;

        const item = document.createElement('div');
        item.className = 'rev-item';
        item.innerHTML = `
            <div class="rev-q">${i + 1}. ${escapeHTML(q.question)}</div>
            <div class="rev-a">Your Answer:
                <span class="${isCorrect ? 'correct' : 'wrong'}">
                    ${
                        q.type === "fill"
                            ? escapeHTML(userAns)
                            : Array.isArray(userAns)
                                ? userAns.map(idx => `<code>${escapeHTML(q.options[idx])}</code>`).join(', ')
                                : ""
                    }
                </span>
            </div>
            <div class="rev-a">Correct Answer:
                ${
                    q.type === "fill"
                        ? q.correct.map(ans => `<code>${escapeHTML(ans)}</code>`).join(' / ')
                        : q.correct.map(idx => `<code>${escapeHTML(q.options[idx])}</code>`).join(', ')
                }
            </div>
        `;
        reviewList.appendChild(item);
    });

    const scoreWrap = document.getElementById('scoreWrap');
    scoreWrap.innerHTML = `
        <div class="badge">${correctCount} / ${quiz.length}</div>
        <div class="score-sub">Your Score</div>
    `;
}

document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'playAgain') startQuiz();
    if (e.target && e.target.id === 'homeBtn') showHome();
});
