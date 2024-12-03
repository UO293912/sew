class Noticias {
    constructor() {
        // Verificar si el navegador soporta la API File
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            document.write("<p>Este navegador soporta el API File </p>");
        } else {
            document.write("<p>¡¡¡ Este navegador NO soporta el API File y este programa puede no funcionar correctamente !!!</p>");
        }

        // Seleccionamos el contenedor de noticias una sola vez
        this.newsContainer = document.querySelector('main > section');
    }

    // Función para leer el archivo
    readInputFile(files) {
        const file = files[0]; // Obtiene el primer archivo seleccionado
        if (file) {
            const reader = new FileReader(); // Crea un lector de archivos

            // Usamos la sintaxis correcta de evento
            reader.onload = (event) => {
                const fileContent = event.target.result; // Contenido del archivo
                const lines = fileContent.split('\n'); // Divide el contenido en líneas
                this.newsContainer.innerHTML = '<h2>Noticias</h2>'; // Limpia el contenido anterior

                // Itera sobre las líneas y procesa el contenido
                lines.forEach((line, index) => {
                    const parts = line.trim().split('_'); // Divide la línea por el separador "_"
                    if (parts.length === 3) {
                        const [titular, entradilla, autor] = parts;
                        this.displayNews(titular, entradilla, autor);
                    } else {
                        console.warn(`Línea mal formateada en el índice ${index}: ${line}`);
                    }
                });

                // Muestra el formulario de añadir noticia
                this.showAddNewsForm();
            };

            reader.onerror = () => {
                alert('Error al leer el archivo.');
            };

            reader.readAsText(file); // Lee el archivo como texto
        } else {
            alert('No se seleccionó ningún archivo.');
        }
    }

    // Función para mostrar la noticia en el DOM
    displayNews(titular, entradilla, autor) {
        // Crear el elemento de la noticia (article)
        const newsItem = document.createElement('article');

        // Crear el título de la noticia
        const titleElement = document.createElement('h3');
        titleElement.textContent = titular;

        // Crear el párrafo para la entradilla
        const introElement = document.createElement('p');
        introElement.innerHTML = `<strong>Entradilla:</strong> ${entradilla}`;

        // Crear el párrafo para el autor
        const authorElement = document.createElement('p');
        authorElement.innerHTML = `<strong>Autor:</strong> ${autor}`;

        // Añadir los elementos al artículo
        newsItem.appendChild(titleElement);
        newsItem.appendChild(introElement);
        newsItem.appendChild(authorElement);

        // Añadir la noticia **antes** del formulario
        const form = this.newsContainer.querySelector('form');
        if (form) {
            this.newsContainer.insertBefore(newsItem, form); // Inserta la noticia antes del formulario
        } else {
            this.newsContainer.appendChild(newsItem); // Si el formulario aún no está, la coloca al final
        }
    }

    // Función para mostrar el formulario de añadir noticia
    showAddNewsForm() {
        // Verificar si el formulario ya está presente
        if (!this.newsContainer.querySelector('form')) {
            // Crear el formulario de añadir noticia
            const form = document.createElement('form');

            // Crear los campos del formulario sin usar `id` o `class`
            form.innerHTML = `
                <label for="titular">Titular:</label>
                <textarea required></textarea><br><br>

                <label for="entradilla">Entradilla:</label>
                <textarea required></textarea><br><br>

                <label for="autor">Autor:</label>
                <textarea required></textarea><br><br>

                <button type="submit">Añadir noticia</button>
            `;

            // Añadir el formulario al contenedor de noticias
            this.newsContainer.appendChild(form);

            // Añadir el evento de submit para manejar la adición de noticia
            form.addEventListener('submit', (event) => {
                event.preventDefault(); // Evita la recarga de la página

                const textareas = form.querySelectorAll('textarea');
                const titular = textareas[0].value;
                const entradilla = textareas[1].value;
                const autor = textareas[2].value;

                // Llamar a la función para mostrar la nueva noticia
                this.displayNews(titular, entradilla, autor);

                // Limpiar los campos del formulario
                form.reset();
            });
        }
    }
}
