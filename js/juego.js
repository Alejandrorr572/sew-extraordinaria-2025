/**
 * Juego de Preguntas sobre Siero - Arquitectura Orientada a Objetos
 * Desarrollado en ECMAScript puro - Sin uso de IDs, clases, o data-* attributes
 * Cumple con los estándares estrictos del proyecto
 */

/**
 * Clase que representa una pregunta del juego
 */
class Pregunta {
    constructor(pregunta, opciones, correcta, explicacion) {
        this.pregunta = pregunta;
        this.opciones = opciones;
        this.correcta = correcta;
        this.explicacion = explicacion;
    }

    /**
     * Verifica si una respuesta es correcta
     */
    esCorrecta(indiceRespuesta) {
        return indiceRespuesta === this.correcta;
    }

    /**
     * Obtiene la opción correcta
     */
    getOpcionCorrecta() {
        return this.opciones[this.correcta];
    }

    /**
     * Obtiene todas las opciones
     */
    getOpciones() {
        return [...this.opciones]; // Retornar copia para evitar mutaciones
    }
}

/**
 * Clase que gestiona el banco de preguntas
 */
class BancoPreguntas {
    constructor() {
        this.preguntas = this.inicializarPreguntas();
    }

    /**
     * Inicializa las preguntas sobre el contenido del sitio web
     */
    inicializarPreguntas() {
        return [            new Pregunta(
                "¿Cuál es la capital del concejo de Siero según la información del sitio web?",
                ["Lugones", "Pola de Siero", "Carbayín", "La Carrera", "Aramil"],
                1,
                "Pola de Siero es la capital del concejo y el centro comercial y administrativo."
            ),
            new Pregunta(
                "¿Cuántos habitantes tiene aproximadamente el concejo de Siero?",
                ["Más de 30.000 habitantes", "Más de 45.000 habitantes", "Más de 51.000 habitantes", "Más de 60.000 habitantes", "Más de 75.000 habitantes"],
                2,
                "Siero tiene más de 51.000 habitantes, siendo el segundo concejo más poblado de Asturias."
            ),
            new Pregunta(
                "¿Cuál es la extensión territorial del concejo de Siero?",
                ["189 km²", "203 km²", "211 km²", "225 km²", "234 km²"],
                2,
                "Siero tiene una extensión de 211 km², lo que lo convierte en un concejo de tamaño considerable."
            ),
            new Pregunta(
                "¿Qué sierra es mencionada como atractivo natural de Siero?",
                ["Sierra de los Picos de Europa", "Sierra del Aramo", "Sierra del Sueve", "Sierra de Peña Mayor", "Sierra de Teverga"],
                2,
                "La Sierra del Sueve es mencionada como uno de los principales atractivos naturales para senderismo y turismo rural."
            ),
            new Pregunta(
                "¿Cuál de estos platos tradicionales asturianos se destaca en la gastronomía de Siero?",
                ["Pote asturiano", "Fabada asturiana", "Callos a la asturiana", "Merluza a la sidra", "Tortos de maíz"],
                1,
                "La fabada asturiana es destacada como uno de los platos tradicionales principales en la gastronomía local."
            ),
            new Pregunta(
                "¿Qué bebida tradicional asturiana es característica de Siero?",
                ["Orujo asturiano", "Sidra asturiana", "Licor de avellana", "Aguardiente de hierbas", "Queimada asturiana"],
                1,
                "La sidra asturiana es la bebida tradicional por excelencia, servida en las sidrerías características del concejo."
            ),
            new Pregunta(
                "¿Cuál de estas parroquias es conocida como 'Puerta de entrada' por tener el Aeropuerto de Asturias?",
                ["Pola de Siero", "Carbayín", "Lugones", "La Carrera", "Aramil"],
                2,
                "Lugones es descrita como la puerta de entrada al concejo por albergar el Aeropuerto de Asturias."
            ),
            new Pregunta(
                "¿Qué tipo de arquitectura histórica es mencionada como patrimonio cultural de Siero?",
                ["Arquitectura gótica", "Palacios barrocos", "Iglesias prerrománicas y palacios indianos", "Construcciones modernistas", "Fortalezas medievales"],
                2,
                "Se mencionan específicamente las iglesias prerrománicas y los palacios indianos como parte del patrimonio cultural."
            ),
            new Pregunta(
                "¿Cuál de estas festividades es mencionada como tradicional de Siero?",
                ["Fiestas de San Juan", "Festival de la Sidra", "Las Fiestas de la Pola", "Carnaval de Siero", "Romería de la Virgen"],
                2,
                "Las Fiestas de la Pola son mencionadas específicamente como una de las celebraciones tradicionales principales."
            ),
            new Pregunta(
                "¿Qué posición ocupa Siero entre los concejos más poblados de Asturias?",
                ["Primer lugar", "Segundo lugar", "Tercer lugar", "Cuarto lugar", "Quinto lugar"],
                1,
                "Siero es el segundo concejo más poblado de Asturias, después de Gijón."
            )
        ];
    }

    /**
     * Obtiene una pregunta por índice
     */
    getPregunta(indice) {
        return this.preguntas[indice];
    }

    /**
     * Obtiene el número total de preguntas
     */
    getTotalPreguntas() {
        return this.preguntas.length;
    }

    /**
     * Obtiene todas las respuestas correctas
     */
    getRespuestasCorrectas() {
        return this.preguntas.map((pregunta, index) => ({
            numero: index + 1,
            respuesta: pregunta.getOpcionCorrecta(),
            explicacion: pregunta.explicacion
        }));
    }
}

/**
 * Clase que gestiona el estado del juego
 */
class EstadoJuego {
    constructor(totalPreguntas) {
        this.reset(totalPreguntas);
    }

    /**
     * Resetea el estado del juego
     */
    reset(totalPreguntas) {
        this.preguntaActual = 0;
        this.respuestas = new Array(totalPreguntas).fill(null);
        this.puntuacion = 0;
        this.juegoIniciado = false;
        this.juegoTerminado = false;
        this.fechaInicio = null;
        this.fechaFin = null;
    }

    /**
     * Inicia el juego
     */
    iniciar() {
        this.juegoIniciado = true;
        this.fechaInicio = new Date();
    }

    /**
     * Finaliza el juego
     */
    finalizar() {
        this.juegoTerminado = true;
        this.fechaFin = new Date();
    }

    /**
     * Avanza a la siguiente pregunta
     */
    siguientePregunta() {
        if (this.preguntaActual < this.respuestas.length - 1) {
            this.preguntaActual++;
            return true;
        }
        return false;
    }

    /**
     * Retrocede a la pregunta anterior
     */
    preguntaAnterior() {
        if (this.preguntaActual > 0) {
            this.preguntaActual--;
            return true;
        }
        return false;
    }

    /**
     * Registra una respuesta
     */
    registrarRespuesta(indiceRespuesta) {
        this.respuestas[this.preguntaActual] = indiceRespuesta;
    }

    /**
     * Obtiene la respuesta actual
     */
    getRespuestaActual() {
        return this.respuestas[this.preguntaActual];
    }

    /**
     * Verifica si todas las preguntas están respondidas
     */
    todasRespondidas() {
        return this.respuestas.every(respuesta => respuesta !== null);
    }

    /**
     * Calcula la puntuación final
     */
    calcularPuntuacion(bancoPreguntas) {
        this.puntuacion = this.respuestas.reduce((total, respuesta, index) => {
            const pregunta = bancoPreguntas.getPregunta(index);
            return total + (pregunta.esCorrecta(respuesta) ? 1 : 0);
        }, 0);
        return this.puntuacion;
    }

    /**
     * Obtiene estadísticas del juego
     */
    getEstadisticas() {
        const totalPreguntas = this.respuestas.length;
        const incorrectas = totalPreguntas - this.puntuacion;
        const porcentaje = Math.round((this.puntuacion / totalPreguntas) * 100);
        const tiempoJuego = this.fechaFin && this.fechaInicio ? 
            Math.round((this.fechaFin - this.fechaInicio) / 1000) : 0;

        return {
            correctas: this.puntuacion,
            incorrectas: incorrectas,
            porcentaje: porcentaje,
            tiempoSegundos: tiempoJuego,
            totalPreguntas: totalPreguntas
        };
    }

    /**
     * Obtiene el progreso actual en porcentaje
     */
    getProgreso() {
        return ((this.preguntaActual + 1) / this.respuestas.length) * 100;
    }
}

/**
 * Clase que maneja la interfaz de usuario
 */
class InterfazJuego {
    constructor() {
        this.pantallaInicio = document.querySelector('section[aria-label="Pantalla de inicio del juego"]');
        this.pantallaJuego = document.querySelector('section[aria-label="Área de juego"]');
        this.pantallaResultados = document.querySelector('section[aria-label="Resultados del juego"]');
        this.contenedorPregunta = document.querySelector('section[aria-label="Área de juego"] > section');
        this.barraProgreso = document.querySelector('section[aria-label="Área de juego"] > div:first-child > div');
        this.botonAnterior = document.querySelector('button[aria-label="Pregunta anterior"]');
        this.botonSiguiente = document.querySelector('button[aria-label="Siguiente pregunta"]');
        this.botonFinalizar = document.querySelector('button[aria-label="Finalizar juego"]');
    }

    /**
     * Muestra una pantalla específica
     */
    mostrarPantalla(pantalla) {
        this.pantallaInicio.hidden = pantalla !== 'inicio';
        this.pantallaJuego.hidden = pantalla !== 'juego';
        this.pantallaResultados.hidden = pantalla !== 'resultados';
    }

    /**
     * Renderiza una pregunta en la interfaz
     */
    renderizarPregunta(pregunta, numeroPregunta, totalPreguntas, respuestaSeleccionada) {
        let html = `
            <p>Pregunta ${numeroPregunta} de ${totalPreguntas}</p>
            <h3>${pregunta.pregunta}</h3>
            <fieldset>
                <legend>Opciones de respuesta</legend>
        `;

        pregunta.getOpciones().forEach((opcion, index) => {
            const checked = respuestaSeleccionada === index ? 'checked' : '';
            html += `
                <label>
                    <input type="radio" 
                           name="pregunta-${numeroPregunta}" 
                           value="${index}"
                           onchange="juego.seleccionarOpcion(${index})"
                           ${checked}>
                    <span>${opcion}</span>
                </label>
            `;
        });

        html += '</fieldset>';
        this.contenedorPregunta.innerHTML = html;
    }

    /**
     * Actualiza la barra de progreso
     */
    actualizarProgreso(porcentaje) {
        this.barraProgreso.style.width = `${porcentaje}%`;
    }

    /**
     * Actualiza los controles de navegación
     */
    actualizarControles(estado) {
        // Botón anterior
        this.botonAnterior.hidden = estado.preguntaActual === 0;

        // Botones siguiente/finalizar
        const respuestaSeleccionada = estado.getRespuestaActual() !== null;
        const esUltimaPregunta = estado.preguntaActual === estado.respuestas.length - 1;

        if (esUltimaPregunta) {
            this.botonSiguiente.hidden = true;
            this.botonFinalizar.hidden = false;
            this.botonFinalizar.disabled = !respuestaSeleccionada;
        } else {
            this.botonSiguiente.hidden = false;
            this.botonFinalizar.hidden = true;
            this.botonSiguiente.disabled = !respuestaSeleccionada;
        }
    }

    /**
     * Renderiza la pantalla de resultados
     */
    renderizarResultados(estadisticas, mensaje) {
        const colorPuntuacion = this.obtenerColorPuntuacion(estadisticas.correctas);
        
        const html = `
            <h2>🎉 ¡Juego Completado!</h2>
            
            <p style="font-size: 3rem; font-weight: bold; margin: 1rem 0; color: ${colorPuntuacion};">
                ${estadisticas.correctas}/10
            </p>

            <section>
                ${mensaje}
            </section>

            <section aria-label="Estadísticas del juego">
                <div>
                    <strong>${estadisticas.correctas}</strong>
                    <span>Correctas</span>
                </div>
                <div>
                    <strong>${estadisticas.incorrectas}</strong>
                    <span>Incorrectas</span>
                </div>
                <div>
                    <strong>${estadisticas.porcentaje}%</strong>
                    <span>Acierto</span>
                </div>
                <div>
                    <strong>${estadisticas.tiempoSegundos}s</strong>
                    <span>Tiempo</span>
                </div>
            </section>

            <nav>
                <button onclick="juego.reiniciar()" aria-label="Jugar de nuevo">
                    🔄 Jugar de Nuevo
                </button>
                <button onclick="juego.volverAlInicio()" aria-label="Volver al sitio web">
                    🏠 Volver al Inicio
                </button>
            </nav>
        `;
        
        this.pantallaResultados.innerHTML = html;
    }

    /**
     * Obtiene el color según la puntuación
     */
    obtenerColorPuntuacion(correctas) {
        if (correctas >= 9) return '#28a745'; // Verde - excelente
        if (correctas >= 7) return '#17a2b8'; // Azul - buena
        if (correctas >= 5) return '#ffc107'; // Amarillo - regular
        return '#dc3545'; // Rojo - necesita mejorar
    }

    /**
     * Muestra un mensaje de alerta
     */
    mostrarAlerta(mensaje) {
        alert(mensaje);
    }
}

/**
 * Clase que genera mensajes según la puntuación
 */
class GeneradorMensajes {
    static obtenerMensajeResultado(correctas) {
        if (correctas === 10) {
            return `
                <p><strong>🏆 ¡PERFECTO! ¡Eres un experto en Siero!</strong></p>
                <p>Has demostrado un conocimiento excepcional sobre nuestro concejo. 
                ¡Felicidades! Conoces muy bien la información de nuestro sitio web.</p>
            `;
        } else if (correctas >= 8) {
            return `
                <p><strong>🥇 ¡Excelente conocimiento!</strong></p>
                <p>Tienes un gran dominio de la información sobre Siero. 
                Solo te faltan algunos detalles para ser un experto total.</p>
            `;
        } else if (correctas >= 6) {
            return `
                <p><strong>🥈 ¡Buen trabajo!</strong></p>
                <p>Tienes un conocimiento sólido sobre Siero, pero aún puedes mejorar. 
                Te recomendamos revisar más información en nuestro sitio web.</p>
            `;
        } else if (correctas >= 4) {
            return `
                <p><strong>🥉 Conocimiento básico</strong></p>
                <p>Tienes algunas nociones sobre Siero, pero necesitas explorar más 
                nuestro sitio web para conocer mejor el concejo.</p>
            `;
        } else {
            return `
                <p><strong>📚 ¡Necesitas estudiar más!</strong></p>
                <p>Te recomendamos navegar por todas las secciones de nuestro sitio web 
                para conocer mejor las maravillas que ofrece Siero.</p>
            `;
        }
    }
}

/**
 * Clase principal que orquesta todo el juego
 */
class JuegoSiero {
    constructor() {
        this.bancoPreguntas = new BancoPreguntas();
        this.estado = new EstadoJuego(this.bancoPreguntas.getTotalPreguntas());
        this.interfaz = new InterfazJuego();
        
        console.log('🎯 Juego de preguntas sobre Siero inicializado (Orientado a Objetos)');
        console.log(`📊 ${this.bancoPreguntas.getTotalPreguntas()} preguntas cargadas`);
    }

    /**
     * Inicia el juego
     */
    iniciar() {
        console.log('🎮 Iniciando juego de preguntas sobre Siero');
        
        this.estado.reset(this.bancoPreguntas.getTotalPreguntas());
        this.estado.iniciar();
        
        this.interfaz.mostrarPantalla('juego');
        this.actualizarVista();
    }

    /**
     * Selecciona una opción de respuesta
     */
    seleccionarOpcion(indiceOpcion) {
        console.log(`✅ Opción seleccionada: ${indiceOpcion} para pregunta ${this.estado.preguntaActual + 1}`);
        
        this.estado.registrarRespuesta(indiceOpcion);
        this.interfaz.actualizarControles(this.estado);
    }

    /**
     * Avanza a la siguiente pregunta
     */
    siguientePregunta() {
        if (this.estado.getRespuestaActual() === null) {
            this.interfaz.mostrarAlerta('⚠️ Debes seleccionar una respuesta antes de continuar.');
            return;
        }

        console.log(`➡️ Avanzando a pregunta ${this.estado.preguntaActual + 2}`);
        
        if (this.estado.siguientePregunta()) {
            this.actualizarVista();
        }
    }

    /**
     * Retrocede a la pregunta anterior
     */
    preguntaAnterior() {
        console.log(`⬅️ Retrocediendo a pregunta ${this.estado.preguntaActual}`);
        
        if (this.estado.preguntaAnterior()) {
            this.actualizarVista();
        }
    }

    /**
     * Finaliza el juego
     */
    finalizar() {
        if (!this.estado.todasRespondidas()) {
            this.interfaz.mostrarAlerta('⚠️ Debes responder todas las preguntas antes de finalizar el juego.');
            return;
        }

        console.log('🏁 Finalizando juego y calculando puntuación');
        
        this.estado.finalizar();
        this.estado.calcularPuntuacion(this.bancoPreguntas);
        
        const estadisticas = this.estado.getEstadisticas();
        const mensaje = GeneradorMensajes.obtenerMensajeResultado(estadisticas.correctas);
        
        this.interfaz.mostrarPantalla('resultados');
        this.interfaz.renderizarResultados(estadisticas, mensaje);
        
        console.log(`🎯 Resultados:`, estadisticas);
    }

    /**
     * Reinicia el juego
     */
    reiniciar() {
        console.log('🔄 Reiniciando juego');
        this.interfaz.mostrarPantalla('inicio');
        this.estado.reset(this.bancoPreguntas.getTotalPreguntas());
    }

    /**
     * Vuelve al sitio web principal
     */
    volverAlInicio() {
        console.log('🏠 Volviendo a la página de inicio');
        window.location.href = 'index.html';
    }

    /**
     * Actualiza la vista con la pregunta actual
     */
    actualizarVista() {
        const preguntaActual = this.bancoPreguntas.getPregunta(this.estado.preguntaActual);
        
        this.interfaz.renderizarPregunta(
            preguntaActual,
            this.estado.preguntaActual + 1,
            this.bancoPreguntas.getTotalPreguntas(),
            this.estado.getRespuestaActual()
        );
        
        this.interfaz.actualizarProgreso(this.estado.getProgreso());
        this.interfaz.actualizarControles(this.estado);
    }

    /**
     * Método de debug para mostrar el estado
     */
    mostrarEstado() {
        console.log('🎮 Estado actual del juego:', {
            preguntaActual: this.estado.preguntaActual + 1,
            respuestas: this.estado.respuestas,
            puntuacion: this.estado.puntuacion,
            juegoIniciado: this.estado.juegoIniciado,
            juegoTerminado: this.estado.juegoTerminado
        });
    }

    /**
     * Método de debug para mostrar respuestas correctas
     */
    mostrarRespuestasCorrectas() {
        console.log('✅ Respuestas correctas:');
        this.bancoPreguntas.getRespuestasCorrectas().forEach(item => {
            console.log(`${item.numero}. ${item.respuesta} - ${item.explicacion}`);
        });
    }
}

// Variable global para el juego (necesaria para los event handlers en HTML)
let juego;

/**
 * Funciones globales para compatibilidad con event handlers en HTML
 */
function iniciarJuego() {
    juego.iniciar();
}

function preguntaSiguiente() {
    juego.siguientePregunta();
}

function preguntaAnterior() {
    juego.preguntaAnterior();
}

function finalizarJuego() {
    juego.finalizar();
}

function reiniciarJuego() {
    juego.reiniciar();
}

function volverAlInicio() {
    juego.volverAlInicio();
}

// Funciones de debug globales
function mostrarEstadoJuego() {
    juego.mostrarEstado();
}

function obtenerRespuestasCorrectas() {
    juego.mostrarRespuestasCorrectas();
}

// Inicialización cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la instancia del juego
    juego = new JuegoSiero();
    
    // Configurar estado inicial - solo la pantalla de inicio visible
    const pantallaInicio = document.querySelector('section[aria-label="Pantalla de inicio del juego"]');
    const pantallaJuego = document.querySelector('section[aria-label="Área de juego"]');
    const pantallaResultados = document.querySelector('section[aria-label="Resultados del juego"]');
    
    pantallaInicio.hidden = false;
    pantallaJuego.hidden = true;
    pantallaResultados.hidden = true;
    
    // Funciones de debug disponibles en consola
    window.mostrarEstadoJuego = mostrarEstadoJuego;
    window.obtenerRespuestasCorrectas = obtenerRespuestasCorrectas;
    
    console.log('🛠️ Funciones de debug disponibles:');
    console.log('- mostrarEstadoJuego() - Ver estado actual del juego');
    console.log('- obtenerRespuestasCorrectas() - Ver todas las respuestas correctas');
});

// Prevenir recarga accidental durante el juego
window.addEventListener('beforeunload', function(e) {
    if (juego && juego.estado.juegoIniciado && !juego.estado.juegoTerminado) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Perderás el progreso del juego.';
    }
});
