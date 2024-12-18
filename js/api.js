
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;


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

        // Ajustar velocidad proporcional al tamaño vertical del canvas
        this.baseHeight = 700; // Altura base para referencia
        this.speedFactor = this.canvas.height / this.baseHeight;
        this.initialEnemySpeed = 1.5 * this.speedFactor;
        this.initialCarSpeed = 3 * this.speedFactor;

        this.lineWidth = 12;
        this.lineLength = 40;
        this.gap = 50;
        this.proximityRangeRatio = 0.25; // 25% del ancho del canvas como proximidad
        this.proximityRange = this.canvas.width * this.proximityRangeRatio;
        this.roadLines = [];
        this.lastEnemyY = 0;
        this.scoreThreshold = 6;
        this.maxEnemies = 2;


        this.crashSound = new Audio('multimedia/audios/large-crash-with-cataiff-14490 (mp3cut.net).wav');
        this.engineSound = new Audio('multimedia/audios/motor-75615 (mp3cut.net).wav');

        this.initializeEventListeners();
        this.initializeRoadLines();


        // Listener para redimensionar
        window.addEventListener("resize", () => {
            this.updateCanvasSize();
        });
    }

    updateCanvasSize() {
        const prevWidth = this.canvas.width;
        const prevHeight = this.canvas.height;
    

        this.canvas.width = this.canvas.offsetWidth ;
        this.canvas.height = this.canvas.offsetHeight ;
    
        this.updateSizes();
        this.proximityRange = this.canvas.width * this.proximityRangeRatio;
    
        // Ajustar posiciones de elementos proporcionalmente
        const widthRatio = this.canvas.width / prevWidth;
        const heightRatio = this.canvas.height / prevHeight;
    
        this.carX *= widthRatio;
        this.carY *= heightRatio;
    
        this.enemies = this.enemies.map(enemy => ({
            x: enemy.x * widthRatio,
            y: enemy.y * heightRatio
        }));
    
        this.initializeRoadLines();
        this.drawInitialState();
    }
    
    

    updateSizes() {
        this.carWidth = this.canvas.width * this.carWidthRatio;
        this.carHeight = this.canvas.height * this.carHeightRatio;
        this.enemyWidth = this.canvas.width * this.enemyWidthRatio;
        this.enemyHeight = this.canvas.height * this.enemyHeightRatio;
    
        // Ajustar velocidad proporcional al tamaño vertical del canvas
        this.speedFactor = this.canvas.height / this.baseHeight;
        this.initialEnemySpeed = 1.5 * this.speedFactor;
        this.initialCarSpeed = 3 * this.speedFactor;
    
        this.enemySpeed = this.calculateSpeed(this.initialEnemySpeed, this.score);
        this.carSpeed = this.initialCarSpeed;

        this.proximityRange = this.canvas.width * this.proximityRangeRatio;
    }
    
    
    

    calculateSpeed(baseSpeed, score) {
        // Ajusta los multiplicadores y constantes según tu preferencia
        const growthFactor = 0.4*(this.canvas.height/(this.baseHeight*3)); // Factor de crecimiento para controlar el aumento
        const smoothness = 1; // Ajusta este valor para un crecimiento más lento o rápido
        return baseSpeed + growthFactor * Math.pow(score, smoothness);
    }



    initializeEventListeners() {
        // Esperar a que el DOM esté completamente cargado
        window.addEventListener("keydown", this.keyDownHandler.bind(this));
        window.addEventListener("keyup", this.keyUpHandler.bind(this));

        
            // Asegúrate de que los botones estén presentes
            const leftButton = document.querySelector("main > section > canvas + article > button:nth-of-type(1)");
            const rightButton = document.querySelector("main > section > canvas + article > button:nth-of-type(2)");

            if (leftButton && rightButton) {
                // Para el botón de la izquierda
                leftButton.addEventListener("mousedown", () => {
                    this.leftPressed = true;
                });
                leftButton.addEventListener("mouseup", () => {
                    this.leftPressed = false;
                });
                leftButton.addEventListener("mouseleave", () => {
                    this.leftPressed = false; // Detener movimiento si el cursor sale del botón
                });

                // Para el botón de la derecha
                rightButton.addEventListener("mousedown", () => {
                    this.rightPressed = true;
                });
                rightButton.addEventListener("mouseup", () => {
                    this.rightPressed = false;
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
            this.createEnemy(); // Crear el primer enemigo si no existen.
        }
    

        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].y += this.enemySpeed;
    
            // Calcular progreso del enemigo más antiguo
            if (i < this.maxEnemies - 1) {
                this.progress = this.enemies[i].y / this.canvas.height;
                if (this.progress >= 0.5&& this.enemies.length < this.maxEnemies) {
                    this.createEnemy(); // Crear un nuevo enemigo
                }
            }
    
            // Eliminar enemigos que salgan del canvas
            if (this.enemies[i].y > this.canvas.height) {
                this.enemies.splice(i, 1);
                this.score++;

    
                // Incrementos suaves de velocidad
                this.enemySpeed = this.calculateSpeed(this.initialEnemySpeed, this.score);
            }
        }
    }
    
    


    collisionDetection() {
        for (let i = 0; i < this.enemies.length; i++) {
            if (this.carX < this.enemies[i].x + this.enemyWidth && this.carX + this.carWidth > this.enemies[i].x &&
                this.carY < this.enemies[i].y + this.enemyHeight && this.carY + this.carHeight > this.enemies[i].y) {
                this.crashSound.play();
                this.gameOver = true;
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
                setTimeout(() => {
                    this.showRestartButton();
                }, 3000);
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
        this.carSpeed = this.calculateSpeed(this.initialCarSpeed, this.score);

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
        // Tamaño de la fuente basado en el ancho del canvas
        const fontSize = this.canvas.width * 0.04; // 4% del ancho del canvas
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`Puntuación: ${this.score}`, 10, fontSize + 10);
        
        // Mostrar el récord
        this.ctx.textAlign = "right";
        this.ctx.fillText(`Récord: ${this.highScore}`, this.canvas.width - 10, fontSize + 10);
    }
    
    
    



    initializeRoadLines() {
        // Calcular cuántas líneas de la carretera caben en el canvas
        const numLines = Math.ceil(this.canvas.height / (this.lineLength + this.gap));
    
        // Crear las líneas ajustadas al tamaño del canvas
        this.roadLines = [];
        for (let i = 0; i < numLines; i++) {
            const yPosition = i * (this.lineLength + this.gap);
            this.roadLines.push({
                x: this.canvas.width / 2 - this.lineWidth / 2,
                y: yPosition
            });
        }
    }
    
    drawRoadLines() {
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.setLineDash([this.lineLength, this.lineLength + this.gap]);
    
        for (let i = 0; i < this.roadLines.length; i++) {
            const y = this.roadLines[i].y; // Acceder correctamente a la propiedad `y`
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width / 2, y);
            this.ctx.lineTo(this.canvas.width / 2, y + this.lineLength);
            this.ctx.stroke();
        }
    
        this.ctx.setLineDash([]); // Restablecer el estilo de la línea
    }
    
    updateRoadLines() {
        for (let i = 0; i < this.roadLines.length; i++) {
            this.roadLines[i].y += this.enemySpeed; // Actualizar la propiedad `y`
    
            if (this.roadLines[i].y > this.canvas.height) {
                this.roadLines[i].y = -this.lineLength;
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
        startButton.disabled = false;

    }

    startGame() {
        this.gameOver = false;
        this.score = 0;
        this.enemySpeed = this.initialEnemySpeed;
        this.carSpeed = this.initialCarSpeed;
        this.carX = this.canvas.width / 2 - this.carWidth / 2;
        this.enemies = [];
        this.roadLines = [];
        this.progressSpawn = 1;
        this.progress = 1;
        this.maxEnemies = 2;
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




