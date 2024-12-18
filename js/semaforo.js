class Semaforo {
    constructor() {
        // Atributos
        this.levels = [0.2, 0.5, 0.8]; // Dificultades posibles del juego
        this.lights = 4; // Número de luces, inicializado a 4
        this.unload_moment = null; // Momento de inicio de la secuencia de apagado, inicializado a null
        this.clic_moment = null; // Momento de clic del usuario, inicializado a null

        // Inicialización aleatoria de la dificultad de juego
        var randomIndex = Math.floor(Math.random() * this.levels.length);
        this.difficulty = this.levels[randomIndex];

        // Llamada al método para crear la estructura HTML del semáforo
        this.createStructure();
    }

    createStructure() {
        var container = document.querySelector("main");
        var section = document.createElement("section");
        var header = document.createElement("h3");
        header.textContent = "Juego de Semáforo";
        section.appendChild(header);
        container.appendChild(section);

        // Crear las luces del semáforo
        for (let i = 0; i < this.lights; i++) {
            var light = document.createElement("div");
            section.appendChild(light);
        }

        // Crear botón para arrancar el semáforo
        var startButton = document.createElement("button");
        startButton.textContent = "Arrancar Semáforo";
        startButton.onclick = () => this.initSequence(startButton);
        section.appendChild(startButton);

        // Crear botón para registrar el tiempo de reacción
        var reactionButton = document.createElement("button");
        reactionButton.textContent = "Reacción";
        reactionButton.onclick = () => this.stopReaction();
        reactionButton.disabled = true;
        section.appendChild(reactionButton);
    }

    initSequence(button) {
        var container = document.querySelector("section");
        container.classList.add("load");
        button.disabled = true;

        setTimeout(() => {
            this.unload_moment = new Date();
            this.endSequence();
        }, 1500 + this.difficulty * 100);
    }

    endSequence() {
        var container = document.querySelector("section");
        container.classList.remove("load");
        container.classList.add("unload");

        var reactionButton = document.querySelector("section button:nth-of-type(2)");
        reactionButton.disabled = false;
    }

    stopReaction() {
        this.clic_moment = new Date();
        var reactionTime = this.clic_moment - this.unload_moment;
        var reactionTimeRounded = Number((reactionTime / 1000).toFixed(3));

        var container = document.querySelector("section");
        var remove = document.querySelector("section p");
        if (remove != null) {
            container.removeChild(remove);
        }
        var resultParagraph = document.createElement("p");
        resultParagraph.textContent = `Tu tiempo de reacción es: ${reactionTimeRounded} segundos.`;
        container.appendChild(resultParagraph);

        container.classList.remove("unload");

        var reactionButton = document.querySelector("section button:nth-of-type(2)");
        reactionButton.disabled = true;
        var startButton = document.querySelector("section button:nth-of-type(1)");
        startButton.disabled = false;

        // Llamar al método para crear el formulario
        this.createRecordForm(reactionTimeRounded);
    }

    stopReactionAlready() {
        var reactionTime = this.clic_moment - this.unload_moment;
        var reactionTimeRounded = Number((reactionTime / 1000).toFixed(3));

        var container = document.querySelector("section");
        var remove = document.querySelector("section p");
        if (remove != null) {
            container.removeChild(remove);
        }
        var resultParagraph = document.createElement("p");
        resultParagraph.textContent = `Tu tiempo de reacción es: ${reactionTimeRounded} segundos.`;
        container.appendChild(resultParagraph);

        container.classList.remove("unload");

        var reactionButton = document.querySelector("section button:nth-of-type(2)");
        reactionButton.disabled = true;
        var startButton = document.querySelector("section button:nth-of-type(1)");
        startButton.disabled = false;

        // Llamar al método para crear el formulario
        this.createRecordForm(reactionTimeRounded);
    }

    createRecordForm(reactionTime) {
        // Obtener el contenedor principal
        var $container = $("main");
    
        // Eliminar cualquier formulario previamente creado dentro del contenedor
        $container.find("form").remove();
        $container.children("p").remove();
        $container.children("h3").remove();
        $container.find("ol").remove();
    
        // Crear el formulario con jQuery
        var $form = $("<form>", {
            method: "POST",
            action: "", // Aquí no necesitas cambiar nada si deseas enviarlo al mismo archivo PHP
        });
    
        // Campo para el nombre
        var $nameLabel = $("<label>").text("Nombre: ");
        var $nameInput = $("<input>", { type: "text", name: "nombre" });
        $nameLabel.append($nameInput);
    
        // Campo para los apellidos
        var $surnameLabel = $("<label>").text("Apellidos: ");
        var $surnameInput = $("<input>", { type: "text", name: "apellidos" });
        $surnameLabel.append($surnameInput);
    
        // Campo para el nivel (no editable)
        var $levelLabel = $("<label>").text("Nivel: ");
        var $levelInput = $("<input>", {
            type: "text",
            name: "nivel",
            value: this.difficulty,
            readonly: true,
        });
        $levelLabel.append($levelInput);
    
        // Campo para el tiempo (no editable)
        var $timeLabel = $("<label>").text("Tiempo: ");
        var $timeInput = $("<input>", {
            type: "text",
            name: "tiempo",
            value: reactionTime,
            readonly: true,
        });
        $timeLabel.append($timeInput);
    
        // Botón de envío
        var $submitButton = $("<button>", {
            type: "submit",
            text: "Guardar Récord",
        });
    
        // Añadir los elementos al formulario
        $form.append(
            $("<p>").append($nameLabel),
            $("<p>").append($surnameLabel),
            $("<p>").append($levelLabel),
            $("<p>").append($timeLabel),
            $("<p>").append($submitButton)
        );
    
        // Añadir el formulario al contenedor (sección)
        $container.append($form);
    }
    

    createRecordForm2(level, time) {
        // Obtener la sección y su color de fondo
        var $container = $("main");

        $container.find("form").remove();
        $container.children("p").remove();
        $container.children("h3").remove();
        $container.find("ol").remove();

        var $p = $("<p>").text("Por favor, introduce tu nombre y apellidos.");
        $container.append($p);
    
        // Crear el formulario con jQuery
        var $form = $("<form>", {
            method: "POST",
            action: "", // Aquí no necesitas cambiar nada si deseas enviarlo al mismo archivo PHP
        });
    
        // Campo para el nombre
        var $nameLabel = $("<label>").text("Nombre: ");
        var $nameInput = $("<input>", { type: "text", name: "nombre" });
        $nameLabel.append($nameInput);
    
        // Campo para los apellidos
        var $surnameLabel = $("<label>").text("Apellidos: ");
        var $surnameInput = $("<input>", { type: "text", name: "apellidos" });
        $surnameLabel.append($surnameInput);
    
        // Campo para el nivel (no editable)
        var $levelLabel = $("<label>").text("Nivel: ");
        var $levelInput = $("<input>", {
            type: "text",
            name: "nivel",
            value: level,
            readonly: true,
        });
        $levelLabel.append($levelInput);
    
        // Campo para el tiempo (no editable)
        var $timeLabel = $("<label>").text("Tiempo: ");
        var $timeInput = $("<input>", {
            type: "text",
            name: "tiempo",
            value: time,
            readonly: true,
        });
        $timeLabel.append($timeInput);
    
        // Botón de envío
        var $submitButton = $("<button>", {
            type: "submit",
            text: "Guardar Récord",
        });
    
        // Añadir los elementos al formulario
        $form.append(
            $nameLabel,
            $("<br>"),
            $surnameLabel,
            $("<br>"),
            $levelLabel,
            $("<br>"),
            $timeLabel,
            $("<br>"),
            $submitButton
        );
       
        // Añadir el formulario al contenedor (sección)
        $container.append($form);

    }
    
    
}


