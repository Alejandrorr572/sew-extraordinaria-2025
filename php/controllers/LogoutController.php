<?php
/**
 * Controlador de Logout
 * Sistema de Reservas Turísticas de Siero
 */
class LogoutController extends BaseController {
    /**
     * Inicialización del controlador
     */
    protected function initialize(): void {
        // No es necesario verificar si está logueado
    }
    
    /**
     * Maneja la petición principal
     */
    public function handle(): void {
        // Cerrar la sesión
        $this->sessionManager->cerrarSesion();
        
        // Redirigir al login
        $this->sessionManager->setFlash('success', 'Has cerrado sesión correctamente');
        $this->redirect('login.php');
    }
}

// Iniciar controlador si este archivo se accede directamente
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    require_once 'SessionManager.php';
    require_once 'DatabaseConnection.php';
    require_once 'Models.php';
    require_once 'BaseController.php';
    
    $controller = new LogoutController();
    $controller->handle();
}
?>
