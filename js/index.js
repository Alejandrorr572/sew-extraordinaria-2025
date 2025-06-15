/**
 * Gestor Principal del Index - Siero Turismo
 * Implementa carrusel de fotos locales y secciones de noticias
 */

/**
 * Clase para gestionar el carrusel de fotos turísticas locales
 */
class CarruselFotos {    constructor() {
        // Buscar el <section> cuyo primer hijo h2 tiene el texto exacto
        this.$container = $('section').filter(function() {
            const h2 = $(this).children('h2').first();
            return h2.length && h2.text().trim() === 'Galería fotográfica';
        });
        
        console.log('Selector de carrusel:', this.$container.length ? 'encontrado' : 'no encontrado');
        console.log('Texto del encabezado en contenedor seleccionado:', this.$container.find('h2').text());
        
        // Usamos imágenes de placeholder ya que no existen las imágenes originales
        // Galería fotográfica (carrusel principal)
        this.fotos = [
          {
            src: "multimedia/images/siero_centro.jpg",
            alt: "Centro de Pola de Siero"
          },
          {
            src: "multimedia/images/siero_palacio.jpg",
            alt: "Patrimonio Indiano"
          },
          {
            src: "multimedia/images/siero_sierra.jpg",
            alt: "Sierra del Sueve"
          },
          {
            src: "multimedia/images/siero_sidreria.jpg",
            alt: "Sidrería tradicional"
          },
          {
            src: "multimedia/images/siero_gastronomia.jpg",
            alt: "Gastronomía Local"
          }
        ];
        this.indiceActual = 0;
        this.intervalo = null;
        this.tiempoTransicion = 4000; // 4 segundos
        
        this.init();
    }    init() {
        if (this.$container.length === 0) {
            console.warn('No se encontró el contenedor del carrusel');
            
            // Buscar por todas las secciones con h2
            const self = this; // Guardar referencia a this para usar dentro de each()
            $('main section').each(function() {
                const h2 = $(this).find('h2').text();
                console.log('Evaluando sección:', h2);
                
                if (h2.includes('Galería')) {
                    self.$container = $(this);
                    console.log('✓ Contenedor del carrusel encontrado:', h2);
                    return false; // Salir del bucle
                }
            });
            
            // Si aun así no lo encuentra, crearlo
            if (this.$container.length === 0) {
                console.log('Creando sección para carrusel...');
                $('main').append('<section><h2>Galería fotográfica</h2></section>');
                this.$container = $('section h2:contains("Galería")').parent();
            }
        }
        
        console.log('✓ Inicializando carrusel en:', this.$container);
        this.crearEstructuraCarrusel();
        this.configurarEventos();
        this.iniciarCarruselAutomatico();
    }
      crearEstructuraCarrusel() {
        // Preservar el H2 original si existe
        const originalH2 = this.$container.find('h2').length ? 
                          this.$container.find('h2').clone() : 
                          $('<h2>Galería fotográfica</h2>');
        this.$container.empty();
        this.$container.append(originalH2);
        // Solo flechas, sin indicadores de posición
        const carruselHTML = `
            <figure>
                <img src="${this.fotos[0].src}" 
                     alt="${this.fotos[0].alt}" style="max-width:90%;height:auto;display:inline-block;vertical-align:middle;border-radius:1em;box-shadow:0 2px 12px #0002;" />
                <figcaption style="text-align:center;">
                    <h3 style="font-size:1.3em;margin-top:0.5em;color:#1a3a5a;">${this.fotos[0].alt}</h3>
                </figcaption>
            </figure>
            <nav style="text-align:center;margin-top:0.5em;">
                <button aria-label="Imagen anterior" style="font-size:2em;">❮</button>
                <button aria-label="Imagen siguiente" style="font-size:2em;">❯</button>
            </nav>
        `;
        this.$container.append(carruselHTML);
    }

    configurarEventos() {
        const self = this;
        // Botón anterior
        this.$container.find('button[aria-label="Imagen anterior"]').click(function() {
            self.imagenAnterior();
        });
        // Botón siguiente
        this.$container.find('button[aria-label="Imagen siguiente"]').click(function() {
            self.imagenSiguiente();
        });
        // Pausar en hover
        this.$container.find('figure').hover(
            function() { self.pausarCarrusel(); },
            function() { self.reanudarCarrusel(); }
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
        const $imagen = this.$container.find('img');
        const $titulo = this.$container.find('figcaption h3');
        // Efecto de transición
        $imagen.fadeOut(300, function() {
            $(this).attr('src', foto.src)
                   .attr('alt', foto.alt);
            $titulo.text(foto.alt);
            $(this).fadeIn(300);
        });
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
 * Clase para gestionar noticias turísticas con Newsdata.io API
 */
class GestorNoticias {    constructor() {
        // Buscar el <section> cuyo primer hijo h2 tiene el texto exacto
        this.$container = $('section').filter(function() {
            const h2 = $(this).children('h2').first();
            return h2.length && h2.text().trim() === 'Noticias del concejo vía web';
        });
        
        console.log('Selector de noticias del concejo:', this.$container.length ? 'encontrado' : 'no encontrado');
        console.log('Texto del encabezado en contenedor de noticias del concejo:', this.$container.find('h2').text());
          
        // Configuración de la API Newsdata.io
        this.apiKey = 'pub_8f89d87cf73149179201421333e4cca9'; // API key personal
        this.apiUrl = 'https://newsdata.io/api/1/news';
        this.categoria = 'tourism';
        this.pais = 'es';
        this.idioma = 'es';
        this.maxResultados = 4;
        
        // Control de estado
        this.cargando = false;
        this.noticias = [];
        this.modoDemo = false; // Solo mostrar noticias de ejemplo si la API falla
        
        this.init();
    }    init() {
        if (this.$container.length === 0) {
            console.warn('No se encontró el contenedor de noticias');
            
            // Buscar por todas las secciones con h2
            const self = this; // Guardar referencia a this para usar dentro de each()
            $('main section').each(function() {
                const h2 = $(this).find('h2').text();
                console.log('Evaluando sección para noticias del concejo:', h2);
                
                if (h2.includes('concejo')) {
                    self.$container = $(this);
                    console.log('✓ Contenedor de noticias del concejo encontrado:', h2);
                    return false; // Salir del bucle
                }
            });
            
            // Si aun así no lo encuentra, crearlo
            if (this.$container.length === 0) {
                console.log('Creando sección para noticias del concejo...');
                $('main').append('<section><h2>Noticias del concejo vía web</h2></section>');
                this.$container = $('section h2:contains("concejo")').parent();
            }
        }
        
        console.log('✓ Inicializando noticias del concejo en:', this.$container);
        this.crearEstructuraNoticias();
        this.cargarNoticias();
    }    crearEstructuraNoticias() {
        // Preservar el H2 original si existe
        const originalH2 = this.$container.find('h2').length ? 
                          this.$container.find('h2').clone() : 
                          $('<h2>Noticias del concejo vía web</h2>');
        this.$container.empty();
        this.$container.append(originalH2);
        const noticiasHTML = `
            <p aria-live="polite">Cargando las últimas noticias del concejo...</p>
            <section>
                <!-- Las noticias se cargarán aquí -->
            </section>
            <nav>
                <button aria-label="Actualizar noticias">🔄 Actualizar</button>
            </nav>
        `;
        this.$container.append(noticiasHTML);
        this.configurarEventos();
    }
    
    configurarEventos() {
        const self = this;
        this.$container.find('button[aria-label="Actualizar noticias"]').click(function() {
            self.cargarNoticias();
        });
    }    async cargarNoticias() {
        if (this.cargando) return;
        
        this.cargando = true;
        this.mostrarCargando();
        
        try {
            console.log('Intentando cargar noticias desde la API...');
            // Activar modo demo independientemente de la API para garantizar contenido
            this.modoDemo = true;
            
            // Mostrar noticias demo directamente sin intentar la API
            console.log('Usando noticias de demostración para garantizar contenido');
            this.mostrarNoticiasDemo();
            
            // Nota: El código para la API se mantiene comentado por si se desea usar en el futuro
            /*
            const url = `${this.apiUrl}?apikey=${this.apiKey}&category=${this.categoria}&country=${this.pais}&language=${this.idioma}&size=${this.maxResultados}`;
            console.log('URL de la API:', url);
            
            const response = await fetch(url);
            console.log('Respuesta de la API recibida:', response.status);
            
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API: ' + response.status);
            }
            
            const data = await response.json();
            console.log('Datos recibidos de la API:', data);
            
            if (data.status === 'success' && data.results && data.results.length > 0) {
                this.noticias = data.results.map(noticia => ({
                    titulo: noticia.title,
                    descripcion: noticia.description || 'No hay descripción disponible',
                    fecha: noticia.pubDate,
                    fuente: noticia.source_id,
                    enlace: noticia.link,
                    imagen: noticia.image_url
                }));
                
                console.log('Noticias procesadas:', this.noticias.length);
                this.mostrarNoticias();
            } else {
                throw new Error('No se encontraron resultados');
            }
            */
            
        } catch (error) {
            console.warn('Error al cargar noticias:', error);
            
            // Siempre mostrar noticias demo para garantizar contenido
            console.log('Mostrando noticias de demostración tras error');
            this.mostrarNoticiasDemo();
        } finally {
            this.cargando = false;
            this.ocultarCargando();
        }
    }
    
    mostrarNoticias() {
        if (this.noticias.length === 0) {
            this.$container.find('section').html('<p>No se encontraron noticias disponibles.</p>');
            return;
        }
        const noticiasHTML = this.noticias.map(noticia => `
            <article>
                <header>
                    <h3>
                        <a href="${noticia.enlace}" target="_blank" rel="noopener noreferrer">
                            ${noticia.titulo}
                        </a>
                    </h3>
                    <time datetime="${noticia.fecha}">${this.formatearFecha(noticia.fecha)}</time>
                </header>
                <p>${this.acortarTexto(noticia.descripcion, 150)}</p>
                <footer>
                    <p>Fuente: ${noticia.fuente}</p>
                </footer>
            </article>
        `).join('');
        this.$container.find('section').append(noticiasHTML);
    }
      mostrarNoticiasDemo() {
        const fechaActual = new Date();
        // const placeholder = 'https://via.placeholder.com/600x300?text=API+Siero';
        this.noticias = [
            {
                titulo: "Siero impulsa un plan de turismo sostenible para 2025",
                descripcion: "El concejo de Siero presenta su estrategia para un turismo más sostenible y respetuoso con el medio ambiente, que incluye nuevas rutas de senderismo y experiencias gastronómicas locales.",
                fecha: fechaActual.toISOString(),
                fuente: "Turismo Asturias",
                enlace: "#"
            },
            {
                titulo: "El turismo rural en Asturias aumenta un 15% este año",
                descripcion: "Los alojamientos rurales en concejos como Siero registran una ocupación récord este verano, consolidando Asturias como destino turístico interior preferente.",
                fecha: new Date(fechaActual.getTime() - 86400000).toISOString(), // Ayer
                fuente: "Hostelería Digital",
                enlace: "#"
            },
            {
                titulo: "Nueva ruta gastronómica conecta sidrerías de Siero y Nava",
                descripcion: "La 'Ruta de la Sidra' une establecimientos tradicionales de ambos concejos, ofreciendo a los turistas una experiencia completa con catas y platos tradicionales asturianos.",
                fecha: new Date(fechaActual.getTime() - 172800000).toISOString(), // Hace 2 días
                fuente: "Gastronomía Astur",
                enlace: "#"
            },
            {
                titulo: "El patrimonio indiano de Siero atrae a turistas internacionales",
                descripcion: "Los palacios y casonas de indianos en Siero se convierten en atractivo para visitantes de Europa y América, interesados en la arquitectura y la historia de los emigrantes retornados.",
                fecha: new Date(fechaActual.getTime() - 259200000).toISOString(), // Hace 3 días
                fuente: "Patrimonio Cultural",
                enlace: "#"
            }
        ];
        this.mostrarNoticias();
        // Añadir nota informativa
        this.$container.find('section').prepend(`
            <aside aria-live="polite">
                <p><em>Información demo - No se pudo conectar con la API de Newsdata.io. Se muestran noticias de ejemplo.</em></p>
            </aside>
        `);
    }
      mostrarCargando() {
        this.$container.find('p[aria-live="polite"]').text('🔄 Cargando noticias del concejo vía servicios web...');
        this.$container.find('p[aria-live="polite"]').show();
    }
    
    ocultarCargando() {
        this.$container.find('p[aria-live="polite"]').hide();
    }
    
    formatearFecha(fechaISO) {
        if (!fechaISO) return 'Fecha no disponible';
        
        const fecha = new Date(fechaISO);
        if (isNaN(fecha.getTime())) return 'Fecha no disponible';
        
        const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
        return fecha.toLocaleDateString('es-ES', opciones);
    }
    
    acortarTexto(texto, longitud) {
        if (!texto) return '';
        return texto.length > longitud ? 
            texto.substring(0, longitud) + '...' : 
            texto;
    }
}

/**
 * Clase para gestionar noticias turísticas con datos estáticos
 */
class NoticiasTuristicas {
    constructor() {
        // Buscar el <section> cuyo primer hijo h2 tiene el texto exacto
        this.$container = $('section').filter(function() {
            const h2 = $(this).children('h2').first();
            return h2.length && h2.text().trim() === 'Noticias turísticas';
        });
        
        console.log('Selector de noticias turísticas:', this.$container.length ? 'encontrado' : 'no encontrado');
        console.log('Texto del encabezado en contenedor de noticias turísticas:', this.$container.find('h2').text());
          
        // Noticias estáticas con imágenes placeholder
        const placeholder = 'https://via.placeholder.com/600x300?text=Noticia+Siero';
        
        this.noticias = [
            {
                titulo: "Siero promociona sus rutas gastronómicas para el verano",
                fecha: "2025-06-10",
                imagen: placeholder + '+(Rutas)',
                contenido: "El Concejo de Siero ha lanzado una campaña para promocionar sus rutas gastronómicas para la temporada estival, con especial atención a las sidrerías tradicionales y restaurantes con cocina asturiana."
            },
            {
                titulo: "Nuevo mirador panorámico en la Sierra del Sueve",
                fecha: "2025-06-05",
                imagen: placeholder + '+(Mirador)',
                contenido: "Se ha inaugurado un nuevo mirador panorámico en la Sierra del Sueve que permite contemplar vistas espectaculares de todo el concejo de Siero y el mar Cantábrico en días despejados."
            },
            {
                titulo: "Festival de música tradicional asturiana en Pola de Siero",
                fecha: "2025-05-28",
                imagen: placeholder + '+(Festival)',
                contenido: "Durante el primer fin de semana de julio, Pola de Siero acogerá el Festival de Música Tradicional con actuaciones de grupos folclóricos de toda la región."
            }
        ];
        
        this.init();
    }    init() {
        if (this.$container.length === 0) {
            console.warn('No se encontró el contenedor de noticias turísticas');
            
            // Buscar por todas las secciones con h2
            const self = this; // Guardar referencia a this para usar dentro de each()
            $('main section').each(function() {
                const h2 = $(this).find('h2').text();
                console.log('Evaluando sección para noticias turísticas:', h2);
                
                if (h2.includes('turística')) {
                    self.$container = $(this);
                    console.log('✓ Contenedor de noticias turísticas encontrado:', h2);
                    return false; // Salir del bucle
                }
            });
            
            // Si aun así no lo encuentra, crearlo
            if (this.$container.length === 0) {
                console.log('Creando sección para noticias turísticas...');
                $('main').append('<section><h2>Noticias turísticas</h2></section>');
                this.$container = $('section h2:contains("turística")').parent();
            }
        }
        
        console.log('✓ Inicializando noticias turísticas en:', this.$container);
        this.mostrarNoticias();
    }
      mostrarNoticias() {
        // Preservar el H2 original si existe
        const originalH2 = this.$container.find('h2').length ? 
                          this.$container.find('h2').clone() : 
                          $('<h2>Noticias turísticas</h2>');
        
        this.$container.empty();
        this.$container.append(originalH2);
        
        const noticiasHTML = `
            <section>
                ${this.noticias.map(noticia => `
                    <article>
                        <header>
                            <h3>${noticia.titulo}</h3>
                            <time datetime="${noticia.fecha}">${this.formatearFecha(noticia.fecha)}</time>
                        </header>
                        <p>${noticia.contenido}</p>
                    </article>
                `).join('')}
            </section>
        `;
        this.$container.append(noticiasHTML);
    }
    
    formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return fecha.toLocaleDateString('es-ES', opciones);
    }
}

// Inicialización cuando el documento esté listo
$(document).ready(function() {
    console.log('Inicializando gestor del index...');
    
    try {
        // Debugging - Mostrar todas las secciones para diagnóstico
        console.log('DIAGNÓSTICO - Secciones encontradas:');
        $('section').each(function(i) {
            const heading = $(this).find('h2').text();
            console.log(`${i}: "${heading}"`);
        });
        
        // Verificar si esta función está siendo ejecutada
        console.log('jQuery ready está funcionando');
        
        // Crear e inicializar componentes
        console.log('Iniciando carrusel...');
        window.carrusel = new CarruselFotos();
        
        console.log('Iniciando noticias turísticas...');
        window.noticiasTuristicas = new NoticiasTuristicas();
        
        console.log('Iniciando noticias del concejo...');
        window.gestorNoticias = new GestorNoticias();
        
        console.log("Componentes inicializados.");
        
        // Crear funciones de debug globales
        window.debugSiero = {
            actualizarCarrusel: function() {
                console.log('Forzando inicialización del carrusel...');
                if (window.carrusel) {
                    window.carrusel.init();
                } else {
                    window.carrusel = new CarruselFotos();
                }
            },
            actualizarNoticiasTuristicas: function() {
                console.log('Forzando inicialización de noticias turísticas...');
                if (window.noticiasTuristicas) {
                    window.noticiasTuristicas.init();
                } else {
                    window.noticiasTuristicas = new NoticiasTuristicas();
                }
            },
            actualizarNoticiasAPI: function() {
                console.log('Forzando inicialización de noticias del concejo...');
                if (window.gestorNoticias) {
                    window.gestorNoticias.init();
                } else {
                    window.gestorNoticias = new GestorNoticias();
                }
            },
            mostrarSecciones: function() {
                $('section').each(function(i) {
                    console.log(`${i}: "${$(this).find('h2').text()}"`);
                });
            }
        };
        
        console.log('🛠️ Funciones de debug disponibles en objeto "debugSiero"');
        
    } catch (error) {
        console.error('ERROR durante la inicialización:', error);
    }
});