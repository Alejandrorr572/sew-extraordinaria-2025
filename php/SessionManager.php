<?php
/**
 * Gestor de Sesiones para el Sistema de Reservas Turísticas
 * Implementa el patrón Singleton y manejo completo de sesiones de usuario
 */
class SessionManager {
    private static $instance = null;
    private $sessionStarted = false;
    
    // Configuración de sesión
    private const SESSION_NAME = 'SIERO_RESERVAS_SESSION';
    private const SESSION_LIFETIME = 7200; // 2 horas
    private const REGENERATE_INTERVAL = 300; // 5 minutos
    
    /**
     * Constructor privado para Singleton
     */
    private function __construct() {
        $this->configureSession();
    }
    
    /**
     * Obtiene la instancia única del SessionManager
     */
    public static function getInstance(): SessionManager {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Configura los parámetros de sesión
     */
    private function configureSession(): void {
        // Configuración de seguridad de sesión
        ini_set('session.cookie_httponly', 1);
        ini_set('session.cookie_secure', 0); // Cambiar a 1 en HTTPS
        ini_set('session.use_only_cookies', 1);
        ini_set('session.cookie_samesite', 'Strict');
        ini_set('session.gc_maxlifetime', self::SESSION_LIFETIME);
        
        // Nombre personalizado de sesión
        session_name(self::SESSION_NAME);
    }
    
    /**
     * Inicia la sesión
     */
    public function iniciarSesion(): bool {
        if ($this->sessionStarted) {
            return true;
        }
        
        if (session_status() === PHP_SESSION_NONE) {
            if (session_start()) {
                $this->sessionStarted = true;
                $this->initializeSession();
                $this->checkSessionSecurity();
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Inicializa variables de sesión necesarias
     */
    private function initializeSession(): void {
        if (!isset($_SESSION['iniciada'])) {
            $_SESSION['iniciada'] = time();
            $_SESSION['ultima_actividad'] = time();
            $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
            $_SESSION['ip_address'] = $this->getClientIP();
        }
        
        $_SESSION['ultima_actividad'] = time();
    }
    
    /**
     * Verifica la seguridad de la sesión
     */
    private function checkSessionSecurity(): void {
        // Verificar expiración de sesión
        if (isset($_SESSION['iniciada'])) {
            $sessionAge = time() - $_SESSION['iniciada'];
            if ($sessionAge > self::SESSION_LIFETIME) {
                $this->destruirSesion();
                return;
            }
        }
        
        // Verificar User Agent
        if (isset($_SESSION['user_agent'])) {
            $currentUserAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
            if ($_SESSION['user_agent'] !== $currentUserAgent) {
                $this->destruirSesion();
                return;
            }
        }
        
        // Verificar IP (opcional, puede ser problemático con proxies)
        if (isset($_SESSION['ip_address'])) {
            $currentIP = $this->getClientIP();
            if ($_SESSION['ip_address'] !== $currentIP) {
                // Solo log, no destruir sesión automáticamente
                error_log("Cambio de IP detectado en sesión: {$_SESSION['ip_address']} -> {$currentIP}");
            }
        }
        
        // Regenerar ID de sesión periódicamente
        $this->regenerateSessionId();
    }
    
    /**
     * Regenera el ID de sesión por seguridad
     */
    private function regenerateSessionId(): void {
        if (isset($_SESSION['ultimo_regenerado'])) {
            $timeSinceRegeneration = time() - $_SESSION['ultimo_regenerado'];
            if ($timeSinceRegeneration < self::REGENERATE_INTERVAL) {
                return;
            }
        }
        
        session_regenerate_id(true);
        $_SESSION['ultimo_regenerado'] = time();
    }
    
    /**
     * Obtiene la IP del cliente
     */
    private function getClientIP(): string {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                // Para X-Forwarded-For, tomar la primera IP
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return '0.0.0.0';
    }
    
    /**
     * Establece los datos del usuario en la sesión
     */
    public function establecerUsuario(array $usuario): void {
        $this->iniciarSesion();
        
        $_SESSION['usuario'] = [
            'id_usuario' => $usuario['id_usuario'],
            'nombre' => $usuario['nombre'],
            'apellidos' => $usuario['apellidos'],
            'email' => $usuario['email'],
            'telefono' => $usuario['telefono'] ?? null,
            'fecha_login' => time()
        ];
        
        $_SESSION['autenticado'] = true;
        $this->regenerateSessionId();
    }
    
    /**
     * Alias para compatibilidad
     */
    public static function setUsuario(array $usuario): void {
        self::getInstance()->establecerUsuario($usuario);
    }
    
    /**
     * Obtiene los datos del usuario de la sesión
     */
    public function getUsuario(): ?array {
        $this->iniciarSesion();
        return $_SESSION['usuario'] ?? null;
    }
    
    /**
     * Verifica si hay un usuario logueado
     */
    public function usuarioLogueado(): bool {
        $this->iniciarSesion();
        return isset($_SESSION['autenticado']) && $_SESSION['autenticado'] === true && isset($_SESSION['usuario']);
    }
    
    /**
     * Requiere que el usuario esté logueado, redirige si no lo está
     */
    public function requiereLogin(string $redirectUrl = 'login.php'): void {
        if (!$this->usuarioLogueado()) {
            header("Location: $redirectUrl");
            exit;
        }
    }
    
    /**
     * Alias estático para requiereLogin
     */
    public static function requiereLoginEstatico(string $redirectUrl = 'login.php'): void {
        self::getInstance()->requiereLogin($redirectUrl);
    }
    
    /**
     * Cierra la sesión del usuario
     */
    public function cerrarSesion(): bool {
        $this->iniciarSesion();
        
        // Limpiar variables de sesión
        $_SESSION = [];
        
        // Destruir cookie de sesión
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly']
            );
        }
        
        // Destruir sesión
        return session_destroy();
    }
    
    /**
     * Destruye completamente la sesión
     */
    public function destruirSesion(): void {
        $this->cerrarSesion();
        $this->sessionStarted = false;
    }
    
    /**
     * Establece un valor en la sesión
     */
    public function set(string $key, $value): void {
        $this->iniciarSesion();
        $_SESSION[$key] = $value;
    }
    
    /**
     * Obtiene un valor de la sesión
     */
    public function get(string $key, $default = null) {
        $this->iniciarSesion();
        return $_SESSION[$key] ?? $default;
    }
    
    /**
     * Verifica si existe una clave en la sesión
     */
    public function has(string $key): bool {
        $this->iniciarSesion();
        return isset($_SESSION[$key]);
    }
    
    /**
     * Elimina una clave de la sesión
     */
    public function remove(string $key): void {
        $this->iniciarSesion();
        unset($_SESSION[$key]);
    }
    
    /**
     * Obtiene información de la sesión
     */
    public function getSessionInfo(): array {
        $this->iniciarSesion();
        
        return [
            'session_id' => session_id(),
            'session_name' => session_name(),
            'session_status' => session_status(),
            'iniciada' => $_SESSION['iniciada'] ?? null,
            'ultima_actividad' => $_SESSION['ultima_actividad'] ?? null,
            'usuario_logueado' => $this->usuarioLogueado(),
            'tiempo_activa' => isset($_SESSION['iniciada']) ? time() - $_SESSION['iniciada'] : 0,
            'ip_address' => $_SESSION['ip_address'] ?? null
        ];
    }
    
    /**
     * Establece mensajes flash (para mostrar una sola vez)
     */
    public function setFlash(string $type, string $message): void {
        $this->iniciarSesion();
        if (!isset($_SESSION['flash'])) {
            $_SESSION['flash'] = [];
        }
        $_SESSION['flash'][$type] = $message;
    }
    
    /**
     * Obtiene y elimina un mensaje flash
     */
    public function getFlash(string $type): ?string {
        $this->iniciarSesion();
        $message = $_SESSION['flash'][$type] ?? null;
        unset($_SESSION['flash'][$type]);
        return $message;
    }
    
    /**
     * Obtiene todos los mensajes flash y los elimina
     */
    public function getAllFlash(): array {
        $this->iniciarSesion();
        $messages = $_SESSION['flash'] ?? [];
        $_SESSION['flash'] = [];
        return $messages;
    }
    
    /**
     * Previene clonación (Singleton)
     */
    private function __clone() {}
    
    /**
     * Previene deserialización (Singleton)
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
    
    // Métodos estáticos para compatibilidad con el código existente
    public static function iniciarSesionEstatico(): void {
        self::getInstance()->iniciarSesion();
    }
    
    public static function getUsuarioEstatico(): ?array {
        return self::getInstance()->getUsuario();
    }
    
    public static function usuarioLogueadoEstatico(): bool {
        return self::getInstance()->usuarioLogueado();
    }
}

// Alias estático para compatibilidad con el código existente
class SessionManagerStatic {
    public static function iniciarSesion(): void {
        SessionManager::getInstance()->iniciarSesion();
    }
    
    public static function getUsuario(): ?array {
        return SessionManager::getInstance()->getUsuario();
    }
    
    public static function usuarioLogueado(): bool {
        return SessionManager::getInstance()->usuarioLogueado();
    }
    
    public static function requiereLogin(string $redirectUrl = 'login.php'): void {
        SessionManager::getInstance()->requiereLogin($redirectUrl);
    }
    
    public static function establecerUsuario(array $usuario): void {
        SessionManager::getInstance()->establecerUsuario($usuario);
    }
    
    public static function cerrarSesion(): bool {
        return SessionManager::getInstance()->cerrarSesion();
    }
}
?>
