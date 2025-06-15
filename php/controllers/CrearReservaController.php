<?php
/**
 * Controlador de Crear Reserva
 * Sistema de Reservas Turísticas de Siero
 */
class CrearReservaController extends BaseController {
    /**
     * Inicialización del controlador
     */
    protected function initialize(): void {
        // Requiere login para hacer reservas
        $this->requireLogin();
    }
    
    /**
     * Maneja la petición principal
     */
    public function handle(): void {
        // Si es POST, procesar la reserva
        if ($this->request->isPost()) {
            $this->procesarReserva();
        } else {
            // Mostrar formulario de reserva
            $this->mostrarFormulario();
        }
    }
    
    /**
     * Muestra el formulario de creación de reserva
     */
    private function mostrarFormulario(): void {
        $reservaService = new ReservaService();
        $recursosService = new RecursosService();
        
        // Obtener recursos y disponibilidades
        $recursos = $recursosService->obtenerTodosLosRecursos();
        $disponibilidades = $reservaService->obtenerDisponibilidadesFuturas();
        
        // Pasar datos a la vista
        $this->set('recursos', $recursos);
        $this->set('disponibilidades', $disponibilidades);
        $this->set('usuario', $this->sessionManager->getUsuario());
        
        // Renderizar vista
        $this->render('crear_reserva_view');
    }
    
    /**
     * Procesa el formulario de reserva
     */
    private function procesarReserva(): void {
        $reservaService = new ReservaService();
        
        // Validar datos del formulario
        $idDisponibilidad = (int)$this->request->post('id_disponibilidad');
        $numeroPersonas = (int)$this->request->post('numero_personas');
        $observaciones = $this->request->post('observaciones');
        
        // Validación básica
        if (!$idDisponibilidad) {
            $this->set('error', 'Debe seleccionar una disponibilidad para reservar');
            $this->mostrarFormulario();
            return;
        }
        
        if ($numeroPersonas < 1) {
            $this->set('error', 'El número de personas debe ser al menos 1');
            $this->mostrarFormulario();
            return;
        }
        
        try {
            // Obtener información de disponibilidad
            $disponibilidad = $reservaService->obtenerDisponibilidad($idDisponibilidad);
            
            if (!$disponibilidad) {
                $this->set('error', 'La disponibilidad seleccionada no existe o no está disponible');
                $this->mostrarFormulario();
                return;
            }
            
            // Verificar plazas disponibles
            if ($disponibilidad->plazas_disponibles < $numeroPersonas) {
                $this->set('error', 'No hay suficientes plazas disponibles para el número de personas solicitado');
                $this->mostrarFormulario();
                return;
            }
            
            // Crear reserva
            $idUsuario = $this->sessionManager->getUsuario()['id_usuario'];
            $numeroReserva = $reservaService->crearReserva($idDisponibilidad, $idUsuario, $numeroPersonas, $observaciones);
            
            // Redirigir a la confirmación
            $this->redirect('confirmacion_reserva.php?numero=' . $numeroReserva);
            
        } catch (Exception $e) {
            // Error general
            $this->set('error', 'Error al crear la reserva: ' . $e->getMessage());
            $this->mostrarFormulario();
        }
    }
}


// Iniciar controlador si este archivo se accede directamente
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    require_once 'SessionManager.php';
    require_once 'DatabaseConnection.php';
    require_once 'Models.php';
    require_once 'BaseController.php';
    require_once 'controllers/RecursosController.php'; 
    
    $controller = new CrearReservaController();
    $controller->handle();
}
?>
