<?php
/**
 * Controlador de Dashboard
 * Sistema de Reservas Turísticas de Siero
 */
class DashboardController extends BaseController {
    /**
     * Inicialización del controlador
     */
    protected function initialize(): void {
        // Requerir login para acceder al dashboard
        $this->requireLogin();
    }
    
    /**
     * Maneja la petición principal
     */
    public function handle(): void {
        $dashboardService = new DashboardService($this->sessionManager->getUsuario()['id_usuario']);
        
        // Obtener estadísticas y datos para el dashboard
        $this->set('usuario', $this->sessionManager->getUsuario());
        $this->set('estadisticas', $dashboardService->obtenerEstadisticas());
        $this->set('proximasReservas', $dashboardService->obtenerProximasReservas());
        $this->set('recursosDestacados', $dashboardService->obtenerRecursosDestacados());
        
        // Renderizar vista
        $this->render('dashboard_view');
    }
}

/**
 * Servicio para el Dashboard
 * Encapsula la lógica de negocio y acceso a datos
 */
class DashboardService {
    private $idUsuario;
    
    /**
     * Constructor del servicio
     */
    public function __construct(int $idUsuario) {
        $this->idUsuario = $idUsuario;
    }
      /**
     * Obtiene estadísticas para el dashboard - formato compatible con MisReservasController
     */
    public function obtenerEstadisticas(): array {
        $db = DatabaseConnection::getInstance();
        
        // Total de reservas
        $stmt = $db->prepare("SELECT COUNT(*) as total FROM reservas WHERE id_usuario = :id_usuario");
        $stmt->execute(['id_usuario' => $this->idUsuario]);
        $totalReservas = $stmt->fetch()['total'];
        
        // Reservas por estado
        $stmt = $db->prepare("
            SELECT estado, COUNT(*) as total 
            FROM reservas 
            WHERE id_usuario = :id_usuario 
            GROUP BY estado
        ");
        $stmt->execute(['id_usuario' => $this->idUsuario]);
        
        $reservasPorEstado = [];
        while ($row = $stmt->fetch()) {
            $reservasPorEstado[$row['estado']] = $row['total'];
        }
        
        // Gasto total
        $stmt = $db->prepare("
            SELECT SUM(precio_total) as total 
            FROM reservas 
            WHERE id_usuario = :id_usuario AND estado != 'cancelada'
        ");
        $stmt->execute(['id_usuario' => $this->idUsuario]);
        $gastoTotal = $stmt->fetch()['total'] ?? 0;
        
        // Próximas reservas
        $stmt = $db->prepare("
            SELECT COUNT(*) as total 
            FROM reservas r
            JOIN disponibilidad_recursos d ON r.id_disponibilidad = d.id_disponibilidad
            WHERE r.id_usuario = :id_usuario 
            AND r.estado IN ('confirmada', 'activa') 
            AND d.fecha_inicio >= CURRENT_DATE
        ");
        $stmt->execute(['id_usuario' => $this->idUsuario]);
        $proximasReservas = $stmt->fetch()['total'];
        
        return [
            'total_reservas' => $totalReservas,
            'por_estado' => $reservasPorEstado,
            'gasto_total' => $gastoTotal,
            'proximas_reservas' => $proximasReservas
        ];
    }
    
    /**
     * Obtiene las próximas reservas del usuario
     */
    public function obtenerProximasReservas(int $limite = 5): array {
        $db = DatabaseConnection::getInstance();
        
        $stmt = $db->prepare("
            SELECT 
                r.numero_reserva,
                r.estado,
                r.numero_personas,
                r.precio_total,
                r.fecha_reserva,
                rt.nombre AS recurso_nombre,
                tr.nombre AS tipo_recurso,
                d.fecha_inicio,
                d.hora_inicio
            FROM reservas r
            JOIN disponibilidad_recursos d ON r.id_disponibilidad = d.id_disponibilidad
            JOIN recursos_turisticos rt ON d.id_recurso = rt.id_recurso
            JOIN tipos_recursos tr ON rt.id_tipo = tr.id_tipo
            WHERE r.id_usuario = :id_usuario 
              AND r.estado IN ('confirmada', 'activa')
              AND d.fecha_inicio >= CURRENT_DATE()
            ORDER BY d.fecha_inicio ASC, d.hora_inicio ASC
            LIMIT :limite
        ");
        
        $stmt->bindParam(':id_usuario', $this->idUsuario, PDO::PARAM_INT);
        $stmt->bindParam(':limite', $limite, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
    
    /**
     * Obtiene recursos turísticos destacados
     */
    public function obtenerRecursosDestacados(int $limite = 6): array {
        $db = DatabaseConnection::getInstance();
        
        // Consulta para obtener recursos con disponibilidad futura
        $stmt = $db->prepare("
            SELECT DISTINCT 
                rt.id_recurso,
                rt.nombre,
                rt.descripcion,
                rt.ubicacion,
                rt.precio_base,
                tr.nombre as tipo_nombre,
                tr.icono as tipo_icono,
                MIN(d.fecha_inicio) as proxima_fecha,
                COUNT(DISTINCT d.id_disponibilidad) as disponibilidades
            FROM recursos_turisticos rt
            JOIN tipos_recursos tr ON rt.id_tipo = tr.id_tipo
            JOIN disponibilidad_recursos d ON rt.id_recurso = d.id_recurso
            WHERE rt.activo = 1 
              AND d.activo = 1
              AND d.fecha_inicio >= CURRENT_DATE()
              AND d.plazas_disponibles > 0
            GROUP BY rt.id_recurso
            ORDER BY disponibilidades DESC, proxima_fecha ASC
            LIMIT :limite
        ");
        
        $stmt->bindParam(':limite', $limite, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
}

/**
 * DTO para datos del dashboard
 * Encapsula los datos necesarios para la vista
 */
class DashboardData {
    public $usuario;
    public $estadisticas;
    public $proximasReservas;
    public $recursosDestacados;
    
    /**
     * Constructor con todos los datos
     */
    public function __construct(array $usuario, array $estadisticas, array $proximasReservas, array $recursosDestacados) {
        $this->usuario = $usuario;
        $this->estadisticas = $estadisticas;
        $this->proximasReservas = $proximasReservas;
        $this->recursosDestacados = $recursosDestacados;
    }
    
    /**
     * Formatea un precio para mostrar
     */
    public function formatearPrecio(float $precio): string {
        return number_format($precio, 2, ',', '.') . ' €';
    }
    
    /**
     * Formatea una fecha para mostrar
     */
    public function formatearFecha($fecha): string {
        if (!$fecha) return '';
        $timestamp = strtotime($fecha);
        return date('d/m/Y', $timestamp);
    }
    
    /**
     * Formatea una hora para mostrar
     */
    public function formatearHora($hora): string {
        if (!$hora) return '';
        return substr($hora, 0, 5); // HH:MM
    }
}

// Iniciar controlador si este archivo se accede directamente
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    require_once 'SessionManager.php';
    require_once 'DatabaseConnection.php';
    require_once 'Models.php';
    require_once 'BaseController.php';
    
    $controller = new DashboardController();
    $controller->handle();
}
?>
