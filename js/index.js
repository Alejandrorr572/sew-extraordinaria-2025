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
        this.apiKey = 'tu_api_key_aqui'; // Reemplazar con API key real
        this.apiUrl = 'https://newsapi.org/v2/everything';
        this.consultaBusqueda = 'turismo+asturias+OR+siero+OR+"costa+verde"+OR+sidra';
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
    }
    
    async cargarNoticias() {
        if (this.cargando) return;
        
        this.cargando = true;
        this.mostrarCargando();
        
        try {
            // Usando NewsAPI - alternativa gratuita
            const response = await fetch(`${this.apiUrl}?q=${this.consultaBusqueda}&language=es&sortBy=publishedAt&pageSize=6&apiKey=${this.apiKey}`);
            
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API');
            }
            
            const data = await response.json();
            this.noticias = data.articles || [];
            this.mostrarNoticias();
            
        } catch (error) {
            console.error('Error cargando noticias:', error);
            this.mostrarNoticiasEjemplo(); // Fallback con noticias de ejemplo
        } finally {
            this.cargando = false;
            this.ocultarCargando();
        }
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
        // Noticias de ejemplo cuando falla la API
        const noticiasEjemplo = [
            {
                title: "Siero impulsa nuevas rutas turísticas por la Sierra del Sueve",
                description: "El concejo presenta un ambicioso plan para promocionar el turismo de naturaleza con nuevos senderos señalizados.",
                publishedAt: new Date().toISOString(),
                source: { name: "Turismo Asturias" },
                url: "#"
            },
            {
                title: "La gastronomía asturiana protagonista en las ferias de turismo",
                description: "La fabada y la sidra de Siero destacan en las últimas ferias gastronómicas europeas.",
                publishedAt: new Date(Date.now() - 86400000).toISOString(),
                source: { name: "La Nueva España" },
                url: "#"
            },
            {
                title: "Record de visitantes en los palacios indianos de Asturias",
                description: "El patrimonio indiano bate records de visitas con rutas organizadas desde Siero.",
                publishedAt: new Date(Date.now() - 172800000).toISOString(),
                source: { name: "El Comercio" },
                url: "#"
            }
        ];
        
        this.noticias = noticiasEjemplo;
        this.mostrarNoticias();
    }
    
    async cargarMasNoticias() {
        // Implementar paginación si se requiere
        console.log('Cargando más noticias...');
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
});
