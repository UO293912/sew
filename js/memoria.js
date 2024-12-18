// memoria.js
'use strict';

class Memoria {
    constructor() {
        // Atributos del juego
        this.elements = [
            {
                element: "RedBull",
                source: "https://upload.wikimedia.org/wikipedia/de/c/c4/Red_Bull_Racing_logo.svg"
            },
            {
                element: "RedBull",
                source: "https://upload.wikimedia.org/wikipedia/de/c/c4/Red_Bull_Racing_logo.svg"
            },
            {
                element: "McLaren",
                source: "https://upload.wikimedia.org/wikipedia/en/6/66/McLaren_Racing_logo.svg"
            },
            {
                element: "McLaren",
                source: "https://upload.wikimedia.org/wikipedia/en/6/66/McLaren_Racing_logo.svg"
            },
            {
                element: "Alpine",
                source: "https://upload.wikimedia.org/wikipedia/fr/b/b7/Alpine_F1_Team_2021_Logo.svg"
            },
            {
                element: "Alpine",
                source: "https://upload.wikimedia.org/wikipedia/fr/b/b7/Alpine_F1_Team_2021_Logo.svg"
            },
            {
                element: "AstonMartin",
                source: "https://upload.wikimedia.org/wikipedia/fr/7/72/Aston_Martin_Aramco_Cognizant_F1.svg"
            },
            {
                element: "AstonMartin",
                source: "https://upload.wikimedia.org/wikipedia/fr/7/72/Aston_Martin_Aramco_Cognizant_F1.svg"
            },
            {
                element: "Ferrari",
                source: "https://upload.wikimedia.org/wikipedia/de/c/c0/Scuderia_Ferrari_Logo.svg"
            },
            {
                element: "Ferrari",
                source: "https://upload.wikimedia.org/wikipedia/de/c/c0/Scuderia_Ferrari_Logo.svg"
            },
            {
                element: "Mercedes",
                source: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Mercedes_AMG_Petronas_F1_Logo.svg"
            },
            {
                element: "Mercedes",
                source: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Mercedes_AMG_Petronas_F1_Logo.svg"
            }
        ];

        // Atributos de control del juego
        this.hasFlippedCard = false; // Indica si ya hay una carta dada la vuelta
        this.lockBoard = false; // Indica si el tablero está bloqueado
        this.firstCard = null; // Primera carta dada la vuelta
        this.secondCard = null; // Segunda carta dada la vuelta

        this.shuffleElements(); // Mezcla los elementos al iniciar el juego
        this.createElements(); // Llamada al método para crear las tarjetas
        this.addEventListeners(); // Añadir eventos a las tarjetas
    }

    // Método para crear las tarjetas en el DOM
    createElements() {
        this.finish = true;
        this.container= document.querySelector('main'); // Selecciona el contenedor para las tarjetas
        this.tablero = document.createElement('section'); // Crear un elemento section
        this.header = document.createElement('h2');
        this.subHeader = document.createElement('p');
        this.iniciarJuego = document.createElement('button');
        this.instrucciones = document.createElement('dialog');
        this.titleInstrucciones = document.createElement('h3');
        this.textInstrucciones = document.createElement('p');
        this.cerrarInstrucciones = document.createElement('button');
        this.abrirInstrucciones = document.createElement('button');
        this.modalGanar = document.createElement('dialog');
        this.titleGanar = document.createElement('h3');
        this.textGanar = document.createElement('p');
        this.cerrarGanar = document.createElement('button');
        this.abrirInstrucciones.textContent = 'Ver Instrucciones';
        this.titleInstrucciones.textContent = 'Instrucciones del juego';
        this.textInstrucciones.textContent = 'Haciendo click sobre las tarjetas del tablero,\
                                              se darán la vuelta para mostrar el logo de un equipo\
                                              de Fórmula 1. El objetivo del juego es encontrar las \
                                              parejas de tarjetas iguales. ¡Buena suerte!';
        this.cerrarInstrucciones.textContent = 'Cerrar';
        this.titleGanar.textContent = '¡Felicidades!';
        this.textGanar.textContent = '¡Has encontrado todas las parejas!';
        this.cerrarGanar.textContent = 'Cerrar';
        this.header.textContent = 'Juego de memoria';
        this.subHeader.textContent = 'Haz clic en una carta para darle vuelta y encontrar las parejas';
        this.iniciarJuego.textContent = 'Iniciar juego de memoria';
        this.modalGanar.appendChild(this.titleGanar);
        this.modalGanar.appendChild(this.textGanar);
        this.modalGanar.appendChild(this.cerrarGanar);
        this.instrucciones.appendChild(this.titleInstrucciones);
        this.instrucciones.appendChild(this.textInstrucciones);
        this.instrucciones.appendChild(this.cerrarInstrucciones);
        this.tablero.appendChild(this.header);
        this.tablero.appendChild(this.subHeader);
        this.tablero.appendChild(this.instrucciones);
        this.tablero.appendChild(this.abrirInstrucciones);
        this.tablero.appendChild(this.iniciarJuego);
        this.tablero.appendChild(this.modalGanar);
        this.abrirInstrucciones.addEventListener('click', () => {   
            this.instrucciones.showModal();
        });
       
        this.container.appendChild(this.tablero); // Añadir el tablero al contenedor
    }

    // Método para añadir event listeners a las tarjetas
    addEventListeners() {
        this.iniciarJuego.addEventListener('click', () => {
            this.elements.forEach(element => {
                var card = document.createElement('article');
                card.setAttribute('data-element', element.element);
                card.setAttribute('data-state', 'unflipped'); // Estado inicial de la tarjeta
    
                var header = document.createElement('h3');
                header.textContent = 'Tarjeta de memoria';
                card.appendChild(header);
                card.addEventListener('click', this.flipCard.bind(this, card)); // Usar bind para establecer el contexto
    
                var img = document.createElement('img');
                img.setAttribute('src', element.source);
                img.setAttribute('alt', element.element);
                card.appendChild(img);
    
                this.tablero.appendChild(card); // Añadir la tarjeta al tablero
                });
            this.tablero.removeChild(this.iniciarJuego);
            this.finish = false;
            }   
        );

        this.tablero.addEventListener('click', () => {
            var cards = document.querySelectorAll('article');
            var revealedCards = document.querySelectorAll('article[data-state="revealed"]');
            if (cards.length === revealedCards.length && !this.finish) {
                this.finish=true;
                this.modalGanar.showModal();
            }
        });
        this.cerrarGanar.addEventListener('click', () => {
            this.tablero.removeChild(this.modalGanar);
        });

        this.cerrarInstrucciones.addEventListener('click', () => {
            this.instrucciones.close();
        });
    }

    // Método para voltear una carta
    flipCard(card) {
        // Comprobaciones iniciales
        if (card.getAttribute('data-state') === 'revealed') return; // Si la carta ya está revelada
        if (this.lockBoard) return; // Si el tablero está bloqueado
        if (card === this.firstCard) return; // Si la carta seleccionada es la misma que la primera

        // Cambia el estado de la carta a 'flipped'
        card.setAttribute('data-state', 'flipped'); // Se da la vuelta a la tarjeta

        // Mostrar la imagen en la tarjeta
        var img = card.querySelector('img');

        // Comprobar si ya hay una carta volteada
        if (!this.hasFlippedCard) {
            this.hasFlippedCard = true; // Indicar que hay una carta volteada
            this.firstCard = card; // Asignar la carta actual como la primera
        } else {
            this.secondCard = card; // Asignar la carta actual como la segunda
            this.checkForMatch(); // Verificar si hay un par
        }
    }

    // Método para mezclar las cartas utilizando el algoritmo Durstenfeld
    shuffleElements() {
        for (let i = this.elements.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            [this.elements[i], this.elements[j]] = [this.elements[j], this.elements[i]];
        }
    }

    // Método para deshacer el flip de las cartas
    unflipCards() {
        this.lockBoard = true; // Bloquea el tablero
        setTimeout(() => { // Usa setTimeout para crear un delay
            this.firstCard.setAttribute('data-state', 'unflipped'); // Cambia el estado de la primera carta
            this.secondCard.setAttribute('data-state', 'unflipped'); // Cambia el estado de la segunda carta
            this.resetBoard(); // Resetea el tablero
        }, 1300); // Delay de 1.3 segundos
    }

    // Método para resetear el estado del tablero
    resetBoard() {
        this.firstCard = null;
        this.secondCard = null;
        this.hasFlippedCard = false;
        this.lockBoard = false;
    }

    // Método para comprobar si las cartas son un match
    checkForMatch() {
        var isMatch = this.firstCard.getAttribute('data-element') === this.secondCard.getAttribute('data-element')
        isMatch ? this.disableCards() : this.unflipCards(); // Usando el operador ternario
    }

    // Método para deshabilitar las cartas que ya han sido emparejadas
    disableCards() {
        this.firstCard.setAttribute('data-state', 'revealed'); // Cambia el estado a revealed
        this.secondCard.setAttribute('data-state', 'revealed'); // Cambia el estado a revealed
        this.resetBoard(); // Resetea el tablero
    }
}


