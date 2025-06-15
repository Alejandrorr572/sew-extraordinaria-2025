<?php
/**
 * Inicialización manual de la base de datos
 * Sistema de Reservas Turísticas de Siero
 */

require_once 'inicializar_db.php';

// Mensaje de confirmación
if (isset($_GET['confirmar']) && $_GET['confirmar'] === '1') {
    $inicializador = new InicializadorDatos();
    $resultado = $inicializador->inicializar();
    
    echo "<h1>Inicialización de Datos</h1>";
    echo "<p>Estado: " . ($resultado['exito'] ? 'Éxito' : 'Error') . "</p>";
    echo "<ul>";
    foreach ($resultado['mensajes'] as $mensaje) {
        echo "<li>{$mensaje}</li>";
    }
    echo "</ul>";
    echo "<p><a href='index.php'>Volver al inicio</a></p>";
} else {
    // Mostrar confirmación
    echo "<!DOCTYPE html>
    <html lang='es'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Inicializar Base de Datos - Sistema de Reservas Turísticas de Siero</title>
        <link rel='stylesheet' href='../estilo/estilo.css'>
        <link rel='stylesheet' href='../estilo/layout.css'>
    </head>
    <body>
        <header>
            <h1>Sistema de Reservas Turísticas de Siero</h1>
            <nav>
                <ul>
                    <li><a href='../index.html'>Web Principal</a></li>
                    <li><a href='index.php'>Iniciar Sesión</a></li>
                    <li><a href='registro.php'>Registrarse</a></li>
                </ul>
            </nav>
        </header>
        
        <main>
            <section>
                <h1>Inicializar Base de Datos</h1>
                
                <p>Estás a punto de inicializar la base de datos con datos de prueba para las reservas turísticas.</p>
                <p><strong>Importante:</strong> Si la base de datos ya contiene datos, no se añadirán datos nuevos.</p>
                
                <p>
                    <a href='inicializar.php?confirmar=1' style='display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;'>Inicializar Datos</a>
                    <a href='index.php' style='display: inline-block; padding: 10px 20px; margin-left: 10px; background-color: #ccc; color: #333; text-decoration: none; border-radius: 5px; font-weight: bold;'>Cancelar</a>
                </p>
            </section>
        </main>
        
        <footer>
            <p>&copy; " . date('Y') . " - Sistema de Reservas Turísticas de Siero</p>
        </footer>
    </body>
    </html>";
}
?>
