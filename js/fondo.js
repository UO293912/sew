class Fondo {
    constructor(pais, capital, circuito) {
        this.pais = pais;
        this.capital = capital;
        this.circuito = circuito;
    }

    async obtenerImagenCircuito() {
        const apiKey = '4249be9116ab436e5041315c19a202ec';  // Tu API Key de Flickr
        const apiUrl = `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${apiKey}&tags=formula1,${this.circuito},${this.pais}&format=json&nojsoncallback=1&per_page=10`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.photos.photo.length > 0) {
                const photo = data.photos.photo[0];
                const imageUrl = `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_b.jpg`;
                this.establecerFondo(imageUrl);
            } else {
                console.log("No se encontraron imágenes para el circuito.");
            }
        } catch (error) {
            console.error("Error al obtener la imagen del circuito:", error);
        }
    }

    establecerFondo(imageUrl) {
        // Establecer el fondo con la imagen obtenida de Flickr
        document.documentElement.style.height = '100%';
        document.body.style.display = 'flex';
        document.body.style.flexDirection = 'column';
        document.body.style.height = '100%';
        document.body.style.backgroundImage = `url(${imageUrl})`;
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';

    }
}
