// Původní nastavení segmentů a pravděpodobností
const originalSegments = [
    { label: "Výhra 1", color: "#FF5733", probability: 0.1 },  // 10% šance
    { label: "Výhra 2", color: "#33FF57", probability: 0.2 },  // 20% šance
    { label: "Výhra 3", color: "#3357FF", probability: 0.3 },  // 30% šance
    { label: "Nevýhra", color: "#F0E68C", probability: 0.4 },  // 40% šance
];

// Inicializace segmentů a váženého seznamu
let segments = [...originalSegments];  // Kopie původních segmentů
let weightedSegments = createWeightedSegments(segments);

// Funkce pro vytvoření váženého seznamu
function createWeightedSegments(segments) {
    const weighted = [];
    segments.forEach(segment => {
        const count = segment.probability * 100;  // násobíme 100 pro větší přesnost
        for (let i = 0; i < count; i++) {
            weighted.push(segment);
        }
    });
    return weighted;
}

const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const resetButton = document.getElementById('resetButton');
const wheelRadius = canvas.width / 2;
const center = { x: wheelRadius, y: wheelRadius };
let rotationAngle = 0;

// Funkce pro vykreslení kola
function drawWheel() {
    const segmentAngle = (2 * Math.PI) / segments.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Vymažeme plátno před kreslením

    segments.forEach((segment, index) => {
        const startAngle = index * segmentAngle + rotationAngle;
        const endAngle = startAngle + segmentAngle;

        // Kreslení výseče
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.arc(center.x, center.y, wheelRadius, startAngle, endAngle);
        ctx.fillStyle = segment.color;
        ctx.fill();
        ctx.stroke();
        
        // Přidání textu
        ctx.save();
        ctx.translate(center.x, center.y);
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.fillStyle = "#000";
        ctx.textAlign = "right";
        ctx.font = "18px Arial";
        ctx.fillText(segment.label, wheelRadius - 10, 10);
        ctx.restore();
    });
}

// Funkce pro výpočet finálního úhlu, aby střed segmentu zastavil na 90 stupních (π/2 rad)
function calculateFinalRotationAngle(chosenSegmentIndex) {
    const segmentAngle = (2 * Math.PI) / segments.length;
    const targetAngle = Math.PI / 2;  // 90 stupňů v radiánech
    const segmentCenterAngle = chosenSegmentIndex * segmentAngle + segmentAngle / 2;

    // Vypočítáme rotaci potřebnou k tomu, aby střed segmentu byl na 90 stupních
    let requiredRotation = targetAngle - segmentCenterAngle;
    
    // Přidáme několik plných otoček (např. 5x 360 stupňů) k animaci
    requiredRotation += 2 * Math.PI * 5;

    return requiredRotation;
}

// Funkce pro easing (pomalé zastavení) - používáme ease-out efekt
function easeOut(t) {
    return t * (2 - t);  // Jednoduchá funkce pro zpomalování na konci animace
}

// Funkce pro roztočení kola a výběr segmentu
function spinWheel() {
    // Vybereme segment na základě váženého seznamu
    const chosenSegment = weightedSegments[Math.floor(Math.random() * weightedSegments.length)];
    const chosenSegmentIndex = segments.indexOf(chosenSegment);

    const spinDuration = 3000;  // délka rotace v ms
    const finalAngle = calculateFinalRotationAngle(chosenSegmentIndex);

    let startTime = null;

    function animate(time) {
        if (!startTime) startTime = time;
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);  // Zjistíme, jak daleko v animaci jsme (od 0 do 1)
        const easedProgress = easeOut(progress);  // Aplikujeme funkci zpomalování

        if (elapsed < spinDuration) {
            rotationAngle = easedProgress * finalAngle;
            drawWheel();
            requestAnimationFrame(animate);
        } else {
            // Rotace dokončena, zastavíme na finálním úhlu
            rotationAngle = finalAngle;
            drawWheel();
            alert(`Kolo zastavilo na: ${chosenSegment.label}`);
            removeSegment(chosenSegment);
        }
    }

    requestAnimationFrame(animate);
}

// Funkce pro odstranění segmentu ze seznamu a aktualizaci váženého seznamu
function removeSegment(segment) {
    const index = segments.indexOf(segment);
    if (index > -1) {
        segments.splice(index, 1);  // Odstraníme segment
    }
    if (segments.length > 0) {
        weightedSegments = createWeightedSegments(segments);  // Aktualizujeme vážený seznam
        drawWheel();  // Znovu vykreslíme kolo
    } else {
        alert("Všechny segmenty byly vybrány. Kolo již nemá žádné segmenty.");
    }
}

// Funkce pro resetování kola
function resetWheel() {
    segments = [...originalSegments];  // Obnovíme původní segmenty
    weightedSegments = createWeightedSegments(segments);  // Znovu vytvoříme vážený seznam
    rotationAngle = 0;  // Resetujeme rotaci
    drawWheel();  // Znovu vykreslíme kolo
}

drawWheel();
spinButton.addEventListener('click', spinWheel);
resetButton.addEventListener('click', resetWheel);
