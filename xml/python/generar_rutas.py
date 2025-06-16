#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador de archivos KML y SVG a partir de datos XML de rutas
Proyecto Siero - Sistema de Rutas Turísticas
"""

import xml.etree.ElementTree as ET
import os
from math import sqrt

class GeneradorRutas:
    def __init__(self, archivo_xml):
        """
        Inicializa el generador con el archivo XML de rutas
        """
        self.archivo_xml = archivo_xml
        self.tree = ET.parse(archivo_xml)
        self.root = self.tree.getroot()
        
    def generar_kml(self, ruta_id, archivo_salida):
        """
        Genera un archivo KML para la planimetría de una ruta específica
        """
        ruta = self.obtener_ruta(ruta_id)
        if not ruta:
            print(f"Error: No se encontró la ruta {ruta_id}")
            return False
            
        nombre_ruta = ruta.find('nombre').text
        descripcion = ruta.find('descripcion').text
        
        # Crear contenido KML
        kml_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
    <Document>
        <name>{nombre_ruta}</name>
        <description>{descripcion}</description>
        
        <!-- Estilos para puntos -->
        <Style id="inicio">
            <IconStyle>
                <Icon>
                    <href>http://maps.google.com/mapfiles/kml/paddle/grn-circle.png</href>
                </Icon>
                <scale>1.2</scale>
            </IconStyle>
        </Style>
        
        <Style id="hito">
            <IconStyle>
                <Icon>
                    <href>http://maps.google.com/mapfiles/kml/paddle/blu-circle.png</href>
                </Icon>
                <scale>1.0</scale>
            </IconStyle>
        </Style>
        
        <Style id="ruta">
            <LineStyle>
                <color>ff0000ff</color>
                <width>3</width>
            </LineStyle>
        </Style>
        
        <!-- Punto de inicio -->
        <Placemark>
            <name>Inicio: {ruta.find('lugarInicio').text}</name>
            <description>Punto de inicio de la ruta</description>
            <styleUrl>#inicio</styleUrl>
            <Point>
                <coordinates>
                    {ruta.find('coordenadasInicio/longitud').text},{ruta.find('coordenadasInicio/latitud').text},{ruta.find('coordenadasInicio/altitud').text}
                </coordinates>
            </Point>
        </Placemark>
        
'''
          # Añadir hitos
        hitos = ruta.find('hitos').findall('hito')
        coordenadas_linea = []
        
        # Coordenadas de inicio para la línea
        coord_inicio = ruta.find('coordenadasInicio')
        coordenadas_linea.append(f"{coord_inicio.find('longitud').text},{coord_inicio.find('latitud').text},{coord_inicio.find('altitud').text}")
        
        for i, hito in enumerate(hitos, 1):
            nombre_hito = hito.find('nombre')
            descripcion_hito = hito.find('descripcion')
            coordenadas = hito.find('coordenadas')
            
            # Validar que los elementos existen
            if nombre_hito is None or coordenadas is None:
                print(f"Advertencia: Hito {i} incompleto, saltando...")
                continue
                
            nombre_text = nombre_hito.text if nombre_hito.text else f"Hito {i}"
            descripcion_text = descripcion_hito.text if descripcion_hito is not None and descripcion_hito.text else "Sin descripción disponible"
            
            lon = coordenadas.find('longitud').text
            lat = coordenadas.find('latitud').text
            alt = coordenadas.find('altitud').text
            
            coordenadas_linea.append(f"{lon},{lat},{alt}")
            kml_content += f'''        <!-- Hito {i} -->
        <Placemark>
            <name>Hito {i}: {nombre_text}</name>
            <description>{descripcion_text}</description>
            <styleUrl>#hito</styleUrl>
            <Point>
                <coordinates>{lon},{lat},{alt}</coordinates>
            </Point>
        </Placemark>
        
'''
        
        # Añadir línea de ruta
        kml_content += f'''        <!-- Línea de ruta -->
        <Placemark>
            <name>Recorrido {nombre_ruta}</name>
            <description>Trazado completo de la ruta</description>
            <styleUrl>#ruta</styleUrl>
            <LineString>
                <tessellate>1</tessellate>
                <coordinates>
                    {' '.join(coordenadas_linea)}
                </coordinates>
            </LineString>
        </Placemark>
        
    </Document>
</kml>'''
        
        # Guardar archivo
        with open(archivo_salida, 'w', encoding='utf-8') as f:
            f.write(kml_content)
            
        print(f"Archivo KML generado: {archivo_salida}")
        return True
    
    def generar_svg(self, ruta_id, archivo_salida):
        """
        Genera un archivo SVG para la altimetría de una ruta específica
        """
        ruta = self.obtener_ruta(ruta_id)
        if not ruta:
            print(f"Error: No se encontró la ruta {ruta_id}")
            return False
            
        nombre_ruta = ruta.find('nombre').text
        
        # Recopilar datos de altitud y distancia
        altitudes = []
        distancias_acumuladas = [0]
        
        # Punto de inicio
        alt_inicio = int(ruta.find('coordenadasInicio/altitud').text)
        altitudes.append(alt_inicio)
        
        # Hitos
        distancia_acumulada = 0
        hitos = ruta.find('hitos').findall('hito')
        for hito in hitos:
            coordenadas = hito.find('coordenadas')
            distancia_elem = hito.find('distancia')
            
            if coordenadas is None or distancia_elem is None:
                continue
                
            alt = int(coordenadas.find('altitud').text)
            dist = int(distancia_elem.text)
            
            distancia_acumulada += dist
            altitudes.append(alt)
            distancias_acumuladas.append(distancia_acumulada)
        
        # Configuración del SVG
        ancho_svg = 800
        alto_svg = 400
        margen = 50
        
        ancho_grafico = ancho_svg - 2 * margen
        alto_grafico = alto_svg - 2 * margen
        
        # Escalas
        distancia_max = max(distancias_acumuladas)
        altitud_min = min(altitudes)
        altitud_max = max(altitudes)
        rango_altitud = altitud_max - altitud_min if altitud_max != altitud_min else 100
        
        # Crear contenido SVG
        svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{ancho_svg}" height="{alto_svg}" xmlns="http://www.w3.org/2001/XMLSchema-instance">
    
    <!-- Título -->
    <text x="{ancho_svg//2}" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold">
        Perfil Altimétrico: {nombre_ruta}
    </text>
    
    <!-- Fondo del gráfico -->
    <rect x="{margen}" y="{margen}" width="{ancho_grafico}" height="{alto_grafico}" 
          fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/>
    
    <!-- Líneas de cuadrícula horizontales (altitudes) -->
'''
        
        # Añadir líneas de cuadrícula y etiquetas de altitud
        num_lineas_alt = 5
        for i in range(num_lineas_alt + 1):
            alt_linea = altitud_min + (rango_altitud * i / num_lineas_alt)
            y_linea = margen + alto_grafico - (alt_linea - altitud_min) * alto_grafico / rango_altitud
            
            svg_content += f'''    <line x1="{margen}" y1="{y_linea}" x2="{margen + ancho_grafico}" y2="{y_linea}" 
          stroke="#dee2e6" stroke-width="0.5"/>
    <text x="{margen - 5}" y="{y_linea + 4}" text-anchor="end" font-family="Arial, sans-serif" font-size="10">
        {int(alt_linea)}m
    </text>
'''
        
        # Líneas de cuadrícula verticales (distancias)
        svg_content += "\n    <!-- Líneas de cuadrícula verticales (distancias) -->\n"
        num_lineas_dist = 5
        for i in range(num_lineas_dist + 1):
            dist_linea = distancia_max * i / num_lineas_dist
            x_linea = margen + (dist_linea * ancho_grafico / distancia_max)
            
            svg_content += f'''    <line x1="{x_linea}" y1="{margen}" x2="{x_linea}" y2="{margen + alto_grafico}" 
          stroke="#dee2e6" stroke-width="0.5"/>
    <text x="{x_linea}" y="{margen + alto_grafico + 15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10">
        {int(dist_linea)}m
    </text>
'''
        
        # Crear puntos del perfil
        puntos_perfil = []
        for i, (dist, alt) in enumerate(zip(distancias_acumuladas, altitudes)):
            x = margen + (dist * ancho_grafico / distancia_max)
            y = margen + alto_grafico - ((alt - altitud_min) * alto_grafico / rango_altitud)
            puntos_perfil.append(f"{x},{y}")
        
        # Línea del perfil
        svg_content += f'''
    <!-- Perfil altimétrico -->
    <polyline points="{' '.join(puntos_perfil)}" 
              fill="none" stroke="#007bff" stroke-width="3"/>
    
    <!-- Área bajo la curva -->
    <polygon points="{margen},{margen + alto_grafico} {' '.join(puntos_perfil)} {margen + ancho_grafico},{margen + alto_grafico}" 
             fill="rgba(0, 123, 255, 0.3)" stroke="none"/>
    
    <!-- Puntos de hitos -->
'''
        
        # Marcar puntos de hitos
        for i, (dist, alt) in enumerate(zip(distancias_acumuladas, altitudes)):
            x = margen + (dist * ancho_grafico / distancia_max)
            y = margen + alto_grafico - ((alt - altitud_min) * alto_grafico / rango_altitud)
            
            color = "#28a745" if i == 0 else "#dc3545"  # Verde para inicio, rojo para hitos
            
            svg_content += f'''    <circle cx="{x}" cy="{y}" r="4" fill="{color}" stroke="white" stroke-width="2"/>
    <text x="{x}" y="{y - 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" font-weight="bold">
        {i if i == 0 else f"H{i}"}
    </text>
'''
        
        # Etiquetas de ejes
        svg_content += f'''
    <!-- Etiquetas de ejes -->
    <text x="{ancho_svg//2}" y="{alto_svg - 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12">
        Distancia (metros)
    </text>
    
    <text x="20" y="{alto_svg//2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" 
          transform="rotate(-90, 20, {alto_svg//2})">
        Altitud (metros)
    </text>
    
    <!-- Información estadística -->
    <text x="{margen}" y="{alto_svg - 30}" font-family="Arial, sans-serif" font-size="10">
        Distancia total: {distancia_max}m | Altitud mín: {altitud_min}m | Altitud máx: {altitud_max}m | Desnivel: {altitud_max - altitud_min}m
    </text>
    
</svg>'''
        
        # Guardar archivo
        with open(archivo_salida, 'w', encoding='utf-8') as f:
            f.write(svg_content)
            
        print(f"Archivo SVG generado: {archivo_salida}")
        return True
    
    def obtener_ruta(self, ruta_id):
        """
        Obtiene una ruta específica por su ID
        """
        for ruta in self.root.findall('ruta'):
            if ruta.get('id') == ruta_id:
                return ruta
        return None
    
    def listar_rutas(self):
        """
        Lista todas las rutas disponibles
        """
        print("Rutas disponibles:")
        for ruta in self.root.findall('ruta'):
            ruta_id = ruta.get('id')
            nombre = ruta.find('nombre').text
            print(f"  {ruta_id}: {nombre}")

def main():
    """
    Función principal del generador
    Ahora acepta argumentos de línea de comandos para especificar el archivo XML
    """
    import sys
    
    # Verificar si se proporciona un archivo XML personalizado
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        archivo_xml = sys.argv[1]
        print(f"Usando archivo XML personalizado: {archivo_xml}")
    else:
        # Archivo XML está un nivel arriba desde xml/python/ por defecto
        archivo_xml = "../rutas.xml"
        print(f"Usando archivo XML predeterminado: {archivo_xml}")
    
    if not os.path.exists(archivo_xml):
        print(f"Error: No se encuentra el archivo {archivo_xml}")
        return
    
    generador = GeneradorRutas(archivo_xml)
    
    # Crear directorios de salida (kml y svg están al mismo nivel que python)
    os.makedirs("../kml", exist_ok=True)
    os.makedirs("../svg", exist_ok=True)
    
    print("\nVerificando rutas disponibles:")
    generador.listar_rutas()
    
    # Obtener todas las rutas del archivo XML
    rutas_ids = []
    for ruta in generador.root.findall('ruta'):
        rutas_ids.append(ruta.get('id'))
    
    if not rutas_ids:
        print("Error: No se encontraron rutas en el archivo XML")
        return
    
    print(f"\nGenerando archivos para {len(rutas_ids)} rutas: {', '.join(rutas_ids)}")
    
    for ruta_id in rutas_ids:
        # Generar KML en carpeta xml/kml
        archivo_kml = f"../kml/{ruta_id}.kml"
        generador.generar_kml(ruta_id, archivo_kml)
        
        # Generar SVG en carpeta xml/svg
        archivo_svg = f"../svg/{ruta_id}.svg"
        generador.generar_svg(ruta_id, archivo_svg)
    
    print("\n¡Generación completada!")
    print("Archivos KML generados en: xml/kml/")
    print("Archivos SVG generados en: xml/svg/")

if __name__ == "__main__":
    main()
