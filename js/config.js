/**
 * Configuración Global del Sistema Siero
 * Permite alternar entre modo demostración y producción
 */

window.SieroConfig = {
    // Configuración global del sistema
    MODO_DEMO: false, // Cambiado a false para intentar APIs reales
    
    // Configuración de noticias
    noticias: {
        intentarAPIs: true, // true para intentar APIs reales primero
        tiempoTimeout: 5000, // 5 segundos timeout para APIs
        fuentes: [
            'Europa Press Asturias',
            'La Nueva España', 
            'El Comercio',
            'RTPA',
            'Asturias24'
        ]
    },
    
    // Configuración meteorológica  
    meteorologia: {
        intentarAPIs: true, // true para intentar APIs reales primero
        tiempoTimeout: 8000, // 8 segundos timeout para APIs meteorológicas
        apis: {
            openWeather: {
                key: 'bd5e378503939ddaee76f12ad7a97608', 
                url: 'https://api.openweathermap.org/data/2.5'
            },
            openMeteo: {
                url: 'https://api.open-meteo.com/v1/forecast',
                requiresKey: false
            }
        },
        coordenadas: {
            latitud: 43.3906,
            longitud: -5.6644,
            ciudad: 'Pola de Siero',
            region: 'Asturias, ES'
        }
    },
    
    // Mensajes del sistema
    mensajes: {
        duracionVisible: 20000, // 20 segundos
        autoRemover: true
    },
    
    // Logging y debug
    debug: {
        activado: true,
        mostrarTiempos: true,
        mostrarErrores: true
    },
      // Función para activar modo producción
    activarModoProduccion() {
        this.MODO_DEMO = false;
        this.noticias.intentarAPIs = true;
        this.meteorologia.intentarAPIs = true;
        console.log('🌐 Modo producción activado - Se intentarán APIs reales');
        console.log('⚠️ Las APIs pueden fallar por CORS, límites o conectividad');
    },
    
    // Función para activar modo demo
    activarModoDemo() {
        this.MODO_DEMO = true;
        this.noticias.intentarAPIs = false;
        this.meteorologia.intentarAPIs = false;
        console.log('🎭 Modo demostración activado - Se usarán datos de ejemplo');
    },
    
    // Función para mostrar estado actual
    mostrarEstado() {
        console.log('=== CONFIGURACIÓN ACTUAL DEL SISTEMA ===');
        console.log('Modo:', this.MODO_DEMO ? 'DEMOSTRACIÓN' : 'PRODUCCIÓN');
        console.log('Noticias - Intentar APIs:', this.noticias.intentarAPIs);
        console.log('Meteorología - Intentar APIs:', this.meteorologia.intentarAPIs);
        console.log('Debug activado:', this.debug.activado);
        console.log('=========================================');
    }
};

// Mostrar configuración inicial
if (window.SieroConfig.debug.activado) {
    console.log('⚙️ Configuración del sistema Siero cargada');
    window.SieroConfig.mostrarEstado();
}

// Hacer disponible globalmente para debugging
window.config = window.SieroConfig;
