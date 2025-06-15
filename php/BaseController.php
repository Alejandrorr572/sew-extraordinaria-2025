<?php
/**
 * Controlador base para el Sistema de Reservas Turísticas de Siero
 * Implementa patrón orientado a objetos para gestionar las peticiones HTTP
 */
abstract class BaseController {
    protected $sessionManager;
    protected $modelFactory;
    protected $request;
    protected $viewData = [];
    
    /**
     * Constructor base para todos los controladores
     */
    public function __construct() {
        $this->sessionManager = SessionManager::getInstance();
        $this->modelFactory = new ModelFactory();
        $this->request = new Request();
        $this->initialize();
    }
    
    /**
     * Método para inicialización adicional en controladores derivados
     */
    protected function initialize(): void {
        // Implementar en clases derivadas si es necesario
    }
    
    /**
     * Método abstracto que debe ser implementado por todos los controladores
     * Define la acción principal a ejecutar
     */
    abstract public function handle(): void;
    
    /**
     * Verifica si el usuario está autenticado
     * Redirige al login si no lo está
     */
    protected function requireLogin(): void {
        $this->sessionManager->requiereLogin();
    }
    
    /**
     * Establece un valor para la vista
     */
    protected function set(string $key, $value): void {
        $this->viewData[$key] = $value;
    }
    
    /**
     * Renderiza una vista con los datos proporcionados
     */
    protected function render(string $view): void {
        // Extraer variables para la vista
        extract($this->viewData);
        
        // Incluir el archivo de la vista
        $viewFile = 'views/' . $view . '.php';
        if (file_exists($viewFile)) {
            include $viewFile;
        } else {
            throw new Exception("Vista no encontrada: {$viewFile}");
        }
    }
    
    /**
     * Redirecciona a otra página
     */
    protected function redirect(string $url): void {
        header("Location: {$url}");
        exit;
    }
    
    /**
     * Envía una respuesta JSON
     */
    protected function json($data, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    
    /**
     * Procesa una petición AJAX
     */
    protected function processAjaxRequest(): bool {
        return $this->request->isAjax();
    }
}

/**
 * Factoría de modelos para crear instancias de objetos del dominio
 */
class ModelFactory {
    /**
     * Crea una instancia de usuario
     */
    public function createUsuario(array $data = []): Usuario {
        return new Usuario($data);
    }
    
    /**
     * Crea una instancia de TipoRecurso
     */
    public function createTipoRecurso(array $data = []): TipoRecurso {
        return new TipoRecurso($data);
    }
    
    /**
     * Crea una instancia de RecursoTuristico
     */
    public function createRecursoTuristico(array $data = []): RecursoTuristico {
        return new RecursoTuristico($data);
    }
    
    /**
     * Crea una instancia de DisponibilidadRecurso
     */
    public function createDisponibilidadRecurso(array $data = []): DisponibilidadRecurso {
        return new DisponibilidadRecurso($data);
    }
    
    /**
     * Crea una instancia de Reserva
     */
    public function createReserva(array $data = []): Reserva {
        return new Reserva($data);
    }
}

/**
 * Clase para manejar la petición HTTP
 */
class Request {
    private $get;
    private $post;
    private $server;
    private $files;
    private $cookies;
    
    /**
     * Constructor para inicializar la petición
     */
    public function __construct() {
        $this->get = $_GET;
        $this->post = $_POST;
        $this->server = $_SERVER;
        $this->files = $_FILES;
        $this->cookies = $_COOKIE;
    }
    
    /**
     * Obtiene un valor de GET
     */
    public function get(string $key, $default = null) {
        return $this->get[$key] ?? $default;
    }
    
    /**
     * Obtiene un valor de POST
     */
    public function post(string $key, $default = null) {
        return $this->post[$key] ?? $default;
    }
    
    /**
     * Obtiene todos los valores de POST
     */
    public function allPost(): array {
        return $this->post;
    }
    
    /**
     * Obtiene todos los valores de GET
     */
    public function allGet(): array {
        return $this->get;
    }
    
    /**
     * Verifica el método de la petición
     */
    public function method(): string {
        return $this->server['REQUEST_METHOD'] ?? 'GET';
    }
    
    /**
     * Verifica si es una petición POST
     */
    public function isPost(): bool {
        return $this->method() === 'POST';
    }
    
    /**
     * Verifica si es una petición GET
     */
    public function isGet(): bool {
        return $this->method() === 'GET';
    }
    
    /**
     * Verifica si es una petición AJAX/XHR
     */
    public function isAjax(): bool {
        return isset($this->server['HTTP_X_REQUESTED_WITH']) && 
               strtolower($this->server['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
    }
    
    /**
     * Obtiene un archivo subido
     */
    public function file(string $key) {
        return $this->files[$key] ?? null;
    }
    
    /**
     * Obtiene una cookie
     */
    public function cookie(string $key, $default = null) {
        return $this->cookies[$key] ?? $default;
    }
    
    /**
     * Obtiene la URL actual
     */
    public function url(): string {
        $protocol = (!empty($this->server['HTTPS']) && $this->server['HTTPS'] !== 'off' || $this->server['SERVER_PORT'] == 443) ? "https://" : "http://";
        return $protocol . $this->server['HTTP_HOST'] . $this->server['REQUEST_URI'];
    }
    
    /**
     * Obtiene la URL base
     */
    public function baseUrl(): string {
        $protocol = (!empty($this->server['HTTPS']) && $this->server['HTTPS'] !== 'off' || $this->server['SERVER_PORT'] == 443) ? "https://" : "http://";
        return $protocol . $this->server['HTTP_HOST'] . dirname($this->server['PHP_SELF']);
    }
}

/**
 * Clase para manejar la respuesta HTTP
 */
class Response {
    private $headers = [];
    private $content;
    private $statusCode = 200;
    
    /**
     * Establece un encabezado HTTP
     */
    public function setHeader(string $name, string $value): self {
        $this->headers[$name] = $value;
        return $this;
    }
    
    /**
     * Establece el código de estado HTTP
     */
    public function setStatusCode(int $statusCode): self {
        $this->statusCode = $statusCode;
        return $this;
    }
    
    /**
     * Establece el contenido de la respuesta
     */
    public function setContent($content): self {
        $this->content = $content;
        return $this;
    }
    
    /**
     * Envía la respuesta al cliente
     */
    public function send(): void {
        // Establecer código de estado
        http_response_code($this->statusCode);
        
        // Establecer encabezados
        foreach ($this->headers as $name => $value) {
            header("{$name}: {$value}");
        }
        
        // Enviar contenido
        echo $this->content;
        exit;
    }
    
    /**
     * Envía una redirección
     */
    public function redirect(string $url, int $statusCode = 302): void {
        $this->setStatusCode($statusCode);
        $this->setHeader('Location', $url);
        $this->send();
    }
    
    /**
     * Envía una respuesta JSON
     */
    public function json($data, int $statusCode = 200): void {
        $this->setStatusCode($statusCode);
        $this->setHeader('Content-Type', 'application/json');
        $this->setContent(json_encode($data));
        $this->send();
    }
}
?>
