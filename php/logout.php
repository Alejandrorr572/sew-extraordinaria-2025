<?php
/**
 * Punto de entrada para Logout - Sistema de Reservas Turísticas de Siero
 */

// Incluir dependencias
require_once 'SessionManager.php';
require_once 'DatabaseConnection.php';
require_once 'Models.php';
require_once 'BaseController.php';
require_once 'controllers/LogoutController.php';

// Inicializar controlador
$controller = new LogoutController();
$controller->handle();
?>
