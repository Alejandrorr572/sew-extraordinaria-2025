<?php
/**
 * Controlador de Registro de Usuarios
 * Sistema de Reservas Turísticas de Siero
 */
class RegistroController extends BaseController {
    /**
     * Inicialización del controlador
     */
    protected function initialize(): void {
        // No es necesario estar logueado para registrarse
    }
    
    /**
     * Maneja la petición principal
     */
    public function handle(): void {
        // Si es POST, procesa el formulario
        if ($this->request->isPost()) {
            $this->procesarRegistro();
        } else {
            // Muestra el formulario de registro
            $this->mostrarFormulario();
        }
    }
    
    /**
     * Muestra el formulario de registro
     */
    private function mostrarFormulario(): void {
        $this->render('registro_view');
    }
    
    /**
     * Procesa el formulario de registro
     */    private function procesarRegistro(): void {
        $validador = new RegistroValidator($this->request->allPost());
        
        if ($validador->esValido()) {
            try {
                // Get validated data and remove password_confirm
                $datos = $validador->getDatos();
                unset($datos['password_confirm']);
                
                $usuario = $this->modelFactory->createUsuario($datos);
                $usuario->save();
                
                // Mostrar mensaje de éxito
                $this->sessionManager->setFlash('success', 'Registro completado correctamente. Ya puedes iniciar sesión.');
                $this->redirect('login.php');
            } catch (ValidationException $e) {
                $this->set('errores', $e->getValidationErrors());
                $this->set('datos', $validador->getDatos());
                $this->render('registro_view');
            } catch (Exception $e) {
                $this->set('error', 'Error al registrar el usuario: ' . $e->getMessage());
                $this->set('datos', $validador->getDatos());
                $this->render('registro_view');
            }
        } else {
            $this->set('errores', $validador->getErrores());
            $this->set('datos', $validador->getDatos());
            $this->render('registro_view');
        }
    }
}

/**
 * Validador para el registro de usuarios
 */
class RegistroValidator {
    private $datos = [];
    private $errores = [];
    
    /**
     * Constructor con los datos a validar
     */
    public function __construct(array $datos) {
        // Limpieza de datos
        $this->datos = $this->limpiarDatos($datos);
        $this->validar();
    }
    
    /**
     * Limpia los datos de entrada
     */
    private function limpiarDatos(array $datos): array {
        $datosLimpios = [];
        foreach ($datos as $key => $value) {
            $datosLimpios[$key] = is_string($value) ? trim($value) : $value;
        }
        return $datosLimpios;
    }
    
    /**
     * Valida los datos del formulario
     */
    private function validar(): void {
        // Validar nombre
        if (empty($this->datos['nombre'])) {
            $this->errores['nombre'] = 'El nombre es obligatorio';
        } elseif (strlen($this->datos['nombre']) < 2) {
            $this->errores['nombre'] = 'El nombre debe tener al menos 2 caracteres';
        }
        
        // Validar apellidos
        if (empty($this->datos['apellidos'])) {
            $this->errores['apellidos'] = 'Los apellidos son obligatorios';
        } elseif (strlen($this->datos['apellidos']) < 2) {
            $this->errores['apellidos'] = 'Los apellidos deben tener al menos 2 caracteres';
        }
        
        // Validar email
        if (empty($this->datos['email'])) {
            $this->errores['email'] = 'El email es obligatorio';
        } elseif (!filter_var($this->datos['email'], FILTER_VALIDATE_EMAIL)) {
            $this->errores['email'] = 'El formato del email no es válido';
        } else {
            // Verificar si ya existe un usuario con este email
            $usuarios = Usuario::where('email', $this->datos['email']);
            if (!empty($usuarios)) {
                $this->errores['email'] = 'Este email ya está registrado';
            }
        }
        
        // Validar contraseña
        if (empty($this->datos['password'])) {
            $this->errores['password'] = 'La contraseña es obligatoria';
        } elseif (strlen($this->datos['password']) < 6) {
            $this->errores['password'] = 'La contraseña debe tener al menos 6 caracteres';
        }
        
        // Validar confirmación de contraseña
        if (empty($this->datos['password_confirm'])) {
            $this->errores['password_confirm'] = 'La confirmación de contraseña es obligatoria';
        } elseif ($this->datos['password'] !== $this->datos['password_confirm']) {
            $this->errores['password_confirm'] = 'Las contraseñas no coinciden';
        }
        
        // Validar teléfono (opcional)
        if (!empty($this->datos['telefono']) && !preg_match('/^[0-9]{9}$/', $this->datos['telefono'])) {
            $this->errores['telefono'] = 'El teléfono debe tener 9 dígitos';
        }
    }
    
    /**
     * Verifica si los datos son válidos
     */
    public function esValido(): bool {
        return empty($this->errores);
    }
    
    /**
     * Obtiene los errores de validación
     */
    public function getErrores(): array {
        return $this->errores;
    }
    
    /**
     * Obtiene los datos validados
     */
    public function getDatos(): array {
        return $this->datos;
    }
}

// Iniciar controlador si este archivo se accede directamente
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    require_once 'SessionManager.php';
    require_once 'DatabaseConnection.php';
    require_once 'Models.php';
    require_once 'BaseController.php';
    
    $controller = new RegistroController();
    $controller->handle();
}
?>
