<?php
/**
 * Vista de Login
 * Sistema de Reservas Turísticas de Siero
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - Sistema de Reservas Turísticas de Siero</title>
    <link rel="stylesheet" href="../estilo/estilo.css">
    <link rel="stylesheet" href="../estilo/layout.css">    <script src="views/js/validacion.js"></script>
</head>
<body>
    <header>
        <h1>Sistema de Reservas Turísticas de Siero</h1>
        <nav>
            <ul>
                <li><a href="../index.html">Web Principal</a></li>
                <li><a href="registro.php">Registrarse</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section>
            <h1>Iniciar Sesión</h1>
            
            <?php if (isset($inicializacion) && is_array($inicializacion)): ?>
                <section aria-label="Mensajes de inicialización de datos">
                    <?php if ($inicializacion['exito']): ?>
                        <p>Se han inicializado datos de prueba para las reservas:</p>
                        <ul>
                            <?php foreach ($inicializacion['mensajes'] as $mensaje): ?>
                                <li><?php echo htmlspecialchars($mensaje); ?></li>
                            <?php endforeach; ?>
                        </ul>
                    <?php else: ?>
                        <p>Error en la inicialización de datos:</p>
                        <ul>
                            <?php foreach ($inicializacion['mensajes'] as $mensaje): ?>
                                <li><?php echo htmlspecialchars($mensaje); ?></li>
                            <?php endforeach; ?>
                        </ul>
                    <?php endif; ?>                </section>
            <?php endif; ?>
            
            <?php if (isset($error)): ?>
                <p><?php echo $error; ?></p>
            <?php endif; ?>
            
            <?php if (!isset($inicializacion) || empty($inicializacion['mensajes']) || !$inicializacion['exito']): ?>
                <p>¿No hay recursos disponibles para reservar? <a href="inicializar.php">Inicializar datos de prueba</a></p>
            <?php endif; ?>
              <?php if (isset($mensajes['success'])): ?>
                <p><?php echo $mensajes['success']; ?></p>
            <?php endif; ?>
              <form method="post" action="login.php" id="formLogin">
                <fieldset>
                    <legend>Datos de acceso</legend>
                    
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required 
                        value="<?php echo isset($email) ? htmlspecialchars($email) : ''; ?>">
                    <?php if (isset($errores['email'])): ?>
                        <p><?php echo $errores['email']; ?></p>
                    <?php endif; ?>
                    
                    <label for="password">Contraseña</label>
                    <input type="password" name="password" required>
                    <?php if (isset($errores['password'])): ?>
                        <p><?php echo $errores['password']; ?></p>
                    <?php endif; ?>
                </fieldset>
                
                <nav>
                    <a href="registro.php">Crear una cuenta</a>
                    <button type="submit">Iniciar Sesión</button>
                </nav>
            </form>
        </section>
    </main>
    
    <footer>
        <p>Sistema de Reservas Turísticas de Siero &copy; <?php echo date('Y'); ?></p>
    </footer>
</body>
</html>
