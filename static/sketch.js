// Configuraciones iniciales para el canvas
const WIDTH = 500;
const HEIGHT = 500;
const STROKE_WEIGHT = 3;
const CROP_PADDING = 2;
const REPOS_PADDING = 2;

// Variables para manejar el modelo, la visualización de las predicciones y la interacción del usuario
let model;
let clicked = false;
let mousePosition = [];
let strokePixels = [[], []];  // Coordenadas del trazo actual
let imageStrokes = [];        // Coordenadas de todos los trazos en el canvas
let LABELS = [];              // Etiquetas de las clases para la predicción
let selectedWord = '';
let countdownTimer;
let countdown = 15;

// Carga las etiquetas de las clases desde un archivo JSON
fetch('class_names.json')
    .then(response => response.json())
    .then(data => {
        LABELS = data;
    })
    .catch(error => console.error('Error al cargar los nombres de las clases:', error));

// Función auxiliar para verificar si un número está dentro de un rango
function inRange(n, from, to) {
    return n >= from && n < to;
}

// Configuración inicial del canvas
function setup() {
    let canvas = createCanvas(WIDTH, HEIGHT);
    canvas.parent('canvasContainer');
    strokeWeight(STROKE_WEIGHT);
    stroke("black");
    background("#FFFFFF");
}

// Carga el modelo de TensorFlow Lite
const loadModel = async () => {
    console.log("Model loading...");
    model = await tflite.loadTFLiteModel("./models/model.tflite");
    model.predict(tf.zeros([1, 28, 28, 1]));  // Calentamiento del modelo
    console.log(`Model loaded! (${LABELS.length} classes)`);
};

// Maneja el evento de presionar el mouse
function mouseDown() {
    clicked = true;
    mousePosition = [mouseX, mouseY];
}

// Maneja el movimiento del mouse, dibuja las líneas
function mouseMoved() {
    if (clicked && inRange(mouseX, 0, WIDTH) && inRange(mouseY, 0, HEIGHT)) {
        strokePixels[0].push(Math.floor(mouseX));
        strokePixels[1].push(Math.floor(mouseY));
        line(mouseX, mouseY, mousePosition[0], mousePosition[1]);
        mousePosition = [mouseX, mouseY];
    }
}

// Finaliza el trazo cuando se suelta el mouse
function mouseReleased() {
    if (strokePixels[0].length) {
        imageStrokes.push(strokePixels);
        strokePixels = [[], []];
    }
    clicked = false;
}

function startGame() {
    selectedWord = LABELS[Math.floor(Math.random() * LABELS.length)];
    countdown = 15;
    updateCountdownDisplay();
    document.getElementById('word').textContent = selectedWord;
    countdownTimer = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    countdown -= 1;
    updateCountdownDisplay();

    if (countdown <= 0) {
        clearInterval(countdownTimer);
        const canvasElement = document.getElementById('defaultCanvas0'); // Asegúrate de que este es el ID correcto
        if (isCanvasBlank(canvasElement)) {
            window.location.href = 'index.html'; // Redirección
        } else {
            predict(); // Continuar con la predicción
        }
    }
}


function isCanvasBlank(canvas) {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2] + imageData.data[i + 3] < 1020) {
            return false; // No está en blanco
        }
    }
    return true; // Está en blanco
}

function updateCountdownDisplay() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `Tiempo restante: ${countdown} segundos`;
}

// Preprocesa la imagen para el modelo (redimensiona y recorta)
const preprocess = async (cb) => {
    const { min, max } = getBoundingBox();
    const imageBlob = await fetch("/transform", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            strokes: imageStrokes,
            box: [min.x, min.y, max.x, max.y],
        }),
    }).then((response) => response.blob());
    const img = new Image(28, 28);
    img.src = URL.createObjectURL(imageBlob);
    img.onload = () => {
        const tensor = tf.tidy(() =>
            tf.browser.fromPixels(img, 1).toFloat().expandDims(0)
        );
        cb(tensor);
    };
};

// Calcula las coordenadas mínimas de los trazos
const getMinimumCoordinates = () => {
    let min_x = Number.MAX_SAFE_INTEGER;
    let min_y = Number.MAX_SAFE_INTEGER;

    for (const stroke of imageStrokes) {
        for (let i = 0; i < stroke[0].length; i++) {
            min_x = Math.min(min_x, stroke[0][i]);
            min_y = Math.min(min_y, stroke[1][i]);
        }
    }

    return [Math.max(0, min_x), Math.max(0, min_y)];
};

// Obtiene el cuadro delimitador para recortar la imagen
const getBoundingBox = () => {
    repositionImage();

    const coords_x = [];
    const coords_y = [];

    for (const stroke of imageStrokes) {
        for (let i = 0; i < stroke[0].length; i++) {
            coords_x.push(stroke[0][i]);
            coords_y.push(stroke[1][i]);
        }
    }

    const x_min = Math.min(...coords_x);
    const x_max = Math.max(...coords_x);
    const y_min = Math.min(...coords_y);
    const y_max = Math.max(...coords_y);

    const width = Math.max(...coords_x) - Math.min(...coords_x);
    const height = Math.max(...coords_y) - Math.min(...coords_y);

    const coords_min = {
        x: Math.max(0, x_min - CROP_PADDING),
        y: Math.max(0, y_min - CROP_PADDING),
    };

    let coords_max;
    if (width > height) {
        coords_max = {
            x: Math.min(WIDTH, x_max + CROP_PADDING),
            y: Math.max(0, y_min + CROP_PADDING) + width,
        };
    } else {
        coords_max = {
            x: Math.max(0, x_min + CROP_PADDING) + height,
            y: Math.min(HEIGHT, y_max + CROP_PADDING),
        };
    }

    return {
        min: coords_min,
        max: coords_max,
    };
};

// Reposiciona la imagen en la esquina superior izquierda
const repositionImage = () => {
    const [min_x, min_y] = getMinimumCoordinates();
    for (const stroke of imageStrokes) {
        for (let i = 0; i < stroke[0].length; i++) {
            stroke[0][i] -= min_x - REPOS_PADDING;
            stroke[1][i] -= min_y - REPOS_PADDING;
        }
    }
};

// Realiza la predicción utilizando el modelo
const predict = async (isManual = false) => {
    // Si la predicción es manual, detener el temporizador
    if (isManual && countdownTimer) {
        clearInterval(countdownTimer);
    }

    if (!imageStrokes.length) return;
    if (!LABELS.length) throw new Error("No labels found!");

    preprocess((tensor) => {
        const predictions = model.predict(tensor).dataSync();

        const topPrediction = Array.from(predictions)
            .map((p, i) => ({
                probability: p,
                className: LABELS[i],
                index: i,
            }))
            .sort((a, b) => b.probability - a.probability)[0];

        // Comprobar si la palabra seleccionada coincide con la predicción con mayor probabilidad
        if (topPrediction.className === selectedWord) {
            showResult("¡Ganaste!");
        } else {
            showResult("Perdiste. Intenta de nuevo.");
        }

        // Esperar 2-3 segundos antes de limpiar el mensaje y reiniciar el juego
        setTimeout(() => {
            hideResult();
            clearCanvas();
            startGame();
        }, 3000);
    });
};

const hideResult = () => {
    const resultElement = document.getElementById("result");
    resultElement.style.display = 'none';
};


const showResult = (message) => {
    const resultElement = document.getElementById("result");
    resultElement.innerHTML = message;
    resultElement.style.display = 'block';
};

const clearCanvas = () => {
    clear();
    background("#FFFFFF");
    imageStrokes = [];
    strokePixels = [[], []];
};

window.onload = () => {
    const $submit = document.getElementById("predict");
    const $canvas = document.getElementById("defaultCanvas0");

    const resultContainer = document.createElement("h1");
    resultContainer.id = "result";
    document.body.appendChild(resultContainer);

    loadModel();
    $canvas.addEventListener("mousedown", mouseDown);
    $canvas.addEventListener("mousemove", mouseMoved);
    $canvas.addEventListener("mouseup", mouseReleased);

    $submit.addEventListener("click", () => predict(true));
    startGame();
    setup();
};
