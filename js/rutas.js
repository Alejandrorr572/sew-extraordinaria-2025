/**
 * Gestor de Rutas Turísticas de Siero
 * Sistema completo para carga y visualización de rutas XML con jQuery
 * Incluye integración con Google Maps y visualización SVG
 */

/**
 * Clase principal para gestionar las rutas turísticas
 * Implementa el patrón de orientación a objetos requerido
 */
class GestorRutas {    constructor() {
        this.$container = $('section[role="region"][aria-label="Detalles de ruta"]');
        this.$buttons = $('nav[role="navigation"][aria-label="Selector de rutas"]');
        this.$loading = $('aside[role="status"]');
        this.$error = $('aside[role="alert"]');
        this.rutasData = null;
        this.rutaActual = null;
        this.mapas = new Map(); // Almacenar instancias de mapas
        
        // Debug info
        console.log('jQuery available:', typeof $ !== 'undefined');
        console.log('Container found:', this.$container.length);
        console.log('Buttons found:', this.$buttons.length);
        console.log('Loading found:', this.$loading.length);
        console.log('Error found:', this.$error.length);
        console.log('Document ready:', document.readyState);
        
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
            cache: false,
            success: function(data) {
                console.log('XML cargado correctamente');
                self.rutasData = data;
                self.procesarRutas();
                self.$loading.hide();
            },
            error: function(xhr, status, error) {
                console.error('Error cargando rutas.xml:', error, xhr.status);
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
     */    seleccionarRuta(rutaId) {
        // Actualizar botones activos
        this.$buttons.find('button').attr('aria-selected', 'false');
        this.$buttons.find(`button[aria-controls="ruta-${rutaId}"]`).attr('aria-selected', 'true');
        
        // Ocultar contenido anterior
        this.$container.find('article').attr('hidden', 'hidden');
          // Mostrar nueva ruta
        if (this.$container.find(`article[aria-label="Ruta ${rutaId}"]`).length === 0) {
            this.crearContenidoRuta(rutaId);
        } else {
            this.$container.find(`article[aria-label="Ruta ${rutaId}"]`).removeAttr('hidden');
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
     */    generarHTMLRuta(rutaId, info) {        const $content = $(`
            <article role="tabpanel" aria-label="Ruta ${rutaId}">
                <section role="region" aria-label="Información general">
                    <h2>${info.nombre}</h2>
                    <p>${info.descripcion}</p>                    <section role="list" aria-label="Información de ruta">
                        <article role="listitem" aria-label="Tipo de ruta">
                            <h3>Tipo de Ruta</h3>
                            <p>${info.tipo}</p>
                        </article>
                        
                        <article role="listitem" aria-label="Transporte">
                            <h3>Transporte</h3>
                            <p>${info.transporte}</p>
                        </article>
                        
                        <article role="listitem" aria-label="Duración">
                            <h3>Duración Estimada</h3>
                            <p>${info.duracion}</p>
                        </article>
                        
                        <article role="listitem" aria-label="Punto de inicio">
                            <h3>Punto de Inicio</h3>
                            <p>${info.lugarInicio}</p>
                        </article>
                    </section>
                </section>
                  <nav role="tablist" aria-label="Información de ruta">
                    <button role="tab" aria-selected="true" aria-controls="tab-informacion">Información</button>
                    <button role="tab" aria-selected="false" aria-controls="tab-mapa">Planimetría (KML)</button>
                    <button role="tab" aria-selected="false" aria-controls="tab-altimetria">Altimetría (SVG)</button>
                </nav>
                  <section role="tabpanel">
                    <section role="tabpanel" aria-labelledby="tab-informacion">
                        ${this.generarTabInformacion(info)}
                    </section>
                    <section role="tabpanel" aria-labelledby="tab-mapa" hidden>
                        <section role="img" aria-label="Mapa de ruta ${rutaId}"></section>
                    </section>
                    <section role="tabpanel" aria-labelledby="tab-altimetria" hidden>
                        <section role="img" aria-label="Perfil altimétrico ${rutaId}">
                            <p>Cargando perfil altimétrico...</p>
                        </section>
                    </section>
                </section>
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
        
        // Configurar eventos para las pestañas dentro de este artículo específico
        $(`article[aria-label="Ruta ${rutaId}"] nav[role="tablist"] button[role="tab"]`).click(function() {
            const $button = $(this);
            const controlsId = $button.attr('aria-controls');
            const $article = $button.closest('article[role="tabpanel"]');
            
            // Actualizar botones
            $article.find('nav[role="tablist"] button[role="tab"]').attr('aria-selected', 'false');
            $button.attr('aria-selected', 'true');
            
            // Obtener el contenedor de paneles (el section que está después del nav)
            const $panelContainer = $article.find('nav[role="tablist"]').next('section[role="tabpanel"]');
            const $allPanels = $panelContainer.children('section[role="tabpanel"]');
            
            // Ocultar todos los paneles
            $allPanels.attr('hidden', 'hidden');
            
            // Mostrar panel correspondiente basado en el índice del botón
            const buttonIndex = $article.find('nav[role="tablist"] button[role="tab"]').index($button);
            const $targetPanel = $allPanels.eq(buttonIndex);
            $targetPanel.removeAttr('hidden');
            
            // Cargar contenido específico según la pestaña
            if (controlsId === 'tab-mapa' && !self.mapas.has(rutaId)) {
                setTimeout(() => {
                    self.cargarMapa(rutaId, self.extraerInformacionRuta($(self.rutasData).find(`ruta[id="${rutaId}"]`)));
                }, 100);
            } else if (controlsId === 'tab-altimetria') {
                const $svgSection = $targetPanel.find('section[role="img"]');
                if ($svgSection.children().length <= 1) {
                    self.cargarSVG(rutaId);
                }
            }
            
            // Redimensionar mapa si es necesario
            if (controlsId === 'tab-mapa' && self.mapas.has(rutaId)) {
                setTimeout(() => {
                    google.maps.event.trigger(self.mapas.get(rutaId), 'resize');
                }, 100);
            }
        });
    }cargarMapa(rutaId, rutaInfo) {
        const mapDiv = document.querySelector(`section[aria-label="Mapa de ruta ${rutaId}"]`);
        
        if (!mapDiv) {
            console.error(`No se encontró el contenedor del mapa para la ruta ${rutaId}`);
            return;
        }
        
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
     */    cargarSVG(rutaId) {
        const self = this;
        const svgUrl = `xml/svg/${rutaId}.svg`;
        
        $.ajax({
            url: svgUrl,
            type: 'GET',
            dataType: 'text',            success: function(svgData) {
                // Modificar SVG para añadir línea de nivel del mar
                const svgModificado = self.modificarSVGAltimetria(svgData);
                $(`section[aria-label="Perfil altimétrico ${rutaId}"]`).html(svgModificado);
            },
            error: function() {
                $(`section[aria-label="Perfil altimétrico ${rutaId}"]`).html('<p role="alert">Error al cargar el perfil altimétrico</p>');
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
