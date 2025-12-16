// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js');
    });
}

// Constants (mm)
const UNITS = {
    // Metric
    'mm': 1, 'cm': 10, 'm': 1000, 'km': 1000000,
    // Imperial
    'in': 25.4, 'ft': 304.8, 'yd': 914.4, '1/4in': 6.35,
    // Brick (used for unit conversion)
    'stud': 8.0, 'plate': 3.2, 'brick': 9.6, 'figh': 40.0
};

// Brick Factors
const BRICK_FACTORS = {
    'stud': 8.0,
    'plate': 3.2,
    'brick': 9.6,
    's16': 16 * 8.0,
    's32': 32 * 8.0,
    's48': 48 * 8.0,
    'ldu': 0.4,
    'figh': 40.0
};

// State
let currentMode = 'brick';
let isDark = false;

// Elements
const scaleL = document.getElementById('scaleL');
const scaleR = document.getElementById('scaleR');
const inputReal = document.getElementById('inputReal');
const unitSelect = document.getElementById('unitSelect');
const toast = document.getElementById('toast');

const rightInputs = document.querySelectorAll('input[data-unit]');
const btnBrick = document.getElementById('btnToBrick');
const btnReal = document.getElementById('btnToReal');
const btnScale = document.getElementById('btnToScale');
const themeBtn = document.getElementById('themeBtn');

// Helper
function fmt(num) {
    if (num === null || isNaN(num) || !isFinite(num)) return '';
    return parseFloat(num.toFixed(6));
}

function toMM(val, unit) {
    return val * (UNITS[unit] || 1);
}

function showToast() {
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// Logic
function calculate() {
    const sL = parseFloat(scaleL.value);
    const sR = parseFloat(scaleR.value);
    const ratio = (sL && sR) ? (sL / sR) : 0;

    let activeInput = null;
    let rightCount = 0;

    rightInputs.forEach(input => {
        if (input.value !== '' && !isNaN(parseFloat(input.value))) {
            activeInput = input;
            rightCount++;
        }
    });

    // Check Multi-input Error (Real & Scale modes)
    if ((currentMode === 'real' || currentMode === 'scale') && rightCount > 1) {
        showToast();
        if (currentMode === 'real') inputReal.value = '';
        if (currentMode === 'scale') { scaleL.value = ''; scaleR.value = ''; }
        return;
    }

    if (currentMode === 'brick') {
        const realVal = parseFloat(inputReal.value);
        if (isNaN(realVal)) return;
        
        const realMM = toMM(realVal, unitSelect.value);
        const modelMM = realMM * ratio;

        rightInputs.forEach(input => {
            const factor = BRICK_FACTORS[input.dataset.unit];
            input.value = fmt(modelMM / factor);
        });

    } else if (currentMode === 'real') {
        if (rightCount === 1 && activeInput && ratio !== 0) {
            const val = parseFloat(activeInput.value);
            const factor = BRICK_FACTORS[activeInput.dataset.unit];
            const modelMM = val * factor;
            const realMM = modelMM / ratio;
            
            inputReal.value = fmt(realMM / (UNITS[unitSelect.value] || 1));
        } else {
            inputReal.value = '';
        }

    } else if (currentMode === 'scale') {
        const realVal = parseFloat(inputReal.value);
        
        if (!isNaN(realVal) && rightCount === 1 && activeInput) {
            const val = parseFloat(activeInput.value);
            if (val === 0 || realVal === 0) return;

            const realMM = toMM(realVal, unitSelect.value);
            const factor = BRICK_FACTORS[activeInput.dataset.unit];
            const modelMM = val * factor;
            
            const rawRatio = modelMM / realMM;

            if (rawRatio <= 1) {
                scaleL.value = 1;
                scaleR.value = fmt(1 / rawRatio);
            } else {
                scaleL.value = fmt(rawRatio);
                scaleR.value = 1;
            }
        }
    }
}

// Mode Switch
function setMode(mode) {
    currentMode = mode;

    btnBrick.classList.toggle('active', mode === 'brick');
    btnReal.classList.toggle('active', mode === 'real');
    btnScale.classList.toggle('active', mode === 'scale');

    scaleL.value = 1;
    scaleR.value = 1;
    inputReal.value = '';
    rightInputs.forEach(input => input.value = '');

    if (mode === 'brick') {
        scaleL.disabled = false; scaleR.disabled = false;
        inputReal.disabled = false; unitSelect.disabled = false;
        rightInputs.forEach(inp => inp.disabled = true);
    
    } else if (mode === 'real') {
        scaleL.disabled = false; scaleR.disabled = false;
        inputReal.disabled = true; unitSelect.disabled = false;
        rightInputs.forEach(inp => inp.disabled = false);

    } else if (mode === 'scale') {
        scaleL.disabled = true; scaleR.disabled = true;
        inputReal.disabled = false; unitSelect.disabled = false;
        rightInputs.forEach(inp => inp.disabled = false);
    }
}

// Events
[btnBrick, btnReal, btnScale].forEach(btn => {
    btn.addEventListener('click', (e) => setMode(e.target.id.replace('btnTo', '').toLowerCase()));
});

const allInputs = [scaleL, scaleR, inputReal, unitSelect, ...rightInputs];
allInputs.forEach(el => el.addEventListener('input', calculate));

themeBtn.addEventListener('click', () => {
    isDark = !isDark;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeBtn.querySelector('span').textContent = isDark ? 'light_mode' : 'dark_mode';
});

// Init
setMode('brick');