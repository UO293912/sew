class Circuito{
    constructor(){
        
    }

readInputInfoFile(file) {
    if (file) {
        var reader = new FileReader();
        // Limpiar solo el contenido generado dinámicamente, sin borrar la estructura original
        document.querySelector('main section section:nth-of-type(1)').innerHTML = 
        '<h3>Información del Circuito</h3>\
         <p>Seleccione un archivo XML con la información del circuito</p>\
         <input type="file" accept=".xml" onchange="circuito.readInputInfoFile(this.files[0]);"/>';

        // Crear y mostrar los detalles del archivo
        var fileDetails = `
            <p><strong>Nombre del archivo:</strong> ${file.name}</p>
            <p><strong>Tamaño del archivo:</strong> ${file.size} bytes</p>
            <p><strong>Tipo del archivo:</strong> ${file.type}</p>
            <p><strong>Fecha de la última modificación:</strong> ${new Date(file.lastModifiedDate).toLocaleString()}</p>
        `;
        document.querySelector('main section section:nth-of-type(1)').insertAdjacentHTML('beforeend', fileDetails);

        // Crear el contenedor para el contenido del archivo dinámicamente
        var fileContentContainer = document.createElement('section');
        var fileContentHeader = document.createElement('h3');
        fileContentHeader.textContent = 'Contenido del archivo de texto:';
        var fileContentPre = document.createElement('pre');
        fileContentContainer.appendChild(fileContentHeader);
        fileContentContainer.appendChild(fileContentPre);
        document.querySelector('main section section:nth-of-type(1)').appendChild(fileContentContainer);

        // Leer y mostrar el contenido del archivo
        reader.onload = function(e) {
            var content = e.target.result;
            fileContentPre.textContent = content; // Mostrar el contenido XML en el contenedor <pre>
        };

        // Leer el archivo como texto
        reader.readAsText(file);
    }
}

readInputPlaniFile(file) {
    if (file) {
        var reader = new FileReader();
        // Limpiar el contenido generado dinámicamente, sin borrar la estructura original
        document.querySelector('main section section:nth-of-type(2)').innerHTML = 
        '<h3>Planimetría del Circuito</h3>\
         <p>Seleccione un archivo KML con la planimetría del circuito</p>\
         <input type="file" accept=".kml" onchange="circuito.readInputPlaniFile(this.files[0]);"/>';
        
        // Crear y mostrar los detalles del archivo
        var fileDetails = ` 
            <p><strong>Nombre del archivo:</strong> ${file.name}</p>
            <p><strong>Tamaño del archivo:</strong> ${file.size} bytes</p>
            <p><strong>Tipo del archivo:</strong> ${file.type}</p>
            <p><strong>Fecha de la última modificación:</strong> ${new Date(file.lastModifiedDate).toLocaleString()}</p>
        `;
        document.querySelector('main section section:nth-of-type(2)').insertAdjacentHTML('beforeend', fileDetails);

        // Leer el contenido del archivo KML
        reader.onload = (e)=> {
            var content = e.target.result;

            // Parsear el contenido del archivo KML para obtener las coordenadas
            var parser = new DOMParser();
            var kmlDocument = parser.parseFromString(content, 'application/xml');

            // Buscar todas las coordenadas en el archivo KML
            var coordinateElements = kmlDocument.querySelectorAll('coordinates');
            var allCoordinates = [];
            coordinateElements.forEach((element) => {
                var coordsText = element.textContent.trim().split(/\s+/); // Separar las coordenadas por espacios
                coordsText.forEach(coordPair => {
                    var [lng, lat] = coordPair.split(',').map(parseFloat); // Extraer longitud y latitud
                    allCoordinates.push({ lat: lat, lng: lng });
                });
            });

            if (allCoordinates.length === 0) {
                console.error("No se encontraron coordenadas en el archivo KML.");
                return;
            }
            // Inicializar el mapa con las coordenadas extraídas
            this.initPlanimetriaMap(allCoordinates);
        };

        // Leer el archivo como texto
        reader.readAsText(file);
    }
}

// Función para inicializar el mapa con las coordenadas de la planimetría
initPlanimetriaMap(allCoordinates) {
    // Crear un div dinámicamente con un tamaño fijo
    var mapDiv = document.createElement('div');
    mapDiv.style.backgroundColor = 'transparent'; // Fondo transparente
    document.querySelector('main section section:nth-of-type(2)').appendChild(mapDiv); // Añadir el div al contenedor adecuado

    // Crear el mapa en el contenedor adecuado centrado en la primera coordenada
    var mapOptions = {
        zoom: 14,
        center: allCoordinates[0],
        mapTypeId: google.maps.MapTypeId.ROADMAP, // Asegura el tipo de mapa correcto
    };
    var map = new google.maps.Map(mapDiv, mapOptions); // Crear el mapa

    // Dibujar la polilínea en el mapa
    var planimetryPath = new google.maps.Polyline({
        path: allCoordinates, // Asignar las coordenadas extraídas
        geodesic: true,       // Hacer que siga la curvatura de la tierra
        strokeColor: '#FF0000', // Color de la línea
        strokeOpacity: 1.0,    // Opacidad de la línea
        strokeWeight: 2        // Grosor de la línea
    });

    // Añadir la polilínea al mapa
    planimetryPath.setMap(map);

    // Agregar un marcador en la coordenada inicial (línea de meta)
    var marker = new google.maps.Marker({
        position: allCoordinates[0], // Primera coordenada del archivo KML
        map: map,
        title: "Línea de Meta", // Texto al pasar el mouse por el marcador
        icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png", // Ícono verde
        }
    });

    // Crear una InfoWindow para la etiqueta de la línea de meta
    var infoWindow = new google.maps.InfoWindow({
        content: '<div style="font-size:14px; font-weight:bold;">Línea de Meta</div>',
    });

    // Abrir la InfoWindow al crear el marcador
    infoWindow.open(map, marker);
}

readInputAltiFile(file) {
    if (file) {
        var reader = new FileReader();
        // Limpiar solo el contenido generado dinámicamente, sin borrar la estructura original
        var section = document.querySelector('main section section:nth-of-type(3)');
        section.innerHTML = `
            <h3>Altimetría del Circuito</h3>
            <p>Seleccione un archivo SVG con la altimetría del circuito:</p>
            <input type="file" accept=".svg" onchange="circuito.readInputAltiFile(this.files[0]);" />
        `;

        // Crear y mostrar los detalles del archivo
        var fileDetails = `
            <p><strong>Nombre del archivo:</strong> ${file.name}</p>
            <p><strong>Tamaño del archivo:</strong> ${file.size} bytes</p>
            <p><strong>Tipo del archivo:</strong> ${file.type}</p>
            <p><strong>Fecha de la última modificación:</strong> ${new Date(file.lastModifiedDate).toLocaleString()}</p>
        `;
        section.insertAdjacentHTML('beforeend', fileDetails);

        // Crear un contenedor para el contenido SVG del archivo
        var fileContentContainer = document.createElement('section');
        var fileContentHeader = document.createElement('h3');
        fileContentHeader.textContent = 'Contenido del archivo SVG (Altimetría):';
        var fileContentDiv = document.createElement('pre'); // Contenedor para mostrar el SVG
        fileContentContainer.appendChild(fileContentHeader);
        fileContentContainer.appendChild(fileContentDiv);
        section.appendChild(fileContentContainer);

        // Leer y mostrar el contenido del archivo SVG
        reader.onload =  function(e) {
            var content = e.target.result;
            fileContentDiv.innerHTML = content; // Mostrar el contenido SVG en el contenedor <div>
        };

        // Leer el archivo como texto
        reader.readAsText(file);
    }
}
}

