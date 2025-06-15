<?php
/**
 * Punto de entrada para Registro - Sistema de Reservas Turísticas de Siero
 */

// Incluir dependencias
require_once 'SessionManager.php';
require_once 'DatabaseConnection.php';
require_once 'Models.php';
require_once 'BaseController.php';
require_once 'controllers/RegistroController.php';

// Inicializar controlador
$controller = new RegistroController();
$controller->handle();
?>
