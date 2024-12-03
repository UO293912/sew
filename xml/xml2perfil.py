# -*- coding: utf-8 -*-
"""
Created on Mon Oct 28 13:39:09 2024

@author: nicol
"""
import xml.etree.ElementTree as ET

class SVG:
    """
    Genera un archivo SVG con puntos, líneas y etiquetas de altura adaptable al viewport.
    """
    def __init__(self, width="100%", height="100%", viewBox="0 0 1920 1080"):
        # Usamos width y height al 100% para que el SVG ocupe el tamaño completo del viewport
        self.width = width
        self.height = height
        self.viewBox = viewBox  # Definimos un viewBox para mantener la proporción de dibujo
        self.elements = []

    def add_circle(self, cx, cy, r, color="black", stroke="none", stroke_width="1"):
        """
        Añade un círculo para representar un punto
        """
        circle = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{color}" stroke="{stroke}" stroke-width="{stroke_width}" />'
        self.elements.append(circle)

    def add_line(self, x1, y1, x2, y2, color="black", width="2"):
        """
        Añade una línea entre dos puntos
        """
        line = f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}" />'
        self.elements.append(line)

    def add_text(self, x, y, text, color="black", font_size="12", position="top"):
        """
        Añade texto para mostrar la altura en cada punto; posición arriba o abajo
        """
        offset = -10 if position == "top" else 20
        text_element = f'<text x="{x}" y="{y + offset}" fill="{color}" font-size="{font_size}" text-anchor="middle">{text}</text>'
        self.elements.append(text_element)

    def escribir(self, nombreArchivoSVG):
        """
        Escribe el archivo SVG con todos los elementos agregados
        """
        svg_content = f'<svg width="{self.width}" height="{self.height}" viewBox="{self.viewBox}" xmlns="http://www.w3.org/2000/svg">\n'
        svg_content += "\n".join(self.elements)
        svg_content += "\n</svg>"

        # Guardar el SVG en un archivo
        with open(nombreArchivoSVG, "w") as file:
            file.write(svg_content)
        print(f"Creado el archivo SVG: {nombreArchivoSVG}")

class CircuitoManager:
    """
    Clase para manejar el XML del circuito y crear el SVG
    """
    def __init__(self, xml_file, svg_width="100%", svg_height="100%", viewBox="0 0 1920 1080"):
        self.tree = ET.parse(xml_file)
        self.root = self.tree.getroot()
        self.svg = SVG(svg_width, svg_height, viewBox)
        self.circuito = None

    def cargar_circuito(self):
        """
        Carga el circuito desde el XML y dibuja puntos, etiquetas y líneas en SVG.
        Agrega puntos adicionales al inicio y final en la misma posición X que sus puntos adyacentes,
        reflejando una diferencia de altura en el eje Y.
        """
        puntos = []
        idx = 0
        max_altura = 880  # Ajustado dentro del viewBox
        x_margin = 50  # Margen izquierdo dentro del viewBox
        x_increment = 40  # Separación horizontal ajustada
        altitud_scale = 40  # Factor de escala para acentuar los cambios de altitud
    
        last_altitud = None
    
        # Procesar los tramos del XML
        tramos = self.root.findall('{http://www.uniovi.es}circuito/{http://www.uniovi.es}tramos/{http://www.uniovi.es}tramo')
        altitudes = [float(tramo.get('altitud', '0')) for tramo in tramos]
    
        # Comprobar si hay suficientes datos para procesar
        if len(altitudes) < 2:
            print("No hay suficientes puntos en el circuito para generar el perfil.")
            return
    
        # Añadir un punto inicial adicional (diferencia en altura)
        x_initial = x_margin  # Misma posición X que el primer punto
        y_initial = max_altura - (altitudes[0] - 10) * altitud_scale  # Altura más baja que el primer punto
        self.svg.add_circle(x_initial, y_initial, 4, color="red")  # Punto inicial adicional
        self.svg.add_text(x_initial, y_initial, f"{altitudes[0] - 10}m", color="red", font_size="12", position="bottom")
        puntos.append((x_initial, y_initial))
    
        # Procesar los puntos reales
        for altitud in altitudes:
            x = x_margin + idx * x_increment
            y = max_altura - altitud * altitud_scale
            self.svg.add_circle(x, y, 4, color="blue")
    
            # Etiqueta si cambia altitud
            if altitud != last_altitud:
                pos = "bottom" if idx > 0 and y > puntos[-1][1] else "top"
                self.svg.add_text(x, y, f"{altitud}m", color="black", font_size="12", position=pos)
                last_altitud = altitud
    
            puntos.append((x, y))
            idx += 1
    
        # Añadir un punto final adicional (diferencia en altura)
        x_final = x_margin + (idx - 1) * x_increment  # Misma posición X que el último punto
        y_final = max_altura - (altitudes[-1] - 10) * altitud_scale  # Altura más baja que el último punto
        self.svg.add_circle(x_final, y_final, 4, color="red")  # Punto final adicional
        self.svg.add_text(x_final, y_final, f"{altitudes[-1] - 10}m", color="red", font_size="12", position="bottom")
        puntos.append((x_final, y_final))
    
        # Dibujar líneas entre todos los puntos (incluidos los adicionales)
        for i in range(len(puntos) - 1):
            x1, y1 = puntos[i]
            x2, y2 = puntos[i + 1]
            self.svg.add_line(x1, y1, x2, y2, color="black")

    
    
            # Conectar el punto final con el inicial para cerrar el circuito
            if len(puntos) > 1:
                x1, y1 = puntos[0]
                x2, y2 = puntos[-1]
                self.svg.add_line(x2, y2, x1, y1, color="black", width="2")

def main():
    # Cargar el XML y crear el archivo SVG
    xml_file = 'circuitoEsquema.xml'
    nombreSVG = 'perfil.svg'

    manager = CircuitoManager(xml_file)
    manager.cargar_circuito()

    # Escribir el archivo SVG
    manager.svg.escribir(nombreSVG)

if __name__ == "__main__":
    main()

