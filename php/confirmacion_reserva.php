<?php
/**
 * Punto de entrada para Confirmación de Reserva - Sistema de Reservas Turísticas de Siero
 */

// Incluir dependencias
require_once 'SessionManager.php';
require_once 'DatabaseConnection.php';
require_once 'Models.php';
require_once 'BaseController.php';
require_once 'ReservaService.php';  
require_once 'controllers/ConfirmacionReservaController.php';

// Inicializar controlador
$controller = new ConfirmacionReservaController();
$controller->handle();
?>
