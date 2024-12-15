<!DOCTYPE HTML>
<html lang="es">
<head>
    <meta name="author" content="Nicolás Guerbartchouk Pérez" />
    <meta name="description" content="descripcion contenido" />
    <meta name="keywords" content="palabras clave separadas por comas" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta charset="UTF-8" />
    <title>F1 Desktop</title>
    <link rel="stylesheet" type="text/css" href="../estilo/estilo.css" />
    <link rel="stylesheet" type="text/css" href="../estilo/layout.css" />
    <link rel="icon" href="../multimedia/imagenes/f1Icon48px.ico" type="image/x-icon">
</head>
<body>
    <header>
        <h1><a href="../index.html" title="Inicio">F1 Desktop</a></h1>
        <nav>
            <a href="../index.html" title="Inicio">Inicio</a>
            <a href="../piloto.html" title="Piloto">Piloto</a>
            <a href="../noticias.html" title="Noticias">Noticias</a>
            <a href="../calendario.html" title="Calendario">Calendario</a>
            <a href="../meteorologia.html" title="Meteorología">Meteorología</a>
            <a href="../circuito.html" title="Circuito">Circuito</a>
            <a href="../viajes.php" title="Viajes">Viajes</a>
            <a href="../juegos.html" title="Juegos" class="active">Juegos</a>
        </nav>
    </header>
    <p>Estas en: <a href="../index.html" title="Inicio"><u>Inicio</u></a> >> <a href="../juegos.html"
            title="Juegos"><u>Juegos</u></a> >> Datos F1 </p>
    <main>
        <h2>Menú de Juegos</h2>
        <ul>
            <li><a href="../memoria.html">Juego de Memoria</a></li>
            <li><a href="../semaforo.php">Juego de Semáforo</a></li>
            <li><a href="../api.html">Juego de conducción</a></li>
            <li><a href="Main.php">Datos de F1</a></li>
        </ul>
        <section>
            <h3>Datos F1</h3>
            <?php
            session_start();
            require_once 'Database.php';
            require_once 'DBSetup.php';
            require_once 'CSVImporter.php';

            if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
                 

                $db = new Database();
                $action = $_POST['action'];

                switch ($action) {
                    case 'create_db':
                        $setup = new DBSetup($db);
                        $setup->createTables();
                        echo "<p>Base de datos y tablas creadas exitosamente.</p>";
                        break;

                    case 'import_csv':
                        if (isset($_FILES['import_file']) && $_FILES['import_file']['error'] === UPLOAD_ERR_OK) {
                            $filePath = $_FILES['import_file']['tmp_name'];
                        
                            try {
                                $importer = new CSVImporter($db);
                                $importer->importDatabase($filePath);
                                echo "<p>Datos importados correctamente.</p>";
                            } catch (Exception $e) {
                                echo "<p>Error al importar los datos: " . $e->getMessage() . "</p>";
                            }
                        } else {
                            echo "<p>Error al subir el archivo CSV.</p>";
                        }
                        break;

                    case 'export_csv':
                        if (!isset($_SESSION['csv_data']) || empty($_SESSION['csv_data'])) {
                            echo "<p>No hay datos para exportar. Por favor, visualiza alguna consulta</p>";
                            break;
                        }
                        
                        $csvData = $_SESSION['csv_data'];
                        $title = $_SESSION['csv_title'] ?? 'Exportación';

                        // Generar un nombre de archivo dinámico basado en el título o algún dato de la consulta
                        // Por ejemplo, usando el título o la fecha de la consulta
                        $timestamp = date('Y-m-d_H-i-s'); // Timestamp para asegurar que el nombre sea único
                        $filename = "export_{$title}_{$timestamp}.csv"; // Nombre del archivo basado en el título y la fecha

                        try {
                            // Limpieza de salida previa
                            if (ob_get_level()) {
                                ob_end_clean();
                            }

                            $csvContent = "\xEF\xBB\xBF";  // Añadir BOM para UTF-8
                            $csvContent = "$title\n\n";
                            $headers = array_keys($csvData[0]);
                            $csvContent .= implode(',', $headers) . "\n";

                            foreach ($csvData as $row) {
                                $escapedRow = array_map(function ($value) {
                                    // Asegurarse de que cada valor esté en UTF-8
                                    return '"' . str_replace('"', '""', mb_convert_encoding($value, 'UTF-8', 'auto')) . '"';
                                }, $row);
                                $csvContent .= implode(',', $escapedRow) . "\n";
                            }


                            // Configurar encabezados para la descarga del archivo
                            header('Content-Type: text/csv; charset=UTF-8');  // Especificar codificación UTF-8
                            header('Content-Disposition: attachment; filename="' . $filename . '"');
                            header('Content-Length: ' . strlen($csvContent));

                            // Liberar datos de la sesión
                            unset($_SESSION['csv_data']);
                            unset($_SESSION['csv_title']); // También liberamos el título si es necesario

                            echo $csvContent;

                            exit;

                        } catch (Exception $e) {
                            echo "<p>Error al exportar los datos: " . $e->getMessage() . "</p>";
                        }
                        break;



                    case 'verTodosResultados':
                        try {
                            // Tabla y columnas para los resultados
                            $table = 'resultados';
                            $columns = ['id_piloto', 'id_carrera', 'posicion', 'puntos', 'tiempo'];
                            $result = $db->select($table, $columns);

                            // Variables para los equipos, pilotos y carreras
                            $tablePilotos = 'pilotos';
                            $columnsPilotos = ['nombre', 'apellido', 'id_equipo_actual'];
                            
                            $tableEquipos = 'equipos';
                            $columnsEquipos = ['nombre'];

                            $tableCarreras = 'carreras';
                            $columnsCarreras = ['nombre'];

                            $csvData = []; // Array para almacenar los datos para el CSV

                            if (empty($result)) {
                                echo "<p>No se encontraron resultados.</p>";
                            } else {
                                $title = "Resultados"; // Título general de la tabla
                                echo "<p><strong>$title</strong></p>";
                                $_SESSION['csv_title'] = $title; // Guardar el título en la sesión
                            }

                            // Bucle para procesar cada resultado
                            foreach ($result as $row) {
                                // Obtener datos del piloto
                                $conditionsPiloto = ['id_piloto' => $row['id_piloto']];
                                $resultPiloto = $db->select($tablePilotos, $columnsPilotos, $conditionsPiloto);

                                // Obtener datos del equipo
                                $conditionsEquipo = ['id_equipo' => $resultPiloto[0]['id_equipo_actual']];
                                $resultEquipo = $db->select($tableEquipos, $columnsEquipos, $conditionsEquipo);

                                // Obtener datos de la carrera
                                $conditionsCarrera = ['id_carrera' => $row['id_carrera']];
                                $resultCarrera = $db->select($tableCarreras, $columnsCarreras, $conditionsCarrera);

                                $nombrePiloto = "{$resultPiloto[0]['nombre']} {$resultPiloto[0]['apellido']}";
                                $equipo = $resultEquipo[0]['nombre'];
                                $carrera = $resultCarrera[0]['nombre'];
                                $posicion = $row['posicion'];
                                $puntos = $row['puntos'];
                                $tiempo = $row['tiempo'];

                                // Imprimir los resultados como <p>
                                echo "<p>Piloto: $nombrePiloto, Equipo: $equipo, Carrera: $carrera, Posición: $posicion, Puntos: $puntos, Tiempo(hh:mm:ss): $tiempo</p>";

                                // Guardar los datos en el array para el CSV
                                $csvData[] = [
                                    'Piloto' => $nombrePiloto,
                                    'Equipo' => $equipo,
                                    'Carrera' => $carrera,
                                    'Posición' => $posicion,
                                    'Puntos' => $puntos,
                                    'Tiempo' => $tiempo
                                ];
                            }

                            // Guardar los datos en la sesión para exportarlos luego
                            $_SESSION['csv_data'] = $csvData;

                        } catch (Exception $e) {
                            echo "Error: " . $e->getMessage();
                        }
                        break;


                    case 'verPilotosPorEquipo':
                        $param = isset($_POST['nombre_equipo_de_pilotos']) ? $_POST['nombre_equipo_de_pilotos'] : null;
                        if ($param) {
                            // Usar el parámetro para procesar la consulta
                            try {
                                $table = 'equipos';
                                $columns = ['id_equipo'];
                                $conditions = ['nombre' => htmlspecialchars($param)]; // Cambiar según el equipo deseado
                                
                                // Consultar el ID del equipo según su nombre
                                $result = $db->select($table, $columns, $conditions);
                                if (empty($result)) {
                                    echo "<p>No se encontró el equipo del que buscar.</p>";
                                } else {
                                    $id_equipo = $result[0]['id_equipo'];
                                    
                                    // Consultar los pilotos del equipo
                                    $table = 'pilotos';
                                    $columns = ['nombre', 'apellido', 'nacionalidad', 'fecha_nacimiento'];
                                    $conditions = ['id_equipo_actual' => $id_equipo];
                                    $result2 = $db->select($table, $columns, $conditions);
                                    
                                    if (empty($result2)) {
                                        echo "<p>No se encontraron pilotos para el equipo " . htmlspecialchars($param) . ".</p>";
                                    } else {
                                        echo "<p><strong>Pilotos del equipo " . htmlspecialchars($param) . "</strong></p>";
                                    }

                                    // Crear array para exportar a CSV
                                    $csvData = []; 
                                    foreach ($result2 as $row) {
                                        echo "<p>Piloto: {$row['nombre']} {$row['apellido']}, Nacionalidad: {$row['nacionalidad']}, Fecha de Nacimiento: {$row['fecha_nacimiento']}</p>";
                                        
                                        // Guardar los datos de los pilotos para exportar
                                        $csvData[] = [
                                            'Nombre' => $row['nombre'],
                                            'Apellido' => $row['apellido'],
                                            'Nacionalidad' => $row['nacionalidad'],
                                            'Fecha de Nacimiento' => $row['fecha_nacimiento']
                                        ];
                                    }

                                    // Guardar los datos en la sesión para exportarlos luego
                                    $_SESSION['csv_data'] = $csvData;
                                    $_SESSION['csv_title'] = "Pilotos del equipo " . htmlspecialchars($param); // Título de la exportación
                                }

                            } catch (Exception $e) {
                                echo "<p>Error: " . $e->getMessage() . "</p>";
                            }
                        } else {
                            echo "<p>No se recibió ningún equipo del que se quieren ver los pilotos.</p>";
                        }
                        break;


                    case 'verCarrerasTemporada':
                        try {
                            $param = isset($_POST['año_temporada_para_carreras']) ? $_POST['año_temporada_para_carreras'] : null;
                            if ($param) {
                                // 1. Obtener el ID de temporada usando el año proporcionado
                                $table = 'temporadas';
                                $columns = ['id_temporada'];
                                $conditions = ['año' => htmlspecialchars($param)]; // Comprobamos que exista una temporada con ese año
                                
                                $temporada = $db->select($table, $columns, $conditions);

                                // Si no se encuentra la temporada, mostramos un mensaje de error
                                if (empty($temporada)) {
                                    echo "<p>No se encontró temporada para el año " . htmlspecialchars($param) . ".</p>";
                                } else {
                                    $id_temporada = $temporada[0]['id_temporada']; // Obtenemos el id de la temporada

                                    // 2. Obtener las carreras de la temporada
                                    $table = 'carreras';
                                    $columns = ['id_carrera', 'nombre', 'fecha', 'id_circuito'];
                                    $conditions = ['id_temporada' => $id_temporada]; // Usamos el id de temporada para filtrar las carreras
                                    
                                    $result = $db->select($table, $columns, $conditions);
                                    if (empty($result)) {
                                        echo "<p>No se encontraron carreras para la temporada " . htmlspecialchars($param) . ".</p>";
                                    } else {
                                        echo "<p><strong>Carreras de la temporada " . htmlspecialchars($param) . "</strong></p>";

                                        // 3. Crear array para exportar a CSV
                                        $csvData = [];
                                        foreach ($result as $row) {
                                            // Obtener el nombre del circuito asociado a la carrera
                                            $table = 'circuitos';
                                            $columns = ['nombre'];
                                            $conditions = ['id_circuito' => $row['id_circuito']];
                                            
                                            $circuito = $db->select($table, $columns, $conditions);
                                            $circuito_nombre = $circuito[0]['nombre'] ?? 'Desconocido'; // Manejar caso si no se encuentra el circuito

                                            echo "<p>Carrera: {$row['nombre']}, Fecha: {$row['fecha']}, Circuito: {$circuito_nombre}</p>";

                                            // Guardar los datos de las carreras para exportar
                                            $csvData[] = [
                                                'Carrera' => $row['nombre'],
                                                'Fecha' => $row['fecha'],
                                                'Circuito' => $circuito_nombre
                                            ];
                                        }

                                        // Guardar los datos en la sesión para exportarlos luego
                                        $_SESSION['csv_data'] = $csvData;
                                        $_SESSION['csv_title'] = "Carreras de la temporada " . htmlspecialchars($param); // Título de la exportación
                                    }
                                }
                            } else {
                                echo "No se proporcionó un año de temporada válido.";
                            }
                        } catch (Exception $e) {
                            echo "Error: " . $e->getMessage();
                        }
                        break;

                    case 'verTodosPilotos':
                        try {
                            $table = 'pilotos';
                            $columns = ['nombre', 'apellido', 'id_equipo_actual', 'nacionalidad', 'fecha_nacimiento'];
                            $result = $db->select($table, $columns);
                            $table = 'equipos';
                            $columns = ['nombre'];
                            $csvData = []; // Array para almacenar los datos para el CSV

                            if (empty($result)) {
                                echo "<p>No se encontraron pilotos.</p>";
                            } else {
                                $title = "Pilotos"; // Título general de la tabla
                                echo "<p><strong>$title</strong></p>";
                                $_SESSION['csv_title'] = $title; // Guardar el título en la sesión
                            }

                            foreach ($result as $row) {
                                $conditions = ['id_equipo' => $row['id_equipo_actual']];
                                $result2 = $db->select($table, $columns, $conditions);

                                $nombrePiloto = "{$row['nombre']} {$row['apellido']}";
                                $equipo = $result2[0]['nombre'];
                                $nacionalidad = $row['nacionalidad'];
                                $fechaNacimiento = $row['fecha_nacimiento'];

                                // Imprimir los datos como <p>
                                echo "<p>Piloto: $nombrePiloto, Equipo: $equipo, Nacionalidad: $nacionalidad, Fecha de Nacimiento: $fechaNacimiento</p>";

                                // Guardar los datos en el array para el CSV
                                $csvData[] = [
                                    'Piloto' => $nombrePiloto,
                                    'Equipo' => $equipo,
                                    'Nacionalidad' => $nacionalidad,
                                    'Fecha de Nacimiento' => $fechaNacimiento
                                ];
                            }

                            // Guardar los datos en la sesión para exportarlos luego
                            $_SESSION['csv_data'] = $csvData;

                        } catch (Exception $e) {
                            echo "Error: " . $e->getMessage();
                        }
                        break;

                    case 'verResultadosDePiloto':
                        try {
                            $param = isset($_POST['nombre_piloto_para_resultados']) ? $_POST['nombre_piloto_para_resultados'] : null;
                            if ($param) {
                                $param_parts = preg_split('/\s+/', trim($param)); // Divide por uno o más espacios
                                if (count($param_parts) != 2) {
                                    echo "<p>Formato inválido. Debe ser: 'nombre y apellido'.</p>";
                                } else {
                                    $nombre_piloto = trim($param_parts[0]); // Extraer nombre
                                    $apellido_piloto = trim($param_parts[1]); // Extraer apellido
                                    
                                    $table = 'pilotos';
                                    $columns = ['id_piloto'];
                                    $conditions = ['nombre' => htmlspecialchars($nombre_piloto), 'apellido' => htmlspecialchars($apellido_piloto)];
                                    $result = $db->select($table, $columns, $conditions);
                                    
                                    if (empty($result)) {
                                        echo "<p>No se encontró el piloto con nombre " . htmlspecialchars($nombre_piloto) . " " . htmlspecialchars($apellido_piloto) . ".</p>";
                                    } else {
                                        // Definir la tabla y columnas para los resultados del piloto
                                        $table = 'resultados';
                                        $columns = ['id_carrera', 'posicion', 'puntos', 'tiempo'];
                                        $conditions = ['id_piloto' => $result[0]['id_piloto']];
                                        $result = $db->select($table, $columns, $conditions);

                                        if (empty($result)) {
                                            echo "<p>No se encontraron resultados para el piloto " . htmlspecialchars($nombre_piloto) . " " . htmlspecialchars($apellido_piloto) . ".</p>";
                                        } else {
                                            echo "<p><strong>Resultados del piloto " . htmlspecialchars($nombre_piloto) . " " . htmlspecialchars($apellido_piloto) . "</strong></p>";

                                            // Preparar los datos para el CSV
                                            $csvData = []; // Array para almacenar los datos para el CSV
                                            $title = "Resultados de Piloto: " . htmlspecialchars($nombre_piloto) . " " . htmlspecialchars($apellido_piloto); // Título general de la tabla, ahora incluye el nombre del piloto
                                            $_SESSION['csv_title'] = $title; // Guardar el título en la sesión

                                            // Procesar cada resultado
                                            foreach ($result as $row) {
                                                $table = 'carreras';
                                                $columns = ['nombre', 'fecha'];
                                                $conditions = ['id_carrera' => $row['id_carrera']];
                                                $result2 = $db->select($table, $columns, $conditions);

                                                // Datos para imprimir
                                                $nombreCarrera = $result2[0]['nombre'];
                                                $fechaCarrera = $result2[0]['fecha'];
                                                $posicion = $row['posicion'];
                                                $puntos = $row['puntos'];
                                                $tiempo = $row['tiempo'];

                                                // Imprimir los resultados de la carrera
                                                echo "<p>Carrera: $nombreCarrera, Fecha: $fechaCarrera, Posición: $posicion, Puntos: $puntos, Tiempo(hh:mm:ss): $tiempo</p>";

                                                // Guardar los resultados en el array para el CSV
                                                $csvData[] = [
                                                    'Carrera' => $nombreCarrera,
                                                    'Fecha' => $fechaCarrera,
                                                    'Posición' => $posicion,
                                                    'Puntos' => $puntos,
                                                    'Tiempo' => $tiempo
                                                ];
                                            }

                                            // Guardar los datos en la sesión para exportarlos luego
                                            $_SESSION['csv_data'] = $csvData;
                                        }
                                    }
                                }
                            } else {
                                echo "No se proporcionó un nombre de piloto válido.";
                            }
                        } catch (Exception $e) {
                            echo "Error: " . $e->getMessage();
                        }
                        break;

                    case 'verParticipantesCarrera':
                        try {
                            $param = isset($_POST['carrera_año_para_participantes']) ? $_POST['carrera_año_para_participantes'] : null;
                            
                            if ($param) {
                                // Separar el formato "nombre carrera, año temporada"
                                $param_parts = explode(',', $param);
                                if (count($param_parts) != 2) {
                                    echo "<p>Formato inválido. Debe ser: 'nombre carrera, año temporada'.</p>";
                                } else {
                                    $nombre_carrera = trim($param_parts[0]); // Extraer nombre de la carrera
                                    $año_temporada = trim($param_parts[1]); // Extraer año de la temporada

                                    // Validación del año (asegurarse de que es numérico)
                                    if (!is_numeric($año_temporada)) {
                                        echo "<p>El año debe ser un valor numérico válido.</p>";
                                        break;
                                    }

                                    // 1. Obtener el ID de temporada usando el año proporcionado
                                    $table = 'temporadas';
                                    $columns = ['id_temporada'];
                                    $conditions = ['año' => (int) $año_temporada];  // Convertir a entero para mayor seguridad
                                    $temporada = $db->select($table, $columns, $conditions);
                                    if (empty($temporada)) {
                                        echo "<p>No se encontró la temporada del año " . htmlspecialchars($año_temporada) . ".</p>";
                                    } else {
                                        $id_temporada = $temporada[0]['id_temporada'];

                                        // 2. Obtener el ID de la carrera usando el nombre y la temporada
                                        $table = 'carreras';
                                        $columns = ['id_carrera'];
                                        $conditions = [
                                            'nombre' => htmlspecialchars($nombre_carrera),
                                            'id_temporada' => $id_temporada
                                        ];
                                        $carrera = $db->select($table, $columns, $conditions);

                                        if (empty($carrera)) {
                                            echo "<p>No se encontró la carrera con nombre '" . htmlspecialchars($nombre_carrera) . "' para la temporada " . htmlspecialchars($año_temporada) . ".</p>";
                                        } else {
                                            $id_carrera = $carrera[0]['id_carrera'];

                                            // 3. Obtener resultados de la carrera
                                            $table = 'resultados';
                                            $columns = ['id_piloto', 'posicion', 'puntos', 'tiempo'];
                                            $conditions = ['id_carrera' => $id_carrera];
                                            $result = $db->select($table, $columns, $conditions);

                                            if (empty($result)) {
                                                echo "<p>No hay resultados para la carrera '" . htmlspecialchars($nombre_carrera) . "' en la temporada " . htmlspecialchars($año_temporada) . ".</p>";
                                            } else {
                                                echo "<p><strong>Participantes de la carrera '" . htmlspecialchars($nombre_carrera) . "' en la temporada " . htmlspecialchars($año_temporada) . "</strong></p>";

                                                // 4. Mostrar los resultados
                                                $csv_data = [];
                                                foreach ($result as $row) {
                                                    // Obtener información del piloto
                                                    $table = 'pilotos';
                                                    $columns = ['nombre', 'id_equipo_actual'];
                                                    $conditions = ['id_piloto' => $row['id_piloto']];
                                                    $result2 = $db->select($table, $columns, $conditions);
                                                    if (!empty($result2)) {
                                                        // Obtener información del equipo
                                                        $table = 'equipos';
                                                        $columns = ['nombre'];
                                                        $conditions = ['id_equipo' => $result2[0]['id_equipo_actual']];
                                                        $result3 = $db->select($table, $columns, $conditions);
                                                        
                                                        // Mostrar los detalles del piloto y equipo
                                                        echo "<p>Piloto: {$result2[0]['nombre']}, Equipo: {$result3[0]['nombre']}, Posición: {$row['posicion']}, Puntos: {$row['puntos']}, Tiempo(hh:mm:ss): {$row['tiempo']}</p>";

                                                        // Preparar datos para el CSV
                                                        $csv_data[] = [
                                                            'Piloto' => $result2[0]['nombre'],
                                                            'Equipo' => $result3[0]['nombre'],
                                                            'Posición' => $row['posicion'],
                                                            'Puntos' => $row['puntos'],
                                                            'Tiempo' => $row['tiempo']
                                                        ];
                                                    }
                                                }

                                                // Guardar título del CSV en la sesión
                                                $_SESSION['csv_title'] = "Participantes de la carrera ". htmlspecialchars($nombre_carrera)." en la temporada ".htmlspecialchars($año_temporada);
                                                // Guardar datos del CSV en la sesión
                                                $_SESSION['csv_data'] = $csv_data;
                                            }
                                        }
                                    }
                                }
                            } else {
                                echo "<p>No se proporcionó un parámetro válido.</p>";
                            }
                        } catch (Exception $e) {
                            echo "Error: " . $e->getMessage();
                        }

                        break;

                    case 'verRankingTemporada':
                        try {
                            // Recibir el año de la temporada desde el parámetro POST
                            $param = isset($_POST['año_temporada_para_ranking']) ? intval($_POST['año_temporada_para_ranking']) : null;

                            if (!$param) {
                                echo "<p>Error: No se proporcionó un año de temporada válido.</p>";
                            }else{
                                // 1. Obtener el ID de la temporada
                                $table = 'temporadas';
                                $columns = ['id_temporada'];
                                $conditions = ['año' => $param];
                                $temporada = $db->select($table, $columns, $conditions);

                                if (empty($temporada)) {
                                    echo "<p>Error: No se encontró la temporada para el año " . htmlspecialchars($año_temporada) . ".</p>";
                                }else{
                                    $id_temporada = $temporada[0]['id_temporada'];

                                    // 2. Obtener los IDs de las carreras de la temporada
                                    $table = 'carreras';
                                    $columns = ['id_carrera'];
                                    $conditions = ['id_temporada' => $id_temporada];
                                    $carreras = $db->select($table, $columns, $conditions);

                                    if (empty($carreras)) {
                                         echo "<p>Error: No se encontraron carreras para la temporada " . htmlspecialchars($año_temporada) . ".<p>";
                                    }else{
                                        // 3. Inicializar ranking de pilotos
                                        $ranking = [];

                                        // 4. Recorrer cada carrera y acumular los puntos de los pilotos
                                        foreach ($carreras as $carrera) {
                                            $id_carrera = $carrera['id_carrera'];

                                            $table = 'resultados';
                                            $columns = ['id_piloto', 'puntos'];
                                            $conditions = ['id_carrera' => $id_carrera];
                                            $resultados = $db->select($table, $columns, $conditions);

                                            foreach ($resultados as $resultado) {
                                                $id_piloto = $resultado['id_piloto'];
                                                $puntos = $resultado['puntos'];

                                                // Acumular puntos en el ranking
                                                if (!isset($ranking[$id_piloto])) {
                                                    $ranking[$id_piloto] = $puntos;
                                                } else {
                                                    $ranking[$id_piloto] += $puntos;
                                                }
                                            }
                                        }
                                        if (empty($ranking)) {
                                            echo "<p>No hay resultados para la temporada " . htmlspecialchars($año_temporada) . ".</p>";
                                        }else{
                                            echo "<p><strong>Ranking de la temporada " . htmlspecialchars($año_temporada) . "</strong></p>";
                                            // 5. Ordenar el ranking por puntos en orden descendente
                                            arsort($ranking);
                                            $csv_data = [];

                                            // 6. Mostrar el ranking
                                            $posicion = 1;
                                            foreach ($ranking as $id_piloto => $puntos) {
                                                // Obtener información del piloto
                                                $table = 'pilotos';
                                                $columns = ['nombre', 'apellido', 'id_equipo_actual'];
                                                $conditions = ['id_piloto' => $id_piloto];
                                                $piloto = $db->select($table, $columns, $conditions);

                                                // Obtener información del equipo
                                                $table = 'equipos';
                                                $columns = ['nombre'];
                                                $conditions = ['id_equipo' => $piloto[0]['id_equipo_actual']];
                                                $equipo = $db->select($table, $columns, $conditions);

                                                echo "<p>Posición: {$posicion}, Piloto: {$piloto[0]['nombre']} {$piloto[0]['apellido']}, Equipo: {$equipo[0]['nombre']}, Puntos: {$puntos}\n</p>";
                                                    
                                                // Agregar los datos al arreglo para el CSV
                                                $csv_data[] = [
                                                    'Posición' => $posicion,
                                                    'Piloto' => $piloto[0]['nombre'] . ' ' . $piloto[0]['apellido'],
                                                    'Equipo' => $equipo[0]['nombre'],
                                                    'Puntos' => $puntos
                                                ];

                                                $posicion++;
                                            }
                                            $_SESSION['csv_data'] = $csv_data;
                                            $_SESSION['csv_title'] = "Ranking de la temporada " . htmlspecialchars($año_temporada);
                                        }
                                    }
                                }
                            }
                        } catch (Exception $e) {
                            echo "Error: " . $e->getMessage();
                        }
                        break;

                        case 'verTodosCircuitos':
                            try {
                                $table = 'circuitos';
                                $columns = ['nombre', 'pais', 'ciudad', 'longitud', 'tipo', 'capacidad', 'descripcion'];
                                $result = $db->select($table, $columns);
                                if (empty($result)) {
                                    echo "<p>No se encontraron circuitos.</p>";
                                }else{
                                    $csv_data = [];
                                    echo "<p><strong>Circuitos</strong></p>";
                                    foreach ($result as $row) {
                                        echo "<p>Circuito: {$row['nombre']}, País: {$row['pais']}, Ciudad: {$row['ciudad']}, Longitud(m): {$row['longitud']}, Tipo: {$row['tipo']}, Capacidad: {$row['capacidad']}, Descripción: {$row['descripcion']}\n</p>";
                                        $csv_data[] = [
                                            'Circuito' => $row['nombre'],
                                            'País' => $row['pais'],
                                            'Ciudad' => $row['ciudad'],
                                            'Longitud' => $row['longitud'],
                                            'Tipo' => $row['tipo'],
                                            'Capacidad' => $row['capacidad'],
                                            'Descripción' => $row['descripcion']
                                        ];
                                    }
                                    $_SESSION['csv_data'] = $csv_data;
                                    $_SESSION['csv_title'] = "Circuitos";
                                }
                            } catch (Exception $e) {
                                echo "Error: " . $e->getMessage();
                            }
                            break;
                        case 'verTodosEquipos':
                            try {
                                $table = 'equipos';
                                $columns = ['nombre', 'fundacion', 'pais', 'presupuesto'];
                                $result = $db->select($table, $columns);
                                if (empty($result)) {
                                    echo "<p>No se encontraron equipos.</p>";
                                }else{
                                    $csv_data = [];
                                    echo "<p><strong>Equipos</strong></p>";
                                    foreach ($result as $row) {
                                        echo "<p>Equipo: {$row['nombre']}, Fundación: {$row['fundacion']}, País: {$row['pais']}, Presupuesto($): {$row['presupuesto']}\n</p>";
                                        $csv_data[] = [
                                            'Equipo' => $row['nombre'],
                                            'Fundación' => $row['fundacion'],
                                            'País' => $row['pais'],
                                            'Presupuesto' => $row['presupuesto']
                                        ];
                                    }
                                    $_SESSION['csv_data'] = $csv_data;
                                    $_SESSION['csv_title'] = "Equipos";
                                }
                            } catch (Exception $e) {
                                echo "Error: " . $e->getMessage();
                            }
                            break;
                        case 'verTodasTemporadas':
                            try {
                                $table = 'temporadas';
                                $columns = ['año', 'descripcion'];
                                $result = $db->select($table, $columns);
                                if (empty($result)) {
                                    echo "<p>No se encontraron temporadas.</p>";
                                }else{
                                    $csv_data = [];
                                    echo "<p><strong>Temporadas</strong></p>";
                                    foreach ($result as $row) {
                                        echo "<p>Temporada: {$row['año']}, Descripción: {$row['descripcion']}\n</p>";
                                        $csv_data[] = [
                                            'Temporada' => $row['año'],
                                            'Descripción' => $row['descripcion']
                                        ];
                                    }
                                    $_SESSION['csv_data'] = $csv_data;
                                    $_SESSION['csv_title'] = "Temporadas";
                                }
                            } catch (Exception $e) {
                                echo "Error: " . $e->getMessage();
                            }
                            break;
                        case 'verTodasCarreras':
                            try {
                                $table = 'carreras';
                                $columns = ['nombre', 'fecha', 'id_circuito', 'id_temporada'];
                                $result = $db->select($table, $columns);
                                if (empty($result)) {
                                    echo "<p>No se encontraron carreras.</p>";
                                }else{
                                    $csv_data = [];
                                    echo "<p><strong>Carreras</strong></p>";
                                    foreach ($result as $row) {
                                        $table = 'circuitos';
                                        $columns = ['nombre'];
                                        $conditions = ['id_circuito' => $row['id_circuito']];
                                        $circuitos = $db->select($table, $columns, $conditions);

                                        $table = 'temporadas';
                                        $columns = ['año'];
                                        $conditions = ['id_temporada' => $row['id_temporada']];
                                        $temporadas = $db->select($table, $columns, $conditions);
                                        if (!empty($circuitos) && !empty($temporadas)) {
                                            echo "<p>Carrera: {$row['nombre']}, Fecha: {$row['fecha']}, Circuito: {$circuitos[0]['nombre']}, Temporada: {$temporadas[0]['año']}\n</p>";
                                            $csv_data[] = [
                                                'Carrera' => $row['nombre'],
                                                'Fecha' => $row['fecha'],
                                                'Circuito' => $circuitos[0]['nombre'],
                                                'Temporada' => $temporadas[0]['año']
                                            ];
                                        }
                                    }
                                    $_SESSION['csv_data'] = $csv_data;
                                    $_SESSION['csv_title'] = "Carreras";
                                }
                            } catch (Exception $e) {
                                echo "Error: " . $e->getMessage();
                            }
                            break;
                        
                    
                        default:
                            echo "<p>Acción no reconocida.</p>";
                }
                echo "<p></p>";
                // Generar el formulario dinámicamente con PHP
                echo'<form method="post" enctype="multipart/form-data">';
                // Importar Datos desde CSV
                echo '<fieldset>';
                echo '<legend>Importar Datos desde CSV</legend>';
                echo '<label>Seleccionar archivo CSV:</label>';
                echo '<input type="file" name="import_file" accept=".csv">';
                echo '<button type="submit" name="action" value="import_csv">Importar</button>';
                echo '</fieldset>';
                

                // Exportar Datos a CSV
                echo '<fieldset>';
                echo '<legend>Exportar Datos a CSV</legend>';
                echo '<button type="submit" name="action" value="export_csv">Exportar</button>';
                echo '</fieldset>';


                // Botones de consultas predefinidas
                echo '<fieldset>';
                echo '<legend>Consultas Rápidas</legend>';
                
                // Consultas sobre circuitos
                echo '<h4>Consultas sobre circuitos</h4>';
                echo '<button type="submit" name="action" value="verTodosCircuitos">Ver todos los circuitos</button>';

                // Consultas sobre equipos
                echo '<h4>Consultas sobre equipos</h4>';
                echo '<button type="submit" name="action" value="verTodosEquipos">Ver todos los equipos</button>';

                // Consultas sobre pilotos
                echo '<h4>Consultas sobre pilotos</h4>';
                echo '<button type="submit" name="action" value="verTodosPilotos">Ver todos los pilotos</button>';
                echo '<button type="submit" name="action" value="verPilotosPorEquipo">Ver pilotos por equipo...</button>';
                echo '<textarea id="nombre_equipo_de_pilotos" name="nombre_equipo_de_pilotos" placeholder="Introduce el nombre del equipo"></textarea>';
                echo '<button type="submit" name="action" value="verResultadosDePiloto">Ver resultados de piloto...</button>';
                echo '<textarea id="nombre_piloto_para_resultados" name="nombre_piloto_para_resultados" placeholder="Introduce el nombre y apellidos del piloto"></textarea>';

                // Consultas sobre temporadas
                echo '<h4>Consultas sobre temporadas</h4>';
                echo '<button type="submit" name="action" value="verTodasTemporadas">Ver todas las temporadas</button>';
                echo '<button type="submit" name="action" value="verCarrerasTemporada">Ver detalles de temporada...</button>';
                echo '<textarea id="año_temporada_para_carreras" name="año_temporada_para_carreras" placeholder="Introduce el año de la temporada"></textarea>';
                echo '<button type="submit" name="action" value="verRankingTemporada">Ver ranking de temporada</button>';
                echo '<textarea id="año_temporada_para_ranking" name="año_temporada_para_ranking" placeholder="Introduce el año de la temporada"></textarea>';

                // Consultas sobre carreras
                echo '<h4>Consultas sobre carreras</h4>';
                echo '<button type="submit" name="action" value="verTodasCarreras">Ver todas las carreras</button>';
                echo '<button type="submit" name="action" value="verParticipantesCarrera">Ver resultados carrera...</button>';
                echo '<textarea id="carrera_año_para_participantes" name="carrera_año_para_participantes" placeholder="Introduce el nombre de la carrera y el año en formato: Nombre carrera, año temporada"></textarea>';
               

                // Consultas sobre resultados
                echo '<h4>Consultas sobre resultados</h4>';
                echo '<button type="submit" name="action" value="verTodosResultados">Ver todos los resultados</button>';

                
                



                echo '</fieldset>';

                echo '</form>';
                $db->close();
            }else{
                echo '<form method="post" enctype="multipart/form-data">';
                
                // Crear Base de Datos y Tablas
                echo '<fieldset">';
                echo '<legend>1º-Crear Base de Datos y Tablas</legend>';
                echo '<button type="submit" name="action" value="create_db">Crear</button>';
                echo '</fieldset>';
                echo '</form>';
            }

            ?>
        </section>
    </main>
</body>
</html>
