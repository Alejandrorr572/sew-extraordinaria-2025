<?php
/**
 * Vista de Creación de Reserva
 * Sistema de Reservas Turísticas de Siero
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crear Reserva - Sistema de Reservas Turísticas de Siero</title>
    <link rel="stylesheet" href="../estilo/estilo.css">
    <link rel="stylesheet" href="../estilo/layout.css">
</head>
<body>    <header>
        <h1>Sistema de Reservas Turísticas de Siero</h1>
        <nav>
            <ul>
                <li><a href="dashboard.php">Inicio</a></li>
                <li><a href="recursos.php">Recursos</a></li>
                <li><a href="crear_reserva.php" aria-current="page">Crear Reserva</a></li>
                <li><a href="mis_reservas.php">Mis Reservas</a></li>
                <li><a href="../index.html">Web Principal</a></li>
                <li><a href="logout.php">Cerrar Sesión</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <h2>Crear Nueva Reserva</h2>
        
        <?php if (isset($error)): ?>
            <p role="alert"><?php echo $error; ?></p>
        <?php endif; ?>
        
        <section>
            <form method="post" action="crear_reserva.php">
                <fieldset>
                    <legend>Datos personales</legend>
                    <p>
                        <label>Nombre:</label>
                        <span><?php echo htmlspecialchars($usuario['nombre'] . ' ' . $usuario['apellidos']); ?></span>
                    </p>
                    
                    <p>
                        <label>Email:</label>
                        <span><?php echo htmlspecialchars($usuario['email']); ?></span>
                    </p>
                    
                    <p>
                        <label>Teléfono:</label>
                        <span><?php echo htmlspecialchars($usuario['telefono'] ?? 'No especificado'); ?></span>
                    </p>
                </fieldset>
                
                <fieldset>
                    <legend>Seleccionar disponibilidad</legend>
                    
                    <?php if (empty($disponibilidades)): ?>
                        <p>No hay disponibilidades futuras. Por favor, intente más tarde.</p>
                    <?php else: ?>
                        <p>
                            <label for="id_disponibilidad">Seleccione día y hora:</label>
                            <select id="id_disponibilidad" name="id_disponibilidad" required>
                                <option value="">-- Seleccione una opción --</option>
                                <?php foreach ($disponibilidades as $disp): ?>
                                    <option value="<?php echo $disp['id_disponibilidad']; ?>">
                                        <?php echo htmlspecialchars($disp['nombre_recurso']); ?> - 
                                        <?php echo date('d/m/Y', strtotime($disp['fecha_inicio'])); ?> 
                                        <?php echo substr($disp['hora_inicio'], 0, 5); ?> a 
                                        <?php echo substr($disp['hora_fin'], 0, 5); ?> - 
                                        <?php echo number_format($disp['precio'], 2, ',', '.'); ?> € - 
                                        <?php echo $disp['plazas_disponibles']; ?> plazas disponibles
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </p>
                    <?php endif; ?>
                </fieldset>
                
                <fieldset>
                    <legend>Detalles de la reserva</legend>
                    <p>
                        <label for="numero_personas">Número de personas:</label>
                        <input type="number" id="numero_personas" name="numero_personas" min="1" value="1" required>
                    </p>
                    
                    <p>
                        <label for="observaciones">Observaciones:</label>
                        <textarea id="observaciones" name="observaciones" rows="4"></textarea>
                    </p>
                </fieldset>
                
                <fieldset>
                    <legend>Confirmación</legend>
                    <p>
                        <button type="submit">Crear Reserva</button>
                        <a href="dashboard.php">Cancelar</a>
                    </p>
                </fieldset>
            </form>
        </section>
    </main>
    
    <footer>
        <p>&copy; <?php echo date('Y'); ?> - Sistema de Reservas Turísticas de Siero</p>
    </footer>
</body>
</html>
