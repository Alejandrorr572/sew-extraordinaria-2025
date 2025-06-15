<?php
/**
 * Página de creación de reservas
 * Sistema de Reservas Turísticas de Siero
 */

require_once 'SessionManager.php';
require_once 'DatabaseConnection.php';
require_once 'Models.php';
require_once 'BaseController.php';
require_once 'RecursosService.php';   
require_once 'ReservaService.php';  
require_once 'controllers/CrearReservaController.php';

// Iniciar controlador
$controller = new CrearReservaController();
$controller->handle();
?>
