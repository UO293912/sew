# -*- coding: utf-8 -*-
"""
Created on Mon Oct 28 13:39:09 2024

@author: nicol
"""
import xml.etree.ElementTree as ET

class Kml(object):
    """
    Genera archivo KML con puntos y líneas
    """
    def __init__(self):
        """
        Crea el elemento raíz y el espacio de nombres
        """
        self.raiz = ET.Element('kml', xmlns="http://www.opengis.net/kml/2.2")
        self.doc = ET.SubElement(self.raiz, 'Document')

    def addPlacemark(self, nombre, descripcion, long, lat):
        """
        Añade un elemento <Placemark> con puntos <Point>
        """
        pm = ET.SubElement(self.doc, 'Placemark')
        ET.SubElement(pm, 'name').text = nombre
        ET.SubElement(pm, 'description').text = descripcion
        punto = ET.SubElement(pm, 'Point')
        ET.SubElement(punto, 'coordinates').text = f"{long},{lat}"

    def addLineString(self, nombre, extrude, tesela, listaCoordenadas, color, ancho):
        """
        Añade un elemento <Placemark> con líneas <LineString>
        """
        pm = ET.SubElement(self.doc, 'Placemark')
        ET.SubElement(pm, 'name').text = nombre
        ls = ET.SubElement(pm, 'LineString')
        ET.SubElement(ls, 'extrude').text = extrude
        ET.SubElement(ls, 'tessellation').text = tesela
        ET.SubElement(ls, 'coordinates').text = listaCoordenadas

        estilo = ET.SubElement(pm, 'Style')
        linea = ET.SubElement(estilo, 'LineStyle')
        ET.SubElement(linea, 'color').text = color
        ET.SubElement(linea, 'width').text = ancho

    def escribir(self, nombreArchivoKML):
        """
        Escribe el archivo KML con declaración y codificación
        """
        arbol = ET.ElementTree(self.raiz)
        arbol.write(nombreArchivoKML, encoding='utf-8', xml_declaration=True)

class CircuitoManager:
    """
    Clase para manejar el XML del circuito.
    """
    def __init__(self, xml_file):
        self.tree = ET.parse(xml_file)
        self.root = self.tree.getroot()
        self.circuito = None

    def cargar_circuito(self):
        """
        Carga el circuito del XML.
        """
        for circuito in self.root.findall('{http://www.uniovi.es}circuito'):
            nombre = circuito.get('nombre')
            self.circuito = nombre  # Guardamos el nombre del circuito

            coordenadas = []
            # Inicializamos la variable para guardar la coordenada centro
            centro = circuito.find('{http://www.uniovi.es}coordenadasCentro')
            longitud = centro.get('longitud')
            latitud = centro.get('latitud')
            # Formatear las coordenadas para el KML
            coordenadas.append(f"{longitud},{latitud}")

            # Añadir un marcador para cada punto
            descripcion = f"Longitud: {longitud}, Latitud: {latitud}"
            kml.addPlacemark("Inicio", descripcion, longitud, latitud)

            for i, tramo in enumerate(circuito.find('{http://www.uniovi.es}tramos')):
                longitud = tramo.get('longitud')
                latitud = tramo.get('latitud')

                # Formatear las coordenadas para el KML
                coordenadas.append(f"{longitud},{latitud}")

                # Añadir un marcador para cada punto
                '''
                if i<44:
                    descripcion = f"Longitud: {longitud}, Latitud: {latitud}"
                    kml.addPlacemark(f"Tramo {i + 1}", descripcion, longitud, latitud)
                '''

            # Crear la línea que conecta todos los tramos
            kml.addLineString(f"Ruta {self.circuito}", "1", "1", '\n'.join(coordenadas), '#ff0000ff', '2')

def main():
    # Cargar el XML y crear el archivo KML
    xml_file = 'circuitoEsquema.xml'
    nombreKML = 'circuito.kml'

    global kml
    kml = Kml()
    manager = CircuitoManager(xml_file)
    manager.cargar_circuito()

    # Escribir el archivo KML
    kml.escribir(nombreKML)
    print(f"Creado el archivo: {nombreKML}")

if __name__ == "__main__":
    main()
