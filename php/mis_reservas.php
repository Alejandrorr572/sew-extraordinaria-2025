<?php
/**
 * Punto de entrada para Mis Reservas - Sistema de Reservas Turísticas de Siero
 */

// Incluir dependencias
require_once 'SessionManager.php';
require_once 'DatabaseConnection.php';
require_once 'Models.php';
require_once 'BaseController.php';
require_once 'controllers/MisReservasController.php';

// Inicializar controlador
$controller = new MisReservasController();
$controller->handle();
?>
