/**
 * Sistema de gestión turística de Siero
 *                </article>
                <nav class="carrusel-controles">
                    <button class="carrusel-btn carrusel-prev" aria-label="Imagen anterior">‹</button>
                    <button class="carrusel-btn carrusel-next" aria-label="Imagen siguiente">›</button>
                </nav>
                <nav class="carrusel-indicadores">
                    ${this.fotos.map((_, index) => `
                        <button class="carrusel-indicador ${index === 0 ? 'active' : ''}" 
                                data-index="${index}" aria-label="Ir a imagen ${index + 1}">
                        </button>
                    `).join('')}
                </nav>
            </section>ón orientada a objetos con jQuery
 * @author Descubre Siero
 * @version 1.0
 */

/**
 * Clase para gestionar el carrusel de fotos turísticas
 */
class CarruselTuristico {    constructor(contenedorSelector, opciones = {}) {
        this.$contenedor = $(contenedorSelector);
        this.fotos = opciones.fotos || [];
        this.indiceActual = 0;
        this.intervaloAuto = opciones.intervaloAuto || 4000;
        this.autoPlay = opciones.autoPlay !== false;
        this.timerAuto = null;
        
        this.init();
    }
    
    /**
     * Inicializa el carrusel
     */
    init() {
        this.crearEstructuraHTML();
        this.configurarEventos();
        if (this.autoPlay) {
            this.iniciarAutoplay();
        }
        this.mostrarFoto(0);
    }
      /**
     * Crea la estructura HTML del carrusel
     */    crearEstructuraHTML() {
        const htmlCarrusel = `
            <section role="region" aria-label="Carrusel de imágenes">
                <div role="presentation">
                    ${this.fotos.map((foto, index) => `
                        <figure id="slide-${index}" role="group" aria-labelledby="titulo-${index}" ${index === 0 ? '' : 'hidden'}>
                            <img src="${foto.src}" alt="${foto.alt}">
                            <figcaption>
                                <h3 id="titulo-${index}">${foto.titulo}</h3>
                                <p>${foto.descripcion}</p>
                            </figcaption>
                        </figure>
                    `).join('')}
                </div>
                <div role="group">
                    <button aria-label="Imagen anterior">‹</button>
                    <button aria-label="Imagen siguiente">›</button>
                </div>
                <div role="group">
                    ${this.fotos.map((_, index) => `
                        <button role="button" 
                                aria-controls="slide-${index}" 
                                aria-selected="${index === 0 ? 'true' : 'false'}"
                                aria-label="Ir a imagen ${index + 1}">
                        </button>
                    `).join('')}
                </div>
            </section>
        `;
        
        this.$contenedor.html(htmlCarrusel);
    }
      /**
     * Configura los eventos de interacción
     */
    configurarEventos() {
        // Botón anterior
        this.$contenedor.find('[aria-label="Imagen anterior"]').on('click', () => {
            this.anterior();
        });
        
        // Botón siguiente
        this.$contenedor.find('[aria-label="Imagen siguiente"]').on('click', () => {
            this.siguiente();
        });
        
        // Indicadores
        this.$contenedor.find('[role="button"][aria-controls^="slide"]').on('click', (e) => {
            const indice = parseInt($(e.currentTarget).attr('aria-controls').replace('slide-', ''));
            this.mostrarFoto(indice);
        });
        
        // Pausar autoplay al hacer hover
        this.$contenedor.on('mouseenter', () => {
            this.pausarAutoplay();
        });
        
        this.$contenedor.on('mouseleave', () => {
            if (this.autoPlay) {
                this.iniciarAutoplay();
            }
        });
        
        // Navegación con teclado
        $(document).on('keydown', (e) => {
            if (this.$contenedor.is(':visible')) {
                if (e.key === 'ArrowLeft') {
                    this.anterior();
                } else if (e.key === 'ArrowRight') {
                    this.siguiente();
                }
            }
        });
    }
      /**
     * Muestra una foto específica
     * @param {number} indice - Índice de la foto a mostrar
     */
    mostrarFoto(indice) {
        if (indice < 0 || indice >= this.fotos.length) return;
        
        // Actualizar slides
        this.$contenedor.find('figure[role="group"]').attr('hidden', 'hidden');
        this.$contenedor.find(`#slide-${indice}`).removeAttr('hidden');
        
        // Actualizar indicadores
        this.$contenedor.find('[role="button"][aria-controls^="slide"]').attr('aria-selected', 'false');
        this.$contenedor.find(`[aria-controls="slide-${indice}"]`).attr('aria-selected', 'true');
        
        this.indiceActual = indice;
    }
    
    /**
     * Ir a la imagen anterior
     */
    anterior() {
        const nuevoIndice = this.indiceActual > 0 ? this.indiceActual - 1 : this.fotos.length - 1;
        this.mostrarFoto(nuevoIndice);
    }
    
    /**
     * Ir a la imagen siguiente
     */
    siguiente() {
        const nuevoIndice = this.indiceActual < this.fotos.length - 1 ? this.indiceActual + 1 : 0;
        this.mostrarFoto(nuevoIndice);
    }
    
    /**
     * Iniciar el autoplay
     */
    iniciarAutoplay() {
        this.pausarAutoplay();
        this.timerAuto = setInterval(() => {
            this.siguiente();
        }, this.intervaloAuto);
    }
    
    /**
     * Pausar el autoplay
     */
    pausarAutoplay() {
        if (this.timerAuto) {
            clearInterval(this.timerAuto);
            this.timerAuto = null;
        }
    }
}

/**
 * Clase para gestionar las noticias turísticas
 */
class NoticiasManager {
    constructor(contenedorId, opciones = {}) {
        this.$contenedor = $(contenedorId);
        this.apiKey = opciones.apiKey || '';
        this.maxNoticias = opciones.maxNoticias || 5;
        this.categoria = opciones.categoria || 'turismo';
        this.region = opciones.region || 'Asturias';
        
        this.init();
    }
    
    /**
     * Inicializa el gestor de noticias
     */
    init() {
        this.mostrarCargando();
        this.cargarNoticias();
    }
    
    /**
     * Muestra el indicador de carga
     */    mostrarCargando() {
        this.$contenedor.html(`
            <section class="noticias-loading">
                <figure class="loading-spinner"></figure>
                <p>Cargando últimas noticias turísticas...</p>
            </section>
        `);
    }
    
    /**
     * Carga las noticias desde servicios web
     */
    async cargarNoticias() {
        try {
            // Simulamos llamada a API de noticias (NewsAPI, RSS feeds, etc.)
            // En una implementación real, aquí iría la llamada real a la API
            const noticias = await this.simularAPICall();
            this.renderizarNoticias(noticias);
        } catch (error) {
            this.mostrarError(error);
        }
    }
    
    /**
     * Simula una llamada a API de noticias
     * En una implementación real, esto sería una llamada fetch() a una API real
     */
    async simularAPICall() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        titulo: "Nuevo sendero interpretativo en la Sierra del Sueve",
                        descripcion: "El Concejo de Siero inaugura una nueva ruta de senderismo que conecta diversos miradores naturales...",
                        fecha: "2025-06-08",
                        fuente: "Turismo Asturias",
                        url: "#",
                        imagen: "multimedia/images/sierra-sueve-siero.jpg"
                    },
                    {
                        titulo: "Festival Gastronómico de Sidra y Fabada en Pola de Siero",
                        descripcion: "Del 15 al 17 de junio se celebrará el tradicional festival que reúne a los mejores productores locales...",
                        fecha: "2025-06-07",
                        fuente: "La Voz de Asturias",
                        url: "#",
                        imagen: "multimedia/images/fabada-siero.jpg"
                    },
                    {
                        titulo: "Restauración del Palacio de los Álvarez-Buylla",
                        descripcion: "Concluyen las obras de restauración de uno de los edificios indianos más emblemáticos del concejo...",
                        fecha: "2025-06-06",
                        fuente: "El Comercio",
                        url: "#",
                        imagen: "multimedia/images/palacio-indiano-siero.jpg"
                    },
                    {
                        titulo: "Nuevas rutas de cicloturismo conectan Siero con concejos limítrofes",
                        descripcion: "Se han señalizado tres nuevas rutas ciclistas que permiten descubrir el patrimonio natural y cultural...",
                        fecha: "2025-06-05",
                        fuente: "Cadena SER Asturias",
                        url: "#",
                        imagen: "multimedia/images/pola-siero-centro.jpg"
                    },
                    {
                        titulo: "Siero se posiciona como destino de turismo rural sostenible",
                        descripcion: "El concejo recibe la certificación de destino turístico sostenible por sus iniciativas medioambientales...",
                        fecha: "2025-06-04",
                        fuente: "RTPA",
                        url: "#",
                        imagen: "multimedia/images/sidreria-tradicional-siero.jpg"
                    }
                ]);
            }, 1500);
        });
    }
    
    /**
     * Renderiza las noticias en el DOM
     * @param {Array} noticias - Array de objetos noticia
     */    renderizarNoticias(noticias) {
        const htmlNoticias = `
            <section class="noticias-container">
                <section class="noticias-grid">
                    ${noticias.slice(0, this.maxNoticias).map(noticia => `
                        <article class="noticia-card">
                            <figure class="noticia-imagen">
                                <img src="${noticia.imagen}" alt="${noticia.titulo}" loading="lazy">
                            </figure>
                            <section class="noticia-contenido">
                                <h3 class="noticia-titulo">
                                    <a href="${noticia.url}" target="_blank" rel="noopener noreferrer">
                                        ${noticia.titulo}
                                    </a>
                                </h3>
                                <p class="noticia-descripcion">${noticia.descripcion}</p>
                                <footer class="noticia-meta">
                                    <time class="noticia-fecha">${this.formatearFecha(noticia.fecha)}</time>
                                    <cite class="noticia-fuente">${noticia.fuente}</cite>
                                </footer>
                            </section>
                        </article>
                    `).join('')}
                </section>
                <footer class="noticias-footer">
                    <button class="btn-cargar-mas" onclick="noticiasManager.cargarMasNoticias()">
                        Cargar más noticias
                    </button>
                </footer>
            </section>
        `;
        
        this.$contenedor.html(htmlNoticias);
        this.aplicarEfectos();
    }
    
    /**
     * Aplica efectos de animación a las noticias
     */
    aplicarEfectos() {
        this.$contenedor.find('.noticia-card').each((index, elemento) => {
            $(elemento).delay(index * 200).fadeIn(500);
        });
    }
    
    /**
     * Formatea una fecha para mostrar
     * @param {string} fecha - Fecha en formato YYYY-MM-DD
     * @returns {string} Fecha formateada
     */
    formatearFecha(fecha) {
        const opciones = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return new Date(fecha).toLocaleDateString('es-ES', opciones);
    }
    
    /**
     * Muestra mensaje de error
     * @param {Error} error - Error ocurrido
     */    mostrarError(error) {
        this.$contenedor.html(`
            <section class="noticias-error">
                <h3>Error al cargar las noticias</h3>
                <p>No se pudieron cargar las últimas noticias. Por favor, inténtalo más tarde.</p>
                <button onclick="noticiasManager.cargarNoticias()" class="btn-reintentar">
                    Reintentar
                </button>
            </section>
        `);
    }
    
    /**
     * Carga más noticias (funcionalidad futura)
     */
    cargarMasNoticias() {
        // Implementación futura para paginación
        console.log('Cargando más noticias...');
    }
}

/**
 * Clase principal de la aplicación
 */
class AplicacionSiero {
    constructor() {
        this.carrusel = null;
        this.noticiasManager = null;
        
        this.init();
    }
    
    /**
     * Inicializa la aplicación
     */
    init() {
        $(document).ready(() => {
            this.configurarCarrusel();
            this.configurarNoticias();
            this.configurarEfectosGenerales();
        });
    }
    
    /**
     * Configura el carrusel de fotos
     */
    configurarCarrusel() {
        const fotosCarrusel = [
            {
                src: 'multimedia/images/mapa-siero.jpg',
                alt: 'Mapa de situación del Concejo de Siero en Asturias',
                titulo: 'Ubicación de Siero',
                descripcion: 'Concejo ubicado en el centro de Asturias, puerta de entrada a la región'
            },
            {
                src: 'multimedia/images/pola-siero-centro.jpg',
                alt: 'Centro urbano de Pola de Siero',
                titulo: 'Pola de Siero',
                descripcion: 'Capital del concejo, centro neurálgico de actividad comercial y administrativa'
            },
            {
                src: 'multimedia/images/palacio-indiano-siero.jpg',
                alt: 'Palacio indiano histórico en Siero',
                titulo: 'Patrimonio Indiano',
                descripcion: 'Arquitectura única que refleja la historia de emigración a América'
            },
            {
                src: 'multimedia/images/sierra-sueve-siero.jpg',
                alt: 'Paisajes naturales de la Sierra del Sueve',
                titulo: 'Sierra del Sueve',
                descripcion: 'Paisajes montañosos ideales para senderismo y turismo natural'
            },
            {
                src: 'multimedia/images/sidreria-tradicional-siero.jpg',
                alt: 'Sidrería tradicional asturiana en Siero',
                titulo: 'Gastronomía Tradicional',
                descripcion: 'Sidrerías y restaurantes que mantienen viva la tradición culinaria'
            },
            {
                src: 'multimedia/images/fabada-siero.jpg',
                alt: 'Fabada asturiana tradicional de Siero',
                titulo: 'Fabada Sierense',
                descripcion: 'El plato más representativo de la gastronomía local'
            }
        ];
          this.carrusel = new CarruselTuristico('.carrusel-turistico', {
            fotos: fotosCarrusel,
            intervaloAuto: 5000,
            autoPlay: true
        });
    }
    
    /**
     * Configura el gestor de noticias
     */
    configurarNoticias() {
        this.noticiasManager = new NoticiasManager('.noticias-turisticas', {
            maxNoticias: 5,
            categoria: 'turismo',
            region: 'Asturias'
        });
    }
    
    /**
     * Configura efectos generales de la página
     */
    configurarEfectosGenerales() {
        // Efecto de aparición suave para secciones
        $('section').each((index, elemento) => {
            $(elemento).delay(index * 300).fadeIn(800);
        });
        
        // Scroll suave para enlaces internos
        $('a[href^="#"]').on('click', function(e) {
            e.preventDefault();
            const target = $(this.getAttribute('href'));
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top - 100
                }, 800);
            }
        });
    }
}

// Instancia global de la aplicación
let app;
let noticiasManager; // Para acceso desde botones

// Inicializar la aplicación cuando el DOM esté listo
$(document).ready(() => {
    app = new AplicacionSiero();
    // Hacer disponible el noticiasManager globalmente para los botones
    setTimeout(() => {
        noticiasManager = app.noticiasManager;
    }, 100);
});
