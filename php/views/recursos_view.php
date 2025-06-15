<?php
/**
 * Vista de Recursos Turísticos
 * Sistema de Reservas Turísticas de Siero
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recursos Turísticos - Sistema de Reservas Turísticas de Siero</title>
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
        <?php if (isset($mensajes)): ?>
            <?php foreach ($mensajes as $tipo => $mensaje): ?>
                <p role="alert"><?php echo $mensaje; ?></p>
            <?php endforeach; ?>
        <?php endif; ?>
          <h1>Recursos Turísticos de Siero</h1>
        
        <?php if (isset($recurso)): /* Vista detallada de un recurso */ ?>            <article>
                <header>
                </header>
                <section>
                    <h2><?php echo htmlspecialchars($recurso->nombre); ?></h2>
                    <p><?php echo htmlspecialchars($tipo->nombre); ?></p>
                    <p><?php echo htmlspecialchars($recurso->ubicacion); ?></p>
                    <section>
                        <?php echo nl2br(htmlspecialchars($recurso->descripcion)); ?>
                    </section>
                    
                    <section>
                        <h3>Disponibilidad</h3>
                        <?php if (isset($disponibilidades) && !empty($disponibilidades)): ?>
                            <ul>
                                <?php foreach ($disponibilidades as $disponibilidad): ?>
                                    <li>
                                        <p>
                                            <?php echo date('d/m/Y', strtotime($disponibilidad->fecha_inicio)); ?> 
                                            <?php echo substr($disponibilidad->hora_inicio, 0, 5); ?> - 
                                            <?php echo substr($disponibilidad->hora_fin, 0, 5); ?>
                                        </p>
                                        <p><?php echo number_format($disponibilidad->precio, 2, ',', '.'); ?> € por persona</p>
                                        <p><?php echo $disponibilidad->plazas_disponibles; ?> plazas disponibles</p>
                                        <?php if ($disponibilidad->plazas_disponibles > 0): ?>
                                            <a href="reservar.php?id=<?php echo $disponibilidad->id_disponibilidad; ?>">Reservar</a>
                                        <?php else: ?>
                                            <button disabled>No disponible</button>
                                        <?php endif; ?>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        <?php else: ?>
                            <p>No hay disponibilidad para este recurso en las fechas seleccionadas.</p>
                        <?php endif; ?>
                    </section>
                    
                    <p>
                        <a href="recursos.php">Volver a la lista</a>
                    </p>
                </section>
            </article>
        <?php else: /* Vista de lista de recursos */ ?>
            <?php if (isset($recursos) && !empty($recursos)): ?>
                <section>
                    <?php foreach ($recursos as $recurso): ?>                        <article>
                            <section>
                                <p><?php echo htmlspecialchars($recurso['tipo_nombre']); ?></p>
                                <h3><?php echo htmlspecialchars($recurso['nombre']); ?></h3>
                                <p><?php echo htmlspecialchars($recurso['ubicacion']); ?></p>
                                <p><?php echo htmlspecialchars(substr($recurso['descripcion'], 0, 100)); ?>...</p>
                                <a href="recursos.php?id=<?php echo $recurso['id_recurso']; ?>">Ver Detalles</a>
                            </section>
                        </article>
                    <?php endforeach; ?>
                </section>
                
                <?php if (isset($paginacion)): ?>
                <nav>
                    <ul>
                        <?php if ($paginacion['pagina_actual'] > 1): ?>
                            <li><a href="recursos.php?pagina=1<?php echo $paginacion['query_string']; ?>">&laquo; Primera</a></li>
                            <li><a href="recursos.php?pagina=<?php echo $paginacion['pagina_actual'] - 1; ?><?php echo $paginacion['query_string']; ?>">&lsaquo; Anterior</a></li>
                        <?php endif; ?>
                        
                        <?php for ($i = max(1, $paginacion['pagina_actual'] - 2); $i <= min($paginacion['total_paginas'], $paginacion['pagina_actual'] + 2); $i++): ?>
                            <li>
                                <a href="recursos.php?pagina=<?php echo $i; ?><?php echo $paginacion['query_string']; ?>"
                                   <?php echo $i == $paginacion['pagina_actual'] ? 'aria-current="page"' : ''; ?>>
                                    <?php echo $i; ?>
                                </a>
                            </li>
                        <?php endfor; ?>
                        
                        <?php if ($paginacion['pagina_actual'] < $paginacion['total_paginas']): ?>
                            <li><a href="recursos.php?pagina=<?php echo $paginacion['pagina_actual'] + 1; ?><?php echo $paginacion['query_string']; ?>">Siguiente &rsaquo;</a></li>
                            <li><a href="recursos.php?pagina=<?php echo $paginacion['total_paginas']; ?><?php echo $paginacion['query_string']; ?>">Última &raquo;</a></li>
                        <?php endif; ?>
                    </ul>
                </nav>
                <?php endif; ?>
            <?php else: ?>
                <p role="alert">No se encontraron recursos turísticos con los criterios seleccionados.</p>
            <?php endif; ?>
        <?php endif; ?>
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
