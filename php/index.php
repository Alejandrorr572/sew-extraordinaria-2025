<?php
/**
 * Punto de entrada principal - Sistema de Reservas Turísticas de Siero
 * Redirige al dashboard si el usuario está autenticado, o al login si no
 */

// Incluir dependencias
require_once 'SessionManager.php';

// Inicializar gestor de sesiones
$sessionManager = SessionManager::getInstance();

// Redirigir según el estado de autenticación
if ($sessionManager->usuarioLogueado()) {
    header("Location: dashboard.php");
} else {
    header("Location: login.php");
}
exit;
?>
