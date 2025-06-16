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
        // Buscar solo por aria-label, sin role
        this.$container = $('section[aria-label="Detalles de ruta"]');
        this.$buttons = $('nav[aria-label="Selector de rutas"]'); // <-- Corregido aquí
        this.$loading = $('p[aria-live="polite"]');
        this.$error = $('aside[aria-live="assertive"]');        this.$processingStatus = $('section[aria-label="Carga de rutas"] > p[aria-live="polite"]');
        this.$xmlFileInput = $('section[aria-label="Carga de rutas"] input[type="file"]');
        this.$processRoutesBtn = $('section[aria-label="Carga de rutas"] button:first-of-type');
        this.$generateFilesBtn = $('section[aria-label="Carga de rutas"] button:nth-of-type(2)');
        this.rutasData = null;
        this.rutaActual = null;
        this.mapas = new Map(); // Almacenar instancias de mapas
        this.uploadedXmlContent = null;
        
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
        // Configurar eventos para la carga de archivos
        this.setupFileUploadEvents();
        
        // Por defecto, cargar el XML predeterminado
        this.cargarRutasXML();
    }
    
    /**
     * Configura los eventos para el formulario de carga de archivos
     */
    setupFileUploadEvents() {
        const self = this;
        
        // Evento para el botón de procesar rutas
        this.$processRoutesBtn.on('click', function() {
            if (self.$xmlFileInput[0].files.length > 0) {
                const file = self.$xmlFileInput[0].files[0];
                self.leerArchivoXML(file);
            } else {
                self.mostrarEstadoProcesamiento('Por favor, seleccione un archivo XML primero', 'error');
            }
        });
        
        // Evento para el botón de generar archivos
        this.$generateFilesBtn.on('click', function() {
            if (self.uploadedXmlContent) {
                self.generarArchivosPython();
            } else {
                self.mostrarEstadoProcesamiento('No hay datos de rutas para procesar', 'error');
            }
        });
        
        // Evento al cambiar el archivo seleccionado
        this.$xmlFileInput.on('change', function() {
            if (this.files.length > 0) {
                self.$processRoutesBtn.prop('disabled', false);
                self.mostrarEstadoProcesamiento(`Archivo seleccionado: ${this.files[0].name}`, 'info');
            } else {
                self.$processRoutesBtn.prop('disabled', true);
                self.$generateFilesBtn.prop('disabled', true);
            }
        });
    }
    
    /**
     * Lee el contenido de un archivo XML seleccionado
     */
    leerArchivoXML(file) {
        const self = this;
        const reader = new FileReader();
        
        self.mostrarEstadoProcesamiento('Leyendo archivo XML...', 'info');
        
        reader.onload = function(e) {
            try {
                const xmlContent = e.target.result;
                self.uploadedXmlContent = xmlContent;
                
                // Parsear el XML
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
                
                // Verificar errores de parsing
                const parserError = xmlDoc.querySelector('parsererror');
                if (parserError) {
                    throw new Error('Formato XML inválido');
                }
                
                // Procesar rutas desde el XML cargado
                self.rutasData = xmlDoc;
                self.procesarRutas();
                self.$generateFilesBtn.prop('disabled', false);
                
                // Mostrar mensaje de éxito
                const numRutas = $(xmlDoc).find('ruta').length;
                self.mostrarEstadoProcesamiento(`Archivo XML procesado. Se encontraron ${numRutas} rutas.`, 'success');
            } catch (error) {
                self.mostrarError(`Error procesando el archivo XML: ${error.message}`);
                self.mostrarEstadoProcesamiento('Error al procesar el archivo XML', 'error');
            }
        };
        
        reader.onerror = function() {
            self.mostrarError('Error al leer el archivo');
            self.mostrarEstadoProcesamiento('Error al leer el archivo', 'error');
        };
        
        reader.readAsText(file);
    }
      /**
     * Genera los archivos KML y SVG usando Python
     */
    generarArchivosPython() {
        const self = this;
        
        // En un entorno real, aquí enviaríamos el contenido XML al servidor
        // para procesarlo con Python. En GitHub Pages, no podemos ejecutar Python.
        
        // Para simularlo, mostramos instrucciones al usuario:
        self.mostrarEstadoProcesamiento('Preparando para la generación de archivos...', 'info');
        
        // Guarda temporalmente el XML
        this.guardarArchivoTemporal(this.uploadedXmlContent, 'rutas_temp.xml');
        
        // Muestra instrucciones para ejecutar Python manualmente
        setTimeout(() => {
            const mensaje = `
                <h4>GitHub Pages no puede ejecutar Python directamente</h4>
                <p>Para generar los archivos KML y SVG, sigue estos pasos:</p>
                <ol>
                    <li>Se ha descargado el archivo XML como 'rutas_temp.xml'</li>
                    <li>Guarda este archivo en la carpeta 'xml/' de tu proyecto local</li>
                    <li>Ejecuta manualmente el script Python con: <kbd>python xml/python/generar_rutas.py rutas_temp.xml</kbd></li>
                    <li>Los archivos KML y SVG se generarán en las carpetas 'xml/kml/' y 'xml/svg/' respectivamente</li>
                </ol>
            `;
            self.mostrarEstadoProcesamiento(mensaje, 'info');
        }, 1500);
    }
    
    /**
     * Guarda un archivo temporal en el dispositivo del usuario
     */
    guardarArchivoTemporal(contenido, nombreArchivo) {
        const blob = new Blob([contenido], {type: 'text/xml'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
    
    /**
     * Muestra mensajes de estado del procesamiento
     */
    mostrarEstadoProcesamiento(mensaje, tipo) {
        const claseColor = tipo === 'error' ? 'error-text' : 
                          (tipo === 'success' ? 'success-text' : 'info-text');
        
        this.$processingStatus
            .removeClass('error-text success-text info-text')
            .addClass(claseColor)
            .html(mensaje);
    }
    
    /**
     * Carga el archivo XML predeterminado con las rutas usando jQuery
     */    
    cargarRutasXML() {
        const self = this;
        
        $.ajax({
            url: 'xml/rutas.xml',
            type: 'GET',
            dataType: 'xml',
            cache: false,
            success: function(data) {
                console.log('XML predeterminado cargado correctamente');
                self.rutasData = data;
                self.procesarRutas();
                // Ocultar mensaje de cargando rutas
                $('p[aria-live="polite"]').hide();
            },
            error: function(xhr, status, error) {
                console.error('Error cargando rutas.xml:', error, xhr.status);
                self.mostrarError('No se pudo cargar el archivo de rutas predeterminado');
                // Ocultar mensaje de cargando rutas también en error
                $('p[aria-live="polite"]').hide();
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
        
        // Limpiar botones previos
        self.$buttons.empty();
        
        // Generar botones de rutas
        $rutas.each(function(index, ruta) {
            const $ruta = $(ruta);
            const id = $ruta.attr('id');
            const nombre = $ruta.find('nombre').text();
            
            // Crear botón usando elementos semánticos y atributos ARIA - sin usar aria-controls
            const $button = $('<button>')
                .attr('role', 'tab')
                .attr('aria-selected', index === 0 ? 'true' : 'false')
                .attr('aria-label', `Ver ruta: ${nombre}`)
                .text(nombre)
                .click(function() {
                    self.seleccionarRuta(id);
                });
                
            self.$buttons.append($button);
        });
        
        // Mostrar el contenedor de botones si estaba oculto
        self.$buttons.closest('nav').show();
        
        // Seleccionar primera ruta por defecto
        const primeraRuta = $rutas.first().attr('id');
        this.seleccionarRuta(primeraRuta);
    }    /**
     * Selecciona y muestra una ruta específica
     */    
    seleccionarRuta(rutaId) {
        // Actualizar botones activos
        this.$buttons.find('button').attr('aria-selected', 'false');
        
        // Encontrar el botón por su índice en los datos XML
        const $rutas = $(this.rutasData).find('ruta');
        let index = -1;
        
        $rutas.each(function(i, ruta) {
            if ($(ruta).attr('id') === rutaId) {
                index = i;
                return false; // break
            }
        });
        
        // Seleccionar el botón correspondiente
        if (index >= 0) {
            this.$buttons.find('button').eq(index).attr('aria-selected', 'true');
        }
        
        // Ocultar contenido anterior
        this.$container.find('article[role="tabpanel"]').attr('hidden', 'hidden');
        
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
            // Galería de fotos
            const fotos = [];
            $hito.find('galeria foto').each(function() {
                fotos.push($(this).text());
            });
            info.hitos.push({
                nombre: $hito.find('nombre').text(),
                descripcion: $hito.find('descripcion').text(),
                distancia: parseInt($hito.find('distancia').text() || 0),
                coordenadas: {
                    latitud: parseFloat($hito.find('coordenadas latitud').text()),
                    longitud: parseFloat($hito.find('coordenadas longitud').text()),
                    altitud: parseInt($hito.find('coordenadas altitud').text())
                },
                fotos: fotos
            });
        });
        
        return info;
    }
      /**
     * Genera el HTML para mostrar una ruta
     */    
    generarHTMLRuta(rutaId, info) {        
        const $content = $(`
            <article role="tabpanel" aria-label="Ruta ${rutaId}">
                <section role="region" aria-label="Información general">
                    <h2>${info.nombre}</h2>
                    <p>${info.descripcion}</p>                    
                    <section role="list" aria-label="Información de ruta">
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
                    <button role="tab" aria-selected="true">Información</button>
                    <button role="tab" aria-selected="false">Planimetría (KML)</button>
                    <button role="tab" aria-selected="false">Altimetría (SVG)</button>
                </nav>
                  
                <section role="group" aria-label="Contenido de pestañas">
                    <section role="tabpanel" aria-label="Información">
                        ${this.generarTabInformacion(info)}
                    </section>
                    <section role="tabpanel" aria-label="Planimetría (KML)" hidden>
                        <section role="img" aria-label="Mapa de ruta ${rutaId}"></section>
                    </section>
                    <section role="tabpanel" aria-label="Altimetría (SVG)" hidden>
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
                    ${hito.fotos && hito.fotos.length > 0 ? `<figure>${hito.fotos.map(foto => `<img src='${foto}' alt='Foto de ${hito.nombre}' loading='lazy' width='180'>`).join('')}</figure>` : ''}
                </li>
            `;
        });
        html += '</ol>';
        
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
        const $article = $(`article[aria-label="Ruta ${rutaId}"]`); 
        const $tabs = $article.find('nav[role="tablist"] button[role="tab"]');
        const $panels = $article.find('section[role="group"] > section[role="tabpanel"]');
        
        $tabs.each(function(index) {
            $(this).click(function() {
                // Deseleccionar todas las pestañas
                $tabs.attr('aria-selected', 'false');
                
                // Seleccionar esta pestaña
                $(this).attr('aria-selected', 'true');
                
                // Ocultar todos los paneles
                $panels.attr('hidden', 'hidden');
                
                // Mostrar el panel correspondiente al índice
                $panels.eq(index).removeAttr('hidden');
                
                // Cargar contenido específico según la pestaña
                if (index === 1 && !self.mapas.has(rutaId)) { // Mapa
                    setTimeout(() => {
                        self.cargarMapa(rutaId, self.extraerInformacionRuta($(self.rutasData).find(`ruta[id="${rutaId}"]`)));
                    }, 100);
                } else if (index === 2) { // Altimetría
                    const $svgSection = $panels.eq(index).find('section[role="img"]');
                    if ($svgSection.children().length <= 1) {
                        self.cargarSVG(rutaId);
                    }
                }
                
                // Redimensionar mapa si es necesario
                if (index === 1 && self.mapas.has(rutaId)) {
                    setTimeout(() => {
                        google.maps.event.trigger(self.mapas.get(rutaId), 'resize');
                    }, 100);
                }
            });
        });
        
        // Activar primera pestaña
        $tabs.first().trigger('click');
    }
      /**
     * Configura la funcionalidad de las pestañas usando atributos ARIA
     * con soporte completo para navegación por teclado
     */
    setupTabFunctionality($element) {
        const tabs = $element.find('[role="tab"]');
        const tabPanels = $element.find('[role="tabpanel"]');
        let selectedIndex = 0;
        
        // Añadir atributos para navegación por teclado
        tabs.each(function(i) {
            $(this).attr('tabindex', i === 0 ? '0' : '-1')
                   .attr('aria-posinset', i + 1)
                   .attr('aria-setsize', tabs.length);
        });
        
        // Manejar eventos de click
        tabs.each(function(index) {
            $(this).on('click', function() {
                activateTab(index);
            });
        });
        
        // Manejar eventos de teclado
        tabs.on('keydown', function(e) {
            let newIndex = selectedIndex;
            
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    newIndex = (selectedIndex + 1) % tabs.length;
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    newIndex = (selectedIndex - 1 + tabs.length) % tabs.length;
                    e.preventDefault();
                    break;
                case 'Home':
                    newIndex = 0;
                    e.preventDefault();
                    break;
                case 'End':
                    newIndex = tabs.length - 1;
                    e.preventDefault();
                    break;
                case 'Enter':
                case ' ':
                    activateTab(selectedIndex);
                    e.preventDefault();
                    break;
            }
            
            if (newIndex !== selectedIndex) {
                // Actualizar el foco sin activar la pestaña
                tabs.eq(newIndex).focus();
                selectedIndex = newIndex;
            }
        });
        
        // Función para activar una pestaña
        const activateTab = function(index) {
            // Actualizar estado de las pestañas
            tabs.attr('aria-selected', 'false')
                .attr('tabindex', '-1');
                
            tabs.eq(index).attr('aria-selected', 'true')
                          .attr('tabindex', '0');
            
            // Ocultar todos los paneles
            tabPanels.attr('hidden', 'hidden');
            
            // Mostrar el panel seleccionado
            tabPanels.eq(index).removeAttr('hidden');
            
            // Actualizar índice seleccionado
            selectedIndex = index;
        };
        
        // Establecer estado inicial - primera pestaña está seleccionada
        activateTab(0);
    }

    /**
     * Carga el mapa para la ruta seleccionada
     */
    cargarMapa(rutaId, rutaInfo) {
        // Encontrar el contenedor del mapa usando atributos ARIA e índices
        const $article = $(`article[aria-label="Ruta ${rutaId}"]`);
        const $mapContainer = $article.find('section[role="group"] > section[role="tabpanel"]:eq(1)');
        const mapDiv = $mapContainer.find('section[role="img"]')[0];
        
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
     */    
    cargarSVG(rutaId) {
        const self = this;
        const svgUrl = `xml/svg/${rutaId}.svg`;
        
        // Encontrar el contenedor SVG usando atributos ARIA e índices
        const $article = $(`article[aria-label="Ruta ${rutaId}"]`);
        const $altimetriaContainer = $article.find('section[role="group"] > section[role="tabpanel"]:eq(2)');
        const $svgContainer = $altimetriaContainer.find('section[role="img"]');
        
        $.ajax({
            url: svgUrl,
            type: 'GET',
            dataType: 'text',
            success: function(svgData) {
                // Modificar SVG para añadir línea de nivel del mar
                const svgModificado = self.modificarSVGAltimetria(svgData);
                $svgContainer.html(svgModificado);
            },
            error: function() {
                $svgContainer.html('<p role="alert">Error al cargar el perfil altimétrico</p>');
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
