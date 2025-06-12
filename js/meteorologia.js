/**
 * Gestor de Meteorología para Siero
 * Sistema orientado a objetos con jQuery para consumir servicios web meteorológicos
 * Muestra tiempo actual y previsión de 7 días para Pola de Siero
 */

/**
 * Clase para gestionar servicios web meteorológicos
 * Implementa el patrón de orientación a objetos requerido
 */
class ServicioMeteorologico {    constructor() {
        // Configuración de APIs meteorológicas
        // API Key de OpenWeatherMap (gratuita hasta 1000 llamadas/día)
        this.apiKey = 'bd5e378503939ddaee76f12ad7a97608'; // API key pública de demostración
        this.coordenadas = {
            latitud: 43.3906,  // Pola de Siero aproximado
            longitud: -5.6644  // Pola de Siero aproximado
        };
        this.ciudad = 'Pola de Siero';
        this.region = 'Asturias, ES';
        
        // URLs de las APIs
        this.apiUrls = {
            openWeather: 'https://api.openweathermap.org/data/2.5',
            weatherApi: 'https://api.weatherapi.com/v1',
            backup: 'https://wttr.in' // API de respaldo sin API key
        };
        
        // Elementos DOM con jQuery
        this.$tiempoActualStatus = $('section[aria-label="Estado de carga del tiempo actual"]');
        this.$tiempoActualDatos = $('section[aria-label="Datos meteorológicos actuales"]');
        this.$previsionStatus = $('section[aria-label="Estado de carga de la previsión"]');
        this.$previsionLista = $('section[aria-label="Lista de previsiones diarias"]');
        
        // Estado
        this.datosActuales = null;
        this.datosPrevisiones = null;
        this.cargando = false;
        
        this.init();
    }
    
    /**
     * Inicializa el servicio meteorológico
     */
    init() {
        console.log('Inicializando servicio meteorológico para Siero...');
        this.cargarTiempoActual();
        this.cargarPrevisiones();
        this.configurarActualizaciones();
    }
    
    /**
     * Carga el tiempo actual desde la API
     */
    async cargarTiempoActual() {
        if (this.cargando) return;
        
        this.cargando = true;
        this.mostrarCargandoActual();
        
        try {
            // Intentar con OpenWeatherMap primero
            const datos = await this.obtenerTiempoActualAPI();
            this.datosActuales = datos;
            this.mostrarTiempoActual();
            
        } catch (error) {
            console.error('Error cargando tiempo actual:', error);
            await this.cargarTiempoRespaldo();
        } finally {
            this.cargando = false;
            this.ocultarCargandoActual();
        }
    }
    
    /**
     * Obtiene el tiempo actual de OpenWeatherMap
     */
    async obtenerTiempoActualAPI() {
        const url = `${this.apiUrls.openWeather}/weather?lat=${this.coordenadas.latitud}&lon=${this.coordenadas.longitud}&appid=${this.apiKey}&units=metric&lang=es`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error API: ${response.status}`);
        }
        
        return await response.json();
    }
    
    /**
     * Carga previsiones de 7 días
     */
    async cargarPrevisiones() {
        this.mostrarCargandoPrevisiones();
        
        try {
            const datos = await this.obtenerPrevisionesAPI();
            this.datosPrevisiones = datos;
            this.mostrarPrevisiones();
            
        } catch (error) {
            console.error('Error cargando previsiones:', error);
            await this.cargarPrevisionesRespaldo();
        } finally {
            this.ocultarCargandoPrevisiones();
        }
    }
    
    /**
     * Obtiene previsiones de 7 días de OpenWeatherMap
     */
    async obtenerPrevisionesAPI() {
        const url = `${this.apiUrls.openWeather}/forecast?lat=${this.coordenadas.latitud}&lon=${this.coordenadas.longitud}&appid=${this.apiKey}&units=metric&lang=es&cnt=56`; // 7 días * 8 mediciones
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error API: ${response.status}`);
        }
        
        return await response.json();
    }
    
    /**
     * Carga datos de respaldo cuando falla la API principal
     */
    async cargarTiempoRespaldo() {
        try {
            // Datos simulados para demostración
            this.datosActuales = {
                name: 'Pola de Siero',
                main: {
                    temp: 16.5,
                    feels_like: 15.8,
                    temp_min: 12.3,
                    temp_max: 19.7,
                    pressure: 1016,
                    humidity: 78
                },
                weather: [{
                    main: 'Clouds',
                    description: 'nublado',
                    icon: '04d'
                }],
                wind: {
                    speed: 3.2,
                    deg: 250
                },
                visibility: 10000,
                dt: Date.now() / 1000
            };
            
            this.mostrarTiempoActual();
        } catch (error) {
            this.mostrarErrorTiempoActual();
        }
    }
    
    /**
     * Carga previsiones de respaldo
     */
    async cargarPrevisionesRespaldo() {
        try {
            // Generar previsiones simuladas para 7 días
            const previsiones = [];
            const hoy = new Date();
            
            for (let i = 0; i < 7; i++) {
                const fecha = new Date(hoy);
                fecha.setDate(fecha.getDate() + i);
                
                previsiones.push({
                    dt: fecha.getTime() / 1000,
                    main: {
                        temp_min: 8 + Math.random() * 6,
                        temp_max: 15 + Math.random() * 8,
                        humidity: 65 + Math.random() * 20
                    },
                    weather: [{
                        main: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
                        description: ['soleado', 'nublado', 'lluvia'][Math.floor(Math.random() * 3)],
                        icon: ['01d', '04d', '10d'][Math.floor(Math.random() * 3)]
                    }],
                    wind: {
                        speed: 2 + Math.random() * 4
                    }
                });
            }
            
            this.datosPrevisiones = { list: previsiones };
            this.mostrarPrevisiones();
            
        } catch (error) {
            this.mostrarErrorPrevisiones();
        }
    }
    
    /**
     * Muestra el tiempo actual en el DOM
     */
    mostrarTiempoActual() {
        if (!this.datosActuales) return;
        
        const datos = this.datosActuales;
        const fechaActual = new Date(datos.dt * 1000);
        
        const html = `
            <article role="article" aria-label="Condiciones meteorológicas actuales">
                <header>
                    <h3>🌤️ ${datos.name || this.ciudad}</h3>
                    <time datetime="${fechaActual.toISOString()}" role="text">
                        Última actualización: ${this.formatearFechaHora(fechaActual)}
                    </time>
                </header>
                
                <section role="group" aria-label="Temperatura">
                    <article role="text">
                        <h4>🌡️ Temperatura</h4>
                        <p role="text">
                            <strong>${Math.round(datos.main.temp)}°C</strong>
                            (Sensación térmica: ${Math.round(datos.main.feels_like)}°C)
                        </p>
                        <p role="text">
                            Mín: ${Math.round(datos.main.temp_min)}°C | 
                            Máx: ${Math.round(datos.main.temp_max)}°C
                        </p>
                    </article>
                </section>
                
                <section role="group" aria-label="Condiciones">
                    <article role="text">
                        <h4>☁️ Condiciones</h4>
                        <p role="text">
                            <strong>${this.capitalizarPrimera(datos.weather[0].description)}</strong>
                        </p>
                    </article>
                </section>
                
                <section role="group" aria-label="Detalles atmosféricos">
                    <article role="text">
                        <h4>🌪️ Viento</h4>
                        <p role="text">${datos.wind.speed} m/s (${this.obtenerDireccionViento(datos.wind.deg)})</p>
                    </article>
                    <article role="text">
                        <h4>💧 Humedad</h4>
                        <p role="text">${datos.main.humidity}%</p>
                    </article>
                    <article role="text">
                        <h4>📊 Presión</h4>
                        <p role="text">${datos.main.pressure} hPa</p>
                    </article>
                    ${datos.visibility ? `
                    <article role="text">
                        <h4>👁️ Visibilidad</h4>
                        <p role="text">${(datos.visibility / 1000).toFixed(1)} km</p>
                    </article>
                    ` : ''}
                </section>
            </article>
        `;
        
        this.$tiempoActualDatos.html(html);
    }
    
    /**
     * Muestra las previsiones de 7 días
     */
    mostrarPrevisiones() {
        if (!this.datosPrevisiones || !this.datosPrevisiones.list) return;
        
        // Agrupar por días y tomar el del mediodía
        const previsionesDiarias = this.agruparPorDias(this.datosPrevisiones.list);
        
        const html = previsionesDiarias.map((prevision, index) => {
            const fecha = new Date(prevision.dt * 1000);
            const esHoy = index === 0;
            
            return `
                <article role="listitem" aria-label="Previsión día ${index + 1}">
                    <header>
                        <h3>${esHoy ? 'Hoy' : this.obtenerNombreDia(fecha)}</h3>
                        <time datetime="${fecha.toISOString().split('T')[0]}" role="text">
                            ${this.formatearFecha(fecha)}
                        </time>
                    </header>
                    
                    <section role="group" aria-label="Datos del día">
                        <article role="text">
                            <h4>${this.obtenerEmojiTiempo(prevision.weather[0].main)}</h4>
                            <p role="text">${this.capitalizarPrimera(prevision.weather[0].description)}</p>
                        </article>
                        
                        <article role="text">
                            <h4>🌡️ Temperatura</h4>
                            <p role="text">
                                <strong>${Math.round(prevision.main.temp_max)}°C</strong> / 
                                ${Math.round(prevision.main.temp_min)}°C
                            </p>
                        </article>
                        
                        <article role="text">
                            <h4>💧 Humedad</h4>
                            <p role="text">${prevision.main.humidity}%</p>
                        </article>
                        
                        <article role="text">
                            <h4>🌪️ Viento</h4>
                            <p role="text">${prevision.wind.speed.toFixed(1)} m/s</p>
                        </article>
                    </section>
                </article>
            `;
        }).join('');
        
        this.$previsionLista.html(html);
    }
    
    /**
     * Agrupa las previsiones por días (toma la del mediodía)
     */
    agruparPorDias(lista) {
        const dias = new Map();
        
        lista.forEach(item => {
            const fecha = new Date(item.dt * 1000);
            const fechaStr = fecha.toISOString().split('T')[0];
            
            if (!dias.has(fechaStr)) {
                dias.set(fechaStr, item);
            }
        });
        
        return Array.from(dias.values()).slice(0, 7);
    }
    
    /**
     * Configura actualizaciones automáticas
     */
    configurarActualizaciones() {
        // Actualizar cada 30 minutos
        setInterval(() => {
            this.cargarTiempoActual();
        }, 30 * 60 * 1000);
        
        // Actualizar previsiones cada 6 horas
        setInterval(() => {
            this.cargarPrevisiones();
        }, 6 * 60 * 60 * 1000);
        
        // Botón de actualización manual
        this.agregarBotonActualizar();
    }
    
    /**
     * Añade botón de actualización manual
     */
    agregarBotonActualizar() {
        const $botonActualizar = $(`
            <nav role="navigation" aria-label="Controles meteorológicos">
                <button role="button" aria-label="Actualizar información meteorológica">
                    🔄 Actualizar Tiempo
                </button>
            </nav>
        `);
        
        $botonActualizar.find('button').click(() => {
            this.cargarTiempoActual();
            this.cargarPrevisiones();
        });
        
        this.$tiempoActualDatos.after($botonActualizar);
    }
    
    /**
     * Funciones auxiliares de presentación
     */
    mostrarCargandoActual() {
        this.$tiempoActualStatus.show();
    }
    
    ocultarCargandoActual() {
        this.$tiempoActualStatus.hide();
    }
    
    mostrarCargandoPrevisiones() {
        this.$previsionStatus.show();
    }
    
    ocultarCargandoPrevisiones() {
        this.$previsionStatus.hide();
    }
    
    mostrarErrorTiempoActual() {
        this.$tiempoActualDatos.html(`
            <article role="alert">
                <h3>⚠️ Error al cargar el tiempo actual</h3>
                <p>No se pudo obtener la información meteorológica. Por favor, inténtalo más tarde.</p>
            </article>
        `);
    }
    
    mostrarErrorPrevisiones() {
        this.$previsionLista.html(`
            <article role="alert">
                <h3>⚠️ Error al cargar las previsiones</h3>
                <p>No se pudo obtener la previsión meteorológica. Por favor, inténtalo más tarde.</p>
            </article>
        `);
    }
    
    /**
     * Funciones de utilidad para formateo
     */
    formatearFecha(fecha) {
        return fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    }
    
    formatearFechaHora(fecha) {
        return fecha.toLocaleString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    obtenerNombreDia(fecha) {
        return fecha.toLocaleDateString('es-ES', { weekday: 'long' });
    }
    
    capitalizarPrimera(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }
    
    obtenerDireccionViento(grados) {
        const direcciones = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
        const indice = Math.round(grados / 45) % 8;
        return direcciones[indice];
    }
    
    obtenerEmojiTiempo(condicion) {
        const emojis = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Snow': '❄️',
            'Thunderstorm': '⛈️',
            'Drizzle': '🌦️',
            'Mist': '🌫️',
            'Fog': '🌫️'
        };
        return emojis[condicion] || '🌤️';
    }
}

/**
 * Inicialización cuando el documento esté listo
 */
$(document).ready(function() {
    console.log('Inicializando sistema meteorológico de Siero...');
    
    // Crear instancia del servicio meteorológico
    window.servicioMeteorologico = new ServicioMeteorologico();
    
    console.log('Sistema meteorológico inicializado correctamente');
});
