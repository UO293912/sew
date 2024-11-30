
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.carWidthRatio = 0.1; // 10% del ancho del canvas
        this.carHeightRatio = 0.1; // 20% del alto del canvas
        this.enemyWidthRatio = 0.07; // 7% del ancho del canvas
        this.enemyHeightRatio = 0.1; // 10% del alto del canvas

        this.updateSizes(); // Inicializa tamaños adaptativos

        this.carX = this.canvas.width / 2 - this.carWidth / 2;
        this.carY = this.canvas.height - this.carHeight;
        this.rightPressed = false;
        this.leftPressed = false;
        this.enemies = [];
        this.gameOver = false;
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;

        this.initialEnemySpeed = 0.7; // Reducir la velocidad inicial de los enemigos
        this.initialCarSpeed = 2;  // Reducir la velocidad inicial del coche
        this.enemySpeed = this.initialEnemySpeed;
        this.carSpeed = this.initialCarSpeed;
        this.free = true;

        this.lineWidth = 12;
        this.lineLength = 40;
        this.gap = 50;
        this.proximityRangeRatio = 0.25; // 25% del ancho del canvas como proximidad
        this.proximityRange = this.canvas.width * this.proximityRangeRatio;
        this.roadLines = [];
        this.lastEnemyY = 0;
        this.scoreThreshold = 6;
        this.currentPow = 0;
        this.maxEnemies = 1;


        this.crashSound = new Audio('multimedia/audios/large-crash-with-cataiff-14490 (mp3cut.net).wav');
        this.engineSound = new Audio('multimedia/audios/motor-75615 (mp3cut.net).wav');

        this.initializeEventListeners();
        this.initializeRoadLines();


        // Listener para redimensionar
        window.addEventListener("resize", () => {
            this.updateSizes();
            this.proximityRange = this.canvas.width * this.proximityRangeRatio; // Actualizar la proximidad al cambiar el tamaño
            this.drawInitialState();
        });
    }

    updateSizes() {
        this.carWidth = this.canvas.width * this.carWidthRatio;
        this.carHeight = this.canvas.height * this.carHeightRatio;
        this.enemyWidth = this.canvas.width * this.enemyWidthRatio;
        this.enemyHeight = this.canvas.height * this.enemyHeightRatio;

        // Ajustar posición del coche si se sale del canvas
        this.carX = Math.max(0, Math.min(this.carX, this.canvas.width - this.carWidth));
        this.carY = this.canvas.height - this.carHeight;
    }
    

    calculateSpeed(baseSpeed, score) {
        // Ajusta los multiplicadores y constantes según tu preferencia
        const growthFactor = 0.1; // Factor de crecimiento para controlar el aumento
        const smoothness = 1; // Ajusta este valor para un crecimiento más lento o rápido
        return baseSpeed + growthFactor * Math.pow(score, smoothness);
    }



    initializeEventListeners() {
        // Esperar a que el DOM esté completamente cargado
        window.addEventListener("keydown", this.keyDownHandler.bind(this));
        window.addEventListener("keyup", this.keyUpHandler.bind(this));
        document.addEventListener("DOMContentLoaded", () => {
            // Botón Iniciar
            const startButton = document.querySelector("main > section > button:nth-of-type(1)");
            if (startButton) {
                startButton.addEventListener("click", this.startGame.bind(this));
            }

            // Botón Instrucciones
            const instructionsButton = document.querySelector("main > section > button:nth-of-type(2)");
            const dialog = document.querySelector("dialog");
            const closeDialogButton = dialog?.querySelector("button");
            if (instructionsButton && dialog && closeDialogButton) {
                instructionsButton.addEventListener("click", () => {
                    fetch('xml/api.xml')
                        .then(response => response.text())
                        .then(data => {
                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(data, 'application/xml');
                            const instructions = xmlDoc.getElementsByTagName('parrafo');
                            var p = document.createElement('p');
                            let instructionsText = '';
                            for (let i = 0; i < instructions.length; i++) {
                                instructionsText += `<p>${instructions[i].textContent}</p>`;
                            }
                            p.innerHTML = instructionsText;
                            if (dialog.childNodes.length > 2) {
                                dialog.removeChild(dialog.childNodes[2]);
                            }
                            dialog.insertBefore(p, closeDialogButton);
                        })
                        .catch(error => console.log(error));
                    dialog.showModal();
                });
                closeDialogButton.addEventListener("click", () => dialog.close());
            }

            // Asegúrate de que los botones estén presentes
            const leftButton = document.querySelector("main > section > div > button:nth-of-type(1)");
            const rightButton = document.querySelector("main > section > div > button:nth-of-type(2)");

            if (leftButton && rightButton) {
                // Para el botón de la izquierda
                leftButton.addEventListener("mousedown", () => {
                    this.leftPressed = true;
                    console.log("Izquierda presionado");
                });
                leftButton.addEventListener("mouseup", () => {
                    this.leftPressed = false;
                    console.log("Izquierda liberado");
                });
                leftButton.addEventListener("mouseleave", () => {
                    this.leftPressed = false; // Detener movimiento si el cursor sale del botón
                });

                // Para el botón de la derecha
                rightButton.addEventListener("mousedown", () => {
                    this.rightPressed = true;
                    console.log("Derecha presionado");
                });
                rightButton.addEventListener("mouseup", () => {
                    this.rightPressed = false;
                    console.log("Derecha liberado");
                });
                rightButton.addEventListener("mouseleave", () => {
                    this.rightPressed = false; // Detener movimiento si el cursor sale del botón
                });

                leftButton.addEventListener("touchstart", () => {
                    this.leftPressed = true;
                });
                leftButton.addEventListener("touchend", () => {
                    this.leftPressed = false;
                });
                leftButton.addEventListener("touchcancel", () => {
                    this.leftPressed = false;
                });
                rightButton.addEventListener("touchstart", () => {
                    this.rightPressed = true;
                });
                rightButton.addEventListener("touchend", () => {
                    this.rightPressed = false;
                });
                rightButton.addEventListener("touchcancel", () => {
                    this.rightPressed = false;
                });
            }
        });
    }



    keyDownHandler(e) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            this.rightPressed = true;
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            this.leftPressed = true;
        }
    }

    keyUpHandler(e) {
        if (e.key === "Right" || e.key === "ArrowRight") {
            this.rightPressed = false;
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
            this.leftPressed = false;
        }
    }

    createEnemy() {
        let x;
        do {
            // Generar enemigo cerca de la posición X del coche, con el rango ajustado al tamaño del canvas
            x = this.carX + (Math.random() * 2 - 1) * this.proximityRange;
        } while (x < 0 || x > this.canvas.width - this.enemyWidth);

        // La posición en Y sigue siendo la misma (cerca de la parte superior)
        const y = -this.enemyHeight;

        this.enemies.push({ x: x, y: y });
        this.lastEnemyY = y;
    }

    updateEnemies() {
        if (this.enemies.length === 0) {
            this.createEnemy();
        }

        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].y += this.enemySpeed;

            if (this.enemies[i].y > this.canvas.height) {
                this.enemies.splice(i, 1);
                this.score++;

                // Incrementos suaves de velocidad
                this.enemySpeed = this.initialEnemySpeed + (this.score / this.scoreThreshold) * 0.2;

                console.log("Nueva velocidad de los enemigos:", this.enemySpeed);
                this.createEnemy();
            }
        }
    }


    collisionDetection() {
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.carX < this.enemies[i].x + this.enemyWidth && this.carX + this.carWidth > this.enemies[i].x &&
                this.carY < this.enemies[i].y + this.enemyHeight && this.carY + this.carHeight > this.enemies[i].y) {
                this.crashSound.play();
                this.gameOver = true;
                this.showRestartButton();
                localStorage.setItem('highScore', Math.max(this.score, this.highScore));

                if (this.score > this.highScore) {
                    setTimeout(() => {
                        alert("¡Game Over! Puntuación: " + this.score + "\nNuevo record: " + this.highScore + "\n¡Felicidades, has superado tu record!");
                    }, 600);
                    this.highScore = localStorage.getItem('highScore');
                } else {
                    setTimeout(() => {
                        alert("¡Game Over! Puntuación: " + this.score);
                    }, 600);
                }
            }
        }
    }

    drawCar() {
        this.ctx.fillStyle = "red";
        this.ctx.fillRect(this.carX, this.carY, this.carWidth, this.carHeight);
    }

    drawEnemies() {
        this.ctx.fillStyle = "blue";
        for (let i = 0; i < this.enemies.length; i++) {
            this.ctx.fillRect(this.enemies[i].x, this.enemies[i].y, this.enemyWidth, this.enemyHeight);
        }
    }

    moveCar() {
        // Incrementa la velocidad del coche dependiendo del puntaje, suavemente
        this.carSpeed = this.initialCarSpeed + (this.score / this.scoreThreshold) * 0.1;

        // Mover a la derecha
        if (this.rightPressed && this.carX < this.canvas.width - this.carWidth) {
            this.carX += this.carSpeed;
        }

        // Mover a la izquierda
        if (this.leftPressed && this.carX > 0) {
            this.carX -= this.carSpeed;
        }
    }




    drawScore() {
        // Tamaño de la fuente basado en el ancho del canvas, ajustable
        const fontSize = Math.floor(this.canvas.width * 0.02); // 5% del ancho del canvas
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.textBaseline = "top";  // Asegura que el texto se dibuje desde la parte superior
    
        // Espaciado entre líneas basado en el tamaño de la fuente
        const lineHeight = fontSize * 1.2;
    
        // Establecer el color de la fuente (puedes cambiarlo según lo necesites)
        this.ctx.fillStyle = "#FFFFFF";
    
        // Posición inicial para el texto (ajustado con márgenes)
        const x = 10;
        let y = 10; // Comienza en la parte superior
    
        // Dibuja la puntuación
        this.ctx.fillText(`Puntuación: ${this.score}`, x, y);
        y += lineHeight; // Salto de línea
    
        // Dibuja la puntuación más alta
        this.ctx.fillText(`Puntuación más alta: ${this.highScore}`, x, y);
    }
    
    



    initializeRoadLines() {
        const totalLines = Math.ceil(this.canvas.height / (this.lineLength + this.gap)) + 1;
        for (let i = 0; i < totalLines; i++) {
            this.roadLines.push(-i * (this.lineLength + this.gap));
        }
    }

    drawRoadLines() {
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.setLineDash([this.lineLength, this.lineLength + this.gap]);

        for (let i = 0; i < this.roadLines.length; i++) {
            const y = this.roadLines[i];
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width / 2, y);
            this.ctx.lineTo(this.canvas.width / 2, y + this.lineLength);
            this.ctx.stroke();
        }

        this.ctx.setLineDash([]);
    }

    updateRoadLines() {
        for (let i = 0; i < this.roadLines.length; i++) {
            this.roadLines[i] += this.enemySpeed;

            if (this.roadLines[i] > this.canvas.height) {
                this.roadLines[i] = -this.lineLength;
            }
        }
    }

    drawInitialState() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawRoadLines();
        this.drawCar();
        this.drawScore();
    }

    draw() {
        if (this.gameOver) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawRoadLines();
        this.drawCar();
        this.drawEnemies();
        this.moveCar();
        this.updateEnemies();
        this.collisionDetection();
        this.drawScore();

        this.updateRoadLines();
        requestAnimationFrame(this.draw.bind(this));
    }

    showRestartButton() {
        const startButton = document.querySelector("main > section > button:nth-of-type(1)");
        startButton.textContent = "Reiniciar";

    }

    startGame() {
        this.gameOver = false;
        this.score = 0;
        this.enemySpeed = this.initialEnemySpeed;
        this.carSpeed = this.initialCarSpeed;
        this.carX = this.canvas.width / 2 - this.carWidth / 2;
        this.enemies = [];
        this.roadLines = [];
        this.initializeRoadLines();
        this.drawInitialState();
        this.engineSound.play();

        // Esperar que el sonido termine antes de empezar el ciclo de juego
        this.engineSound.onended = () => {
            // Iniciar el ciclo del juego después de que termine el sonido
            this.draw();
        };

    }
}



