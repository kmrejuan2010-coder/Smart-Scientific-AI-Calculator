
const display = document.getElementById("display");
const expression = document.getElementById("expression");

const buttons = document.querySelectorAll(
    ".calculator-buttons button"
);

let currentInput = "";
let previousExpression = "";

// Display update with number language
function updateDisplay() {
    const lang = document.getElementById("languageSelect").value;

    const value = currentInput || "0";

    display.value = convertNumberLanguage(value, lang);
}

// Button actions
buttons.forEach(button => {

    button.addEventListener("click", () => {

        const value = button.dataset.value;
        const action = button.dataset.action;

        // Clear All
        if (action === "clear") {
            currentInput = "";
            previousExpression = "";
            expression.textContent = "";
            updateDisplay();
            return;
        }

        // Delete
        if (action === "delete") {
            currentInput = currentInput.slice(0, -1);
            updateDisplay();
            return;
        }

        // Calculate
        if (action === "calculate") {
            calculateResult();
            return;
        }

        // History (will be developed later)
       
      if (action === "history") {

    document.getElementById("historySection").hidden = false;

    document.querySelector(".display-box").hidden = true;

    document.querySelector(".calculator-buttons").hidden = true;

    document.querySelector(".history-section").scrollIntoView();

    renderHistory();

    return;
      
      
      }

        // Add number or operator
        if (value !== undefined) {
            currentInput += value;
            updateDisplay();
        }

    });

});

// Safe basic calculation parser
function calculate(expressionText) {

    const tokens = expressionText.match(
        /(?:\d+\.?\d*|\.\d+)|[+\-*/()%]/g
    );

    if (!tokens || tokens.join("") !== expressionText.replace(/\s/g, "")) {
        throw new Error("Invalid Expression");
    }

    let position = 0;

    function parseExpression() {
        let result = parseTerm();

        while (
            tokens[position] === "+" ||
            tokens[position] === "-"
        ) {
            const operator = tokens[position++];

            const right = parseTerm();

            result = operator === "+"
                ? result + right
                : result - right;
        }

        return result;
    }

    function parseTerm() {
        let result = parseUnary();

        while (
            tokens[position] === "*" ||
            tokens[position] === "/"
        ) {
            const operator = tokens[position++];

            const right = parseUnary();

            if (operator === "/" && right === 0) {
                throw new Error("Cannot divide by zero");
            }

            result = operator === "*"
                ? result * right
                : result / right;
        }

        return result;
    }

    function parseUnary() {
        if (tokens[position] === "+") {
            position++;
            return parseUnary();
        }

        if (tokens[position] === "-") {
            position++;
            return -parseUnary();
        }

        return parsePostfix();
    }

    function parsePostfix() {
        let value = parsePrimary();

        while (tokens[position] === "%") {
            position++;
            value /= 100;
        }

        return value;
    }

    function parsePrimary() {
        if (tokens[position] === "(") {
            position++;

            const value = parseExpression();

            if (tokens[position] !== ")") {
                throw new Error("Missing bracket");
            }

            position++;
            return value;
        }

        const token = tokens[position++];

        if (!token || !/^(\d+\.?\d*|\.\d+)$/.test(token)) {
            throw new Error("Invalid Number");
        }

        return Number(token);
    }

    const result = parseExpression();

    if (position !== tokens.length) {
        throw new Error("Invalid Expression");
    }

    if (!Number.isFinite(result)) {
        throw new Error("Math Error");
    }

    return Number(result.toPrecision(12));
}


function calculateResult() {

    if (!currentInput) return;

    const originalExpression = currentInput;

    try {

        let result;

        // Scientific expression detection
        if (/[a-zA-Zπ√^!]/.test(originalExpression)) {
            result = calculateScientific(originalExpression);
        } else {
            result = calculate(originalExpression);
        }

        previousExpression = originalExpression;

        expression.textContent = originalExpression + " =";

        currentInput = String(result);

        updateDisplay();

        saveCalculation(originalExpression, result);

    } catch (error) {

        console.error("Calculation Error:", error);

        display.value = "Error";

    }
}



// Theme toggle
const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("light-mode");

    themeBtn.textContent =
        document.body.classList.contains("light-mode")
            ? "☀"
            : "☾";

});

// Initial display
updateDisplay();


// HISTORY SYSTEM

let calculationHistory = [];

try {
    calculationHistory = JSON.parse(
        localStorage.getItem("smartCalculatorHistory")
    ) || [];

    if (!Array.isArray(calculationHistory)) {
        calculationHistory = [];
    }

} catch {
    calculationHistory = [];
}

function saveCalculation(expression, result) {

    calculationHistory.unshift({
        expression: expression,
        result: String(result),
        time: Date.now()
    });

    calculationHistory = calculationHistory.slice(0, 100);

    localStorage.setItem(
        "smartCalculatorHistory",
        JSON.stringify(calculationHistory)
    );

    renderHistory();
}

function renderHistory() {

    const historyList = document.getElementById("historyList");

    historyList.innerHTML = "";

    if (calculationHistory.length === 0) {

        const empty = document.createElement("p");

        empty.id = "emptyHistory";
        empty.textContent = "No history yet";

        historyList.appendChild(empty);

        return;
    }

    calculationHistory.forEach((item, index) => {

        const row = document.createElement("div");
        row.className = "history-item";

        const details = document.createElement("div");

        const exp = document.createElement("p");
        exp.className = "history-expression";
        exp.textContent = item.expression;

        const result = document.createElement("strong");
        result.className = "history-result";
        result.textContent = "= " + item.result;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "history-delete";
        deleteBtn.textContent = "Delete";
        deleteBtn.dataset.index = index;

        details.appendChild(exp);
        details.appendChild(result);

        row.appendChild(details);
        row.appendChild(deleteBtn);

        historyList.appendChild(row);
    });
}

// Delete individual history
document.getElementById("historyList").addEventListener(
    "click",
    function(event) {

        const button = event.target.closest(".history-delete");

        if (!button) return;

        const index = Number(button.dataset.index);

        calculationHistory.splice(index, 1);

        localStorage.setItem(
            "smartCalculatorHistory",
            JSON.stringify(calculationHistory)
        );

        renderHistory();
    }
);

// Clear all history
document.getElementById("clearHistory").addEventListener(
    "click",
    function() {

        calculationHistory = [];

        localStorage.removeItem("smartCalculatorHistory");

        renderHistory();
    }
);

// Initial history display
renderHistory();

// Back to Calculator

document.getElementById("backToCalculator")
    .addEventListener("click", function() {

        document.getElementById("historySection").hidden = true;

        document.querySelector(".display-box").hidden = false;

        document.querySelector(".calculator-buttons").hidden = false;

    });
  
console.log("Math.js Status:", typeof math);

// SCIENTIFIC MODE TOGGLE
const scientificToggle = document.getElementById("scientificToggle");
const scientificPanel = document.getElementById("scientificPanel");

scientificToggle.addEventListener("click", function () {
    scientificPanel.hidden = !scientificPanel.hidden;

    scientificToggle.textContent = scientificPanel.hidden
        ? "SCIENTIFIC MODE"
        : "HIDE SCIENTIFIC";
});



// SCIENTIFIC CALCULATOR ENGINE

let scientificAngleMode = "DEG";

function calculateScientific(input) {

    // Convert calculator symbols
    let safeInput = input
        .replace(/π/g, "pi")
        .replace(/√/g, "sqrt");

    // Parse expression
    const node = math.parse(safeInput);

    // Allowed mathematical functions
    const allowedFunctions = [
        "sin", "cos", "tan",
        "log", "ln", "sqrt"
    ];

    // Validate expression nodes
    node.traverse(function (child) {

        if (child.isConstantNode) {
            if (typeof child.value !== "number") {
                throw new Error("Invalid Value");
            }
        }

        else if (child.isSymbolNode) {
            const allowedSymbols = [
                "pi", "e",
                ...allowedFunctions
            ];

            if (!allowedSymbols.includes(child.name)) {
                throw new Error("Invalid Symbol");
            }
        }

        else if (child.isFunctionNode) {
            if (
                !child.fn.isSymbolNode ||
                !allowedFunctions.includes(child.fn.name)
            ) {
                throw new Error("Invalid Function");
            }
        }

        else if (child.isOperatorNode) {
            const allowedOperators = [
                "+", "-", "*", "/", "^", "%", "!"
            ];

            if (!allowedOperators.includes(child.op)) {
                throw new Error("Invalid Operator");
            }
        }

        else if (
            !child.isParenthesisNode &&
            !child.isConstantNode &&
            !child.isSymbolNode &&
            !child.isFunctionNode &&
            !child.isOperatorNode
        ) {
            throw new Error("Invalid Expression");
        }

    });

    // DEG / RAD functions
    const toAngle = value =>
        scientificAngleMode === "DEG"
            ? math.unit(value, "deg")
            : value;

    const scope = {
        sin: x => math.sin(toAngle(x)),
        cos: x => math.cos(toAngle(x)),
        tan: x => math.tan(toAngle(x)),
        log: x => math.log10(x),
        ln: x => math.log(x),
        sqrt: x => math.sqrt(x)
    };

    const result = node.evaluate(scope);

    if (
        typeof result !== "number" ||
        !Number.isFinite(result)
    ) {
        throw new Error("Math Error");
    }

    return Number(result.toPrecision(12));
}


// ANGLE MODE TOGGLE

const angleModeButton = document.getElementById("angleMode");

angleModeButton.addEventListener("click", function () {

    scientificAngleMode =
        scientificAngleMode === "DEG" ? "RAD" : "DEG";

    angleModeButton.textContent = scientificAngleMode;

});


// TEMPERATURE CONVERTER

const tempInput = document.getElementById("tempInput");
const tempFrom = document.getElementById("tempFrom");
const tempTo = document.getElementById("tempTo");
const tempResult = document.getElementById("tempResult");
const tempSwap = document.getElementById("tempSwap");
const tempClear = document.getElementById("tempClear");

function convertTemperature() {
    const value = parseFloat(tempInput.value);

    if (tempInput.value.trim() === "" || !Number.isFinite(value)) {
        tempResult.textContent = "Enter a value";
        return;
    }

    let celsius;

    // Convert to Celsius first
    if (tempFrom.value === "C") {
        celsius = value;
    } else if (tempFrom.value === "F") {
        celsius = (value - 32) * 5 / 9;
    } else {
        celsius = value - 273.15;
    }

    // Convert Celsius to target unit
    let result;

    if (tempTo.value === "C") {
        result = celsius;
    } else if (tempTo.value === "F") {
        result = (celsius * 9 / 5) + 32;
    } else {
        result = celsius + 273.15;
    }

    const symbols = {
        C: "°C",
        F: "°F",
        K: "K"
    };

    tempResult.textContent =
        result.toFixed(2) + " " + symbols[tempTo.value];
}

// Automatic conversion
tempInput.addEventListener("input", convertTemperature);
tempFrom.addEventListener("change", convertTemperature);
tempTo.addEventListener("change", convertTemperature);

// Swap units
tempSwap.addEventListener("click", function () {
    const oldFrom = tempFrom.value;

    tempFrom.value = tempTo.value;
    tempTo.value = oldFrom;

    convertTemperature();
});

// Clear converter
tempClear.addEventListener("click", function () {
    tempInput.value = "";
    tempResult.textContent = "Enter a value";
});


// CONVERTER SCREEN NAVIGATION

const tempOpenBtn = document.getElementById("tempOpenBtn");
const tempBackBtn = document.getElementById("tempBackBtn");

const calculatorMain = document.querySelector("main");

const converterSection = document.getElementById("temperatureConverter");
const converterDashboard = document.getElementById("converterDashboard");
const converterScreens = document.getElementById("converterScreens");
const converterBackBtn = document.getElementById("converterBackBtn");

const converterPages = {
    temperature: document.getElementById("temperatureScreen"),
    length: document.getElementById("lengthScreen"),
    weight: document.getElementById("weightScreen"),
    area: document.getElementById("areaScreen"),
    volume: document.getElementById("volumeScreen"),
    speed: document.getElementById("speedScreen"),
    time: document.getElementById("timeScreen"),
    data: document.getElementById("dataScreen"),
    number: document.getElementById("numberScreen")
};

// Open Converter Dashboard
tempOpenBtn.addEventListener("click", function () {

    calculatorMain.hidden = true;
    converterSection.hidden = false;

    converterDashboard.hidden = false;
    converterScreens.hidden = true;
    converterBackBtn.hidden = true;

});

// Open Converter Category
document.querySelectorAll("[data-converter]").forEach(button => {

    button.addEventListener("click", function () {

        const category = button.dataset.converter;
        const selectedPage = converterPages[category];

        if (!selectedPage) return;

        converterDashboard.hidden = true;
        converterScreens.hidden = false;

        Object.values(converterPages).forEach(page => {
            page.hidden = true;
        });

        selectedPage.hidden = false;
        converterBackBtn.hidden = false;

    });

});

// Back to Converter Dashboard
converterBackBtn.addEventListener("click", function () {

    converterScreens.hidden = true;
    converterDashboard.hidden = false;

    converterBackBtn.hidden = true;

});

// Back to Calculator
tempBackBtn.addEventListener("click", function () {

    converterSection.hidden = true;
    calculatorMain.hidden = false;

});

// Back to Converter Dashboard
converterBackBtn.addEventListener("click", function () {

    converterScreens.hidden = true;
    converterDashboard.hidden = false;

    converterBackBtn.hidden = true;

});

// Back to Calculator
tempBackBtn.addEventListener("click", function () {

    converterSection.hidden = true;
    calculatorMain.hidden = false;

});

// LENGTH CONVERTER

const lengthInput = document.getElementById("lengthInput");
const lengthFrom = document.getElementById("lengthFrom");
const lengthTo = document.getElementById("lengthTo");
const lengthResult = document.getElementById("lengthResult");
const lengthSwap = document.getElementById("lengthSwap");
const lengthClear = document.getElementById("lengthClear");

const lengthUnits = {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    mi: 1609.344,
    ft: 0.3048,
    in: 0.0254,
    yd: 0.9144
};

function convertLength() {

    const value = Number(lengthInput.value);

    if (
        lengthInput.value.trim() === "" ||
        !Number.isFinite(value)
    ) {
        lengthResult.textContent = "Enter a value";
        return;
    }

    const meters = value * lengthUnits[lengthFrom.value];

    const result = meters / lengthUnits[lengthTo.value];

    lengthResult.textContent =
        Number(result.toPrecision(10)) + " " + lengthTo.value;
}

lengthInput.addEventListener("input", convertLength);
lengthFrom.addEventListener("change", convertLength);
lengthTo.addEventListener("change", convertLength);

lengthSwap.addEventListener("click", function () {

    const oldFrom = lengthFrom.value;

    lengthFrom.value = lengthTo.value;
    lengthTo.value = oldFrom;

    convertLength();
});

lengthClear.addEventListener("click", function () {

    lengthInput.value = "";
    lengthResult.textContent = "Enter a value";

});

// WEIGHT CONVERTER

const weightInput = document.getElementById("weightInput");
const weightFrom = document.getElementById("weightFrom");
const weightTo = document.getElementById("weightTo");
const weightResult = document.getElementById("weightResult");
const weightSwap = document.getElementById("weightSwap");
const weightClear = document.getElementById("weightClear");

const weightUnits = {
    kg: 1,
    g: 0.001,
    mg: 0.000001,
    lb: 0.45359237,
    oz: 0.028349523125,
    ton: 1000
};

function convertWeight() {

    const value = Number(weightInput.value);

    if (
        weightInput.value.trim() === "" ||
        !Number.isFinite(value)
    ) {
        weightResult.textContent = "Enter a value";
        return;
    }

    const kilograms = value * weightUnits[weightFrom.value];

    const result = kilograms / weightUnits[weightTo.value];

    weightResult.textContent =
        Number(result.toPrecision(10)) + " " + weightTo.value;
}

weightInput.addEventListener("input", convertWeight);
weightFrom.addEventListener("change", convertWeight);
weightTo.addEventListener("change", convertWeight);

weightSwap.addEventListener("click", function () {

    const oldFrom = weightFrom.value;

    weightFrom.value = weightTo.value;
    weightTo.value = oldFrom;

    convertWeight();
});

weightClear.addEventListener("click", function () {

    weightInput.value = "";
    weightResult.textContent = "Enter a value";

});


// AREA CONVERTER

const areaInput = document.getElementById("areaInput");
const areaFrom = document.getElementById("areaFrom");
const areaTo = document.getElementById("areaTo");
const areaResult = document.getElementById("areaResult");
const areaSwap = document.getElementById("areaSwap");
const areaClear = document.getElementById("areaClear");

const areaUnits = {
    m2: 1,
    km2: 1000000,
    cm2: 0.0001,
    ft2: 0.09290304,
    in2: 0.00064516,
    acre: 4046.8564224,
    hectare: 10000
};

function convertArea() {
    const value = Number(areaInput.value);

    if (areaInput.value.trim() === "" || !Number.isFinite(value)) {
        areaResult.textContent = "Enter a value";
        return;
    }

    const squareMeters = value * areaUnits[areaFrom.value];
    const result = squareMeters / areaUnits[areaTo.value];

    areaResult.textContent =
        Number(result.toPrecision(10)) + " " + areaTo.value;
}

areaInput.addEventListener("input", convertArea);
areaFrom.addEventListener("change", convertArea);
areaTo.addEventListener("change", convertArea);

areaSwap.addEventListener("click", function () {
    const oldFrom = areaFrom.value;
    areaFrom.value = areaTo.value;
    areaTo.value = oldFrom;
    convertArea();
});

areaClear.addEventListener("click", function () {
    areaInput.value = "";
    areaResult.textContent = "Enter a value";
});

// VOLUME CONVERTER

const volumeUnits = {
    L: 1,
    mL: 0.001,
    m3: 1000,
    cm3: 0.001,
    ft3: 28.316846592,
    gal: 3.785411784
};

const volumeInput = document.getElementById("volumeInput");
const volumeFrom = document.getElementById("volumeFrom");
const volumeTo = document.getElementById("volumeTo");
const volumeResult = document.getElementById("volumeResult");

function convertVolume() {

    const value = parseFloat(volumeInput.value);

    if (volumeInput.value.trim() === "" || !Number.isFinite(value)) {
        volumeResult.textContent = "Enter a value";
        return;
    }

    const result =
        (value * volumeUnits[volumeFrom.value]) /
        volumeUnits[volumeTo.value];

    volumeResult.textContent =
        Number(result.toFixed(8)).toLocaleString("en-US");
}

volumeInput.addEventListener("input", convertVolume);
volumeFrom.addEventListener("change", convertVolume);
volumeTo.addEventListener("change", convertVolume);

document.getElementById("volumeSwap").addEventListener("click", () => {

    const oldFrom = volumeFrom.value;

    volumeFrom.value = volumeTo.value;
    volumeTo.value = oldFrom;

    convertVolume();
});

document.getElementById("volumeClear").addEventListener("click", () => {

    volumeInput.value = "";
    volumeResult.textContent = "Enter a value";

});



// =====================================
// SPEED, TIME AND DATA CONVERTERS
// =====================================

function setupExtraUnitConverter(config) {

    const input = document.getElementById(config.prefix + "Input");
    const from = document.getElementById(config.prefix + "From");
    const to = document.getElementById(config.prefix + "To");
    const result = document.getElementById(config.prefix + "Result");

    function convert() {

        const rawValue = input.value.trim();
        const value = Number(rawValue);

        if (rawValue === "" || !Number.isFinite(value)) {
            result.textContent = "Enter a value";
            return;
        }

        const converted =
            (value * config.units[from.value]) /
            config.units[to.value];

        if (!Number.isFinite(converted)) {
            result.textContent = "Result too large";
            return;
        }

        result.textContent =
            Number(converted.toPrecision(10)).toLocaleString("en-US");
    }

    input.addEventListener("input", convert);
    from.addEventListener("change", convert);
    to.addEventListener("change", convert);

    document.getElementById(config.prefix + "Swap")
        .addEventListener("click", () => {

            const oldFrom = from.value;
            from.value = to.value;
            to.value = oldFrom;

            convert();
        });

    document.getElementById(config.prefix + "Clear")
        .addEventListener("click", () => {

            input.value = "";
            result.textContent = "Enter a value";
        });
}


// SPEED UNITS (Base: Meter/Second)

setupExtraUnitConverter({
    prefix: "speed",

    units: {
        ms: 1,
        kmh: 0.2777777778,
        mph: 0.44704,
        fts: 0.3048,
        knot: 0.5144444444
    }
});


// TIME UNITS (Base: Second)

setupExtraUnitConverter({
    prefix: "time",

    units: {
        ms: 0.001,
        s: 1,
        min: 60,
        h: 3600,
        day: 86400,
        week: 604800
    }
});


// DATA STORAGE UNITS (Base: Byte)
// Uses 1024-based conversion.

setupExtraUnitConverter({
    prefix: "data",

    units: {
        B: 1,
        KB: 1024,
        MB: 1024 ** 2,
        GB: 1024 ** 3,
        TB: 1024 ** 4
    }
});


// =====================================
// NUMBER SYSTEM CONVERTER
// =====================================

const numberInput = document.getElementById("numberInput");
const numberFrom = document.getElementById("numberFrom");
const numberTo = document.getElementById("numberTo");
const numberResult = document.getElementById("numberResult");

function parseBasedInteger(value, base) {

    let text = value.trim().toUpperCase();

    if (!text) return null;

    let sign = 1n;

    if (text.startsWith("-")) {
        sign = -1n;
        text = text.slice(1);
    } else if (text.startsWith("+")) {
        text = text.slice(1);
    }

    if (!text) return null;

    let result = 0n;

    for (const char of text) {

        const digit = parseInt(char, 36);

        if (
            Number.isNaN(digit) ||
            digit < 0 ||
            digit >= base
        ) {
            return null;
        }

        result = result * BigInt(base) + BigInt(digit);
    }

    return result * sign;
}


function convertNumberSystem() {

    const rawValue = numberInput.value.trim();

    if (!rawValue) {
        numberResult.textContent = "Enter a value";
        return;
    }

    const fromBase = Number(numberFrom.value);
    const toBase = Number(numberTo.value);

    const decimalValue = parseBasedInteger(rawValue, fromBase);

    if (decimalValue === null) {
        numberResult.textContent = "Invalid Number";
        return;
    }

    numberResult.textContent =
        decimalValue.toString(toBase).toUpperCase();
}


numberInput.addEventListener("input", convertNumberSystem);
numberFrom.addEventListener("change", convertNumberSystem);
numberTo.addEventListener("change", convertNumberSystem);


document.getElementById("numberSwap")
    .addEventListener("click", () => {

        const oldFrom = numberFrom.value;

        numberFrom.value = numberTo.value;
        numberTo.value = oldFrom;

        convertNumberSystem();
    });


document.getElementById("numberClear")
    .addEventListener("click", () => {

        numberInput.value = "";
        numberResult.textContent = "Enter a value";
    });



// ==================================
// MULTI-LANGUAGE TRANSLATION SYSTEM
// ==================================

const languageSelect = document.getElementById("languageSelect");

const translations = {
    ".brand h1": [
        "Smart Calculator",
        "স্মার্ট ক্যালকুলেটর",
        "स्मार्ट कैलकुलेटर",
        "الحاسبة الذكية"
    ],
    ".brand p": [
        "Scientific & AI Calculator",
        "সায়েন্টিফিক ও এআই ক্যালকুলেটর",
        "साइंटिफिक और एआई कैलकुलेटर",
        "حاسبة علمية وذكاء اصطناعي"
    ],
    "#tempOpenBtn": [
        "CONVERTER", "কনভার্টার", "कन्वर्टर", "المحوّل"
    ],
    ".history-header h2": [
        "Calculation History", "হিসাবের ইতিহাস",
        "गणना इतिहास", "سجل العمليات الحسابية"
    ],
    "#backToCalculator": [
        "← Back", "← ফিরে যান", "← वापस जाएँ", "رجوع ←"
    ],
    "#clearHistory": [
        "Clear All", "সব মুছুন", "सब मिटाएँ", "مسح الكل"
    ],
    "#emptyHistory": [
        "No history yet", "এখনো কোনো হিসাব নেই",
        "अभी कोई इतिहास नहीं", "لا يوجد سجل حتى الآن"
    ],
    ".display-label": [
        "CALCULATION", "হিসাব", "गणना", "الحساب"
    ],
    "#scientificToggle": [
        "SCIENTIFIC MODE", "সায়েন্টিফিক মোড",
        "साइंटिफिक मोड", "الوضع العلمي"
    ],
    "#angleMode": [
        "DEG", "ডিগ্রি", "डिग्री", "درجة"
    ],
    ".calculator-buttons button[data-action='history']": [
        "HIS", "ইতিহাস", "इतिहास", "السجل"
    ],

    ".converter-dashboard h2": [
        "All-in-One Converter", "অল-ইন-ওয়ান কনভার্টার",
        "ऑल-इन-वन कन्वर्टर", "محول شامل"
    ],
    ".converter-dashboard p": [
        "Select a conversion category",
        "একটি কনভার্সন বিভাগ নির্বাচন করুন",
        "रूपांतरण श्रेणी चुनें",
        "اختر فئة التحويل"
    ],

    "[data-converter='temperature']": [
        "🌡️ Temperature", "🌡️ তাপমাত্রা",
        "🌡️ तापमान", "🌡️ درجة الحرارة"
    ],
    "[data-converter='length']": [
        "📏 Length", "📏 দৈর্ঘ্য",
        "📏 लंबाई", "📏 الطول"
    ],
    "[data-converter='weight']": [
        "⚖️ Weight", "⚖️ ওজন",
        "⚖️ वज़न", "⚖️ الوزن"
    ],
    "[data-converter='area']": [
        "📐 Area", "📐 ক্ষেত্রফল",
        "📐 क्षेत्रफल", "📐 المساحة"
    ],
    "[data-converter='volume']": [
        "🧪 Volume", "🧪 আয়তন",
        "🧪 الحجم", "🧪 الحجم"
    ],
    "[data-converter='speed']": [
        "🚀 Speed", "🚀 গতি",
        "🚀 गति", "🚀 السرعة"
    ],
    "[data-converter='time']": [
        "⏱️ Time", "⏱️ সময়",
        "⏱️ الوقت", "⏱️ الوقت"
    ],
    "[data-converter='data']": [
        "💾 Data Storage", "💾 ডেটা স্টোরেজ",
        "💾 डेटा स्टोरेज", "💾 تخزين البيانات"
    ],
    "[data-converter='number']": [
        "🔢 Number System", "🔢 সংখ্যা পদ্ধতি",
        "🔢 संख्या प्रणाली", "🔢 نظام الأعداد"
    ],

    "#converterBackBtn": [
        "← All Converters", "← সব কনভার্টার",
        "← सभी कन्वर्टर", "جميع المحولات ←"
    ],
    "#tempBackBtn": [
        "← Back", "← ফিরে যান",
        "← वापस जाएँ", "رجوع ←"
    ],

    "#temperatureScreen h2": [
        "🌡️ Temperature Converter", "🌡️ তাপমাত্রা কনভার্টার",
        "🌡️ तापमान कन्वर्टर", "🌡️ محول درجة الحرارة"
    ],
    "#lengthScreen h2": [
        "📏 Length Converter", "📏 দৈর্ঘ্য কনভার্টার",
        "📏 लंबाई कन्वर्टर", "📏 محول الطول"
    ],
    "#weightScreen h2": [
        "⚖️ Weight Converter", "⚖️ ওজন কনভার্টার",
        "⚖️ वज़न कन्वर्टर", "⚖️ محول الوزن"
    ],
    "#areaScreen h2": [
        "📐 Area Converter", "📐 ক্ষেত্রফল কনভার্টার",
        "📐 क्षेत्रफल कन्वर्टर", "📐 محول المساحة"
    ],
    "#volumeScreen h2": [
        "🧪 Volume Converter", "🧪 আয়তন কনভার্টার",
        "🧪 आयतन कन्वर्टर", "🧪 محول الحجم"
    ],
    "#speedScreen h2": [
        "🚀 Speed Converter", "🚀 গতি কনভার্টার",
        "🚀 गति कन्वर्टर", "🚀 محول السرعة"
    ],
    "#timeScreen h2": [
        "⏱️ Time Converter", "⏱️ সময় কনভার্টার",
        "⏱️ समय कन्वर्टर", "⏱️ محول الوقت"
    ],
    "#dataScreen h2": [
        "💾 Data Storage Converter", "💾 ডেটা স্টোরেজ কনভার্টার",
        "💾 डेटा स्टोरेज कन्वर्टर", "💾 محول تخزين البيانات"
    ],
    "#numberScreen h2": [
        "🔢 Number System Converter", "🔢 সংখ্যা পদ্ধতি কনভার্টার",
        "🔢 संख्या प्रणाली कन्वर्टर", "🔢 محول نظام الأعداد"
    ],

    "#temperatureScreen > p": [
        "Convert temperature instantly",
        "সহজেই তাপমাত্রা রূপান্তর করুন",
        "तापमान तुरंत बदलें",
        "حوّل درجة الحرارة فورًا"
    ],
    "#lengthScreen > p": [
        "Convert length units instantly",
        "সহজেই দৈর্ঘ্যের একক রূপান্তর করুন",
        "लंबाई की इकाइयाँ तुरंत बदलें",
        "حوّل وحدات الطول فورًا"
    ],
    "#weightScreen > p": [
        "Convert weight units instantly",
        "সহজেই ওজনের একক রূপান্তর করুন",
        "वज़न की इकाइयाँ तुरंत बदलें",
        "حوّل وحدات الوزن فورًا"
    ],
    "#areaScreen > p": [
        "Convert area units instantly",
        "সহজেই ক্ষেত্রফলের একক রূপান্তর করুন",
        "क्षेत्रफल की इकाइयाँ तुरंत बदलें",
        "حوّل وحدات المساحة فورًا"
    ],
    "#volumeScreen > p": [
        "Convert volume units instantly",
        "সহজেই আয়তনের একক রূপান্তর করুন",
        "आयतन की इकाइयाँ तुरंत बदलें",
        "حوّل وحدات الحجم فورًا"
    ],
    "#speedScreen > p": [
        "Convert speed units instantly",
        "সহজেই গতির একক রূপান্তর করুন",
        "गति की इकाइयाँ तुरंत बदलें",
        "حوّل وحدات السرعة فورًا"
    ],
    "#timeScreen > p": [
        "Convert time units instantly",
        "সহজেই সময়ের একক রূপান্তর করুন",
        "समय की इकाइयाँ तुरंत बदलें",
        "حوّل وحدات الوقت فورًا"
    ],
    "#dataScreen > p": [
        "Convert digital storage units",
        "ডিজিটাল স্টোরেজের একক রূপান্তর করুন",
        "डिजिटल स्टोरेज इकाइयाँ बदलें",
        "حوّل وحدات التخزين الرقمية"
    ],
    "#numberScreen > p": [
        "Convert numbers between different bases",
        "বিভিন্ন সংখ্যা পদ্ধতিতে রূপান্তর করুন",
        "विभिन्न संख्या प्रणालियों में बदलें",
        "حوّل الأعداد بين الأنظمة المختلفة"
    ],

    "#tempInput": ["Enter value", "মান লিখুন", "मान दर्ज करें", "أدخل القيمة"],
    "#lengthInput": ["Enter value", "মান লিখুন", "मान दर्ज करें", "أدخل القيمة"],
    "#weightInput": ["Enter value", "মান লিখুন", "मान दर्ज करें", "أدخل القيمة"],
    "#areaInput": ["Enter value", "মান লিখুন", "मान दर्ज करें", "أدخل القيمة"],
    "#volumeInput": ["Enter value", "মান লিখুন", "मान दर्ज करें", "أدخل القيمة"],
    "#speedInput": ["Enter value", "মান লিখুন", "मान दर्ज करें", "أدخل القيمة"],
    "#timeInput": ["Enter value", "মান লিখুন", "मान दर्ज करें", "أدخل القيمة"],
    "#dataInput": ["Enter value", "মান লিখুন", "मान दर्ज करें", "أدخل القيمة"],
    "#numberInput": ["Enter a number", "সংখ্যা লিখুন", "संख्या दर्ज करें", "أدخل رقمًا"],

    "#tempScreen": ["", "", "", ""]
};

const extraTranslations = {
    "label": {
        en: "Enter", bn: "লিখুন", hi: "दर्ज करें", ar: "أدخل"
    }
};

function applyLanguage(lang) {

    const index = ["en", "bn", "hi", "ar"].indexOf(lang);
    if (index === -1) return;

    for (const selector in translations) {

        const elements = document.querySelectorAll(selector);

        elements.forEach(element => {
            const value = translations[selector][index];

            if (value !== undefined && value !== "") {
                element.textContent = value;
            }
        });
    }

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    // Translate common buttons and labels
    const common = {
        en: ["From", "To", "Clear", "⇅ Swap", "Converted Result"],
        bn: ["থেকে", "পর্যন্ত", "মুছুন", "⇅ অদলবদল", "রূপান্তরিত ফলাফল"],
        hi: ["से", "तक", "मिटाएँ", "⇅ बदलें", "परिवर्तित परिणाम"],
        ar: ["من", "إلى", "مسح", "⇅ تبديل", "النتيجة المحوّلة"]
    }[lang];

    document.querySelectorAll(".converter-card label").forEach(label => {
        const field = label.getAttribute("for");

        if (field && field.endsWith("From")) label.textContent = common[0];
        if (field && field.endsWith("To")) label.textContent = common[1];
    });

    document.querySelectorAll(".converter-card button[id$='Swap']").forEach(button => {
        button.textContent = common[3];
    });

    document.querySelectorAll(".converter-card button[id$='Clear']").forEach(button => {
        button.textContent = common[2];
    });

    document.querySelectorAll(".converter-result p").forEach(p => {
        p.textContent = common[4];
    });

    // History dynamic text
    const empty = document.getElementById("emptyHistory");
    if (empty) {
        empty.textContent = {
            en: "No history yet",
            bn: "এখনো কোনো হিসাব নেই",
            hi: "अभी कोई इतिहास नहीं",
            ar: "لا يوجد سجل حتى الآن"
        }[lang];
    }

    document.querySelectorAll(".history-delete").forEach(button => {
        button.textContent = {
            en: "Delete",
            bn: "মুছুন",
            hi: "हटाएँ",
            ar: "حذف"
        }[lang];
    });

    // Keep selected language
    localStorage.setItem("calculatorLanguage", lang);
}

// Load saved language
const savedLanguage =
    localStorage.getItem("calculatorLanguage") || "en";

languageSelect.value = savedLanguage;
applyLanguage(savedLanguage);

// Change language
languageSelect.addEventListener("change", function () {
    applyLanguage(this.value);
applyLanguage(languageSelect.value);


});


const calculatorTranslations = {
    en: {
        scientific: "SCIENTIFIC MODE",
        hideScientific: "HIDE SCIENTIFIC",
        calculation: "CALCULATION",
        history: "HIS",
        angle: "DEG",
        footer: "LEARN • CALCULATE • ACHIEVE"
    },
    bn: {
        scientific: "সায়েন্টিফিক মোড",
        hideScientific: "সায়েন্টিফিক বন্ধ",
        calculation: "হিসাব",
        history: "ইতিহাস",
        angle: "ডিগ্রি",
        footer: "শিখুন • হিসাব করুন • সফল হোন"
    },
    hi: {
        scientific: "साइंटिफिक मोड",
        hideScientific: "साइंटिफिक बंद करें",
        calculation: "गणना",
        history: "इतिहास",
        angle: "डिग्री",
        footer: "सीखें • गणना करें • सफल बनें"
    },
    ar: {
        scientific: "الوضع العلمي",
        hideScientific: "إغلاق الوضع العلمي",
        calculation: "الحساب",
        history: "السجل",
        angle: "درجة",
        footer: "تعلّم • احسب • حقّق النجاح"
    }
};

function translateCalculatorMain(lang) {
    const t = calculatorTranslations[lang];
    if (!t) return;

    const scientificToggle =
        document.getElementById("scientificToggle");

    scientificToggle.textContent =
        scientificPanel.hidden ? t.scientific : t.hideScientific;

    document.querySelector(".display-label").textContent =
        t.calculation;

    document.querySelector(
        ".calculator-buttons button[data-action='history']"
    ).textContent = t.history;

    document.querySelector("footer p").textContent = t.footer;
}

// Update the existing language function
const originalApplyLanguage = applyLanguage;

applyLanguage = function(lang) {
    originalApplyLanguage(lang);
    translateCalculatorMain(lang);
};

// Update scientific button text when clicked
scientificToggle.addEventListener("click", function() {
    translateCalculatorMain(languageSelect.value);
});


// Language change update
const oldApplyLanguageForDigits = applyLanguage;

applyLanguage = function(lang) {

    oldApplyLanguageForDigits(lang);

    updateCalculatorDigits();

};

// Initial update
updateCalculatorDigits();


// ==================================
// CALCULATOR NUMBER LANGUAGE SYSTEM
// ==================================

const numberDigits = {
    en: "0123456789",
    bn: "০১২৩৪৫৬৭৮৯",
    hi: "०१२३४५६७८९",
    ar: "٠١٢٣٤٥٦٧٨٩"
};

// Convert English digits into selected language
function convertNumberLanguage(value, lang) {

    const digits = numberDigits[lang] || numberDigits.en;

    return String(value).replace(/[0-9]/g, digit => {
        return digits[Number(digit)];
    });
}

// Update calculator buttons and display
function updateCalculatorNumberLanguage() {

    const lang = document.getElementById("languageSelect").value;

    // Translate calculator keypad digits
    buttons.forEach(button => {

        const value = button.dataset.value;

        if (value && /^[0-9]$/.test(value)) {
            button.textContent = convertNumberLanguage(value, lang);
        }

    });

    // Translate calculator display
    updateDisplay();
}

// Listen for language changes
document.getElementById("languageSelect").addEventListener(
    "change",
    updateCalculatorNumberLanguage
);

// Initial language setup
updateCalculatorNumberLanguage();
console.log("Language:", document.getElementById("languageSelect").value);
console.log("Buttons:", buttons.length);
console.log("Converter:", typeof convertNumberLanguage);