// Definición de la clase Agenda
class Agenda {
  constructor() {
    // URL para consultar las carreras de la temporada actual en formato JSON
    this.apiUrl = "https://ergast.com/api/f1/current.json";
  }

  // Método para realizar la consulta a la API para obtener las carreras de la temporada actual
  fetchRaces(callback) {
    // Usamos el objeto XMLHttpRequest para la consulta AJAX (sin jQuery)
    const xhr = new XMLHttpRequest();
    xhr.open("GET", this.apiUrl, true);
    xhr.responseType = "json";

    xhr.onload = () => {
      if (xhr.status === 200) {
        const races = xhr.response?.MRData?.RaceTable?.Races || [];
        callback(races);  // Llamamos al callback con la lista de carreras
      } else {
        console.error("Error al realizar la consulta AJAX: ", xhr.status);
        callback([]);  // Llamamos al callback con un arreglo vacío en caso de error
      }
    };

    xhr.onerror = () => {
      console.error("Error al realizar la consulta AJAX");
      callback([]);  // Llamamos al callback con un arreglo vacío en caso de error
    };

    xhr.send();
  }

  // Método para renderizar las carreras en el HTML
  renderRaces(races) {
    const container = document.querySelector("main section"); // Selecciona el contenedor de las carreras

    // Limpia el contenedor antes de agregar nuevas carreras
    container.innerHTML = "<h2>Calendario de carreras de la temporada actual</h2>";

    // Recorre las carreras y genera la estructura HTML
    races.forEach(race => {
      const { raceName, Circuit, date, time } = race;
      const { circuitName, Location } = Circuit;
      const { lat, long, locality, country } = Location;

      // Formato de fecha y hora
      const raceDate = new Date(date + "T" + time).toLocaleString();

      // Crear un elemento section para la carrera
      const raceElement = document.createElement("section");
      raceElement.classList.add("race");

      // Añadir el contenido de la carrera
      raceElement.innerHTML = `
        <h3>${raceName}</h3>
        <p><strong>Circuito:</strong> ${circuitName}</p>
        <p><strong>Ubicación:</strong> ${locality}, ${country}</p>
        <p><strong>Coordenadas:</strong> Latitud ${lat}, Longitud ${long}</p>
        <p><strong>Fecha y Hora:</strong> ${raceDate}</p>
      `;

      // Añadir al contenedor
      container.appendChild(raceElement);
    });
  }

  // Método principal que combina la obtención y renderización de las carreras
  showRaces() {
    this.fetchRaces(races => {
      this.renderRaces(races);
    });
  }
}

// Función que se ejecuta cuando el documento está listo (sin usar jQuery)
document.addEventListener("DOMContentLoaded", () => {
  const agenda = new Agenda(); // Creamos la instancia de Agenda

  // Asignamos el evento click al botón
  const button = document.querySelector("main section button");
  if (button) {
    button.addEventListener("click", () => {
      agenda.showRaces(); // Llamamos al método para mostrar las carreras cuando se hace clic en el botón
    });
  }
});
