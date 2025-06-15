<?php
/**
 * Punto de entrada para Recursos Turísticos - Sistema de Reservas Turísticas de Siero
 */

// Incluir dependencias
require_once 'SessionManager.php';
require_once 'DatabaseConnection.php';
require_once 'Models.php';
require_once 'BaseController.php';
require_once 'RecursosService.php'; 
require_once 'controllers/RecursosController.php';

// Inicializar controlador
$controller = new RecursosController();
$controller->handle();
?>
