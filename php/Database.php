<?php

require_once 'config.php';

class Database {
    private $connection;

    public function __construct() {
        // Conectamos a MySQL sin especificar base de datos
        $this->connection = new mysqli(DB_HOST, DB_USER, DB_PASS);

        if ($this->connection->connect_error) {
            throw new Exception("Error de conexión: " . $this->connection->connect_error);
        }

        // Intentamos seleccionar la base de datos
        if (!$this->connection->select_db(DB_NAME)) {
            // Si no existe, la creamos
            $createDbQuery = "CREATE DATABASE " . DB_NAME;
            if (!$this->connection->query($createDbQuery)) {
                throw new Exception("Error creando la base de datos: " . $this->connection->error);
            }

            // Seleccionamos la base de datos recién creada
            if (!$this->connection->select_db(DB_NAME)) {
                throw new Exception("Error seleccionando la base de datos: " . $this->connection->error);
            }
        }
    }
    
    
    

    private function determineTypes($params) {
        // Verificar el tipo de cada parámetro y devolver el tipo correspondiente para cada uno
        $types = [];
    
        foreach ($params as $p) {
            // Si el parámetro es null, tratamos como string por defecto (esto puede ajustarse si tienes reglas específicas para null)
            if (is_null($p)) {
                $types[] = 's'; // Usamos 's' para null, pero ajusta esto si tienes otra lógica
            }
            // Si es un entero
            elseif (is_int($p)) {
                $types[] = 'i';
            }
            // Si es un número flotante
            elseif (is_double($p) || is_float($p)) {
                $types[] = 'd';
            }
            // Si es una cadena de texto
            else {
                $types[] = 's';
            }
        }
    
        // Devolver el array con los tipos
        return implode('', $types);
    }
    
    

    public function executePrepared($query, $params = []) {
        $stmt = $this->connection->prepare($query);
        if ($stmt === false) {
            throw new Exception("Error preparando la consulta: " . $this->connection->error);
        }
        // Si hay parámetros, los pasamos; si no, ejecutamos directamente la consulta
        if (!empty($params)) {
            $types = $this->determineTypes($params);  // Determina los tipos de los parámetros
            $stmt->bind_param($types, ...$params);     // Vincula los parámetros
        }
    
        // Ejecuta la consulta
        $stmt->execute();
        if ($stmt->error) {
            throw new Exception("Error ejecutando la consulta: " . $stmt->error);
        }
    
        return $stmt; // Devuelve el objeto $stmt para su posterior uso
    }
    

    public function select($table, $columns = ['*'], $conditions = [], $params = [], $resultType = MYSQLI_ASSOC) {
        // Si no hay columnas específicas, usamos '*' por defecto
        $columnsStr = implode(', ', $columns);
        $query = "SELECT $columnsStr FROM $table"; // Consulta sin condiciones
        // Si hay condiciones, agregamos el WHERE a la consulta
        if (!empty($conditions)) {
            $query .= " WHERE " . implode(' AND ', array_map(fn($c) => "$c = ?", array_keys($conditions)));
            // Aseguramos que los valores de las condiciones se pasen en $params
            $params = array_merge($params, array_values($conditions));
        }

    
        // Si no hay parámetros, no los pasamos en la ejecución
        if (empty($params)) {
            $stmt = $this->executePrepared($query);
        } else {
            $stmt = $this->executePrepared($query, $params);
        }
    
        // Obtener el resultado de la consulta
        $result = $stmt->get_result();
        return $result->fetch_all($resultType);
    }
    

    public function insert($table, $data) {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));

        $query = "INSERT INTO $table ($columns) VALUES ($placeholders)";
        $this->executePrepared($query, array_values($data));

        return $this->connection->insert_id;
    }

    public function update($table, $data, $conditions) {
        $setClause = implode(', ', array_map(fn($c) => "$c = ?", array_keys($data)));
        $whereClause = implode(' AND ', array_map(fn($c) => "$c = ?", array_keys($conditions)));

        $query = "UPDATE $table SET $setClause WHERE $whereClause";
        $this->executePrepared($query, array_merge(array_values($data), array_values($conditions)));

        return true;
    }

    public function delete($table, $conditions) {
        $whereClause = implode(' AND ', array_map(fn($c) => "$c = ?", array_keys($conditions)));

        $query = "DELETE FROM $table WHERE $whereClause";
        $this->executePrepared($query, array_values($conditions));

        return true;
    }

    public function getConnection() {
        return $this->connection;
    }

    public function close() {
        $this->connection->close();
    }

    public function beginTransaction() {
        $this->connection->begin_transaction();
    }

    public function commitTransaction() {
        $this->connection->commit();
    }

    public function rollbackTransaction() {
        $this->connection->rollback();
    }
}

?>
