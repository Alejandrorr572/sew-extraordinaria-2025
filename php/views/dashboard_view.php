<?php
/**
 * Vista de Dashboard
 * Sistema de Reservas Turísticas de Siero
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Sistema de Reservas Turísticas de Siero</title>
    <link rel="stylesheet" href="../estilo/estilo.css">
    <link rel="stylesheet" href="../estilo/layout.css">
</head>
<body>
      <header>
        <h1>Sistema de Reservas Turísticas de Siero</h1>
        <nav>
            <ul>
                <li><a href="dashboard.php">Inicio</a></li>
                <li><a href="recursos.php">Recursos</a></li>
                <li><a href="crear_reserva.php">Crear Reserva</a></li>
                <li><a href="mis_reservas.php">Mis Reservas</a></li>
                <li><a href="../index.html">Web Principal</a></li>
                <li><a href="logout.php">Cerrar Sesión</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <?php if (isset($mensajes)): ?>
            <?php foreach ($mensajes as $tipo => $mensaje): ?>
                <p role="alert"><?php echo $mensaje; ?></p>
            <?php endforeach; ?>
        <?php endif; ?>
        
        <section>
            <h2>Bienvenido, <?php echo htmlspecialchars($usuario['nombre']); ?></h2>
            <p>Desde aquí puedes explorar los recursos turísticos disponibles en Siero y gestionar tus reservas.</p>
        </section>
          <?php if (isset($estadisticas)): ?>
            <section>
                <article>
                    <h3>Total Reservas</h3>
                    <p><?php echo $estadisticas['total_reservas'] ?? 0; ?></p>
                </article>
                <article>
                    <h3>Activas</h3>
                    <p><?php echo $estadisticas['por_estado']['activa'] ?? 0; ?></p>
                </article>
                <article>
                    <h3>Completadas</h3>
                    <p><?php echo $estadisticas['por_estado']['completada'] ?? 0; ?></p>
                </article>
                <article>
                    <h3>Gasto Total</h3>
                    <p><?php echo number_format($estadisticas['gasto_total'], 2, ',', '.'); ?> €</p>
                </article>
            </section>
        <?php endif; ?>
        
        <section>
            <h2>Recursos Destacados</h2>
            <?php if (isset($recursos_destacados) && !empty($recursos_destacados)): ?>
                <section>
                    <?php foreach ($recursos_destacados as $recurso): ?>                        <article>
                            <section>
                                <h3><?php echo htmlspecialchars($recurso['nombre']); ?></h3>
                                <p><?php echo htmlspecialchars($recurso['ubicacion']); ?></p>
                                <p><?php echo htmlspecialchars(substr($recurso['descripcion'], 0, 100)); ?>...</p>
                                <a href="recursos.php?id=<?php echo $recurso['id_recurso']; ?>">Ver Detalles</a>
                            </section>
                        </article>
                    <?php endforeach; ?>
                </section>
            <?php else: ?>
                <p>No hay recursos destacados disponibles en este momento.</p>
            <?php endif; ?>
            <p>
                <a href="recursos.php">Ver Todos los Recursos</a>
            </p>
        </section>
    </main>
      <footer>
        <p>&copy; <?php echo date('Y'); ?> Descubre Siero - Portal Turístico del Concejo. Todos los derechos reservados.</p>
        <section>
            <h3>Certificaciones de Calidad</h3>
            <p>
                <a href="https://validator.w3.org" target="_blank" rel="noopener noreferrer">
                    <img src="../multimedia/images/valid-html5.png" 
                         alt="Válido HTML5 - Verificado por W3C" >
                </a>                <a href="https://jigsaw.w3.org" target="_blank" rel="noopener noreferrer">
                    <img src="../multimedia/images/vcss-blue.png" 
                         alt="CSS Válido - Verificado por W3C" >
                </a>
            </p>
        </section>
    </footer>
</body>
</html>
