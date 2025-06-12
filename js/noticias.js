/**
 * API File de HTML5 - Gestor de Noticias para Siero Turismo
 * Implementa lectura de archivos locales y gestión dinámica de noticias
 * Cumple con estándares estrictos: sin IDs, clases, ni data-* attributes
 */

/**
 * Clase Noticias - Gestiona la lectura de archivos y manipulación de noticias
 */
class Noticias {
    constructor() {
        // Comprobar soporte de la API File
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            console.log('✅ API File soportada por el navegador');
            this.apiFileSupported = true;
        } else {
            console.error('❌ API File no soportada por este navegador');
            this.apiFileSupported = false;
            this.mostrarErrorSoporte();
        }
        
        this.noticias = [];
        this.contadorNoticias = 0;
        this.init();
    }
    
    init() {
        if (!this.apiFileSupported) return;
        
        this.configurarEventos();
        console.log('📰 Sistema de noticias inicializado correctamente');
    }
    
    configurarEventos() {
        const self = this;
        
        // Configurar evento de carga de archivo
        $('input[type="file"][aria-label="Cargar archivo de noticias"]').on('change', function(event) {
            self.readInputFile(event);
        });
        
        // Configurar evento de añadir noticia manual
        $('button[aria-label="Añadir noticia manual"]').on('click', function() {
            self.añadirNoticia();
        });
    }
    
    /**
     * Método para leer el archivo de input
     */
    readInputFile(event) {
        if (!this.apiFileSupported) {
            alert('Tu navegador no soporta la API File');
            return;
        }
        
        const archivo = event.target.files[0];
        
        if (!archivo) {
            console.warn('No se seleccionó ningún archivo');
            return;
        }
        
        // Verificar que sea un archivo de texto
        if (!archivo.type.match('text.*')) {
            alert('Por favor, selecciona un archivo de texto (.txt)');
            return;
        }
        
        console.log(`📄 Leyendo archivo: ${archivo.name} (${archivo.size} bytes)`);
        
        const reader = new FileReader();
        const self = this;
        
        reader.onload = function(e) {
            self.procesarContenidoArchivo(e.target.result);
        };
        
        reader.onerror = function() {
            console.error('Error al leer el archivo');
            alert('Error al leer el archivo. Inténtalo de nuevo.');
        };
        
        // Leer el archivo como texto
        reader.readAsText(archivo, 'UTF-8');
    }
    
    /**
     * Procesar el contenido del archivo línea por línea
     */
    procesarContenidoArchivo(contenido) {
        console.log('📝 Procesando contenido del archivo...');
        
        // Dividir el contenido en líneas
        const lineas = contenido.split('\n');
        const noticiasLeidas = [];
        
        lineas.forEach((linea, indice) => {
            // Eliminar espacios en blanco al inicio y final
            linea = linea.trim();
            
            // Saltar líneas vacías
            if (linea === '') return;
            
            // Dividir cada línea por el separador "_"
            const partes = linea.split('_');
            
            if (partes.length >= 3) {
                const noticia = {
                    titular: partes[0].trim(),
                    entradilla: partes[1].trim(),
                    autor: partes[2].trim(),
                    origen: 'archivo'
                };
                
                noticiasLeidas.push(noticia);
            } else {
                console.warn(`⚠️ Línea ${indice + 1} no tiene el formato correcto:`, linea);
            }
        });
        
        console.log(`✅ Se procesaron ${noticiasLeidas.length} noticias del archivo`);
        
        // Limpiar noticias anteriores del archivo
        this.limpiarNoticiasDelArchivo();
        
        // Añadir las nuevas noticias
        this.noticias = [...this.noticias, ...noticiasLeidas];
        
        // Mostrar las noticias en el HTML
        this.mostrarNoticiasEnHTML(noticiasLeidas);
        
        // Mostrar mensaje de éxito
        this.mostrarMensajeExito(`Se cargaron ${noticiasLeidas.length} noticias desde el archivo`);
    }
    
    /**
     * Mostrar las noticias en el HTML
     */
    mostrarNoticiasEnHTML(noticias) {
        const $contenedor = $('section[role="region"][aria-label="Noticias desde archivo"]');
        
        if ($contenedor.length === 0) {
            console.error('No se encontró el contenedor de noticias');
            return;
        }
        
        noticias.forEach((noticia) => {
            this.contadorNoticias++;
            
            const noticiaHTML = `
                <article role="article" aria-label="Noticia ${this.contadorNoticias}">
                    <header>
                        <h3>${noticia.titular}</h3>
                        <cite role="text">✍️ ${noticia.autor}</cite>
                        <span role="text" aria-label="Origen">${noticia.origen === 'archivo' ? '📄 Desde archivo' : '✏️ Añadida manualmente'}</span>
                    </header>
                    <section role="text">
                        <p>${noticia.entradilla}</p>
                    </section>
                    <footer>
                        <time role="text">${new Date().toLocaleString('es-ES')}</time>
                    </footer>
                </article>
            `;
            
            $contenedor.append(noticiaHTML);
        });
        
        // Hacer scroll suave hacia las nuevas noticias
        $contenedor[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    /**
     * Añadir noticia manual desde el formulario
     */
    añadirNoticia() {
        const titular = $('input[aria-label="Titular de la noticia"]').val().trim();
        const entradilla = $('textarea[aria-label="Entradilla de la noticia"]').val().trim();
        const autor = $('input[aria-label="Autor de la noticia"]').val().trim();
        
        // Validar campos
        if (!titular || !entradilla || !autor) {
            alert('Por favor, completa todos los campos de la noticia');
            return;
        }
        
        const nuevaNoticia = {
            titular: titular,
            entradilla: entradilla,
            autor: autor,
            origen: 'manual'
        };
        
        // Añadir a la lista
        this.noticias.push(nuevaNoticia);
        
        // Mostrar en el HTML
        this.mostrarNoticiasEnHTML([nuevaNoticia]);
        
        // Limpiar formulario
        this.limpiarFormulario();
        
        // Mostrar mensaje de éxito
        this.mostrarMensajeExito('Noticia añadida correctamente');
        
        console.log('✅ Nueva noticia añadida:', nuevaNoticia);
    }
    
    /**
     * Limpiar formulario de nueva noticia
     */
    limpiarFormulario() {
        $('input[aria-label="Titular de la noticia"]').val('');
        $('textarea[aria-label="Entradilla de la noticia"]').val('');
        $('input[aria-label="Autor de la noticia"]').val('');
    }
    
    /**
     * Limpiar noticias anteriores del archivo
     */
    limpiarNoticiasDelArchivo() {
        this.noticias = this.noticias.filter(noticia => noticia.origen !== 'archivo');
        $('section[role="region"][aria-label="Noticias desde archivo"] article').each(function() {
            const origen = $(this).find('span[aria-label="Origen"]').text();
            if (origen.includes('📄 Desde archivo')) {
                $(this).remove();
            }
        });
    }
    
    /**
     * Mostrar mensaje de éxito
     */
    mostrarMensajeExito(mensaje) {
        const $status = $('section[role="status"][aria-label="Mensajes del sistema"]');
        
        if ($status.length > 0) {
            $status.html(`
                <p role="alert" aria-live="polite">✅ ${mensaje}</p>
            `).show();
            
            // Ocultar después de 5 segundos
            setTimeout(() => {
                $status.fadeOut();
            }, 5000);
        }
    }
    
    /**
     * Mostrar error de soporte
     */
    mostrarErrorSoporte() {
        $('main').prepend(`
            <aside role="alert" aria-label="Error de compatibilidad">
                <h2>❌ Navegador No Compatible</h2>
                <p>Tu navegador no soporta la API File de HTML5.</p>
                <p>Por favor, usa un navegador moderno como Chrome, Firefox, Safari o Edge.</p>
            </aside>
        `);
    }
    
    /**
     * Obtener todas las noticias
     */
    obtenerNoticias() {
        return this.noticias;
    }
    
    /**
     * Obtener estadísticas
     */
    obtenerEstadisticas() {
        const total = this.noticias.length;
        const desdeArchivo = this.noticias.filter(n => n.origen === 'archivo').length;
        const manuales = this.noticias.filter(n => n.origen === 'manual').length;
        
        return {
            total: total,
            desdeArchivo: desdeArchivo,
            manuales: manuales
        };
    }
}

/**
 * Inicialización cuando el documento esté listo
 */
$(document).ready(function() {
    console.log('🚀 Inicializando sistema de noticias con API File...');
    
    // Crear instancia del gestor de noticias
    window.gestorNoticiasFile = new Noticias();
    
    // Función global para mostrar estadísticas
    window.mostrarEstadisticas = function() {
        if (window.gestorNoticiasFile) {
            const stats = window.gestorNoticiasFile.obtenerEstadisticas();
            console.log('📊 Estadísticas de noticias:', stats);
            alert(`📊 Estadísticas:\n\nTotal: ${stats.total} noticias\nDesde archivo: ${stats.desdeArchivo}\nAñadidas manualmente: ${stats.manuales}`);
        }
    };
    
    console.log('📰 Sistema de noticias con API File iniciado correctamente');
    console.log('🛠️ Función disponible: mostrarEstadisticas()');
});
