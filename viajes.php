<?php
class Moneda {
    private $monedaLocal;
    private $monedaBase;
    private $apiKey = '7e2f6d6e5fe84acaacec409f43fa3d97';  

    // Constructor
    public function __construct($monedaLocal, $monedaBase) {
        $this->monedaLocal = $monedaLocal;
        $this->monedaBase = $monedaBase;
    }

    // Método para obtener el tipo de cambio
    public function obtenerCambio() {
        $url = "https://exchange-rates.abstractapi.com/v1/live/?api_key=$this->apiKey&base=$this->monedaBase&target=$this->monedaLocal";
    
        // Inicializar cURL
        $ch = curl_init();
        
        // Configurar cURL para la URL y opciones necesarias
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
        // Ejecutar la solicitud y obtener la respuesta
        $response = curl_exec($ch);
        curl_close($ch);
    
        // Verificar si la respuesta fue válida
        if ($response) {
            $data = json_decode($response, true);
            
            // Verificar si el tipo de cambio está disponible en 'exchange_rates'
            if (isset($data['exchange_rates'][$this->monedaLocal])) {
                return $data['exchange_rates'][$this->monedaLocal]; // Devuelve el tipo de cambio
            } else {
                return "Error: Tipo de cambio no disponible."; // Error si no se encuentra el tipo de cambio
            }
        } else {
            return "Error: No se pudo obtener la respuesta de la API."; // Error si no se pudo realizar la solicitud
        }
    }
    
}

// Instanciar la clase Moneda con EUR como moneda base y la moneda local del país (por ejemplo, CAD)
$moneda = new Moneda("CAD", "EUR"); // Cambiar "CAD" por la moneda local deseada
// $cambio = $moneda->obtenerCambio(); Para no gastar api requests, se ha dejado comentado


class Carrusel {
    private $capital;
    private $pais;

    // Constructor
    public function __construct($capital, $pais) {
        $this->capital = $capital;
        $this->pais = $pais;
    }

    // Método para obtener 10 imágenes desde Flickr
    public function obtenerImagenes() {
        $apiKey = '4249be9116ab436e5041315c19a202ec'; // Tu API Key de Flickr
        $apiUrl = "https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=$apiKey&tags=formula1," . urlencode($this->pais) . "," . urlencode($this->capital) . "&format=json&nojsoncallback=1&per_page=10";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);

        if ($response) {
            $data = json_decode($response, true);

            if (isset($data['photos']['photo']) && count($data['photos']['photo']) > 0) {
                $urls = array_map(function ($photo) {
                    return "https://live.staticflickr.com/{$photo['server']}/{$photo['id']}_{$photo['secret']}_b.jpg";
                }, $data['photos']['photo']);

                return $urls;
            }
        }

        return []; // Retorna un array vacío si no se encuentran imágenes o hay errores
    }
}

// Crear una instancia de la clase Carrusel
$carrusel = new Carrusel("Ottawa", "Canada");
$imagenes = $carrusel->obtenerImagenes();

?>

<!DOCTYPE HTML>
<html lang="es">
<head>
    <!-- Datos que describen el documento -->
    <meta name="author" content="Nicolás Guerbartchouk Pérez" />
    <meta name="description" content="descripcion contenido" />
    <meta name="keywords" content="aquí cada documento debe tener la lista de las palabras clave del mismo separadas por comas" />
    <!-- Definir la ventana gráfica -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="UTF-8" />
    <title>F1 Desktop</title>
    <link rel="stylesheet" type="text/css" href="estilo/estilo.css" />
    <link rel="stylesheet" type="text/css" href="estilo/layout.css" />
    <link rel="icon" href="multimedia/imagenes/f1Icon48px.ico" type="image/x-icon">
</head>
<body>
    <header>
        <!-- Datos con el contenidos que aparece en el navegador -->
        <h1><a href="index.html" title="Inicio">F1 Desktop</a> </h1>
        <nav>
            <a href="index.html" title="Inicio">Inicio</a>
            <a href="piloto.html" title="Piloto">Piloto</a>
            <a href="noticias.html" title="Noticias">Noticias</a>
            <a href="calendario.html" title="Calendario">Calendario</a>
            <a href="meteorologia.html" title="Meteorologia">Meteorologia</a>
            <a href="circuito.html" title="Circuito">Circuito</a>
            <a href="viajes.php" title="Viajes" class="active">Viajes</a>
            <a href="juegos.html" title="Juegos">Juegos</a>
        </nav>
    </header>
    <p>Estas en: <a href="index.html" title="Inicio"><u>Inicio</u></a> >> Viajes</p>
    <h2>Viajes</h2>
    <main>
        <article></article>
        <section>
            <h3>
            Carrusel de Imágenes
            </h3>
            <button>Cargar Carrusel</button>
            <article>
            </article>
        </section>
        <section>
            <h3>Mapas de su posición actual</h3>
            <section>
                <h4>Mapa Estático</h4>
                <div>
                    <p>Cargando mapa...</p>
                </div>
            </section>
            <section>
                <h4>Mapa Dinámico</h4>
                <div>
                    <p>Cargando mapa...</p>
                </div>
            </section>
        </section>
        <section>
            <h3>Cambio de Moneda</h3>
            <?php
            // Verificar si el cambio es numérico antes de usar number_format
            if (is_numeric($cambio)) {
                echo "Actualmente 1€ equivale a " . number_format($cambio, 4) . " C$.";
            } else {
                echo $cambio; // $cambio contendrá el mensaje de error si no es numérico
            }
            ?>
        </section>
        
    </main>

    <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBqZPeOuQ1u8WxdKbtmNOSK1Cdn8IQtwUk"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="js/viajes.js"></script>
    <script>
        // Crear una instancia de la clase Viajes y obtener la ubicación
        const viajes = new Viajes();
        viajes.obtenerPosicion();
        document.addEventListener("DOMContentLoaded", () => {
            document.querySelector('button').addEventListener('click', () => {
                const carrouselImages = <?php echo json_encode($imagenes); ?>;
                // Crear una nueva instancia de la clase Carrusel
                const miCarrusel = new Carrusel(carrouselImages);
                
                // Inicializar el carrusel
                miCarrusel.init();
            });
        });
    </script>
</body>
</html>
