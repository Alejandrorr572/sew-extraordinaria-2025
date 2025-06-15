<?php
/**
 * Vista de Mis Reservas
 * Sistema de Reservas Turísticas de Siero
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mis Reservas - Sistema de Reservas Turísticas de Siero</title>
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
        <h1>Mis Reservas</h1>
        
        <?php if (isset($mensajes)): ?>
            <?php foreach ($mensajes as $tipo => $mensaje): ?>
                <p role="alert"><?php echo $mensaje; ?></p>
            <?php endforeach; ?>
        <?php endif; ?>
        
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
            <form>
                <fieldset>
                    <legend>Filtros</legend>
                    <p>                        <label for="estado">Filtrar por estado:</label>
                        <select id="estado" class="filtro-estado">
                            <option value="">Todas las reservas</option>
                            <option value="pendiente" <?php echo $filtro_actual == 'pendiente' ? 'selected' : ''; ?>>Pendientes</option>
                            <option value="confirmada" <?php echo $filtro_actual == 'confirmada' ? 'selected' : ''; ?>>Confirmadas</option>
                            <option value="activa" <?php echo $filtro_actual == 'activa' ? 'selected' : ''; ?>>Activas</option>
                            <option value="completada" <?php echo $filtro_actual == 'completada' ? 'selected' : ''; ?>>Completadas</option>
                            <option value="cancelada" <?php echo $filtro_actual == 'cancelada' ? 'selected' : ''; ?>>Canceladas</option>
                        </select>
                    </p>
                </fieldset>
                
                <?php if ($filtro_actual): ?>
                    <a href="mis_reservas.php">Limpiar filtro</a>
                <?php endif; ?>
            </form>
        </section>
        
        <?php if (!empty($reservas)): ?>
            <section>
                <?php foreach ($reservas as $reserva): ?>
                    <article>
                        <header>
                            <p>Reserva #<?php echo htmlspecialchars($reserva['numero_reserva']); ?></p>
                            <p><?php echo ReservaData::formatearEstado($reserva['estado']); ?></p>
                        </header>                        <section>
                            <section>
                                <h3><?php echo htmlspecialchars($reserva['recurso_nombre']); ?></h3>
                                <p><?php echo htmlspecialchars($reserva['recurso_ubicacion']); ?></p>
                                
                                <dl>
                                    <dt>Fecha:</dt>
                                    <dd><?php echo date('d/m/Y', strtotime($reserva['fecha_inicio'])); ?></dd>
                                    
                                    <dt>Hora:</dt>
                                    <dd><?php echo substr($reserva['hora_inicio'], 0, 5); ?> - <?php echo substr($reserva['hora_fin'], 0, 5); ?></dd>
                                    
                                    <dt>Personas:</dt>
                                    <dd><?php echo $reserva['numero_personas']; ?></dd>
                                    
                                    <dt>Reservado:</dt>
                                    <dd><?php echo date('d/m/Y', strtotime($reserva['fecha_reserva'])); ?></dd>
                                </dl>
                            </section>
                            
                            <section>
                                <p><?php echo number_format($reserva['precio_total'], 2, ',', '.'); ?> €</p>
                                <?php if (in_array($reserva['estado'], ['pendiente', 'confirmada', 'activa'])): ?>
                                    <button data-reserva="<?php echo $reserva['numero_reserva']; ?>">
                                        Cancelar
                                    </button>
                                <?php endif; ?>
                            </section>
                        </section>
                        <footer>
                            <a href="confirmacion_reserva.php?numero=<?php echo $reserva['numero_reserva']; ?>">Ver Detalles</a>
                        </footer>
                    </article>
                <?php endforeach; ?>
            </section>
        <?php else: ?>
            <section>
                <h3>No tienes reservas<?php echo $filtro_actual ? ' con el filtro seleccionado' : ''; ?></h3>
                <p>Explora nuestros recursos turísticos y haz tu primera reserva.</p>
                <a href="recursos.php">Explorar Recursos</a>
            </section>
        <?php endif; ?>
    </main>
    
    <!-- Modal de cancelación -->
    <dialog id="cancelModal">
        <header>
            <button type="button" aria-label="Cerrar">&times;</button>
            <h2>Cancelar Reserva</h2>
        </header>
        <section>
            <p>¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.</p>
            
            <form id="cancelForm" method="post" action="mis_reservas.php">
                <input type="hidden" name="accion" value="cancelar">
                <input type="hidden" id="numero_reserva" name="numero_reserva" value="">
                
                <fieldset>
                    <legend>Información de cancelación</legend>
                    <p>
                        <label for="motivo_cancelacion">Motivo de cancelación (opcional):</label>
                        <textarea id="motivo_cancelacion" name="motivo_cancelacion"></textarea>
                    </p>
                </fieldset>
                
                <footer>
                    <button type="button">Cerrar</button>
                    <button type="submit">Confirmar Cancelación</button>
                </footer>
            </form>
        </section>
    </dialog>
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
