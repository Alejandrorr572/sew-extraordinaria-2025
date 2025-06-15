/**
 * Validación de formularios
 * Sistema de Reservas Turísticas de Siero
 */

/**
 * Validación para formulario de registro
 */
function validarRegistro() {
    // Referencias a los campos
    const nombre = document.getElementById('nombre');
    const apellidos = document.getElementById('apellidos');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm_password');
    const telefono = document.getElementById('telefono');
    
    // Limpiar errores previos
    limpiarErrores();
    
    let isValid = true;
    
    // Validar nombre
    if (nombre.value.trim() === '') {
        mostrarError(nombre, 'El nombre es obligatorio');
        isValid = false;
    } else if (nombre.value.trim().length < 2) {
        mostrarError(nombre, 'El nombre debe tener al menos 2 caracteres');
        isValid = false;
    }
    
    // Validar apellidos
    if (apellidos.value.trim() === '') {
        mostrarError(apellidos, 'Los apellidos son obligatorios');
        isValid = false;
    } else if (apellidos.value.trim().length < 2) {
        mostrarError(apellidos, 'Los apellidos deben tener al menos 2 caracteres');
        isValid = false;
    }
    
    // Validar email
    if (email.value.trim() === '') {
        mostrarError(email, 'El email es obligatorio');
        isValid = false;
    } else if (!validarEmail(email.value)) {
        mostrarError(email, 'El email no es válido');
        isValid = false;
    }
    
    // Validar contraseña
    if (password.value === '') {
        mostrarError(password, 'La contraseña es obligatoria');
        isValid = false;
    } else if (password.value.length < 6) {
        mostrarError(password, 'La contraseña debe tener al menos 6 caracteres');
        isValid = false;
    }
    
    // Validar confirmación de contraseña
    if (confirmPassword.value === '') {
        mostrarError(confirmPassword, 'Debes confirmar la contraseña');
        isValid = false;
    } else if (password.value !== confirmPassword.value) {
        mostrarError(confirmPassword, 'Las contraseñas no coinciden');
        isValid = false;
    }
    
    // Validar teléfono (opcional)
    if (telefono.value.trim() !== '' && !validarTelefono(telefono.value)) {
        mostrarError(telefono, 'El formato de teléfono no es válido');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Validación para formulario de login
 */
function validarLogin() {
    // Referencias a los campos
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    
    // Limpiar errores previos
    limpiarErrores();
    
    let isValid = true;
    
    // Validar email
    if (email.value.trim() === '') {
        mostrarError(email, 'El email es obligatorio');
        isValid = false;
    } else if (!validarEmail(email.value)) {
        mostrarError(email, 'El email no es válido');
        isValid = false;
    }
    
    // Validar contraseña
    if (password.value === '') {
        mostrarError(password, 'La contraseña es obligatoria');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Validación para formulario de reserva
 */
function validarReserva() {
    // Referencias a los campos
    const numeroPersonas = document.getElementById('numero_personas');
    const maxPersonas = parseInt(numeroPersonas.getAttribute('max'));
    
    // Limpiar errores previos
    limpiarErrores();
    
    let isValid = true;
    
    // Validar número de personas
    if (numeroPersonas.value === '') {
        mostrarError(numeroPersonas, 'El número de personas es obligatorio');
        isValid = false;
    } else if (parseInt(numeroPersonas.value) < 1) {
        mostrarError(numeroPersonas, 'El número de personas debe ser al menos 1');
        isValid = false;
    } else if (parseInt(numeroPersonas.value) > maxPersonas) {
        mostrarError(numeroPersonas, 'El número de personas no puede superar las plazas disponibles');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Muestra un error debajo de un campo de formulario
 */
function mostrarError(input, mensaje) {
    const formGroup = input.parentElement;
    const error = document.createElement('div');
    error.className = 'error';
    error.textContent = mensaje;
    formGroup.appendChild(error);
    input.classList.add('input-error');
}

/**
 * Elimina todos los mensajes de error
 */
function limpiarErrores() {
    // Eliminar mensajes de error
    document.querySelectorAll('.error').forEach(error => error.remove());
    
    // Eliminar clase de error en inputs
    document.querySelectorAll('.input-error').forEach(input => {
        input.classList.remove('input-error');
    });
}

/**
 * Valida formato de email
 */
function validarEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(email);
}

/**
 * Valida formato de teléfono español
 */
function validarTelefono(telefono) {
    const re = /^(\+34|0034|34)?[ -]*(6|7|8|9)[ -]*([0-9][ -]*){8}$/;
    return re.test(telefono);
}

/**
 * Actualiza el precio total en el formulario de reserva
 */
function actualizarPrecio() {
    const numeroPersonas = document.getElementById('numero_personas');
    const precioUnitario = parseFloat(numeroPersonas.dataset.precioUnitario);
    const precioTotalElement = document.getElementById('precio_total');
    
    if (numeroPersonas && precioTotalElement) {
        const personas = parseInt(numeroPersonas.value) || 0;
        const precioTotal = (personas * precioUnitario).toFixed(2);
        precioTotalElement.textContent = precioTotal + ' €';
    }
}

/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    // Formulario de registro
    const formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', function(e) {
            if (!validarRegistro()) {
                e.preventDefault();
            }
        });
    }
    
    // Formulario de login
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            if (!validarLogin()) {
                e.preventDefault();
            }
        });
    }
    
    // Formulario de reserva
    const formReserva = document.getElementById('formReserva');
    if (formReserva) {
        formReserva.addEventListener('submit', function(e) {
            if (!validarReserva()) {
                e.preventDefault();
            }
        });
        
        // Actualizar precio en tiempo real
        const numeroPersonas = document.getElementById('numero_personas');
        if (numeroPersonas) {
            numeroPersonas.addEventListener('input', actualizarPrecio);
            actualizarPrecio(); // Inicializar precio
        }
    }
    
    // Botón de impresión en confirmación de reserva
    const printButton = document.getElementById('print-button');
    if (printButton) {
        printButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.print();
        });
    }
    
    // Filtro de estado en mis reservas
    const estadoFilter = document.querySelector('.filtro-estado');
    if (estadoFilter) {
        estadoFilter.addEventListener('change', function() {
            window.location.href = 'mis_reservas.php?estado=' + this.value;
        });
    }
});
