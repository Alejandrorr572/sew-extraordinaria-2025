<?php
/**
 * Vista de Confirmación de Reserva
 * Sistema de Reservas Turísticas de Siero
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Reserva - Sistema de Reservas Turísticas de Siero</title>
    <link rel="stylesheet" href="../estilo/estilo.css">
    <link rel="stylesheet" href="../estilo/layout.css">
</head>
<body>    <header>
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
        <h1>Confirmación de Reserva</h1>
        
        <article>
            <p aria-hidden="true">CONFIRMADO</p>
            <section>
                <header>
                    <p>¡Tu reserva ha sido confirmada con éxito!</p>
                </header>
                
                <section>
                    <p>Número de Reserva: <?php echo htmlspecialchars($reserva->numero_reserva); ?></p>
                    
                    <dl>
                        <dt>Estado:</dt>
                        <dd><?php echo ucfirst(htmlspecialchars($reserva->estado)); ?></dd>
                        
                        <dt>Fecha de reserva:</dt>
                        <dd><?php echo date('d/m/Y H:i', strtotime($reserva->fecha_reserva)); ?></dd>
                        
                        <dt>Número de personas:</dt>
                        <dd><?php echo $reserva->numero_personas; ?></dd>
                          <dt>Datos del recurso:</dt>
                        <dd>
                            <div>
                                <h4><?php echo htmlspecialchars($recurso->nombre); ?></h4>
                                <p>
                                    <strong>Tipo:</strong> <?php echo htmlspecialchars($tipo->nombre); ?>
                                </p>
                                <p>
                                    <strong>Ubicación:</strong> <?php echo htmlspecialchars($recurso->ubicacion); ?>
                                </p>
                            </div>
                        </dd>
                        
                        <dt>Fecha y hora:</dt>
                        <dd>
                            <?php echo date('d/m/Y', strtotime($disponibilidad->fecha_inicio)); ?><br>
                            <?php echo substr($disponibilidad->hora_inicio, 0, 5); ?> - 
                            <?php echo substr($disponibilidad->hora_fin, 0, 5); ?>
                        </dd>
                        
                        <?php if ($reserva->observaciones_usuario): ?>
                        <dt>Observaciones:</dt>
                        <dd><?php echo nl2br(htmlspecialchars($reserva->observaciones_usuario)); ?></dd>
                        <?php endif; ?>
                    </dl>
                </section>
                
                <section>
                    <dl>
                        <dt>Precio unitario:</dt>
                        <dd><?php echo number_format($disponibilidad->precio, 2, ',', '.'); ?> € por persona</dd>
                        
                        <dt>Número de personas:</dt>
                        <dd><?php echo $reserva->numero_personas; ?></dd>
                        
                        <dt>Total:</dt>
                        <dd><?php echo number_format($reserva->precio_total, 2, ',', '.'); ?> €</dd>
                    </dl>
                </section>                  <nav>
                    <a href="mis_reservas.php">Ver Mis Reservas</a>
                    <a href="dashboard.php">Ir al Inicio</a>
                </nav>
            </section>
        </article>
    </main>
    
    <footer>
        <p>&copy; <?php echo date('Y'); ?> Sistema de Reservas Turísticas de Siero</p>
    </footer>
</body>
</html>
