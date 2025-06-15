<?php
/**
 * Controlador de Login
 * Sistema de Reservas Turísticas de Siero
 */
class LoginController extends BaseController {
    /**
     * Inicialización del controlador
     */
    protected function initialize(): void {
        // No es necesario estar logueado para hacer login
        
        // Intentar inicializar la base de datos con datos de prueba si no existen
        $this->inicializarBaseDeDatos();
    }
    
    /**
     * Inicializar la base de datos si está vacía
     */    private function inicializarBaseDeDatos(): void {
        // Incluir el archivo con la clase inicializadora
        require_once dirname(__DIR__) . '/inicializar_db.php';
        
        try {
            $inicializador = new InicializadorDatos();
            $resultado = $inicializador->inicializar();
            
            // Si hay mensajes de inicialización, pasarlos a la vista
            if (!empty($resultado['mensajes'])) {
                $this->set('inicializacion', $resultado);
            }
        } catch (Exception $e) {
            // Si hay un error, mostramos un mensaje en la vista
            $this->set('inicializacion', [
                'exito' => false,
                'mensajes' => ['Error al inicializar la base de datos: ' . $e->getMessage()]
            ]);
        }
    }
    
    /**
     * Maneja la petición principal
     */
    public function handle(): void {
        // Si ya hay un usuario logueado, redirigir al dashboard
        if ($this->sessionManager->usuarioLogueado()) {
            $this->redirect('dashboard.php');
            return;
        }
        
        // Si es POST, procesar login
        if ($this->request->isPost()) {
            $this->procesarLogin();
        } else {
            // Mostrar el formulario de login
            $this->mostrarFormulario();
        }
    }
    
    /**
     * Muestra el formulario de login
     */
    private function mostrarFormulario(): void {
        // Pasar mensajes flash (si existen)
        if ($this->sessionManager->has('flash')) {
            $this->set('mensajes', $this->sessionManager->getAllFlash());
        }
        
        $this->render('login_view');
    }
    
    /**
     * Procesa el formulario de login
     */
    private function procesarLogin(): void {
        $email = $this->request->post('email');
        $password = $this->request->post('password');
        
        $validador = new LoginValidator(['email' => $email, 'password' => $password]);
        
        if ($validador->esValido()) {
            $usuario = Usuario::authenticate($email, $password);
            
            if ($usuario) {
                // Login exitoso - establecer sesión
                $this->sessionManager->establecerUsuario($usuario->getAttributes());
                
                // Redirigir al dashboard
                $this->redirect('dashboard.php');
            } else {
                // Credenciales incorrectas
                $this->set('error', 'Email o contraseña incorrectos');
                $this->set('email', $email);
                $this->render('login_view');
            }
        } else {
            // Datos inválidos
            $this->set('errores', $validador->getErrores());
            $this->set('email', $email);
            $this->render('login_view');
        }
    }
}

/**
 * Validador para el login
 */
class LoginValidator {
    private $datos = [];
    private $errores = [];
    
    /**
     * Constructor con los datos a validar
     */
    public function __construct(array $datos) {
        $this->datos = $datos;
        $this->validar();
    }
    
    /**
     * Valida los datos del formulario
     */
    private function validar(): void {
        // Validar email
        if (empty($this->datos['email'])) {
            $this->errores['email'] = 'El email es obligatorio';
        } elseif (!filter_var($this->datos['email'], FILTER_VALIDATE_EMAIL)) {
            $this->errores['email'] = 'El formato del email no es válido';
        }
        
        // Validar contraseña
        if (empty($this->datos['password'])) {
            $this->errores['password'] = 'La contraseña es obligatoria';
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
}

/**
 * Servicio de autenticación
 */
class AuthenticationService {
    /**
     * Intenta autenticar a un usuario
     * 
     * @param string $email Email del usuario
     * @param string $password Contraseña del usuario
     * @return Usuario|null Usuario autenticado o null si falla
     */
    public static function authenticate(string $email, string $password): ?Usuario {
        return Usuario::authenticate($email, $password);
    }
    
    /**
     * Cierra la sesión del usuario actual
     */
    public static function logout(): void {
        $sessionManager = SessionManager::getInstance();
        $sessionManager->cerrarSesion();
    }
}

// Iniciar controlador si este archivo se accede directamente
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    require_once 'SessionManager.php';
    require_once 'DatabaseConnection.php';
    require_once 'Models.php';
    require_once 'BaseController.php';
    
    $controller = new LoginController();
    $controller->handle();
}
?>
