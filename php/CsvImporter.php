<?php

class CSVImporter {
    private $db;

    // Constructor que recibe la instancia de la clase Database
    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Importa los datos de un archivo CSV a una tabla.
     *
     * @param string $filePath Ruta del archivo CSV
     * @param string $table Nombre de la tabla donde insertar los datos
     * @throws Exception Si no se puede abrir el archivo CSV o ocurre un error en la inserción
     */
    public function import($filePath, $table) {
        if (($handle = fopen($filePath, "r")) !== FALSE) {
            // Leer los encabezados
            $headers = fgetcsv($handle, 1000, ",");
            if (!$headers) {
                throw new Exception("El archivo CSV no tiene encabezados.");
            }
    
            // Leer el resto de las filas y realizar la inserción
            while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                // Verificar que el número de columnas coincida
                if (count($data) !== count($headers)) {
                    throw new Exception("El número de columnas en la fila no coincide con el número de encabezados.");
                }
    
                // Crear la consulta de inserción dinámica
                $columns = implode(",", $headers);
                $placeholders = implode(",", array_fill(0, count($data), "?"));
                $query = "INSERT INTO $table ($columns) VALUES ($placeholders)";
                
                // Depuración: imprimir la consulta y los datos
                echo "Consulta: $query\n";
                echo "Datos: " . implode(", ", $data) . "\n";
    
                try {
                    // Insertar los datos utilizando la clase Database
                    $this->db->executePrepared($query, $data);
                } catch (Exception $e) {
                    // Manejar errores de inserción
                    echo "Error al insertar en la tabla $table: " . $e->getMessage();
                }
            }
            fclose($handle);
        } else {
            throw new Exception("No se pudo abrir el archivo: $filePath");
        }
    }
    

    /**
     * Importa los datos de un archivo CSV en múltiples tablas (si está estructurado así).
     *
     * @param string $filePath Ruta del archivo CSV
     * @throws Exception Si ocurre un error en la inserción
     */
    public function importDatabase($filePath) {
        $csvData = file_get_contents($filePath);
        $tablesData = $this->parseCSVForDatabase($csvData);

        // Modificación de la función para comprobar antes de insertar
        foreach ($tablesData as $table => $rows) {
            foreach ($rows as $row) {
                // Crear una condición de búsqueda basada en los valores de la fila (comprobamos si existe al 100%)
                $conditions = [];
                foreach ($row as $column => $value) {
                    // Para comprobar, asumimos que el nombre de la columna y el valor deben coincidir
                    $conditions[$column] = $value;
                }
                

                // Verificar si las condiciones están vacías
                if (empty($conditions)) {
                    // Si no hay condiciones, no pasamos parámetros al `select`
                    $existingData = $this->db->select($table);
                } else {
                    // Si hay condiciones, pasamos los valores de las condiciones
                    $existingData = $this->db->select($table, ['*'], $conditions);
                }

                // Si no existe el dato (el array está vacío), se realiza la inserción
                if (empty($existingData)) {
                    try {
                        // Insertar la fila usando la clase Database
                        $this->db->insert($table, $row);
                    } catch (Exception $e) {
                        // Manejar errores por tabla
                        echo "Error al insertar en la tabla $table: " . $e->getMessage() . "\n";
                    }
                } 
            }
        }
    }

    /**
     * Parsea los datos del CSV y los organiza en tablas.
     *
     * @param string $csvData Contenido del archivo CSV
     * @return array Datos organizados por tabla
     * @throws Exception Si los encabezados no coinciden con el número de columnas
     */
    private function parseCSVForDatabase($csvData) {
        // Utiliza una expresión regular para manejar distintos tipos de saltos de línea
        $lines = preg_split('/\r\n|\n|\r/', $csvData);
        $parsedData = [];
        $currentTable = null;
        $headers = [];
    
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;  // Ignorar líneas vacías
    
            // Detectar nueva tabla
            if (strpos($line, "[") === 0 && strpos($line, "]") === (strlen($line) - 1)) {
                $currentTable = trim($line, "[]");
                $parsedData[$currentTable] = [];
                $headers = [];  // Reiniciar encabezados al cambiar de tabla
            } elseif ($currentTable) {
                // Procesar filas de la tabla actual
                $row = str_getcsv($line);
                
                // Si es la primera fila de datos, establecer los encabezados
                if (empty($parsedData[$currentTable]) && empty($headers)) {
                    $headers = $row;
                } else {
                    // Verificar que la cantidad de columnas coincida con los encabezados
                    if (count($headers) !== count($row)) {
                        throw new Exception("El número de columnas no coincide con los encabezados en la tabla '$currentTable'. Fila: " . json_encode($row));
                    }
                    // Crear fila asociativa usando los encabezados
                    $parsedData[$currentTable][] = array_combine($headers, $row);
                }
            }
        }
    
        return $parsedData;
    }
    
}


?>
