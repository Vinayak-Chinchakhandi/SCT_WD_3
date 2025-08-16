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
    { type: "multi",  question: "Which of these are programming languages?", options: ["Python", "HTML", "C++", "CSS"], correct: [0, 2] },
    { type: "fill",   question: "Fill in the blank: CSS stands for ______.", options: ["Cascading style sheets"], correct: ["Cascading"] },
    { type: "single", question: "Which planet is known as the Red Planet?", options: ["Earth", "Venus", "Mars", "Jupiter"], correct: [2] },
    { type: "multi",  question: "Which of the following are prime numbers?", options: ["2", "4", "5", "9"], correct: [0, 2] },
    { type: "fill",   question: "In computing, CPU stands for ______.", options: ["Central processing unit"], correct: ["Central"] },
    { type: "single", question: "What is the capital of Japan?", options: ["Kyoto", "Tokyo", "Osaka", "Hiroshima"], correct: [1] },
    { type: "multi",  question: "Which of these are mammals?", options: ["Dolphin", "Shark", "Bat", "Penguin"], correct: [0, 2] },
    { type: "fill",   question: "The chemical symbol for water is ____.", options: ["H2O"], correct: ["H2O"] },
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
    // set total count on home
    document.getElementById('totalCount').textContent = quiz.length;

    // grab references (some references are inside quizContent; rebind later if necessary)
    startBtn = document.getElementById('startBtn');
    playAgainBtn = document.getElementById('playAgain');
    homeBtn = document.getElementById('homeBtn');

    if (startBtn) startBtn.addEventListener('click', startQuiz);
    if (playAgainBtn) playAgainBtn.addEventListener('click', startQuiz);
    if (homeBtn) homeBtn.addEventListener('click', showHome);

    // initially show home
    showHome();
});

// ===== Show Home =====
function showHome() {
    // show home, hide quiz and review
    homeEl.classList.remove('hidden');
    quizEl.classList.add('hidden');
    reviewEl.classList.add('hidden');

    // hide progress by toggling class on body
    document.body.classList.add('home-active');
}

// ===== Start Quiz =====
function startQuiz() {
    // reset state
    index = 0;
    user = [];

    // show quiz UI, hide home and review
    homeEl.classList.add('hidden');
    quizEl.classList.remove('hidden');
    reviewEl.classList.add('hidden');

    // allow header progress to show
    document.body.classList.remove('home-active');

    // rebind elements inside quiz area
    rebindElements();
    // reset progress fill
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

    // attach events
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
    // hide quiz, show review
    quizEl.classList.add('hidden');
    reviewEl.classList.remove('hidden');

    // populate score and review
    let correctCount = 0;
    const reviewList = document.getElementById('reviewList');
    reviewList.innerHTML = ''; // clear

    quiz.forEach((q, i) => {
        let userAns = user[i] || (q.type === "fill" ? "" : []);
        let isCorrect = false;

        if (q.type === "fill") {
            isCorrect = String(userAns).trim().toLowerCase() === String(q.correct[0]).trim().toLowerCase();
        }
        else if (q.type === "single") {
            isCorrect = Array.isArray(userAns) && userAns.length > 0 && userAns[0] === q.correct[0];
        }
        else if (q.type === "multi") {
            isCorrect = Array.isArray(userAns) &&
                userAns.length === q.correct.length &&
                q.correct.every(idx => userAns.includes(idx));
        }

        if (isCorrect) correctCount++;

        // build element
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
                        ? escapeHTML(q.correct[0])
                        : q.correct.map(idx => `<code>${escapeHTML(q.options[idx])}</code>`).join(', ')
                }
            </div>
        `;
        reviewList.appendChild(item);
    });

    // show score
    const scoreWrap = document.getElementById('scoreWrap');
    scoreWrap.innerHTML = `
        <div class="badge">${correctCount} / ${quiz.length}</div>
        <div class="score-sub">Your Score</div>
    `;
}

// attach playAgain/home listeners (in case elements present after DOM load)
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'playAgain') startQuiz();
    if (e.target && e.target.id === 'homeBtn') showHome();
});
