// Archivo: semaforo.js

class Semaforo {
    constructor() {
      // Atributos
      this.levels = [0.2, 0.5, 0.8];      // Dificultades posibles del juego
      this.lights = 4;                    // Número de luces, inicializado a 4
      this.unload_moment = null;          // Momento de inicio de la secuencia de apagado, inicializado a null
      this.clic_moment = null;            // Momento de clic del usuario, inicializado a null
  
      // Inicialización aleatoria de la dificultad de juego
      const randomIndex = Math.floor(Math.random() * this.levels.length);
      this.difficulty = this.levels[randomIndex];
  
      // Llamada al método para crear la estructura HTML del semáforo
      this.createStructure();
    }
  
     // Método para crear la estructura HTML del semáforo
     createStructure() {
        // Selecciona el último <section> dentro del elemento <main>
        const container = document.querySelector("main");

        const section = document.createElement("section");
        const header = document.createElement("h3");
        header.textContent = "Juego de Semáforo";
        section.appendChild(header);
        container.appendChild(section);
        

        // Crear las luces del semáforo (divs)
        for (let i = 0; i < this.lights; i++) {
            const light = document.createElement("div");
            section.appendChild(light);
        }

        // Crear el botón para arrancar el semáforo
        const startButton = document.createElement("button");
        startButton.textContent = "Arrancar Semáforo";
        startButton.onclick = () => this.initSequence(startButton); // Invocar initSequence al hacer clic
        section.appendChild(startButton);

        // Crear el botón para registrar el tiempo de reacción
        const reactionButton = document.createElement("button");
        reactionButton.textContent = "Reacción";
        reactionButton.onclick = () => this.stopReaction(); // Invocar initSequence al hacer clic
        reactionButton.disabled = true; 
        section.appendChild(reactionButton);
    }

    initSequence(button) {
        const container = document.querySelector("section");
        container.classList.add("load"); // Añadir la clase 'load' para activar la animación de encendido
        button.disabled = true; // Deshabilitar el botón para que no se pueda pulsar de nuevo
        
        // Configurar el temporizador
        setTimeout(() => {
            this.unload_moment = new Date(); // Almacenar la fecha y hora actual
            this.endSequence(); // Invocar el método endSequence
        }, 1500 + this.difficulty * 100); // Tiempo total basado en la dificultad
    }

    endSequence() {
        const container = document.querySelector("section");
        container.classList.remove("load"); // Eliminar la clase 'load' para desactivar la animación de encendido
        container.classList.add("unload"); // Añadir la clase 'unload' para activar la animación de apagado
    
        const reactionButton = document.querySelector("section button:nth-of-type(2)");
        reactionButton.disabled = false; // Habilitar el botón para registrar el tiempo de reacción
    }

     // Método para detener la reacción
     stopReaction() {
        this.clic_moment = new Date(); // Obtener el momento del clic del usuario
        const reactionTime = this.clic_moment - this.unload_moment; // Calcular el tiempo de reacción en milisegundos
        const reactionTimeRounded = Number((reactionTime / 1000).toFixed(3)); // Redondear

        

        // Crear un párrafo para mostrar el tiempo de reacción
        const container = document.querySelector("section");
        const remove = document.querySelector("section p");
        if (remove!=null){
            container.removeChild(remove); // Eliminar el párrafo anterior
        }
        const resultParagraph = document.createElement("p");
        resultParagraph.textContent = `Tu tiempo de reacción es: ${reactionTimeRounded} milésimas de segundo`;
        container.appendChild(resultParagraph); // Mostrar en la pantalla

        // Limpiar clases de carga y descarga
        container.classList.remove("unload");

        // Deshabilitar el botón de reacción y habilitar el de arranque
        const reactionButton = document.querySelector("section button:nth-of-type(2)");
        reactionButton.disabled = true; // Deshabilitar botón de reacción
        const startButton = document.querySelector("section button:nth-of-type(1)");
        startButton.disabled = false; // Habilitar botón de arranque
    }
}
  
  // Crear una instancia de Semaforo para inicializar el juego
  document.addEventListener("DOMContentLoaded", () => {
    const semaforo = new Semaforo();
  });
  