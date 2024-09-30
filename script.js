const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');

// Konfigurace kol - výseče a pravděpodobnosti
const slices = [
    { label: 'Výhra 1', color: '#FF5733', probability: 0.1 },  // 10% šance
    { label: 'Výhra 2', color: '#33FF57', probability: 0.2 },  // 20% šance
    { label: 'Výhra 3', color: '#3357FF', probability: 0.3 },  // 30% šance
    { label: 'Výhra 4', color: '#F033FF', probability: 0.2 },  // 20% šance
    { label: 'Výhra 5', color: '#FF3380', probability: 0.2 }   // 20% šance
];

const totalSlices = slices.length;
const sliceAngle = 2 * Math.PI / totalSlices;
let currentRotation = 0; // Uloží aktuální rotaci kola
let spinning = false; // Indikátor, zda kolo se točí

// Funkce pro kreslení kola
function drawWheel() {
    slices.forEach((slice, index) => {
        const startAngle = index * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        // Nastavení barvy a kreslení výseče
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, startAngle, endAngle);
        ctx.fillStyle = slice.color;
        ctx.fill();

        // Přidání textu do výseče
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(slice.label, canvas.width / 2 - 10, 10);
        ctx.restore();
    });
}

// Funkce pro výběr výhry na základě pravděpodobnosti
function getRandomSlice() {
    const random = Math.random(); // Náhodné číslo mezi 0 a 1
    let cumulativeProbability = 0;

    for (const slice of slices) {
        cumulativeProbability += slice.probability;
        if (random < cumulativeProbability) {
            return slice;
        }
    }

    return slices[slices.length - 1]; // Záložní možnost
}

// Funkce pro animaci kola
function spinWheel() {
    if (spinning) return; // Zabráníme dalšímu točení, pokud už kolo se točí
    spinning = true; // Nastavení indikátoru na "točící se"

    // Resetování proměnných
    currentRotation = 0; // Reset aktuální rotace

    const randomSlice = getRandomSlice(); // Vybere výseč na základě pravděpodobnosti
    let selectedIndex = slices.indexOf(randomSlice);
    let randomRotation = selectedIndex * sliceAngle + (3 * Math.PI / 2) + Math.random() * sliceAngle; // Úhel šipky na 270 stupňů
    let spinTime = 5000; // Doba otáčení
    let rotationAngle = randomRotation + (Math.PI * 8); // Počet otáček

    // Animace rotace kola
    let start = null;
    function rotate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const easedRotation = easeOut(progress / spinTime) * rotationAngle;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(easedRotation);
        currentRotation = easedRotation; // Uložení aktuální rotace kola
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        drawWheel();
        ctx.restore();

        if (progress < spinTime) {
            window.requestAnimationFrame(rotate);
        } else {
            const selectedSlice = getSelectedSlice(currentRotation); // Získání správné výseče
            alert(`Kolo se zastavilo na: ${selectedSlice.label}`);
            spinning = false; // Nastavení indikátoru zpět na "ne točící se"
        }
    }

    window.requestAnimationFrame(rotate);
}

// Funkce pro zpomalení kola
function easeOut(t) {
    return t * (2 - t);
}

// Funkce pro určení výherní výseče na základě úhlu
function getSelectedSlice(rotationAngle) {
    // Normalizace rotace do rozsahu 0 až 2π
    const normalizedRotation = rotationAngle % (2 * Math.PI);

    // Úhel pod šipkou (směr šipky) - 270 stupňů
    const pointerAngle = (3 * Math.PI) / 2; // Šipka směřuje dolů

    // Výpočet úhlu pod šipkou
    const angleUnderPointer = (normalizedRotation + pointerAngle) % (2 * Math.PI);
    
    // Výpočet indexu výseče, která je pod šipkou
    const selectedIndex = Math.floor(angleUnderPointer / sliceAngle) % totalSlices;

    // Debugging - výstupy do konzole
    console.log(`Normalized Rotation: ${normalizedRotation.toFixed(2)}, Pointer Angle: ${pointerAngle.toFixed(2)}, Angle Under Pointer: ${angleUnderPointer.toFixed(2)}, Selected Index: ${selectedIndex}`);

    return slices[selectedIndex];
}

spinButton.addEventListener('click', spinWheel);

drawWheel();
