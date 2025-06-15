<?php
/**
 * Controlador de Recursos Turísticos
 * Sistema de Reservas Turísticas de Siero
 */
class RecursosController extends BaseController {
    /**
     * Inicialización del controlador
     */
    protected function initialize(): void {
        // No requiere login para ver los recursos
    }    /**
     * Maneja la petición principal
     */
    public function handle(): void {
        // La clase RecursosService ahora está en un archivo separado
        // Debemos importarla en el archivo principal o usar require_once
        $recursosService = new RecursosService();
        
        // Obtener datos para la vista sin filtros
        $this->set('tipos_recursos', $recursosService->obtenerTiposRecursos());
        $this->set('recursos', $recursosService->obtenerTodosLosRecursos());
        $this->set('usuario_logueado', $this->sessionManager->usuarioLogueado());
        
        // Renderizar vista
        $this->render('recursos_view');
    }
}

/**
 * Clase para filtros de recursos
 * Encapsula los criterios de filtrado
 */
class RecursosFiltro {
    private $busqueda;
    private $tipoId;
    private $fecha;
    private $precioMin;
    private $precioMax;
    
    /**
     * Constructor con los filtros
     */
    public function __construct(?string $busqueda = null, ?int $tipoId = null, ?string $fecha = null, ?float $precioMin = null, ?float $precioMax = null) {
        $this->busqueda = $busqueda ? trim($busqueda) : null;
        $this->tipoId = $tipoId ? intval($tipoId) : null;
        $this->fecha = $fecha ? trim($fecha) : null;
        $this->precioMin = $precioMin !== null ? floatval($precioMin) : null;
        $this->precioMax = $precioMax !== null ? floatval($precioMax) : null;
        
        // Validar formato de fecha
        if ($this->fecha && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $this->fecha)) {
            $this->fecha = null;
        }
    }
    
    /**
     * Convierte los filtros a un array
     */
    public function toArray(): array {
        return [
            'busqueda' => $this->busqueda,
            'tipo' => $this->tipoId,
            'fecha' => $this->fecha,
            'precio_min' => $this->precioMin,
            'precio_max' => $this->precioMax
        ];
    }
    
    /**
     * Getters para cada propiedad
     */
    public function getBusqueda(): ?string {
        return $this->busqueda;
    }
    
    public function getTipoId(): ?int {
        return $this->tipoId;
    }
    
    public function getFecha(): ?string {
        return $this->fecha;
    }
    
    public function getPrecioMin(): ?float {
        return $this->precioMin;
    }
    
    public function getPrecioMax(): ?float {
        return $this->precioMax;
    }
    
    /**
     * Verifica si hay algún filtro activo
     */
    public function tieneFiltroPrecio(): bool {
        return $this->precioMin !== null || $this->precioMax !== null;
    }
    
    /**
     * Verifica si hay algún filtro activo
     */
    public function hayFiltrosActivos(): bool {
        return $this->busqueda !== null || $this->tipoId !== null || 
               $this->fecha !== null || $this->precioMin !== null || 
               $this->precioMax !== null;
    }
}

/**

/**
 * Clase para formateo de datos de recursos
 * Encapsula la lógica de presentación
 */
class RecursosPresenter {
    /**
     * Formatea la duración para mostrar
     */
    public static function formatearDuracion(int $minutos): string {
        $horas = floor($minutos / 60);
        $mins = $minutos % 60;
        
        if ($horas > 0) {
            return $horas . 'h ' . ($mins > 0 ? $mins . 'min' : '');
        }
        
        return $mins . ' min';
    }
    
    /**
     * Formatea un precio para mostrar
     */
    public static function formatearPrecio(float $precio): string {
        return number_format($precio, 2, ',', '.') . ' €';
    }
    
    /**
     * Formatea una fecha para mostrar
     */
    public static function formatearFecha(string $fecha): string {
        $timestamp = strtotime($fecha);
        return date('d/m/Y', $timestamp);
    }
    
    /**
     * Genera la descripción corta
     */
    public static function descripcionCorta(string $descripcion, int $longitud = 100): string {
        if (strlen($descripcion) <= $longitud) {
            return $descripcion;
        }
        
        return substr($descripcion, 0, $longitud) . '...';
    }
}

// Iniciar controlador si este archivo se accede directamente
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    require_once 'SessionManager.php';
    require_once 'DatabaseConnection.php';
    require_once 'Models.php';
    require_once 'BaseController.php';
    
    $controller = new RecursosController();
    $controller->handle();
}
?>
