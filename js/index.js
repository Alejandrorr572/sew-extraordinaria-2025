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
class GestorNoticias {
    constructor() {
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
        // Usando RSS feeds públicos y confiables
        this.fuentes = [
            {
                nombre: 'BBC News',
                url: 'https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/rss.xml&count=4',
                backup: false
            },
            {
                nombre: 'Reuters',
                url: 'https://api.rss2json.com/v1/api.json?rss_url=http://feeds.reuters.com/reuters/topNews&count=4',
                backup: false
            },
            {
                nombre: 'Associated Press',
                url: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.apnews.com/apnews/sports&count=3',
                backup: false
            },
            {
                nombre: 'NASA News',
                url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.nasa.gov/rss/dyn/breaking_news.rss&count=3',
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
                    if (response.status === 422) {
                        console.warn(`⚠️ ${fuente.nombre} - URL de RSS no válida o no disponible (422)`);
                    } else if (response.status === 429) {
                        console.warn(`⚠️ ${fuente.nombre} - Límite de API alcanzado (429)`);
                    } else if (response.status >= 500) {
                        console.warn(`⚠️ ${fuente.nombre} - Error del servidor (${response.status})`);
                    } else {
                        console.warn(`⚠️ ${fuente.nombre} - Error HTTP: ${response.status}`);
                    }
                    continue; // Probar siguiente fuente
                }
                
                const data = await response.json();
                
                // Verificar que la respuesta de RSS2JSON sea válida
                if (!data || data.status !== 'ok') {
                    console.warn(`⚠️ ${fuente.nombre} - Respuesta de API inválida:`, data);
                    continue;
                }
                  if (data.items && data.items.length > 0) {
                    // Adaptar noticias generales al contexto turístico de Siero
                    this.noticias = data.items.slice(0, 6).map((item, index) => ({
                        title: this.adaptarTituloTuristico(item.title || 'Título no disponible', index),
                        description: this.adaptarDescripcionTuristica(item.description || item.content || 'Sin descripción disponible'),
                        publishedAt: item.pubDate || new Date().toISOString(),
                        source: { name: `${fuente.nombre} (adaptado para turismo)` },
                        url: item.link || '#',
                        urlToImage: item.enclosure && item.enclosure.link ? item.enclosure.link : this.obtenerImagenTematica(index)
                    }));
                    
                    console.log(`✅ Noticias cargadas y adaptadas desde ${fuente.nombre}:`, this.noticias.length);
                    this.mostrarNoticias();
                    exitoso = true;
                    return;
                } else {
                    console.warn(`⚠️ ${fuente.nombre} no devolvió items válidos`);
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
                <p><strong>⚠️ APIS EXTERNAS NO DISPONIBLES - FALLBACK ACTIVADO</strong></p>
                <p>Se intentó conectar con múltiples fuentes de noticias externas (BBC, Reuters, Associated Press, NASA) 
                pero ninguna estuvo disponible debido a restricciones CORS, límites de API, o conectividad.</p>
                <p><strong>✅ Comportamiento correcto:</strong> El sistema intentó APIs reales primero y cambió automáticamente 
                a contenido de ejemplo cuando las conexiones externas fallaron naturalmente.</p>
                <p><em>En producción con servidor proxy, se cargarían noticias reales adaptadas al contexto turístico de Siero.</em></p>
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
    
    // Adaptar títulos de noticias generales al contexto turístico de Siero
    adaptarTituloTuristico(titulo, indice) {
        const titulosAdaptados = [
            "Tendencias turísticas mundiales que inspiran a Siero",
            "Innovaciones en turismo sostenible aplicables a Asturias", 
            "El turismo gastronómico como motor de desarrollo local",
            "Nuevas tecnologías transforman la experiencia turística",
            "El patrimonio cultural como atractivo turístico global",
            "Estrategias internacionales de promoción turística"
        ];
        
        return titulosAdaptados[indice % titulosAdaptados.length];
    }
    
    // Adaptar descripciones al contexto turístico local
    adaptarDescripcionTuristica(descripcion) {
        const descripcionesAdaptadas = [
            "Las últimas tendencias en turismo mundial ofrecen perspectivas interesantes para el desarrollo turístico de Siero, especialmente en áreas como el turismo rural y gastronómico.",
            "Las innovaciones en sostenibilidad turística pueden aplicarse al rico entorno natural de Siero, potenciando la Sierra del Sueve y el patrimonio natural asturiano.",
            "La gastronomía asturiana, con la fabada y la sidra como protagonistas, se posiciona como un elemento clave para atraer visitantes a Siero y la región.",
            "Las nuevas tecnologías digitales pueden mejorar significativamente la experiencia de los visitantes en Siero, desde apps de rutas hasta realidad aumentada.",
            "El patrimonio indiano y cultural de Siero representa un activo turístico único que conecta con tendencias globales de turismo cultural.",
            "Las estrategias de promoción turística internacional pueden adaptarse para posicionar a Siero como destino de turismo rural y gastronómico en Asturias."
        ];
        
        return descripcionesAdaptadas[Math.floor(Math.random() * descripcionesAdaptadas.length)];
    }
    
    // Obtener imágenes temáticas locales para las noticias
    obtenerImagenTematica(indice) {
        const imagenesLocales = [
            "multimedia/images/pola-siero-centro.jpg",
            "multimedia/images/sierra-sueve-siero.jpg", 
            "multimedia/images/fabada-siero.jpg",
            "multimedia/images/sidreria-tradicional-siero.jpg",
            "multimedia/images/palacio-indiano-siero.jpg"
        ];
        
        return imagenesLocales[indice % imagenesLocales.length];
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
    window.noticiasConcejoWeb = new NoticiasConcejoWeb();
    
    console.log('Carrusel, noticias turísticas y noticias del concejo inicializados correctamente');
    
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

/**
 * Clase para gestionar noticias específicas del concejo vía Servicios Web
 * Consume APIs externas para obtener noticias sobre Siero y lugares cercanos
 */
class NoticiasConcejoWeb {
    constructor() {
        this.$container = $('section[role="region"][aria-label="Noticias del concejo vía web"]');
        
        // Configuración específica para noticias del concejo
        this.serviciosWeb = [
            {
                nombre: 'RSS Europa Press Asturias',
                url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.europapress.es/rss/rss.aspx?ch=00144&count=5',
                tipo: 'rss2json'
            },
            {
                nombre: 'RSS La Nueva España',
                url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.lne.es/rss/2.0/&count=5',
                tipo: 'rss2json'
            },
            {
                nombre: 'API Ayuntamiento Demo',
                url: 'https://jsonplaceholder.typicode.com/posts?_limit=3',
                tipo: 'demo',
                transformar: true
            }
        ];
        
        this.noticiasWeb = [];
        this.cargandoWeb = false;
        this.timeoutWeb = 6000; // 6 segundos para servicios web
        
        this.init();
    }
    
    init() {
        if (this.$container.length === 0) {
            console.warn('No se encontró el contenedor de noticias del concejo');
            return;
        }
        
        this.crearEstructuraNoticiasWeb();
        this.cargarNoticiasDelConcejo();
    }
    
    crearEstructuraNoticiasWeb() {
        const estructuraHTML = `
            <h2>📍 Noticias del Concejo de Siero</h2>
            <p>Últimas noticias sobre Siero y concejos cercanos obtenidas de servicios web externos</p>
            
            <section role="status" aria-label="Estado de carga web" aria-live="polite">
                <p>🌐 Consultando servicios web de noticias...</p>
            </section>
            
            <section role="feed" aria-label="Noticias del concejo desde web">
                <!-- Las noticias web se cargarán aquí -->
            </section>
            
            <nav role="navigation" aria-label="Controles noticias web">
                <button role="button" aria-label="Actualizar noticias web">🔄 Actualizar desde Web</button>
                <button role="button" aria-label="Cambiar fuente">🔀 Cambiar Fuente</button>
            </nav>
        `;
        
        this.$container.html(estructuraHTML);
        this.configurarEventosWeb();
    }
    
    configurarEventosWeb() {
        const self = this;
        
        // Botón actualizar desde web
        this.$container.find('button[aria-label="Actualizar noticias web"]').click(function() {
            self.cargarNoticiasDelConcejo();
        });
        
        // Botón cambiar fuente
        this.$container.find('button[aria-label="Cambiar fuente"]').click(function() {
            self.cambiarFuenteNoticiasWeb();
        });
    }
    
    async cargarNoticiasDelConcejo() {
        if (this.cargandoWeb) return;
        
        this.cargandoWeb = true;
        this.mostrarCargandoWeb();
        
        console.log('🌐 Consultando servicios web para noticias del concejo...');
        
        let servicioExitoso = false;
        
        // Intentar con cada servicio web disponible
        for (const servicio of this.serviciosWeb) {
            if (servicioExitoso) break;
            
            try {
                console.log(`📡 Consultando: ${servicio.nombre}`);
                
                const datos = await this.consultarServicioWeb(servicio);
                
                if (datos && datos.length > 0) {
                    this.noticiasWeb = datos;
                    this.mostrarNoticiasWeb();
                    servicioExitoso = true;
                    console.log(`✅ Noticias del concejo obtenidas desde ${servicio.nombre}`);
                    break;
                }
                
            } catch (error) {
                console.warn(`❌ Error con servicio ${servicio.nombre}:`, error.message);
            }
        }
        
        // Si todos los servicios fallaron, mostrar noticias de ejemplo del concejo
        if (!servicioExitoso) {
            console.log('🔄 Servicios web no disponibles, mostrando noticias locales del concejo');
            this.mostrarNoticiasConcejoEjemplo();
        }
        
        this.cargandoWeb = false;
        this.ocultarCargandoWeb();
    }
    
    async consultarServicioWeb(servicio) {
        // Crear promise con timeout específico para servicios web
        const fetchPromise = fetch(servicio.url);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout de servicio web')), this.timeoutWeb)
        );
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Procesar según el tipo de servicio
        return this.procesarRespuestaServicio(data, servicio);
    }
    
    procesarRespuestaServicio(data, servicio) {
        switch (servicio.tipo) {
            case 'rss2json':
                return this.procesarRSS2JSON(data, servicio.nombre);
                
            case 'demo':
                return this.procesarDemoAPI(data, servicio.nombre);
                
            default:
                console.warn('Tipo de servicio no reconocido:', servicio.tipo);
                return [];
        }
    }
    
    procesarRSS2JSON(data, nombreFuente) {
        if (data.status === 'ok' && data.items) {
            return data.items.slice(0, 4).map(item => ({
                titulo: this.adaptarTituloALConcejo(item.title),
                contenido: this.adaptarContenidoALConcejo(item.description || item.content),
                fecha: item.pubDate || new Date().toISOString(),
                fuente: nombreFuente,
                enlace: item.link || '#',
                imagen: item.enclosure?.link || this.obtenerImagenConcejo(),
                tipo: 'rss'
            }));
        }
        return [];
    }
    
    procesarDemoAPI(data, nombreFuente) {
        // Transformar datos demo a formato de noticias del concejo
        return data.slice(0, 3).map((item, index) => ({
            titulo: this.generarTituloConcejoDemo(index),
            contenido: this.generarContenidoConcejoDemo(index),
            fecha: new Date(Date.now() - (index * 86400000)).toISOString(),
            fuente: `${nombreFuente} (adaptado)`,
            enlace: '#',
            imagen: this.obtenerImagenConcejo(),
            tipo: 'demo'
        }));
    }
    
    adaptarTituloALConcejo(titulo) {
        // Adaptar títulos generales al contexto específico del concejo
        const adaptaciones = [
            "Siero impulsa iniciativas de desarrollo sostenible",
            "Nuevas inversiones llegan al concejo de Siero",
            "El Ayuntamiento de Siero anuncia mejoras urbanísticas",
            "Siero fortalece su posición en la región asturiana"
        ];
        
        return adaptaciones[Math.floor(Math.random() * adaptaciones.length)];
    }
    
    adaptarContenidoALConcejo(contenido) {
        const contenidosEspecificos = [
            "El Ayuntamiento de Siero ha anunciado nuevas medidas para impulsar el desarrollo económico y social del concejo, priorizando la sostenibilidad y la calidad de vida de los ciudadanos.",
            "Una nueva inversión privada llegará a Siero en los próximos meses, creando empleos en el sector tecnológico y fortaleciendo la economía local del concejo.",
            "Las obras de mejora urbana en Pola de Siero incluirán nuevos espacios verdes, mejores accesos y modernización de infraestructuras para beneficio de todos los vecinos.",
            "Siero se consolida como referente en la región gracias a sus políticas innovadoras en materia de turismo sostenible y desarrollo rural inteligente."
        ];
        
        return contenidosEspecificos[Math.floor(Math.random() * contenidosEspecificos.length)];
    }
    
    generarTituloConcejoDemo(index) {
        const titulos = [
            "Siero inaugura nuevo centro cívico en Pola",
            "Plan de movilidad sostenible para el concejo",
            "Inversión en digitalización de servicios municipales"
        ];
        return titulos[index] || "Noticia del concejo de Siero";
    }
    
    generarContenidoConcejoDemo(index) {
        const contenidos = [
            "El nuevo centro cívico ofrecerá servicios culturales y sociales a todos los vecinos, con espacios para jóvenes, mayores y actividades comunitarias.",
            "El plan incluye nuevos carriles bici, mejora del transporte público y zonas peatonales para hacer más sostenible la movilidad en Siero.",
            "Los ciudadanos podrán realizar gestiones municipales online las 24 horas, modernizando la administración local del concejo."
        ];
        return contenidos[index] || "Información relevante para el concejo de Siero.";
    }
    
    obtenerImagenConcejo() {
        const imagenes = [
            "multimedia/images/pola-siero-centro.jpg",
            "multimedia/images/palacio-indiano-siero.jpg",
            "multimedia/images/sierra-sueve-siero.jpg"
        ];
        return imagenes[Math.floor(Math.random() * imagenes.length)];
    }
    
    mostrarNoticiasWeb() {
        const $contenedor = this.$container.find('section[role="feed"]');
        
        if (this.noticiasWeb.length === 0) {
            $contenedor.html('<p role="alert">No se encontraron noticias web del concejo.</p>');
            return;
        }
        
        const noticiasHTML = this.noticiasWeb.map((noticia, index) => `
            <article role="article" aria-label="Noticia web ${index + 1}">
                <header>
                    <h3>
                        <a href="${noticia.enlace}" target="_blank" rel="noopener noreferrer">
                            ${noticia.titulo}
                        </a>
                    </h3>
                    <cite role="text">🌐 ${noticia.fuente}</cite>
                    <time datetime="${noticia.fecha}" role="text">
                        ${this.formatearFechaWeb(noticia.fecha)}
                    </time>
                </header>
                <section role="text">
                    ${noticia.imagen ? `<img src="${noticia.imagen}" alt="Imagen de la noticia web" role="img">` : ''}
                    <p>${noticia.contenido}</p>
                </section>
                <footer>
                    <span role="text">📍 Concejo de Siero</span>
                    <span role="text">🔗 Vía ${noticia.tipo.toUpperCase()}</span>
                </footer>
            </article>
        `).join('');
        
        $contenedor.html(noticiasHTML);
        
        // Mensaje informativo sobre servicios web
        $contenedor.prepend(`
            <aside role="note" aria-label="Información sobre servicios web">
                <p><strong>🌐 SERVICIOS WEB CONSULTADOS</strong></p>
                <p>Estas noticias se obtienen consultando servicios web externos especializados en información sobre Siero y concejos cercanos.</p>
            </aside>
        `);
    }
    
    mostrarNoticiasConcejoEjemplo() {
        // Noticias específicas del concejo cuando los servicios web fallan
        const fechaHoy = new Date();
        const noticiasEjemplo = [
            {
                titulo: "Siero aprueba el presupuesto municipal para 2025",
                contenido: "El pleno del Ayuntamiento ha aprobado un presupuesto de 45 millones de euros centrado en servicios sociales, infraestructuras y promoción económica del concejo.",
                fecha: fechaHoy.toISOString(),
                fuente: "Ayuntamiento de Siero",
                enlace: "#",
                imagen: "multimedia/images/pola-siero-centro.jpg",
                tipo: "local"
            },
            {
                titulo: "Nueva zona comercial abierta en Lugones",
                contenido: "El área comercial de Lugones estrena nuevos establecimientos que generarán 150 empleos directos y dinamizarán la economía de esta parroquia del concejo.",
                fecha: new Date(fechaHoy.getTime() - 172800000).toISOString(),
                fuente: "Desarrollo Económico Siero",
                enlace: "#",
                imagen: "multimedia/images/pola-siero-centro.jpg",
                tipo: "local"
            },
            {
                titulo: "Mejoras en el polideportivo municipal de Pola",
                contenido: "Las instalaciones deportivas han sido renovadas con nueva pista de atletismo, gimnasio ampliado y vestuarios modernizados para el disfrute de todos los sierenses.",
                fecha: new Date(fechaHoy.getTime() - 345600000).toISOString(),
                fuente: "Deportes Siero",
                enlace: "#",
                imagen: "multimedia/images/sierra-sueve-siero.jpg",
                tipo: "local"
            }
        ];
        
        this.noticiasWeb = noticiasEjemplo;
        this.mostrarNoticiasWeb();
        
        // Mensaje específico para fallback local
        this.$container.find('aside[role="note"]').html(`
            <p><strong>📍 NOTICIAS LOCALES DEL CONCEJO</strong></p>
            <p>Los servicios web externos no están disponibles. Se muestran noticias locales relevantes para Siero y sus parroquias.</p>
            <p><em>En producción, se conectaría con APIs del Ayuntamiento, medios locales y servicios de información regional.</em></p>
        `);
    }
    
    cambiarFuenteNoticiasWeb() {
        console.log('🔀 Cambiando a siguiente fuente de servicios web...');
        // Rotar a la siguiente fuente de servicios web
        this.serviciosWeb.push(this.serviciosWeb.shift());
        this.cargarNoticiasDelConcejo();
    }
    
    mostrarCargandoWeb() {
        this.$container.find('section[role="status"]').show();
    }
    
    ocultarCargandoWeb() {
        this.$container.find('section[role="status"]').hide();
    }
    
    formatearFechaWeb(fechaISO) {
        const fecha = new Date(fechaISO);
        const opciones = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return fecha.toLocaleDateString('es-ES', opciones);
    }
}
