// Cargar archivos de audio para la pregunta, felicitaciones, inténtalo de nuevo y comprobar
const audioPregunta = new Audio('https://raw.githubusercontent.com/AxelCotonGutierrez/Puzzle-Figuras-Basicas/master/audio/Pregunta.mp3');
const felicidadesAudio = new Audio('https://raw.githubusercontent.com/AxelCotonGutierrez/Puzzle-Figuras-Basicas/master/audio/Felicidades.mp3');
const intentarAudio = new Audio('https://raw.githubusercontent.com/AxelCotonGutierrez/Puzzle-Figuras-Basicas/master/audio/Intentar.mp3');
const comprobarAudio = new Audio('https://raw.githubusercontent.com/AxelCotonGutierrez/Puzzle-Figuras-Basicas/master/audio/Comprobar.mp3'); // Cargar Comprobar.mp3

document.addEventListener('DOMContentLoaded', (event) => {
    initPuzzle();
    document.getElementById('check-button').addEventListener('click', checkPuzzle);
    document.getElementById('next-question').addEventListener('click', resetGame);
});

// Función para reproducir el sonido de la pregunta
function playAudioPregunta() {
    playAudio(audioPregunta);
}

// Función para reproducir el sonido del megáfono debajo del botón "Comprobar"
function playAudioComprobar() {
    playAudio(comprobarAudio); // Reproducir Comprobar.mp3
}

// Función para reproducir audio si el sonido está activado y manejar errores
function playAudio(audioElement) {
    if (document.getElementById('sound-control').checked) { // Verificar si el sonido está activado
        audioElement.play().then(() => {
            console.log('Audio reproducido correctamente');
        }).catch(error => {
            console.error('Error al reproducir el audio:', error);
        });
    }
}

// Lógica del puzzle
let remainingPieces = []; // Almacenar las piezas restantes
let draggedElement = null; // Variable global para almacenar el elemento arrastrado

function initPuzzle() {
    const puzzlePieces = document.getElementById('puzzle-pieces');
    const puzzleBoard = document.getElementById('puzzle-board');
    const imageSrc = 'figuras.jpg';
    const numRows = 3;
    const numCols = 3;

    let pieces = [];

    // Crear piezas del puzzle y almacenarlas en un array
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            let piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.id = 'piece-' + row + '-' + col;
            piece.style.backgroundImage = `url(${imageSrc})`;
            pieces.push(piece);
        }
    }

    // Añadir temporalmente una pieza al DOM para calcular su tamaño
    let tempPiece = pieces[0].cloneNode();
    puzzlePieces.appendChild(tempPiece);
    let rect = tempPiece.getBoundingClientRect();
    puzzlePieces.removeChild(tempPiece);

    const pieceWidth = rect.width;
    const pieceHeight = rect.height;

    // Configurar piezas del puzzle
    pieces.forEach(piece => {
        const col = parseInt(piece.id.split('-')[2], 10);
        const row = parseInt(piece.id.split('-')[1], 10);
        piece.style.backgroundPosition = `-${col * pieceWidth}px -${row * pieceHeight}px`;
        piece.style.width = `${pieceWidth}px`;
        piece.style.height = `${pieceHeight}px`;
        piece.draggable = true;
        piece.addEventListener('dragstart', dragStart);
    });

    // Desordenar y mostrar las primeras piezas
    shuffleArray(pieces);
    for (let i = 0; i < pieces.length; i++) {
        if (i < 3) {
            puzzlePieces.appendChild(pieces[i]);
        } else {
            remainingPieces.push(pieces[i]);
        }
    }

    // Crear slots para el puzzle
    for (let i = 0; i < numRows * numCols; i++) {
        let slot = document.createElement('div');
        slot.classList.add('puzzle-slot');
        slot.id = 'slot-' + Math.floor(i / numCols) + '-' + (i % numCols);
        slot.style.width = `${pieceWidth}px`;
        slot.style.height = `${pieceHeight}px`;
        slot.addEventListener('dragover', dragOver);
        slot.addEventListener('drop', drop);
        puzzleBoard.appendChild(slot);
    }

    // Añadir eventos táctiles a las piezas
    addTouchEventsToPieces();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function dragStart(event) {
    draggedElement = event.target; // Almacenar la referencia al elemento arrastrado
    event.dataTransfer.setData('text/plain', event.target.id); // Usar el ID como dato de transferencia
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const slot = event.target.closest('.puzzle-slot');
    const draggableId = event.dataTransfer.getData('text/plain');
    const draggableElement = document.getElementById(draggableId);

    if (slot && !slot.firstChild) {
        slot.appendChild(draggableElement);
        if (remainingPieces.length > 0) {
            addNextPiece();
        }
    }
}

function addNextPiece() {
    const nextPiece = remainingPieces.shift();
    document.getElementById('puzzle-pieces').appendChild(nextPiece);
    addTouchEventsToPiece(nextPiece); // Añadir eventos táctiles a la nueva pieza
}

function checkPuzzle() {
    let correctCount = 0;
    const numRows = 3;
    const numCols = 3;

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            let slot = document.getElementById('slot-' + row + '-' + col);
            let piece = slot.firstChild;

            if (piece && piece.id === 'piece-' + row + '-' + col) {
                correctCount++;
            }
        }
    }

    const resultDisplay = document.getElementById('result');
    const checkButton = document.getElementById('check-button'); // Botón de comprobar

    if (correctCount === numRows * numCols) {
        resultDisplay.textContent = '¡Correcto! Todas las piezas están en el lugar adecuado.';
        resultDisplay.style.color = 'green';
        playAudio(felicidadesAudio); // Reproducir audio de felicitaciones
        checkButton.disabled = true; // Deshabilitar el botón de comprobar
    } else {
        resultDisplay.textContent = `Algunas piezas están en el lugar incorrecto. Intenta de nuevo. (${correctCount} de ${numRows * numCols} correctas)`;
        resultDisplay.style.color = 'red';
        playAudio(intentarAudio); // Reproducir audio de inténtalo de nuevo
    }
}
function checkPuzzle() {
    let correctCount = 0;
    const numRows = 3;
    const numCols = 3;

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            let slot = document.getElementById('slot-' + row + '-' + col);
            let piece = slot.firstChild;

            if (piece && piece.id === 'piece-' + row + '-' + col) {
                correctCount++;
            }
        }
    }

    const resultDisplay = document.getElementById('result');
    const checkButton = document.getElementById('check-button'); // Botón de comprobar

    if (correctCount === numRows * numCols) {
        resultDisplay.textContent = '¡Correcto! Todas las piezas están en el lugar adecuado.';
        resultDisplay.style.color = 'green';
        playAudio(felicidadesAudio); // Reproducir audio de felicitaciones
        checkButton.disabled = true; // Deshabilitar el botón de comprobar
        
        // Incrementar el contador en Firebase cuando el puzzle esté completo
        incrementarContadorFirebase("Infantil/Matemáticas/Geometría/FormasBásicas", "puzzlegeo1");
        
    } else {
        resultDisplay.textContent = `Algunas piezas están en el lugar incorrecto. Intenta de nuevo. (${correctCount} de ${numRows * numCols} correctas)`;
        resultDisplay.style.color = 'red';
        playAudio(intentarAudio); // Reproducir audio de inténtalo de nuevo
    }
}

function resetGame() {
    const puzzleBoard = document.getElementById('puzzle-board');
    const puzzlePieces = document.getElementById('puzzle-pieces');
    const resultDisplay = document.getElementById('result');
    const checkButton = document.getElementById('check-button'); // Botón de comprobar

    puzzleBoard.innerHTML = '';
    puzzlePieces.innerHTML = '';
    resultDisplay.textContent = '';
    checkButton.disabled = false; // Habilitar el botón de comprobar nuevamente
    initPuzzle();
}

// Funciones táctiles para arrastrar las piezas en dispositivos móviles
function touchStart(e) {
    draggedElement = e.target;
    const touchLocation = e.targetTouches[0];
    offsetX = touchLocation.pageX - draggedElement.offsetLeft;
    offsetY = touchLocation.pageY - draggedElement.offsetTop;
    e.preventDefault();
}

function touchMove(e) {
    if (draggedElement) {
        const touchLocation = e.targetTouches[0];
        draggedElement.style.position = 'absolute';
        draggedElement.style.left = `${touchLocation.pageX - offsetX}px`;
        draggedElement.style.top = `${touchLocation.pageY - offsetY}px`;
        e.preventDefault();
    }
}

function touchEnd(e) {
    if (draggedElement) {
        const slots = document.querySelectorAll('.puzzle-slot');
        let targetSlot = null;
        slots.forEach(slot => {
            if (isElementOverlapping(draggedElement, slot)) {
                targetSlot = slot;
            }
        });

        if (targetSlot && !targetSlot.firstChild) {
            targetSlot.appendChild(draggedElement);
            draggedElement.style.position = 'static';

            if (remainingPieces.length > 0) {
                addNextPiece();
            }
        } else {
            draggedElement.style.position = 'static';
        }
        draggedElement = null;
    }
}

function isElementOverlapping(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    const centerX = rect1.left + rect1.width / 2;
    const centerY = rect1.top + rect1.height / 2;

    return centerX > rect2.left && centerX < rect2.right && centerY > rect2.top && centerY < rect2.bottom;
}

function addTouchEventsToPieces() {
    const pieces = document.querySelectorAll('.puzzle-piece');
    pieces.forEach(addTouchEventsToPiece);
}

function addTouchEventsToPiece(piece) {
    piece.addEventListener('touchstart', touchStart, { passive: false });
    piece.addEventListener('touchmove', touchMove, { passive: false });
    piece.addEventListener('touchend', touchEnd);
}

mostrarContador("Infantil/Matemáticas/Geometría/FormasBásicas", "puzzlegeo1");
