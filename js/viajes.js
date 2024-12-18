"use strict";

class Viajes {
    constructor() {
        this.latitud = null;
        this.longitud = null;
        this.precision = null;
        this.altitud = null;
        this.precisionAltitud = null;
        this.rumbo = null;
        this.velocidad = null;
        this.error = null;
        this.mapa = null;
        this.marcador = null;
    }

    // Método para solicitar la geolocalización
    obtenerPosicion() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this.getPosicion.bind(this),
                this.gestionarErrores.bind(this)
            );
        } else {
            console.error("La API de Geolocalización no está soportada en este navegador.");
        }
    }

    getPosicion(posicion) {
        this.latitud = posicion.coords.latitude;
        this.longitud = posicion.coords.longitude;
        this.precision = posicion.coords.accuracy;
        this.altitud = posicion.coords.altitude;
        this.precisionAltitud = posicion.coords.altitudeAccuracy;
        this.rumbo = posicion.coords.heading;
        this.velocidad = posicion.coords.speed;

        console.log("Datos de geolocalización obtenidos.");

        // Después de obtener la geolocalización, mostrar el mapa estático
        this.getMapaEstaticoGoogle();
        this.crearMapaDinamico();
    }

    gestionarErrores(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                this.error = "El usuario ha denegado el permiso para obtener la ubicación. Por favor, habilite la geolocalización en su navegador.";
                console.error(this.error);
                alert(this.error); // Mostrar un mensaje de alerta al usuario
                break;
            case error.POSITION_UNAVAILABLE:
                this.error = "La información de la ubicación no está disponible.";
                console.error(this.error);
                alert(this.error); // Mostrar un mensaje de alerta al usuario
                break;
            case error.TIMEOUT:
                this.error = "La solicitud para obtener la ubicación ha excedido el tiempo límite.";
                console.error(this.error);
                alert(this.error); // Mostrar un mensaje de alerta al usuario
                break;
            default:
                break;
        }
        
    }

    // Método para mostrar el mapa estático de Google
    getMapaEstaticoGoogle() {
        const ubicacion = document.querySelector('main > section > section  > div'); // Selección más flexible
        const apiKey = "&key=AIzaSyBqZPeOuQ1u8WxdKbtmNOSK1Cdn8IQtwUk"; 
        const url = "https://maps.googleapis.com/maps/api/staticmap?";
        const centro = "center=" + this.latitud + "," + this.longitud;
        const zoom = "&zoom=14";  
        const tamaño = "&size=2000x400";
        const marcador = "&markers=color:red%7Clabel:S%7C" + this.latitud + "," + this.longitud;
        const sensor = "&sensor=false";  
        this.imagenMapa = url + centro + zoom + tamaño + marcador + sensor + apiKey;
        ubicacion.innerHTML = "<img src='" + this.imagenMapa + "' alt='Mapa Estático de Google' />";
    }

    // Método para crear el mapa dinámico de Google
    crearMapaDinamico() {
        if (this.latitud !== null && this.longitud !== null) {
            // Crear el mapa y centrarlo en las coordenadas obtenidas
            this.mapa = new google.maps.Map(document.querySelector('main > section > section:nth-of-type(2) > div'), { // Ajuste más general
                zoom: 15,
                center: { lat: this.latitud, lng: this.longitud },
                mapTypeId: 'roadmap'
            });

            // Crear un marcador en la ubicación del usuario
            this.marcador = new google.maps.Marker({
                position: { lat: this.latitud, lng: this.longitud },
                map: this.mapa,
                title: "Mi ubicación"
            });

            // Ajustar el tamaño del mapa cuando el contenedor cambie de tamaño
            window.addEventListener('resize', () => {
                this.resizeMapa();
            });
        } else {
            console.error("Las coordenadas no están disponibles.");
        }
    }

    // Función para ajustar el tamaño del mapa
    resizeMapa() {
        const mapaDiv = document.querySelector('main > section > section:nth-of-type(2) > div'); // Ajuste más flexible
        google.maps.event.trigger(this.mapa, 'resize');
        this.mapa.setCenter(new google.maps.LatLng(this.latitud, this.longitud));
    }
}

class Carrusel {
    constructor(carrouselImages) {
        this.carrouselImages = carrouselImages;
        this.curSlide = 0;
        this.maxSlide = carrouselImages.length - 1;
        this.slides = [];
    }

    init() {
        
            const articleToFill = document.querySelector("main > article");

            const button = document.querySelector("main > button");
            button.remove();


            if (this.carrouselImages.length > 0) {
                this.createImages(articleToFill);
                this.createNavigationButtons(articleToFill);
            } else {
                this.showNoImagesMessage(articleToFill);
            }
        
    }

    createImages(article) {
        this.carrouselImages.forEach((imagen) => {
            const imgElement = document.createElement("img");
            imgElement.src = imagen;
            imgElement.alt = "Imagen de Canadá";
            article.appendChild(imgElement);
            this.slides.push(imgElement); // Guardar la imagen en el array de slides
        });
    }

    createNavigationButtons(article) {
        // Crear los botones con jQuery
        const nextButton = $("<button>").text(">"); // Crear el botón '>'
        const prevButton = $("<button>").text("<"); // Crear el botón '<'

        // Añadir los botones al contenedor article usando jQuery
        $(article).append(nextButton, prevButton);

        // Lógica de los botones de navegación
        this.addNavigationEventListeners(nextButton, prevButton);
    }

    addNavigationEventListeners(nextButton, prevButton) {
        // Usando jQuery para agregar los event listeners
        nextButton.on("click", () => {
            this.goToNextSlide();
        });

        prevButton.on("click", () => {
            this.goToPrevSlide();
        });
    }

    goToNextSlide() {
        if (this.curSlide === this.maxSlide) {
            this.curSlide = 0; // Volver al primer slide
        } else {
            this.curSlide++;
        }

        this.moveSlides();
    }

    goToPrevSlide() {
        if (this.curSlide === 0) {
            this.curSlide = this.maxSlide; // Volver al último slide
        } else {
            this.curSlide--;
        }

        this.moveSlides();
    }

    moveSlides() {
        this.slides.forEach((slide, indx) => {
            const trans = 100 * (indx - this.curSlide);
            $(slide).css("transform", `translateX(${trans}%)`);
        });
    }

    showNoImagesMessage(article) {
        const pElement = document.createElement("p");
        pElement.innerText = "No se encontraron imágenes para mostrar.";
        article.appendChild(pElement);
    }
}
