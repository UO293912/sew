<?php
class DBSetup {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function createTables() {
        $queries = [
            "CREATE TABLE IF NOT EXISTS Equipos (
                id_equipo INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL,
                fundacion YEAR NOT NULL,
                pais VARCHAR(50) NOT NULL,
                presupuesto DECIMAL(15,2) NOT NULL
            )",
            "CREATE TABLE IF NOT EXISTS Pilotos (
                id_piloto INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL,
                apellido VARCHAR(50) NOT NULL,
                fecha_nacimiento DATE NOT NULL,
                nacionalidad VARCHAR(50) NOT NULL,
                id_equipo_actual INT,
                FOREIGN KEY (id_equipo_actual) REFERENCES Equipos(id_equipo)
            )",
            "CREATE TABLE IF NOT EXISTS Temporadas (
                id_temporada INT AUTO_INCREMENT PRIMARY KEY,
                año INT NOT NULL UNIQUE, 
                descripcion VARCHAR(255) NOT NULL
            )",
            "CREATE TABLE IF NOT EXISTS Circuitos (
                id_circuito INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                pais VARCHAR(50) NOT NULL,
                ciudad VARCHAR(50) NOT NULL,
                longitud INT NOT NULL,
                tipo VARCHAR(50) NOT NULL,
                capacidad INT NOT NULL,
                descripcion TEXT                  
            )",
            "CREATE TABLE IF NOT EXISTS Carreras (
                id_carrera INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                fecha DATE NOT NULL,
                id_circuito INT NOT NULL,
                id_temporada INT NOT NULL,
                FOREIGN KEY (id_circuito) REFERENCES Circuitos(id_circuito),
                FOREIGN KEY (id_temporada) REFERENCES Temporadas(id_temporada)
            )",
            "CREATE TABLE IF NOT EXISTS Resultados (
                id_resultado INT AUTO_INCREMENT PRIMARY KEY,
                id_piloto INT NOT NULL,
                id_carrera INT NOT NULL,
                posicion INT NOT NULL,
                puntos DECIMAL(5, 2) DEFAULT NULL,
                tiempo TIME DEFAULT NULL,
                FOREIGN KEY (id_piloto) REFERENCES Pilotos(id_piloto),
                FOREIGN KEY (id_carrera) REFERENCES Carreras(id_carrera)
            )"
        ];
        foreach ($queries as $query) {
            $this->db->executePrepared($query);
        }
    }
}
?>

