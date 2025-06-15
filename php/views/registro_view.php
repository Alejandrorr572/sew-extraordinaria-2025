<?php
/**
 * Vista de Registro
 * Sistema de Reservas Turísticas de Siero
 */
?>
<!DOCTYPE html>
<html lang="es">
<head>    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro - Sistema de Reservas Turísticas de Siero</title>    <link rel="stylesheet" href="../estilo/estilo.css">
    <link rel="stylesheet" href="../estilo/layout.css">
</head>
<body>
    <header>
        <h1>Sistema de Reservas Turísticas de Siero</h1>
        <nav>
            <ul>
                <li><a href="../index.html">Web Principal</a></li>
                <li><a href="login.php">Iniciar Sesión</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <h1>Registro de Usuario</h1>
        
        <?php if (isset($error)): ?>
            <p role="alert"><?php echo $error; ?></p>
        <?php endif; ?>
        
        <form method="post" action="registro.php">
            <fieldset>
                <legend>Datos personales</legend>
                
                <section>
                    <p>
                        <label for="nombre">Nombre</label>
                        <input type="text" id="nombre" name="nombre" required 
                            value="<?php echo isset($datos['nombre']) ? htmlspecialchars($datos['nombre']) : ''; ?>">
                        <?php if (isset($errores['nombre'])): ?>
                            <span role="alert"><?php echo $errores['nombre']; ?></span>
                        <?php endif; ?>
                    </p>
                    
                    <p>
                        <label for="apellidos">Apellidos</label>
                        <input type="text" id="apellidos" name="apellidos" required 
                            value="<?php echo isset($datos['apellidos']) ? htmlspecialchars($datos['apellidos']) : ''; ?>">
                        <?php if (isset($errores['apellidos'])): ?>
                            <span role="alert"><?php echo $errores['apellidos']; ?></span>
                        <?php endif; ?>
                    </p>
                </section>
                
                <p>
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required 
                        value="<?php echo isset($datos['email']) ? htmlspecialchars($datos['email']) : ''; ?>">
                    <?php if (isset($errores['email'])): ?>
                        <span role="alert"><?php echo $errores['email']; ?></span>
                    <?php endif; ?>
                </p>
                
                <section>
                    <p>
                        <label for="telefono">Teléfono</label>
                        <input type="tel" id="telefono" name="telefono" 
                            value="<?php echo isset($datos['telefono']) ? htmlspecialchars($datos['telefono']) : ''; ?>">
                        <?php if (isset($errores['telefono'])): ?>
                            <span role="alert"><?php echo $errores['telefono']; ?></span>
                        <?php endif; ?>
                    </p>
                    
                    <p>
                        <label for="fecha_nacimiento">Fecha de nacimiento</label>
                        <input type="date" id="fecha_nacimiento" name="fecha_nacimiento" 
                            value="<?php echo isset($datos['fecha_nacimiento']) ? htmlspecialchars($datos['fecha_nacimiento']) : ''; ?>">
                        <?php if (isset($errores['fecha_nacimiento'])): ?>
                            <span role="alert"><?php echo $errores['fecha_nacimiento']; ?></span>
                        <?php endif; ?>
                    </p>
                </section>
            </fieldset>
            
            <fieldset>
                <legend>Datos de acceso</legend>
                
                <p>
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" name="password" required>
                    <?php if (isset($errores['password'])): ?>
                        <span role="alert"><?php echo $errores['password']; ?></span>
                    <?php endif; ?>
                </p>
                
                <p>
                    <label for="password_confirm">Confirmar contraseña</label>
                    <input type="password" id="password_confirm" name="password_confirm" required>
                    <?php if (isset($errores['password_confirm'])): ?>
                        <span role="alert"><?php echo $errores['password_confirm']; ?></span>
                    <?php endif; ?>
                </p>
            </fieldset>
            
            <nav>
                <a href="login.php">¿Ya tienes cuenta? Inicia sesión</a>
                <button type="submit">Registrarse</button>
            </nav>
        </form>
    </main>
    
    <footer>
        <p>Sistema de Reservas Turísticas de Siero &copy; <?php echo date('Y'); ?></p>
    </footer>
</body>
</html>
