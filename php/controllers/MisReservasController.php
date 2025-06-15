<?php
/**
 * Controlador de Mis Reservas
 * Sistema de Reservas Turísticas de Siero
 */
class MisReservasController extends BaseController {
    /**
     * Inicialización del controlador
     */
    protected function initialize(): void {
        // Requiere login
        $this->requireLogin();
    }
    
    /**
     * Maneja la petición principal
     */
    public function handle(): void {
        // Procesar cancelación si se solicita
        if ($this->request->isPost() && $this->request->post('accion') === 'cancelar') {
            $this->cancelarReserva();
            return;
        }
        
        // Mostrar listado de reservas
        $this->mostrarReservas();
    }
    
    /**
     * Muestra el listado de reservas del usuario
     */
    private function mostrarReservas(): void {
        $idUsuario = $this->sessionManager->getUsuario()['id_usuario'];
        $misReservasService = new MisReservasService($idUsuario);
        
        // Filtrar por estado si se especifica
        $filtroEstado = $this->request->get('estado');
        
        // Obtener reservas según filtros
        $reservas = $misReservasService->obtenerReservas($filtroEstado);
        
        // Estadísticas de reservas
        $estadisticas = $misReservasService->obtenerEstadisticas();
        
        // Pasar datos a la vista
        $this->set('reservas', $reservas);
        $this->set('estadisticas', $estadisticas);
        $this->set('filtro_actual', $filtroEstado);
        
        // Mensajes flash
        if ($this->sessionManager->has('flash')) {
            $this->set('mensajes', $this->sessionManager->getAllFlash());
        }
        
        // Renderizar vista
        $this->render('mis_reservas_view');
    }
    
    /**
     * Procesa la cancelación de una reserva
     */
    private function cancelarReserva(): void {
        $numeroReserva = $this->request->post('numero_reserva');
        $motivo = $this->request->post('motivo_cancelacion');
        $idUsuario = $this->sessionManager->getUsuario()['id_usuario'];
        
        if (empty($numeroReserva)) {
            $this->sessionManager->setFlash('error', 'Debe especificar una reserva para cancelar');
            $this->redirect('mis_reservas.php');
            return;
        }
        
        $misReservasService = new MisReservasService($idUsuario);
        
        try {
            $resultado = $misReservasService->cancelarReserva($numeroReserva, $motivo);
            
            if ($resultado) {
                $this->sessionManager->setFlash('success', 'Reserva cancelada correctamente');
            } else {
                $this->sessionManager->setFlash('error', 'No se pudo cancelar la reserva');
            }
        } catch (Exception $e) {
            $this->sessionManager->setFlash('error', 'Error al cancelar la reserva: ' . $e->getMessage());
        }
        
        $this->redirect('mis_reservas.php');
    }
}

/**
 * Servicio para gestionar las reservas del usuario
 * Encapsula la lógica de negocio
 */
class MisReservasService {
    private $idUsuario;
    
    /**
     * Constructor con el ID del usuario
     */
    public function __construct(int $idUsuario) {
        $this->idUsuario = $idUsuario;
    }
    
    /**
     * Obtiene las reservas del usuario con filtros
     */
    public function obtenerReservas(?string $estado = null): array {
        $db = DatabaseConnection::getInstance();
        
        $sql = "
            SELECT 
                r.id_reserva,
                r.numero_reserva,
                r.numero_personas,
                r.precio_total,
                r.estado,
                r.fecha_reserva,
                r.fecha_confirmacion,
                r.fecha_cancelacion,
                r.metodo_pago,
                r.observaciones_usuario,
                rt.nombre AS recurso_nombre,
                rt.ubicacion AS recurso_ubicacion,
                tr.nombre AS tipo_recurso,
                tr.icono AS tipo_icono,
                d.fecha_inicio,
                d.hora_inicio,
                d.fecha_fin,
                d.hora_fin
            FROM reservas r
            JOIN disponibilidad_recursos d ON r.id_disponibilidad = d.id_disponibilidad
            JOIN recursos_turisticos rt ON d.id_recurso = rt.id_recurso
            JOIN tipos_recursos tr ON rt.id_tipo = tr.id_tipo
            WHERE r.id_usuario = :id_usuario
        ";
        
        $params = ['id_usuario' => $this->idUsuario];
        
        if ($estado) {
            $sql .= " AND r.estado = :estado";
            $params['estado'] = $estado;
        }
        
        $sql .= " ORDER BY 
            CASE 
                WHEN d.fecha_inicio >= CURRENT_DATE THEN 0
                ELSE 1
            END,
            d.fecha_inicio ASC,
            d.hora_inicio ASC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll();
    }
    
    /**
     * Obtiene estadísticas de las reservas del usuario
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
     * Cancela una reserva del usuario
     */
    public function cancelarReserva(string $numeroReserva, ?string $motivo = null): bool {
        $db = DatabaseConnection::getInstance();
        
        // Verificar que la reserva pertenezca al usuario y pueda ser cancelada
        $stmt = $db->prepare("
            SELECT *
            FROM reservas
            WHERE numero_reserva = :numero_reserva 
            AND id_usuario = :id_usuario
            AND estado IN ('pendiente', 'confirmada', 'activa')
        ");
        
        $stmt->execute([
            'numero_reserva' => $numeroReserva,
            'id_usuario' => $this->idUsuario
        ]);
        
        $reservaData = $stmt->fetch();
        
        if (!$reservaData) {
            // La reserva no existe, no pertenece al usuario o no se puede cancelar
            return false;
        }
        
        // Cancelar la reserva usando el procedimiento almacenado
        try {
            $stmt = $db->prepare("CALL sp_cancelar_reserva(:numero_reserva, :motivo)");
            $stmt->execute([
                'numero_reserva' => $numeroReserva,
                'motivo' => $motivo ?? 'Cancelada por el usuario'
            ]);
            
            return true;
        } catch (PDOException $e) {
            throw new Exception('Error al cancelar la reserva: ' . $e->getMessage());
        }
    }
    
    /**
     * Verifica si una reserva pertenece al usuario actual
     */
    public function esReservaDelUsuario(string $numeroReserva): bool {
        $db = DatabaseConnection::getInstance();
        
        $stmt = $db->prepare("
            SELECT COUNT(*) as total
            FROM reservas
            WHERE numero_reserva = :numero_reserva AND id_usuario = :id_usuario
        ");
        
        $stmt->execute([
            'numero_reserva' => $numeroReserva,
            'id_usuario' => $this->idUsuario
        ]);
        
        return $stmt->fetch()['total'] > 0;
    }
}

/**
 * Clase para los datos de reserva
 * Encapsula los datos para la vista
 */
class ReservaData {
    public $numeroReserva;
    public $estado;
    public $fechaReserva;
    public $recurso;
    public $fechaInicio;
    public $horaInicio;
    
    /**
     * Formatea el estado para mostrar
     */
    public static function formatearEstado(string $estado): string {
        $estados = [
            'pendiente' => '⏳ Pendiente',
            'confirmada' => '✅ Confirmada',
            'activa' => '🟢 Activa',
            'completada' => '✅ Completada',
            'cancelada' => '❌ Cancelada',
            'no_show' => '⚠️ No presentado'
        ];
        
        return $estados[$estado] ?? $estado;
    }
    
    /**
     * Devuelve la clase CSS según el estado
     */
    public static function getClaseEstado(string $estado): string {
        $clases = [
            'pendiente' => 'estado-pendiente',
            'confirmada' => 'estado-confirmada',
            'activa' => 'estado-activa',
            'completada' => 'estado-completada',
            'cancelada' => 'estado-cancelada',
            'no_show' => 'estado-no-show'
        ];
        
        return $clases[$estado] ?? '';
    }
}

// Iniciar controlador si este archivo se accede directamente
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    require_once 'SessionManager.php';
    require_once 'DatabaseConnection.php';
    require_once 'Models.php';
    require_once 'BaseController.php';
    
    $controller = new MisReservasController();
    $controller->handle();
}
?>
