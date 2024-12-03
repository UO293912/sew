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
        this.container= document.querySelector('main'); // Selecciona el contenedor para las tarjetas
        this.tablero = document.createElement('section'); // Crear un elemento section
        this.header = document.createElement('h2');
        this.header.textContent = 'Juego de memoria';
        this.tablero.appendChild(this.header);
        this.elements.forEach(element => {
            const card = document.createElement('article');
            card.setAttribute('data-element', element.element);
            card.setAttribute('data-state', 'unflipped'); // Estado inicial de la tarjeta

            const header = document.createElement('h3');
            header.textContent = 'Tarjeta de memoria';
            card.appendChild(header);

            const img = document.createElement('img');
            img.setAttribute('src', element.source);
            img.setAttribute('alt', element.element);
            card.appendChild(img);

            this.tablero.appendChild(card); // Añadir la tarjeta al tablero
        });
        this.container.appendChild(this.tablero); // Añadir el tablero al contenedor
    }

    // Método para añadir event listeners a las tarjetas
    addEventListeners() {
        const cards = this.tablero.querySelectorAll('article'); // Seleccionar todas las tarjetas
        cards.forEach(card => {
            card.addEventListener('click', this.flipCard.bind(this, card)); // Usar bind para establecer el contexto
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
        const img = card.querySelector('img');

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
            const j = Math.floor(Math.random() * (i + 1));
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
        }, 2500); // Delay de 2.5 segundos
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
        const isMatch = this.firstCard.getAttribute('data-element') === this.secondCard.getAttribute('data-element')
        isMatch ? this.disableCards() : this.unflipCards(); // Usando el operador ternario
    }

    // Método para deshabilitar las cartas que ya han sido emparejadas
    disableCards() {
        this.firstCard.setAttribute('data-state', 'revealed'); // Cambia el estado a revealed
        this.secondCard.setAttribute('data-state', 'revealed'); // Cambia el estado a revealed
        this.resetBoard(); // Resetea el tablero
    }
}


