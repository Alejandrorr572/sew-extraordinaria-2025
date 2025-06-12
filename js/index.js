/**
 * Gestor Principal del Index - Siero Turismo
 * Implementa carrusel de fotos locales y noticias externas vía API
 * Cumple con estándares estrictos: sin IDs, clases, ni data-* attributes
 */

/**
 * Clase para gestionar el carrusel de fotos turísticas locales
 */
class CarruselFotos {
    constructor() {
        this.$container = $('section[role="region"][aria-label="Galería fotográfica"]');
        this.fotos = [
            {
                src: 'multimedia/images/pola-siero-centro.jpg',
                alt: 'Vista del centro de Pola de Siero',
                titulo: 'Centro de Pola de Siero',
                descripcion: 'El corazón urbano del concejo con su arquitectura tradicional asturiana'
            },
            {
                src: 'multimedia/images/palacio-indiano-siero.jpg',
                alt: 'Palacio indiano histórico de Siero',
                titulo: 'Patrimonio Indiano',
                descripcion: 'Magnífico ejemplo de arquitectura indiana del siglo XIX'
            },
            {
                src: 'multimedia/images/sierra-sueve-siero.jpg',
                alt: 'Paisaje natural de la Sierra del Sueve',
                titulo: 'Sierra del Sueve',
                descripcion: 'Impresionantes vistas naturales y rutas de senderismo'
            },
            {
                src: 'multimedia/images/sidreria-tradicional-siero.jpg',
                alt: 'Sidrería tradicional asturiana',
                titulo: 'Tradición Sidrera',
                descripcion: 'Auténtica cultura sidrera en el corazón de Asturias'
            },
            {
                src: 'multimedia/images/fabada-siero.jpg',
                alt: 'Plato típico de fabada asturiana',
                titulo: 'Gastronomía Local',
                descripcion: 'Sabores auténticos de la cocina tradicional asturiana'
            }
        ];
        this.indiceActual = 0;
        this.intervalo = null;
        this.tiempoTransicion = 4000; // 4 segundos
        
        this.init();
    }
    
    init() {
        if (this.$container.length === 0) {
            console.warn('No se encontró el contenedor del carrusel');
            return;
        }
        
        this.crearEstructuraCarrusel();
        this.configurarEventos();
        this.iniciarCarruselAutomatico();
    }
    
    crearEstructuraCarrusel() {
        const carruselHTML = `
            <h2>Descubre Siero en Imágenes</h2>
            <figure role="img" aria-label="Carrusel de fotos turísticas">
                <section role="group" aria-label="Imagen principal">
                    <img src="${this.fotos[0].src}" 
                         alt="${this.fotos[0].alt}"
                         role="img">
                    <figcaption>
                        <h3>${this.fotos[0].titulo}</h3>
                        <p>${this.fotos[0].descripcion}</p>
                    </figcaption>
                </section>
                
                <nav role="navigation" aria-label="Controles de carrusel">
                    <button role="button" aria-label="Imagen anterior">❮</button>
                    <section role="group" aria-label="Indicadores de posición">
                        ${this.fotos.map((_, index) => 
                            `<button role="button" aria-label="Ir a imagen ${index + 1}" 
                                     aria-pressed="${index === 0 ? 'true' : 'false'}">●</button>`
                        ).join('')}
                    </section>
                    <button role="button" aria-label="Imagen siguiente">❯</button>
                </nav>
            </figure>
        `;
        
        this.$container.html(carruselHTML);
    }
    
    configurarEventos() {
        const self = this;
        
        // Botón anterior
        this.$container.find('nav[role="navigation"] button[aria-label="Imagen anterior"]').click(function() {
            self.imagenAnterior();
        });
        
        // Botón siguiente
        this.$container.find('nav[role="navigation"] button[aria-label="Imagen siguiente"]').click(function() {
            self.imagenSiguiente();
        });
        
        // Indicadores de posición
        this.$container.find('section[role="group"][aria-label="Indicadores de posición"] button').each(function(index) {
            $(this).click(function() {
                self.irAImagen(index);
            });
        });
        
        // Pausar en hover
        this.$container.find('figure').hover(
            function() {
                self.pausarCarrusel();
            },
            function() {
                self.reanudarCarrusel();
            }
        );
    }
    
    imagenAnterior() {
        this.indiceActual = (this.indiceActual - 1 + this.fotos.length) % this.fotos.length;
        this.actualizarImagen();
    }
    
    imagenSiguiente() {
        this.indiceActual = (this.indiceActual + 1) % this.fotos.length;
        this.actualizarImagen();
    }
    
    irAImagen(indice) {
        this.indiceActual = indice;
        this.actualizarImagen();
    }
    
    actualizarImagen() {
        const foto = this.fotos[this.indiceActual];
        const $imagen = this.$container.find('img[role="img"]');
        const $titulo = this.$container.find('figcaption h3');
        const $descripcion = this.$container.find('figcaption p');
        const $indicadores = this.$container.find('section[role="group"][aria-label="Indicadores de posición"] button');
        
        // Efecto de transición
        $imagen.fadeOut(300, function() {
            $(this).attr('src', foto.src)
                   .attr('alt', foto.alt);
            $titulo.text(foto.titulo);
            $descripcion.text(foto.descripcion);
            $(this).fadeIn(300);
        });
        
        // Actualizar indicadores
        $indicadores.attr('aria-pressed', 'false');
        $indicadores.eq(this.indiceActual).attr('aria-pressed', 'true');
    }
    
    iniciarCarruselAutomatico() {
        const self = this;
        this.intervalo = setInterval(function() {
            self.imagenSiguiente();
        }, this.tiempoTransicion);
    }
    
    pausarCarrusel() {
        if (this.intervalo) {
            clearInterval(this.intervalo);
            this.intervalo = null;
        }
    }
    
    reanudarCarrusel() {
        if (!this.intervalo) {
            this.iniciarCarruselAutomatico();
        }
    }
}

/**
 * Clase para gestionar noticias turísticas externas vía API
 */
class GestorNoticias {    constructor() {
        this.$container = $('section[role="region"][aria-label="Noticias turísticas"]');
          // Usar configuración global si está disponible
        if (window.SieroConfig) {
            this.modoDemo = window.SieroConfig.MODO_DEMO;
            this.intentarAPIs = window.SieroConfig.noticias.intentarAPIs;
            this.tiempoTimeout = window.SieroConfig.noticias.tiempoTimeout;
        } else {
            // Configuración por defecto si no hay config.js
            this.modoDemo = false; // Intentar APIs por defecto
            this.intentarAPIs = true;
            this.tiempoTimeout = 5000;
        }
          // APIs disponibles con múltiples fuentes de respaldo
        this.fuentes = [
            {
                nombre: 'El Comercio Asturias',
                url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.elcomercio.es/rss/2.0/&count=5',
                backup: false
            },
            {
                nombre: 'La Nueva España',
                url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.lne.es/rss/2.0/&count=5',
                backup: false
            },
            {
                nombre: 'RTPA Noticias',
                url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.rtpa.es/rss.xml&count=5',
                backup: false
            },
            {
                nombre: 'News API Generic',
                url: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.cnn.com/rss/edition.rss&count=3',
                backup: true
            }
        ];
        
        this.noticias = [];
        this.cargando = false;
        
        this.init();
    }
    
    init() {
        if (this.$container.length === 0) {
            console.warn('No se encontró el contenedor de noticias');
            return;
        }
        
        this.crearEstructuraNoticias();
        this.cargarNoticias();
    }
    
    crearEstructuraNoticias() {
        const noticiasHTML = `
            <h2>Últimas Noticias Turísticas</h2>
            <section role="status" aria-label="Estado de carga" aria-live="polite">
                <p>🔄 Cargando las últimas noticias turísticas...</p>
            </section>
            <section role="feed" aria-label="Lista de noticias">
                <!-- Las noticias se cargarán aquí dinámicamente -->
            </section>
            <nav role="navigation" aria-label="Controles de noticias">
                <button role="button" aria-label="Actualizar noticias">🔄 Actualizar</button>
                <button role="button" aria-label="Ver más noticias">📰 Ver más</button>
            </nav>
        `;
        
        this.$container.html(noticiasHTML);
        this.configurarEventosNoticias();
    }
    
    configurarEventosNoticias() {
        const self = this;
        
        // Botón actualizar
        this.$container.find('button[aria-label="Actualizar noticias"]').click(function() {
            self.cargarNoticias();
        });
        
        // Botón ver más
        this.$container.find('button[aria-label="Ver más noticias"]').click(function() {
            self.cargarMasNoticias();
        });
    }    async cargarNoticias() {
        if (this.cargando) return;
        
        this.cargando = true;
        this.mostrarCargando();
        
        // Solo usar modo demo si está explícitamente configurado
        if (this.modoDemo && !this.intentarAPIs) {
            console.log('🎭 Modo demo configurado - Mostrando noticias de ejemplo');
            setTimeout(() => {
                this.mostrarNoticiasEjemplo();
                this.cargando = false;
                this.ocultarCargando();
            }, 1500);
            return;
        }
        
        // Intentar conectar con APIs reales usando múltiples fuentes
        console.log('🌐 Intentando conectar con APIs de noticias reales...');
        
        let exitoso = false;
        
        // Intentar con cada fuente disponible
        for (const fuente of this.fuentes) {
            if (exitoso) break;
            
            try {
                console.log(`📡 Probando fuente: ${fuente.nombre}`);
                
                // Crear promise con timeout
                const fetchPromise = fetch(fuente.url);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout de API')), this.tiempoTimeout)
                );
                
                const response = await Promise.race([fetchPromise, timeoutPromise]);
                
                if (!response.ok) {
                    console.warn(`⚠️ ${fuente.nombre} falló con status: ${response.status}`);
                    continue; // Probar siguiente fuente
                }
                
                const data = await response.json();
                
                if (data.status === 'ok' && data.items && data.items.length > 0) {
                    this.noticias = data.items.slice(0, 6).map(item => ({
                        title: item.title || 'Título no disponible',
                        description: item.description ? item.description.substring(0, 200) + '...' : 'Sin descripción disponible',
                        publishedAt: item.pubDate || new Date().toISOString(),
                        source: { name: fuente.nombre },
                        url: item.link || '#',
                        urlToImage: item.enclosure && item.enclosure.link ? item.enclosure.link : null
                    }));
                    
                    console.log(`✅ Noticias cargadas exitosamente desde ${fuente.nombre}:`, this.noticias.length);
                    this.mostrarNoticias();
                    exitoso = true;
                    return;
                } else {
                    console.warn(`⚠️ ${fuente.nombre} no devolvió datos válidos`);
                }
                
            } catch (error) {
                console.warn(`❌ Error con ${fuente.nombre}:`, error.message);
                // Continuar con la siguiente fuente
            }
        }
        
        // Si ninguna fuente funcionó, usar noticias de ejemplo
        if (!exitoso) {
            console.error('❌ Todas las fuentes de noticias fallaron');
            console.log('🔄 Cambiando a noticias de ejemplo como fallback');
            this.mostrarNoticiasEjemplo();
        }
        
        this.cargando = false;
        this.ocultarCargando();
    }
    
    mostrarNoticias() {
        const $contenedor = this.$container.find('section[role="feed"]');
        
        if (this.noticias.length === 0) {
            $contenedor.html('<p role="alert">No se encontraron noticias recientes.</p>');
            return;
        }
        
        const noticiasHTML = this.noticias.map((noticia, index) => `
            <article role="article" aria-label="Noticia ${index + 1}">
                <header>
                    <h3>
                        <a href="${noticia.url}" target="_blank" rel="noopener noreferrer">
                            ${noticia.title}
                        </a>
                    </h3>
                    <time datetime="${noticia.publishedAt}" role="text">
                        ${this.formatearFecha(noticia.publishedAt)}
                    </time>
                    <cite role="text">📰 ${noticia.source.name}</cite>
                </header>
                <section role="text">
                    ${noticia.urlToImage ? `<img src="${noticia.urlToImage}" alt="Imagen de la noticia" role="img">` : ''}
                    <p>${noticia.description || 'Descripción no disponible.'}</p>
                </section>
                <footer>
                    <a href="${noticia.url}" target="_blank" rel="noopener noreferrer" 
                       aria-label="Leer noticia completa en nueva pestaña">
                        Leer más →
                    </a>
                </footer>
            </article>
        `).join('');
        
        $contenedor.html(noticiasHTML);
    }
      mostrarNoticiasEjemplo() {
        // Noticias de ejemplo realistas cuando falla la API
        const fechaHoy = new Date();
        const noticiasEjemplo = [
            {
                title: "Siero impulsa nuevas rutas turísticas por la Sierra del Sueve",
                description: "El concejo presenta un ambicioso plan para promocionar el turismo de naturaleza con nuevos senderos señalizados y miradores panorámicos que ofrecen vistas espectaculares de la costa asturiana.",
                publishedAt: fechaHoy.toISOString(),
                source: { name: "Turismo Asturias" },
                url: "#",
                urlToImage: "multimedia/images/sierra-sueve-siero.jpg"
            },
            {
                title: "La gastronomía asturiana protagonista en las ferias de turismo europeas",
                description: "La fabada, el cachopo y la sidra de Siero destacan en las últimas ferias gastronómicas celebradas en París y Londres, atrayendo el interés de tour operadores internacionales.",
                publishedAt: new Date(fechaHoy.getTime() - 86400000).toISOString(),
                source: { name: "La Nueva España" },
                url: "#",
                urlToImage: "multimedia/images/fabada-siero.jpg"
            },
            {
                title: "Record de visitantes en los palacios indianos de Asturias",
                description: "El patrimonio indiano bate records de visitas con rutas organizadas desde Siero. Los palacios construidos por emigrantes retornados de América son el nuevo reclamo turístico.",
                publishedAt: new Date(fechaHoy.getTime() - 172800000).toISOString(),
                source: { name: "El Comercio" },
                url: "#",
                urlToImage: "multimedia/images/palacio-indiano-siero.jpg"
            },
            {
                title: "Siero apuesta por el turismo sostenible y de proximidad",
                description: "El Ayuntamiento de Siero presenta su nueva estrategia de turismo responsable, promoviendo actividades respetuosas con el medio ambiente y el patrimonio cultural local.",
                publishedAt: new Date(fechaHoy.getTime() - 259200000).toISOString(),
                source: { name: "RTPA" },
                url: "#",
                urlToImage: "multimedia/images/pola-siero-centro.jpg"
            },
            {
                title: "La sidra de Siero, embajadora de Asturias en el mundo",
                description: "Las sidrerías del concejo participan en una campaña internacional para promocionar la sidra asturiana como producto turístico y gastronómico de referencia.",
                publishedAt: new Date(fechaHoy.getTime() - 345600000).toISOString(),
                source: { name: "Asturias24" },
                url: "#",
                urlToImage: "multimedia/images/sidreria-tradicional-siero.jpg"
            },
            {
                title: "Nuevas tecnologías al servicio del turismo en Siero",
                description: "El concejo estrena una app móvil con realidad aumentada para descubrir el patrimonio histórico y natural, convirtiendo cada visita en una experiencia interactiva única.",
                publishedAt: new Date(fechaHoy.getTime() - 432000000).toISOString(),
                source: { name: "Turismo Digital" },
                url: "#",
                urlToImage: null
            }
        ];
        
        this.noticias = noticiasEjemplo;
        this.mostrarNoticias();        // Añadir mensaje informativo apropiado
        this.$container.find('section[role="feed"]').prepend(`
            <aside role="note" aria-label="Información sobre las noticias">
                <p><strong>⚠️ API NO DISPONIBLE - FALLBACK ACTIVADO</strong></p>
                <p>No se pudieron cargar noticias reales desde las APIs externas (posibles causas: CORS, límites de API, conectividad). 
                Se muestran noticias de ejemplo realistas sobre turismo en Siero y Asturias.</p>
                <p><em>En un entorno de producción con servidor proxy, se cargarían noticias reales desde medios asturianos.</em></p>
            </aside>
        `);
    }
      async cargarMasNoticias() {
        // Implementar paginación si se requiere
        console.log('📰 Funcionalidad "Ver más noticias" no implementada en demo');
        alert('Esta funcionalidad dirigiría a un portal de noticias completo');
    }
    
    // Función de debug para probar APIs individualmente
    async probarAPI(indice = 0) {
        if (indice >= this.fuentes.length) {
            console.log('🔍 Se probaron todas las fuentes disponibles');
            return;
        }
        
        const fuente = this.fuentes[indice];
        console.log(`🧪 Probando API ${indice + 1}/${this.fuentes.length}: ${fuente.nombre}`);
        console.log(`📡 URL: ${fuente.url}`);
        
        try {
            const response = await fetch(fuente.url);
            console.log(`📊 Status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${fuente.nombre} - Datos recibidos:`, data);
            } else {
                console.log(`❌ ${fuente.nombre} - Error HTTP: ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${fuente.nombre} - Error de conexión:`, error.message);
        }
    }
    
    mostrarCargando() {
        this.$container.find('section[role="status"]').show();
    }
    
    ocultarCargando() {
        this.$container.find('section[role="status"]').hide();
    }
    
    formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        const opciones = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return fecha.toLocaleDateString('es-ES', opciones);
    }
}

/**
 * Inicialización cuando el documento esté listo
 */
$(document).ready(function() {
    console.log('Inicializando gestor del index...');
    
    // Crear instancias de los gestores
    window.carruselFotos = new CarruselFotos();
    window.gestorNoticias = new GestorNoticias();
      console.log('Carrusel y noticias inicializados correctamente');
    
    // Funciones de debug globales para testing de APIs
    window.probarNoticiasAPI = function(indice) {
        if (window.gestorNoticias) {
            window.gestorNoticias.probarAPI(indice);
        } else {
            console.error('Gestor de noticias no inicializado');
        }
    };
    
    window.probarTodasLasAPIs = async function() {
        if (window.gestorNoticias) {
            console.log('🔍 Probando todas las APIs de noticias...');
            for (let i = 0; i < window.gestorNoticias.fuentes.length; i++) {
                await window.gestorNoticias.probarAPI(i);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa de 1 segundo
            }
        } else {
            console.error('Gestor de noticias no inicializado');
        }
    };
    
    console.log('🛠️ Funciones de debug disponibles:');
    console.log('- probarNoticiasAPI(indice) - Probar una API específica');
    console.log('- probarTodasLasAPIs() - Probar todas las APIs disponibles');
});
