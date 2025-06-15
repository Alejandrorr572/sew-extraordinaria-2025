<?php
/**
 * Vista de Formulario de Reserva
 * Sistema de Reservas Turísticas de Siero
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reservar - Sistema de Reservas Turísticas de Siero</title>
    <link rel="stylesheet" href="../estilo/estilo.css">
    <link rel="stylesheet" href="../estilo/layout.css">
</head>
<body>    <header>
        <h1>Sistema de Reservas Turísticas de Siero</h1>        <nav>
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
        <h2>Reservar Recurso Turístico</h2>
        
        <?php if (isset($error)): ?>
            <p role="alert"><?php echo $error; ?></p>
        <?php endif; ?>
          <section>
            <article>
                <p><?php echo htmlspecialchars($tipo->nombre); ?></p>
                <h3><?php echo htmlspecialchars($recurso->nombre); ?></h3>
                <p><?php echo htmlspecialchars($recurso->ubicacion); ?></p>
                <p><?php echo nl2br(htmlspecialchars(substr($recurso->descripcion, 0, 200))); ?>...</p>
                
                <section>
                    <h4>Detalles de la disponibilidad</h4>
                    <p>
                        <strong>Fecha:</strong>
                        <?php echo date('d/m/Y', strtotime($disponibilidad->fecha_inicio)); ?>
                    </p>
                    <p>
                        <strong>Hora:</strong>
                        <?php echo substr($disponibilidad->hora_inicio, 0, 5); ?> - 
                        <?php echo substr($disponibilidad->hora_fin, 0, 5); ?>
                    </p>
                    <p>
                        <strong>Precio:</strong>
                        <?php echo number_format($disponibilidad->precio, 2, ',', '.'); ?> € por persona
                    </p>
                    <p>
                        <strong>Plazas:</strong>
                        <?php echo $disponibilidad->plazas_disponibles; ?> disponibles
                    </p>
                </section>
            </article>
            
            <article>
                <h3>Formulario de Reserva</h3>
                <form method="post" action="reservar.php?id=<?php echo $disponibilidad->id_disponibilidad; ?>">
                    <fieldset>
                        <legend>Datos personales</legend>
                        <p>
                            <label for="nombre">Nombre:</label>
                            <input type="text" id="nombre" name="nombre" value="<?php echo htmlspecialchars($usuario['nombre'] . ' ' . $usuario['apellidos']); ?>" disabled>
                        </p>
                        
                        <p>
                            <label for="email">Email:</label>
                            <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($usuario['email']); ?>" disabled>
                        </p>
                        
                        <p>
                            <label for="telefono">Teléfono:</label>
                            <input type="tel" id="telefono" name="telefono" value="<?php echo htmlspecialchars($usuario['telefono'] ?? ''); ?>" disabled>
                        </p>
                    </fieldset>
                    
                    <fieldset>
                        <legend>Detalles de la reserva</legend>
                        <p>
                            <label for="numero_personas">Número de personas:</label>
                            <input type="number" id="numero_personas" name="numero_personas" min="1" max="<?php echo $max_personas; ?>" value="<?php echo isset($datos['numero_personas']) ? $datos['numero_personas'] : 1; ?>" required>
                            <?php if (isset($errores['numero_personas'])): ?>
                                <p role="alert"><?php echo $errores['numero_personas']; ?></p>
                            <?php endif; ?>
                        </p>
                        
                        <p>
                            <span>Precio total: <span id="precio_total">0.00 €</span></span>
                        </p>
                        
                        <p>
                            <label for="observaciones">Observaciones (opcional):</label>
                            <textarea id="observaciones" name="observaciones"><?php echo isset($datos['observaciones']) ? htmlspecialchars($datos['observaciones']) : ''; ?></textarea>
                        </p>
                    </fieldset>
                    
                    <nav>
                        <a href="recursos.php?id=<?php echo $recurso->id_recurso; ?>">Cancelar</a>
                        <button type="submit">Confirmar Reserva</button>
                    </nav>
                </form>
            </article>
        </section>
    </main>
    
    <footer>
        <p>&copy; <?php echo date('Y'); ?> Sistema de Reservas Turísticas de Siero</p>
    </footer>
</body>
</html>
