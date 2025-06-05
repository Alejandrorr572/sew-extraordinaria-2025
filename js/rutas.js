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
        this.$container = $('#rutaContentContainer');
        this.$buttons = $('#rutaButtons');
        this.$loading = $('#loadingIndicator');
        this.$error = $('#errorContainer');
        this.rutasData = null;
        this.rutaActual = null;
        this.mapas = new Map(); // Almacenar instancias de mapas
        
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
     */
    cargarRutasXML() {
        const self = this;
        
        $.ajax({
            url: 'xml/rutas.xml',
            type: 'GET',
            dataType: 'xml',
            success: function(data) {
                self.rutasData = data;
                self.procesarRutas();
                self.$loading.hide();
            },
            error: function(xhr, status, error) {
                console.error('Error cargando rutas.xml:', error);
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
                .addClass('btn-ruta')
                .attr('data-ruta-id', id)
                .text(nombre)
                .click(function() {
                    self.seleccionarRuta(id);
                });
            
            self.$buttons.append($button);
        });
        
        // Seleccionar primera ruta por defecto
        const primeraRuta = $rutas.first().attr('id');
        this.seleccionarRuta(primeraRuta);
    }
    
    /**
     * Selecciona y muestra una ruta específica
     */
    seleccionarRuta(rutaId) {
        // Actualizar botones activos
        this.$buttons.find('.btn-ruta').removeClass('active');
        this.$buttons.find(`[data-ruta-id="${rutaId}"]`).addClass('active');
        
        // Ocultar contenido anterior
        this.$container.find('.ruta-content').removeClass('active');
        
        // Mostrar nueva ruta
        if (this.$container.find(`#ruta-${rutaId}`).length === 0) {
            this.crearContenidoRuta(rutaId);
        } else {
            this.$container.find(`#ruta-${rutaId}`).addClass('active');
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
        
        const rutaInfo = this.extraerInformacionRuta($ruta);
        const $contenido = this.generarHTMLRuta(rutaId, rutaInfo);
        
        this.$container.append($contenido);
        $contenido.addClass('active');
        
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
     */
    generarHTMLRuta(rutaId, info) {
        const $content = $(`
            <div id="ruta-${rutaId}" class="ruta-content">
                <div class="ruta-info">
                    <h2>${info.nombre}</h2>
                    <p>${info.descripcion}</p>
                    
                    <div class="ruta-detalles">
                        <div class="detalle-item">
                            <div class="detalle-label">Tipo de Ruta</div>
                            <div>${info.tipo}</div>
                        </div>
                        <div class="detalle-item">
                            <div class="detalle-label">Transporte</div>
                            <div>${info.transporte}</div>
                        </div>
                        <div class="detalle-item">
                            <div class="detalle-label">Duración Estimada</div>
                            <div>${info.duracion}</div>
                        </div>
                        <div class="detalle-item">
                            <div class="detalle-label">Punto de Inicio</div>
                            <div>${info.lugarInicio}</div>
                        </div>
                    </div>
                </div>
                
                <div class="ruta-tabs">
                    <button class="tab-button active" data-tab="informacion">Información</button>
                    <button class="tab-button" data-tab="mapa">Planimetría (KML)</button>
                    <button class="tab-button" data-tab="altimetria">Altimetría (SVG)</button>
                </div>
                
                <div class="tab-content">
                    <div id="tab-informacion-${rutaId}" class="tab-panel active">
                        ${this.generarTabInformacion(info)}
                    </div>
                    <div id="tab-mapa-${rutaId}" class="tab-panel">
                        <div id="mapa-${rutaId}" class="mapa-container"></div>
                    </div>
                    <div id="tab-altimetria-${rutaId}" class="tab-panel">
                        <div id="svg-${rutaId}" class="svg-container">
                            <p>Cargando perfil altimétrico...</p>
                        </div>
                    </div>
                </div>
            </div>
        `);
        
        return $content;
    }
    
    /**
     * Genera el contenido de la pestaña de información
     */
    generarTabInformacion(info) {
        let html = '<div class="hitos-list"><h3>Hitos de la Ruta</h3>';
        
        info.hitos.forEach((hito, index) => {
            html += `
                <div class="hito-item">
                    <div class="hito-nombre">Hito ${index + 1}: ${hito.nombre}</div>
                    <p>${hito.descripcion}</p>
                    <small>Distancia acumulada: ${hito.distancia}m | Altitud: ${hito.coordenadas.altitud}m</small>
                </div>
            `;
        });
        
        html += '</div>';
        
        if (info.referencias.length > 0) {
            html += '<div class="referencias"><h3>Referencias</h3><ul>';
            info.referencias.forEach(ref => {
                html += `<li>${ref}</li>`;
            });
            html += '</ul></div>';
        }
        
        if (info.recomendaciones.length > 0) {
            html += '<div class="recomendaciones"><h3>Recomendaciones</h3><ul>';
            info.recomendaciones.forEach(rec => {
                html += `<li>${rec}</li>`;
            });
            html += '</ul></div>';
        }
        
        return html;
    }
    
    /**
     * Configura el funcionamiento de las pestañas
     */
    configurarPestanas(rutaId) {
        const self = this;
        
        $(`#ruta-${rutaId} .tab-button`).click(function() {
            const $button = $(this);
            const tab = $button.data('tab');
            
            // Actualizar botones
            $button.siblings().removeClass('active');
            $button.addClass('active');
            
            // Actualizar paneles
            $(`#ruta-${rutaId} .tab-panel`).removeClass('active');
            $(`#tab-${tab}-${rutaId}`).addClass('active');
            
            // Redimensionar mapa si es necesario
            if (tab === 'mapa' && self.mapas.has(rutaId)) {
                setTimeout(() => {
                    google.maps.event.trigger(self.mapas.get(rutaId), 'resize');
                }, 100);
            }
        });
    }
    
    /**
     * Carga y muestra el mapa con datos KML
     */
    cargarMapa(rutaId, rutaInfo) {
        const mapDiv = document.getElementById(`mapa-${rutaId}`);
        
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
                $(`#svg-${rutaId}`).html('<p class="error">Error al cargar el perfil altimétrico</p>');
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
    }
    
    /**
     * Muestra un mensaje de error
     */
    mostrarError(mensaje) {
        this.$error.find('p').text(mensaje);
        this.$error.show();
    }
}

/**
 * Inicialización cuando el documento esté listo
 */
$(document).ready(function() {
    // Crear instancia del gestor de rutas
    window.gestorRutas = new GestorRutas();
});
