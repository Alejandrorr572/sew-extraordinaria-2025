/**
 * Gestor de Rutas Turísticas de Siero
 * Sistema completo para carga y visualización de rutas XML con jQuery
 * Incluye integración con Google Maps y visualización SVG
 */

/**
 * Clase principal para gestionar las rutas turísticas
 * Implementa el patrón de orientación a objetos requerido
 */
class GestorRutas {
    constructor() {
        this.$container = $('section[role="region"][aria-label="Detalles de ruta"]');
        this.$buttons = $('nav[role="navigation"][aria-label="Selector de rutas"]');
        this.$loading = $('aside[role="status"]');
        this.$error = $('aside[role="alert"]');
        this.rutasData = null;
        this.rutaActual = null;
        this.mapas = new Map(); // Almacenar instancias de mapas
        
        // Debug info
        console.log('Container found:', this.$container.length);
        console.log('Buttons found:', this.$buttons.length);
        console.log('Loading found:', this.$loading.length);
        console.log('Error found:', this.$error.length);
        
        this.init();
    }
    
    /**
     * Inicializa el gestor de rutas
     */
    init() {
        this.cargarRutasXML();
    }
    
    /**
     * Carga el archivo XML con las rutas usando jQuery
     */    cargarRutasXML() {
        const self = this;
        
        $.ajax({
            url: 'xml/rutas-fixed.xml',
            type: 'GET',
            dataType: 'xml',
            cache: false,
            success: function(data) {
                console.log('XML cargado correctamente');
                self.rutasData = data;
                self.procesarRutas();
                self.$loading.hide();
            },
            error: function(xhr, status, error) {
                console.error('Error cargando rutas-fixed.xml:', error, xhr.status);
                self.mostrarError('No se pudo cargar el archivo de rutas');
                self.$loading.hide();
            }
        });
    }
    
    /**
     * Procesa los datos XML y genera la interfaz
     */
    procesarRutas() {
        const self = this;
        const $rutas = $(this.rutasData).find('ruta');
        
        if ($rutas.length === 0) {
            this.mostrarError('No se encontraron rutas en el archivo XML');
            return;
        }
        
        // Generar botones de rutas
        $rutas.each(function(index, ruta) {
            const $ruta = $(ruta);
            const id = $ruta.attr('id');
            const nombre = $ruta.find('nombre').text();
              const $button = $('<button>')
                .attr('role', 'tab')
                .attr('aria-controls', 'ruta-' + id)
                .text(nombre)
                .click(function() {
                    self.seleccionarRuta(id);
                });
            
            self.$buttons.append($button);
        });
        
        // Seleccionar primera ruta por defecto
        const primeraRuta = $rutas.first().attr('id');
        this.seleccionarRuta(primeraRuta);
    }    /**
     * Selecciona y muestra una ruta específica
     */
    seleccionarRuta(rutaId) {
        // Actualizar botones activos
        this.$buttons.find('button').attr('aria-selected', 'false');
        this.$buttons.find(`button[aria-controls="ruta-${rutaId}"]`).attr('aria-selected', 'true');
        
        // Ocultar contenido anterior
        this.$container.find('article').attr('hidden', 'hidden');
          // Mostrar nueva ruta
        if (this.$container.find(`article[id="ruta-${rutaId}"]`).length === 0) {
            this.crearContenidoRuta(rutaId);
        } else {
            this.$container.find(`article[id="ruta-${rutaId}"]`).removeAttr('hidden');
        }
        
        this.rutaActual = rutaId;
    }
    
    /**
     * Crea el contenido HTML para una ruta específica
     */
    crearContenidoRuta(rutaId) {
        const $ruta = $(this.rutasData).find(`ruta[id="${rutaId}"]`);
        
        if ($ruta.length === 0) {
            this.mostrarError(`No se encontró la ruta ${rutaId}`);
            return;
        }
        
        const rutaInfo = this.extraerInformacionRuta($ruta);        const $contenido = this.generarHTMLRuta(rutaId, rutaInfo);
        
        this.$container.append($contenido);
        
        // Configurar pestañas
        this.configurarPestanas(rutaId);
        
        // Cargar mapa y SVG
        setTimeout(() => {
            this.cargarMapa(rutaId, rutaInfo);
            this.cargarSVG(rutaId);
        }, 100);
    }
    
    /**
     * Extrae información de una ruta del XML
     */
    extraerInformacionRuta($ruta) {
        const info = {
            id: $ruta.attr('id'),
            nombre: $ruta.find('nombre').text(),
            descripcion: $ruta.find('descripcion').text(),
            tipo: $ruta.find('tipo').text(),
            transporte: $ruta.find('transporte').text(),
            duracion: $ruta.find('duracion').text(),
            lugarInicio: $ruta.find('lugarInicio').text(),
            coordenadasInicio: {
                latitud: parseFloat($ruta.find('coordenadasInicio latitud').text()),
                longitud: parseFloat($ruta.find('coordenadasInicio longitud').text()),
                altitud: parseInt($ruta.find('coordenadasInicio altitud').text())
            },
            referencias: [],
            recomendaciones: [],
            hitos: []
        };
        
        // Referencias
        $ruta.find('referencias referencia').each(function() {
            info.referencias.push($(this).text());
        });
        
        // Recomendaciones
        $ruta.find('recomendaciones recomendacion').each(function() {
            info.recomendaciones.push($(this).text());
        });
        
        // Hitos
        $ruta.find('hitos hito').each(function() {
            const $hito = $(this);
            info.hitos.push({
                nombre: $hito.find('nombre').text(),
                descripcion: $hito.find('descripcion').text(),
                distancia: parseInt($hito.find('distancia').text() || 0),
                coordenadas: {
                    latitud: parseFloat($hito.find('coordenadas latitud').text()),
                    longitud: parseFloat($hito.find('coordenadas longitud').text()),
                    altitud: parseInt($hito.find('coordenadas altitud').text())
                }
            });
        });
        
        return info;
    }
      /**
     * Genera el HTML para mostrar una ruta
     */    generarHTMLRuta(rutaId, info) {
        const $content = $(`
            <article id="ruta-${rutaId}" role="tabpanel">
                <section role="region" aria-label="Información general">
                    <h2>${info.nombre}</h2>
                    <p>${info.descripcion}</p>
                    
                    <dl role="list">
                        <dt>Tipo de Ruta</dt>
                        <dd>${info.tipo}</dd>
                        
                        <dt>Transporte</dt>
                        <dd>${info.transporte}</dd>
                        
                        <dt>Duración Estimada</dt>
                        <dd>${info.duracion}</dd>
                        
                        <dt>Punto de Inicio</dt>
                        <dd>${info.lugarInicio}</dd>
                    </dl>
                </section>
                
                <nav role="tablist" aria-label="Información de ruta">
                    <button role="tab" aria-selected="true" aria-controls="tab-informacion-${rutaId}">Información</button>
                    <button role="tab" aria-selected="false" aria-controls="tab-mapa-${rutaId}">Planimetría (KML)</button>
                    <button role="tab" aria-selected="false" aria-controls="tab-altimetria-${rutaId}">Altimetría (SVG)</button>
                </nav>
                
                <div role="tabpanel">
                    <section id="tab-informacion-${rutaId}" role="tabpanel" aria-labelledby="tab-informacion">
                        ${this.generarTabInformacion(info)}
                    </section>
                    <section id="tab-mapa-${rutaId}" role="tabpanel" aria-labelledby="tab-mapa" hidden>
                        <div id="mapa-${rutaId}" role="img" aria-label="Mapa de ruta"></div>
                    </section>
                    <section id="tab-altimetria-${rutaId}" role="tabpanel" aria-labelledby="tab-altimetria" hidden>
                        <div id="svg-${rutaId}" role="img" aria-label="Perfil altimétrico">
                            <p>Cargando perfil altimétrico...</p>
                        </div>
                    </section>
                </div>
            </article>
        `);
        
        return $content;
    }
    
    /**     * Genera el contenido de la pestaña de información
     */
    generarTabInformacion(info) {
        let html = '<h3>Hitos de la Ruta</h3><ol role="list">';
        
        info.hitos.forEach((hito, index) => {
            html += `
                <li>
                    <h4>Hito ${index + 1}: ${hito.nombre}</h4>
                    <p>${hito.descripcion}</p>
                    <p><small>Distancia acumulada: ${hito.distancia}m | Altitud: ${hito.coordenadas.altitud}m</small></p>
                </li>
            `;
        });
        
        html += '</ol>';
        
        if (info.referencias.length > 0) {
            html += '<h3>Referencias</h3><ul role="list">';
            info.referencias.forEach(ref => {
                html += `<li>${ref}</li>`;
            });
            html += '</ul>';
        }
        
        if (info.recomendaciones.length > 0) {
            html += '<h3>Recomendaciones</h3><ul role="list">';
            info.recomendaciones.forEach(rec => {
                html += `<li>${rec}</li>`;
            });
            html += '</ul>';
        }
        
        return html;
    }    /**
     * Configura el funcionamiento de las pestañas
     */
    configurarPestanas(rutaId) {
        const self = this;
        
        $(`#ruta-${rutaId} [role="tab"]`).click(function() {
            const $button = $(this);
            const tabId = $button.attr('aria-controls');
            
            // Actualizar botones
            $button.siblings().attr('aria-selected', 'false');
            $button.attr('aria-selected', 'true');
            
            // Actualizar paneles
            $(`#ruta-${rutaId} [role="tabpanel"]`).attr('hidden', 'hidden');
            $(`#${tabId}`).removeAttr('hidden');
            
            // Redimensionar mapa si es necesario
            if (tabId.includes('mapa') && self.mapas.has(rutaId)) {
                setTimeout(() => {
                    google.maps.event.trigger(self.mapas.get(rutaId), 'resize');
                }, 100);
            }
        });
    }    /**
     * Carga y muestra el mapa con datos KML
     */
    cargarMapa(rutaId, rutaInfo) {
        const mapDiv = document.querySelector(`#mapa-${rutaId}`);
        
        if (!mapDiv) return;
        
        // Configurar mapa centrado en el punto de inicio
        const map = new google.maps.Map(mapDiv, {
            zoom: 14,
            center: {
                lat: rutaInfo.coordenadasInicio.latitud,
                lng: rutaInfo.coordenadasInicio.longitud
            },
            mapTypeId: google.maps.MapTypeId.TERRAIN
        });
        
        // Guardar referencia del mapa
        this.mapas.set(rutaId, map);
        
        // Cargar archivo KML
        const kmlUrl = `xml/kml/${rutaId}.kml`;
        
        // Crear marcador para punto de inicio
        new google.maps.Marker({
            position: {
                lat: rutaInfo.coordenadasInicio.latitud,
                lng: rutaInfo.coordenadasInicio.longitud
            },
            map: map,
            title: `Inicio: ${rutaInfo.lugarInicio}`,
            icon: {
                url: 'http://maps.google.com/mapfiles/kml/paddle/grn-circle.png',
                scaledSize: new google.maps.Size(32, 32)
            }
        });
        
        // Añadir marcadores para hitos
        rutaInfo.hitos.forEach((hito, index) => {
            new google.maps.Marker({
                position: {
                    lat: hito.coordenadas.latitud,
                    lng: hito.coordenadas.longitud
                },
                map: map,
                title: `Hito ${index + 1}: ${hito.nombre}`,
                icon: {
                    url: 'http://maps.google.com/mapfiles/kml/paddle/blu-circle.png',
                    scaledSize: new google.maps.Size(24, 24)
                }
            });
        });
        
        // Crear línea de ruta
        const rutaCoords = [
            {
                lat: rutaInfo.coordenadasInicio.latitud,
                lng: rutaInfo.coordenadasInicio.longitud
            }
        ];
        
        rutaInfo.hitos.forEach(hito => {
            rutaCoords.push({
                lat: hito.coordenadas.latitud,
                lng: hito.coordenadas.longitud
            });
        });
        
        const rutaPath = new google.maps.Polyline({
            path: rutaCoords,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 3
        });
        
        rutaPath.setMap(map);
        
        // Ajustar vista para mostrar toda la ruta
        const bounds = new google.maps.LatLngBounds();
        rutaCoords.forEach(coord => {
            bounds.extend(coord);
        });
        map.fitBounds(bounds);
    }
      /**
     * Carga y muestra el archivo SVG de altimetría
     */
    cargarSVG(rutaId) {
        const self = this;
        const svgUrl = `xml/svg/${rutaId}.svg`;
        
        $.ajax({
            url: svgUrl,
            type: 'GET',
            dataType: 'text',
            success: function(svgData) {
                // Modificar SVG para añadir línea de nivel del mar
                const svgModificado = self.modificarSVGAltimetria(svgData);
                $(`#svg-${rutaId}`).html(svgModificado);
            },
            error: function() {
                $(`#svg-${rutaId}`).html('<p role="alert">Error al cargar el perfil altimétrico</p>');
            }
        });
    }
    
    /**
     * Modifica el SVG para añadir línea de nivel del mar y mejorar visualización
     */
    modificarSVGAltimetria(svgData) {
        // Parser básico para modificar el SVG
        const $svg = $(svgData);
        
        // Añadir línea de nivel del mar (cota 0)
        // Esto es una aproximación, en un caso real necesitaríamos calcular la posición exacta
        const lineaNivelMar = `
            <line x1="50" y1="350" x2="750" y2="350" 
                  stroke="#0077be" stroke-width="2" stroke-dasharray="5,5"/>
            <text x="760" y="355" font-family="Arial, sans-serif" font-size="10" fill="#0077be">
                Nivel del mar (0m)
            </text>
        `;
        
        // Insertar la línea antes del cierre del SVG
        let svgModificado = svgData.replace('</svg>', lineaNivelMar + '</svg>');
        
        return svgModificado;
    }    /**
     * Muestra un mensaje de error
     */
    mostrarError(mensaje) {
        console.error('Error en rutas:', mensaje);
        this.$error.find('p').text(mensaje);
        this.$error.removeAttr('hidden');
    }
}

/**
 * Inicialización cuando el documento esté listo
 */
$(document).ready(function() {
    // Crear instancia del gestor de rutas
    window.gestorRutas = new GestorRutas();
});
