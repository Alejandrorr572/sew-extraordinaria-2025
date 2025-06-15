<?php
/**
 * Controlador de Reserva
 * Sistema de Reservas Turísticas de Siero
 */
class ReservarController extends BaseController {
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
        // Obtener ID del recurso
        $idDisponibilidad = (int)$this->request->get('id');
        
        if (!$idDisponibilidad) {
            $this->set('error', 'Debe especificar una disponibilidad para reservar');
            $this->redirect('recursos.php');
            return;
        }
        
        // Si es POST, procesar la reserva
        if ($this->request->isPost()) {
            $this->procesarReserva($idDisponibilidad);
        } else {
            // Mostrar formulario de reserva
            $this->mostrarFormulario($idDisponibilidad);
        }
    }
    
    /**
     * Muestra el formulario de reserva
     */
    private function mostrarFormulario(int $idDisponibilidad): void {
        $reservaService = new ReservaService();
        $disponibilidadData = $reservaService->obtenerDisponibilidadCompleta($idDisponibilidad);
        
        if (!$disponibilidadData) {
            $this->set('error', 'La disponibilidad solicitada no existe o no está disponible');
            $this->redirect('recursos.php');
            return;
        }
        
        // Pasar datos a la vista
        $this->set('disponibilidad', $disponibilidadData['disponibilidad']);
        $this->set('recurso', $disponibilidadData['recurso']);
        $this->set('tipo', $disponibilidadData['tipo']);
        $this->set('usuario', $this->sessionManager->getUsuario());
        $this->set('max_personas', $disponibilidadData['disponibilidad']->plazas_disponibles);
        
        // Renderizar vista
        $this->render('reservar_view');
    }
    
    /**
     * Procesa el formulario de reserva
     */
    private function procesarReserva(int $idDisponibilidad): void {
        $reservaService = new ReservaService();
        $validador = new ReservaValidator($this->request->allPost(), $idDisponibilidad);
        
        if ($validador->esValido()) {
            try {
                $idUsuario = $this->sessionManager->getUsuario()['id_usuario'];
                $numeroPersonas = (int)$this->request->post('numero_personas');
                $observaciones = $this->request->post('observaciones');
                
                // Crear reserva
                $numeroReserva = $reservaService->crearReserva($idDisponibilidad, $idUsuario, $numeroPersonas, $observaciones);
                
                // Redirigir a la confirmación
                $this->redirect('confirmacion_reserva.php?numero=' . $numeroReserva);
                
            } catch (ValidationException $e) {
                // Error de validación
                $disponibilidadData = $reservaService->obtenerDisponibilidadCompleta($idDisponibilidad);
                
                $this->set('disponibilidad', $disponibilidadData['disponibilidad']);
                $this->set('recurso', $disponibilidadData['recurso']);
                $this->set('tipo', $disponibilidadData['tipo']);
                $this->set('usuario', $this->sessionManager->getUsuario());
                $this->set('max_personas', $disponibilidadData['disponibilidad']->plazas_disponibles);
                $this->set('errores', $e->getValidationErrors());
                $this->set('datos', $validador->getDatos());
                
                $this->render('reservar_view');
                
            } catch (Exception $e) {
                // Error general
                $disponibilidadData = $reservaService->obtenerDisponibilidadCompleta($idDisponibilidad);
                
                $this->set('disponibilidad', $disponibilidadData['disponibilidad']);
                $this->set('recurso', $disponibilidadData['recurso']);
                $this->set('tipo', $disponibilidadData['tipo']);
                $this->set('usuario', $this->sessionManager->getUsuario());
                $this->set('max_personas', $disponibilidadData['disponibilidad']->plazas_disponibles);
                $this->set('error', 'Error al procesar la reserva: ' . $e->getMessage());
                $this->set('datos', $validador->getDatos());
                
                $this->render('reservar_view');
            }
        } else {
            // Datos inválidos
            $disponibilidadData = $reservaService->obtenerDisponibilidadCompleta($idDisponibilidad);
            
            $this->set('disponibilidad', $disponibilidadData['disponibilidad']);
            $this->set('recurso', $disponibilidadData['recurso']);
            $this->set('tipo', $disponibilidadData['tipo']);
            $this->set('usuario', $this->sessionManager->getUsuario());
            $this->set('max_personas', $disponibilidadData['disponibilidad']->plazas_disponibles);
            $this->set('errores', $validador->getErrores());
            $this->set('datos', $validador->getDatos());
            
            $this->render('reservar_view');
        }
    }
}

/**
 * Servicio para gestionar las reservas
 * Encapsula la lógica de negocio
 */
class ReservaService {
    /**
     * Obtiene una disponibilidad con todos sus datos relacionados
     */
    public function obtenerDisponibilidadCompleta(int $idDisponibilidad): ?array {
        $disponibilidad = DisponibilidadRecurso::find($idDisponibilidad);
        
        if (!$disponibilidad || !$disponibilidad->activo || $disponibilidad->plazas_disponibles <= 0) {
            return null;
        }
        
        $recurso = $disponibilidad->getRecurso();
        
        if (!$recurso || !$recurso->activo) {
            return null;
        }
        
        $tipo = $recurso->getTipo();
        
        return [
            'disponibilidad' => $disponibilidad,
            'recurso' => $recurso,
            'tipo' => $tipo
        ];
    }
    
    /**
     * Crea una nueva reserva
     * 
     * @return string Número de reserva generado
     * @throws ValidationException Si hay errores de validación
     * @throws Exception Si hay errores en la creación
     */
    public function crearReserva(int $idDisponibilidad, int $idUsuario, int $numeroPersonas, ?string $observaciones = null): string {
        $db = DatabaseConnection::getInstance();
        
        try {
            // Iniciar transacción
            $db->beginTransaction();
            
            // Obtener la disponibilidad
            $disponibilidad = DisponibilidadRecurso::find($idDisponibilidad);
            
            if (!$disponibilidad || !$disponibilidad->activo) {
                throw new ValidationException("La disponibilidad no existe o no está activa");
            }
            
            // Verificar si hay suficientes plazas
            if ($disponibilidad->plazas_disponibles < $numeroPersonas) {
                throw new ValidationException("No hay suficientes plazas disponibles", [
                    'numero_personas' => "Solo hay {$disponibilidad->plazas_disponibles} plazas disponibles"
                ]);
            }
            
            // Calcular precio total
            $precioTotal = $disponibilidad->calcularPrecio($numeroPersonas);
            
            // Crear la reserva
            $reserva = new Reserva([
                'id_usuario' => $idUsuario,
                'id_disponibilidad' => $idDisponibilidad,
                'numero_personas' => $numeroPersonas,
                'precio_total' => $precioTotal,
                'estado' => 'confirmada',
                'observaciones_usuario' => $observaciones,
                'fecha_confirmacion' => date('Y-m-d H:i:s')
            ]);
            
            if (!$reserva->save()) {
                throw new Exception("Error al guardar la reserva");
            }
            
            // Confirmar transacción
            $db->commit();
            
            return $reserva->numero_reserva;
            
        } catch (Exception $e) {
            $db->rollback();
            throw $e;
        }
    }
}

/**
 * Validador para las reservas
 */
class ReservaValidator {
    private $datos = [];
    private $errores = [];
    private $idDisponibilidad;
    
    /**
     * Constructor con los datos a validar
     */
    public function __construct(array $datos, int $idDisponibilidad) {
        $this->datos = $datos;
        $this->idDisponibilidad = $idDisponibilidad;
        $this->validar();
    }
    
    /**
     * Valida los datos del formulario
     */
    private function validar(): void {
        // Validar número de personas
        if (empty($this->datos['numero_personas'])) {
            $this->errores['numero_personas'] = 'El número de personas es obligatorio';
        } elseif (!is_numeric($this->datos['numero_personas']) || (int)$this->datos['numero_personas'] <= 0) {
            $this->errores['numero_personas'] = 'El número de personas debe ser mayor a 0';
        } else {
            // Verificar disponibilidad
            $disponibilidad = DisponibilidadRecurso::find($this->idDisponibilidad);
            
            if (!$disponibilidad || !$disponibilidad->activo) {
                $this->errores['disponibilidad'] = 'La disponibilidad seleccionada no existe o no está activa';
            } elseif ($disponibilidad->plazas_disponibles < (int)$this->datos['numero_personas']) {
                $this->errores['numero_personas'] = "Solo hay {$disponibilidad->plazas_disponibles} plazas disponibles";
            }
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
    
    $controller = new ReservarController();
    $controller->handle();
}
?>
