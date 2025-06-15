<?php
/**
 * Controlador de Confirmación de Reserva
 * Sistema de Reservas Turísticas de Siero
 */
class ConfirmacionReservaController extends BaseController {
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
        // Obtener número de reserva
        $numeroReserva = $this->request->get('numero');
        
        if (empty($numeroReserva)) {
            $this->set('error', 'Debe especificar un número de reserva');
            $this->redirect('mis_reservas.php');
            return;
        }
        
        // Obtener datos de la reserva
        $confirmacionService = new ConfirmacionReservaService();
        $datosReserva = $confirmacionService->obtenerReservaPorNumero($numeroReserva, $this->sessionManager->getUsuario()['id_usuario']);
        
        if (!$datosReserva) {
            $this->set('error', 'La reserva solicitada no existe o no le pertenece');
            $this->redirect('mis_reservas.php');
            return;
        }
        
        // Pasar datos a la vista
        $this->set('reserva', $datosReserva['reserva']);
        $this->set('disponibilidad', $datosReserva['disponibilidad']);
        $this->set('recurso', $datosReserva['recurso']);
        $this->set('tipo', $datosReserva['tipo']);
        $this->set('usuario', $datosReserva['usuario']);
        
        // Renderizar vista
        $this->render('confirmacion_reserva_view');
    }
}

/**
 * Servicio para la confirmación de reservas
 * Encapsula la lógica de negocio
 */
class ConfirmacionReservaService {
    /**
     * Obtiene todos los datos de una reserva por su número
     */
    public function obtenerReservaPorNumero(string $numeroReserva, int $idUsuario): ?array {
        $db = DatabaseConnection::getInstance();
        
        $stmt = $db->prepare("
            SELECT r.*
            FROM reservas r
            WHERE r.numero_reserva = :numero_reserva AND r.id_usuario = :id_usuario
        ");
        
        $stmt->execute([
            'numero_reserva' => $numeroReserva,
            'id_usuario' => $idUsuario
        ]);
        
        $reservaData = $stmt->fetch();
        
        if (!$reservaData) {
            return null;
        }
        
        $reserva = new Reserva($reservaData);
        $disponibilidad = $reserva->getDisponibilidad();
        $recurso = $disponibilidad->getRecurso();
        $tipo = $recurso->getTipo();
        $usuario = $reserva->getUsuario();
        
        return [
            'reserva' => $reserva,
            'disponibilidad' => $disponibilidad,
            'recurso' => $recurso,
            'tipo' => $tipo,
            'usuario' => $usuario
        ];
    }
    
    /**
     * Genera PDF con la confirmación de la reserva (ejemplo de extensión)
     */
    public function generarPDFReserva(string $numeroReserva): string {
        // Esta implementación requeriría una biblioteca externa para PDF
        // y no es parte de los requisitos del proyecto
        throw new Exception("La generación de PDF no está implementada");
    }
}

/**
 * DTO para datos de reserva confirmada
 * Encapsula los datos de la reserva para la vista
 */
class ReservaConfirmadaData {
    public $numeroReserva;
    public $precioTotal;
    public $numeroPersonas;
    public $fechaReserva;
    public $estado;
    public $recursoNombre;
    public $recursoUbicacion;
    public $fechaInicio;
    public $horaInicio;
    public $fechaFin;
    public $horaFin;
    
    /**
     * Constructor con los datos de la reserva
     */
    public function __construct(array $datos) {
        $this->numeroReserva = $datos['numero_reserva'];
        $this->precioTotal = $datos['precio_total'];
        $this->numeroPersonas = $datos['numero_personas'];
        $this->fechaReserva = $datos['fecha_reserva'];
        $this->estado = $datos['estado'];
        $this->recursoNombre = $datos['recurso_nombre'];
        $this->recursoUbicacion = $datos['recurso_ubicacion'];
        $this->fechaInicio = $datos['fecha_inicio'];
        $this->horaInicio = $datos['hora_inicio'];
        $this->fechaFin = $datos['fecha_fin'];
        $this->horaFin = $datos['hora_fin'];
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
    public function formatearFecha(string $fecha): string {
        $timestamp = strtotime($fecha);
        return date('d/m/Y', $timestamp);
    }
    
    /**
     * Formatea una hora para mostrar
     */
    public function formatearHora(string $hora): string {
        return substr($hora, 0, 5); // HH:MM
    }
}

// Iniciar controlador si este archivo se accede directamente
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    require_once 'SessionManager.php';
    require_once 'DatabaseConnection.php';
    require_once 'Models.php';
    require_once 'BaseController.php';
    
    $controller = new ConfirmacionReservaController();
    $controller->handle();
}
?>
