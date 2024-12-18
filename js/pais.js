class Pais {
    constructor(nombre, capital, poblacion) {
        this.nombre = nombre;
        this.capital = capital;
        this.poblacion = poblacion;
        this.circuitoNombre = "";
        this.formaGobierno = "";
        this.coordenadasMeta = { latitud: null, longitud: null };
        this.religionMayoritaria = "";
    }

    setDetalles(circuitoNombre, formaGobierno, coordenadasMeta, religionMayoritaria) {
        this.circuitoNombre = circuitoNombre;
        this.formaGobierno = formaGobierno;
        this.coordenadasMeta.latitud = coordenadasMeta[0];
        this.coordenadasMeta.longitud = coordenadasMeta[1];
        this.religionMayoritaria = religionMayoritaria;
    }

    getNombre() {
        return `Nombre del país: ${this.nombre}`;
    }

    getCapital() {
        return `Capital del país: ${this.capital}`;
    }

    getCircuitoNombre() {
        return `Nombre del Circuito: ${this.circuitoNombre}`;
    }

    getPoblacion() {
        return `Población: ${this.poblacion}`;
    }

    getFormaGobierno() {
        return `Forma de gobierno: ${this.formaGobierno}`;
    }

    getReligionMayoritaria() {
        return `Religión mayoritaria: ${this.religionMayoritaria}`;
    }

    getInfoSecundaria() {
        return `
            <ul>
                <li>Nombre del Circuito de F1: ${this.circuitoNombre}</li>
                <li>Población: ${this.poblacion}</li>
                <li>Forma de Gobierno: ${this.formaGobierno}</li>
                <li>Religión Mayoritaria: ${this.religionMayoritaria}</li>
            </ul>
        `;
    }

    mostrarCoordenadasMeta() {
        if (this.coordenadasMeta.latitud !== null && this.coordenadasMeta.longitud !== null) {
            return `Coordenadas de la línea de meta: Latitud ${this.coordenadasMeta.latitud}, Longitud ${this.coordenadasMeta.longitud}`;
        } else {
            return "Coordenadas de la línea de meta no disponibles.";
        }
    }

    mostrarInformacion() {
        var section = document.querySelector('aside > section > section');

    
        section.innerHTML = `
            <h3>Información del País</h3>
            <p>${this.getNombre()}</p>
            <p>${this.getCapital()}</p>
            <h3>Información Secundaria</h3>
            ${this.getInfoSecundaria()}
            <h3>Coordenadas de la Línea de Meta del Circuito</h3>
            ${this.mostrarCoordenadasMeta()}
        `;
    }

    mostrarPrevisionMeteo() {
        const meteo = new Meteo(this.coordenadasMeta.latitud, this.coordenadasMeta.longitud);
        meteo.cargarDatos();
    }
}

class Meteo {
    constructor(lat, lon) {
        this.apikey = "389dcb76520e6fedf67d572abad85238"; 
        this.lat = lat;  
        this.lon = lon;  
        this.tipo = "&mode=xml";
        this.unidades = "&units=metric";
        this.idioma = "&lang=es";
        this.url = `https://api.openweathermap.org/data/2.5/forecast?lat=${this.lat}&lon=${this.lon}${this.tipo}${this.unidades}${this.idioma}&APPID=${this.apikey}`;
    }

    cargarDatos() {
        $.ajax({
            dataType: "xml",
            url: this.url,
            method: 'GET',
            success: (datos) => {
                let simboloSrc = "";
                let simboloAlt = "";
                let maxTemperatura = Number.MIN_VALUE;
                let minTemperatura = Number.MAX_VALUE;
                let precipitacion = 0;
                let humedadCounter = 0;
                let humedad = 0;
                let fechaHoy = new Date().toISOString().split('T')[0]; // Fecha de hoy
                var articles = $('main > section > article');
                let dayIndex=0;


                $('time', datos).each((index, element) => {
                    let fechaHora = $(element).attr("from");
                    let fecha = fechaHora.split('T')[0]; // Solo la fecha (YYYY-MM-DD)
                    let hora = fechaHora.split('T')[1];
                    
                    // Asegurarse de que solo se capturan 4 días (excluyendo hoy)
                    if ( fecha > fechaHoy) {
                        let temperaturaMax = parseFloat($(element).find('temperature').attr("max"));
                        let temperaturaMin = parseFloat($(element).find('temperature').attr("min"));
                        
                        // Actualizar máximas y mínimas
                        if (temperaturaMax > maxTemperatura) {
                            maxTemperatura = temperaturaMax;
                        }
                        if (temperaturaMin < minTemperatura) {
                            minTemperatura = temperaturaMin;
                        }
                        precipitacion += parseFloat($(element).find('precipitation').attr("value") || "0");
                        humedad = (humedad * humedadCounter + parseFloat($(element).find('humidity').attr("value"))) / (++humedadCounter);

                        // Solo a las 15:00 para el icono
                        if (hora === "15:00:00") {
                            let descripcion = $(element).find('symbol').attr("name");
                            let icono = $(element).find('symbol').attr("var");
                            simboloSrc = `https://openweathermap.org/img/wn/${icono}.png`;
                            simboloAlt = `${descripcion}`;
                        }

                        // Cuando es 21:00, procesar el día completo
                        if (hora === "21:00:00") {
                            var currentArticle = $(articles[dayIndex]); // Selecciona el artículo correspondiente

                            // Actualiza solo los elementos específicos dentro del artículo
                            currentArticle.find('h3').text(fecha); // Actualiza el título con la fecha
                            currentArticle.find('p:nth-of-type(1)').html(`<strong>Temp. Máxima:</strong> ${maxTemperatura.toFixed(2)} °C`);
                            currentArticle.find('p:nth-of-type(2)').html(`<strong>Temp. Mínima:</strong> ${minTemperatura.toFixed(2)} °C`);
                            currentArticle.find('p:nth-of-type(3)').html(`<strong>Humedad:</strong> ${humedad.toFixed(2)} %`);
                            currentArticle.find('p:nth-of-type(4)').html(`<strong>Precipitación:</strong> ${precipitacion} mm`);
                            
                            // Actualiza el símbolo
                            currentArticle.find('img').attr('src', simboloSrc); 
                            currentArticle.find('img').attr('alt', simboloAlt);

                            // Reiniciar variables para el siguiente día
                            maxTemperatura = Number.MIN_VALUE;
                            minTemperatura = Number.MAX_VALUE;
                            precipitacion = 0;
                            humedad = 0;
                            humedadCounter = 0;
                            dayIndex++;
                        }
                    }
                });

            },
            error: () => {
                alert("Hubo un problema al obtener los datos del pronóstico.");
            }
        });
    }
}

