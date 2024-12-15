    <?php
        class Record {
            public $server;
            public $user;
            public $pass;
            public $dbname;

            public function __construct() {
                $this->server = "localhost";
                $this->user = "DBUSER2024";
                $this->pass = "DBPSWD2024";
                $this->dbname = "records";
            }

            public function saveRecord($name, $surname, $level, $time) {
                // Conectar a la base de datos y guardar el récord
                $conn = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
                if ($conn->connect_error) {
                    die("Conexión fallida: " . $conn->connect_error);
                }

                $stmt = $conn->prepare("INSERT INTO registro (nombre, apellidos, nivel, tiempo) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("sssd", $name, $surname, $level, $time);
                $stmt->execute();
                $stmt->close();
                $conn->close();
            }

            public function getTopRecords($level) {
                // Conectar a la base de datos y obtener los 10 mejores récords para el nivel especificado
                $conn = new mysqli($this->server, $this->user, $this->pass, $this->dbname);
                if ($conn->connect_error) {
                    die("Conexión fallida: " . $conn->connect_error);
                }
        
                // Consulta para obtener los 10 mejores resultados ordenados por tiempo ascendente
                $stmt = $conn->prepare("SELECT nombre, apellidos, tiempo FROM registro WHERE nivel = ? ORDER BY tiempo ASC LIMIT 10");
                $stmt->bind_param("s", $level);
                $stmt->execute();
                $result = $stmt->get_result();
        
                // Almacenar los resultados en un array
                $topRecords = [];
                while ($row = $result->fetch_assoc()) {
                    $topRecords[] = $row;
                }
        
                $stmt->close();
                $conn->close();
                return $topRecords;
            }
        }
    ?>

<!DOCTYPE HTML>

<html lang="es">
<head>
    <!-- Datos que describen el documento -->
    <meta name="author" content="Nicolás Guerbartchouk Pérez" />
    <meta name="description" content="descripcion contenido" />
    <meta name="keywords" content="aquí cada documento debe tener la lista
    de las palabras clave del mismo separadas por comas" />
    <!-- Definir la ventana gráfica -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="UTF-8" />
    <title>Juego de Memoria</title>
    <link rel="stylesheet" type="text/css" href="estilo/estilo.css" />
    <link rel="stylesheet" type="text/css" href="estilo/semaforo_grid.css" />
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
            <a href="viajes.php" title="Viajes">Viajes</a>
            <a href="juegos.html" title="Juegos" class="active">Juegos</a>
        </nav>
    </header>
    <p>Estas en: <a href="index.html" title="Inicio"><u>Inicio</u></a> >> <a href="juegos.html"
            title="Juegos"><u>Juegos</u></a> >> Semáforo </p>

    <main>
        <h2>Menú de Juegos</h2>
        <ul>
            <li><a href="memoria.html">Juego de Memoria</a></li>
                <li><a href="semaforo.php">Juego de Semáforo</a></li>
                <li><a href="api.html">Juego de conducción</a></li>
                <li><a href="php/Main.php">Datos de F1</a></li>
        </ul>
        
       <?php

        // Iniciar la sesión para mantener el estado entre recargas
        session_start();

        // Crear una instancia de Record
        $record = new Record();

        echo "<script src='js/semaforo.js'></script>
              <script>
              const semaforo = new Semaforo();
              </script>";

        // Comprobar si el formulario ha sido enviado
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $name = $_POST['nombre'] ?? '';
            $surname = $_POST['apellidos'] ?? '';
            $level = $_POST['nivel'] ?? '';
            $time = $_POST['tiempo'] ?? '';

            if ($name && $surname) {
                $record->saveRecord($name, $surname, $level, $time);
                
                // Almacenar un mensaje de éxito en la sesión
                $_SESSION['form_submitted'] = true;
                $_SESSION['level'] = $level;
                // Redirigir a la misma página para evitar que el formulario se reenvíe
                header('Location: ' . $_SERVER['PHP_SELF']);
                exit();
            } else {
                // Almacenar el error de falta de nombre y apellidos en la sesión
                $_SESSION['missing_fields'] = true;
                $_SESSION['level'] = $level;
                $_SESSION['time'] = $time;
                header('Location: ' . $_SERVER['PHP_SELF']);
                exit();
            }
        }

        // Mostrar el mensaje de éxito solo una vez
        if (isset($_SESSION['form_submitted']) && $_SESSION['form_submitted'] === true) {
            echo "<p>¡Tu récord ha sido guardado!</p>";

            // Obtener los 10 mejores récords para el nivel actual
            $level = $_SESSION['level'] ?? ''; // Cambia 'facil' por el nivel real
            $topRecords = $record->getTopRecords($level);

            // Generar la tabla HTML para mostrar los 10 mejores récords
            echo "<h3>Top 10 Récords para el nivel: " . htmlspecialchars($level) . "</h3>";
            echo "<ol>";

            foreach ($topRecords as $record) {
                echo "<li>
                        <span><strong>Nombre:</strong> " . htmlspecialchars($record['nombre']) . "</span><br>
                        <span><strong>Apellidos:</strong> " . htmlspecialchars($record['apellidos']) . "</span><br>
                        <span><strong>Tiempo:</strong> " . htmlspecialchars($record['tiempo']) . " segundos</span>
                    </li>";
            }

            echo "</ol>";


            // Eliminar la variable de sesión para que no se muestre nuevamente
            unset($_SESSION['form_submitted']);
        }

        // Mostrar el mensaje de error por falta de nombre y apellidos solo una vez
        if (isset($_SESSION['missing_fields']) && $_SESSION['missing_fields'] === true) {
            echo "<script>
                  document.addEventListener('DOMContentLoaded', () => {
                  semaforo.createRecordForm2('" . $_SESSION['level'] . "', '" . $_SESSION['time'] . "')});
                  </script>";
            // Eliminar la variable de sesión para que no se muestre nuevamente
            unset($_SESSION['missing_fields']);
            unset($_SESSION['level']);
            unset($_SESSION['time']);
        }

        ?>


    </main>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    
</body>

</html>