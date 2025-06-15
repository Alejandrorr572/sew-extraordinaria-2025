<?php
/**
 * Inicialización de datos de prueba
 * Sistema de Reservas Turísticas de Siero
 */

/**
 * Clase para inicializar datos de prueba en la base de datos
 */
class InicializadorDatos {
    private $db;
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->db = DatabaseConnection::getInstance();
    }
    
    /**
     * Inicializa la base de datos con datos de prueba
     */
    public function inicializar(): array {
        $resultado = [
            'exito' => true,
            'mensajes' => []
        ];
        
        try {
            // Verificar si hay datos existentes
            if ($this->tieneRecursos()) {
                $resultado['mensajes'][] = 'La base de datos ya contiene recursos. No se inicializarán datos nuevos.';
                return $resultado;
            }
            
            $this->db->beginTransaction();
            
            // Inicializar tipos de recursos
            $tiposCreados = $this->inicializarTiposRecursos();
            $resultado['mensajes'][] = "Se han creado {$tiposCreados} tipos de recursos.";
            
            // Inicializar recursos turísticos
            $recursosCreados = $this->inicializarRecursosTuristicos();
            $resultado['mensajes'][] = "Se han creado {$recursosCreados} recursos turísticos.";
            
            // Inicializar disponibilidades
            $disponibilidadesCreadas = $this->inicializarDisponibilidades();
            $resultado['mensajes'][] = "Se han creado {$disponibilidadesCreadas} disponibilidades.";
            
            $this->db->commit();
            
        } catch (Exception $e) {
            $this->db->rollBack();
            $resultado['exito'] = false;
            $resultado['mensajes'][] = 'Error al inicializar datos: ' . $e->getMessage();
        }
        
        return $resultado;
    }
    
    /**
     * Verifica si ya existen recursos en la base de datos
     */
    private function tieneRecursos(): bool {
        $stmt = $this->db->query("SELECT COUNT(*) FROM recursos_turisticos");
        $count = $stmt->fetchColumn();
        return $count > 0;
    }
    
    /**
     * Inicializa tipos de recursos turísticos
     */
    private function inicializarTiposRecursos(): int {
        $tiposRecursos = [
            [
                'nombre' => 'Museo',
                'descripcion' => 'Espacios museísticos y culturales del concejo',
                'icono' => '🏛️',
                'activo' => true
            ],
            [
                'nombre' => 'Ruta Guiada',
                'descripcion' => 'Rutas y senderos con guía por paisajes naturales',
                'icono' => '🥾',
                'activo' => true
            ],
            [
                'nombre' => 'Sidrería',
                'descripcion' => 'Visitas a sidrerías tradicionales con degustación',
                'icono' => '🍎',
                'activo' => true
            ],
            [
                'nombre' => 'Experiencia Gastronómica',
                'descripcion' => 'Talleres y degustaciones de gastronomía asturiana',
                'icono' => '🍲',
                'activo' => true
            ],
            [
                'nombre' => 'Mercado Local',
                'descripcion' => 'Visita a mercados y ferias tradicionales',
                'icono' => '🛒',
                'activo' => true
            ]
        ];
        
        $stmt = $this->db->prepare("
            INSERT INTO tipos_recursos (nombre, descripcion, icono, activo)
            VALUES (:nombre, :descripcion, :icono, :activo)
        ");
        
        $count = 0;
        foreach ($tiposRecursos as $tipo) {
            $stmt->execute($tipo);
            $count++;
        }
        
        return $count;
    }
    
    /**
     * Inicializa recursos turísticos
     */
    private function inicializarRecursosTuristicos(): int {
        $recursos = [
            // Museos (tipo_id = 1)
            [
                'id_tipo' => 1,
                'nombre' => 'Museo Etnográfico de Siero',
                'descripcion' => 'Museo dedicado a las tradiciones y cultura popular del concejo de Siero. Expone herramientas, vestimentas y objetos cotidianos que muestran la forma de vida rural asturiana a lo largo de los últimos siglos.',
                'ubicacion' => 'C/ Mayor, 12, 33510 Pola de Siero',
                'capacidad_maxima' => 25,
                'precio_base' => 5.00,
                'duracion_minutos' => 90,
                'requisitos_especiales' => null,
                'contacto_telefono' => '985123456',
                'contacto_email' => 'museo@siero.es',
                'imagen_url' => '../multimedia/images/palacio-indiano-siero.jpg',
                'activo' => true
            ],
            [
                'id_tipo' => 1,
                'nombre' => 'Centro de Interpretación del Paisaje Industrial',
                'descripcion' => 'Centro que documenta la transformación del paisaje y la sociedad de Siero a través de su industrialización. Muestra fotografías, maquetas y documentos sobre las minas y fábricas que impulsaron el desarrollo económico de la zona.',
                'ubicacion' => 'Polígono Industrial, 33420 Lugones',
                'capacidad_maxima' => 30,
                'precio_base' => 3.50,
                'duracion_minutos' => 60,
                'requisitos_especiales' => null,
                'contacto_telefono' => '985789456',
                'contacto_email' => 'industrial@siero.es',
                'imagen_url' => '../multimedia/images/pola-siero-centro.jpg',
                'activo' => true
            ],
            
            // Rutas Guiadas (tipo_id = 2)
            [
                'id_tipo' => 2,
                'nombre' => 'Ruta Sierra del Sueve',
                'descripcion' => 'Recorrido guiado por la espectacular Sierra del Sueve, con vistas panorámicas del mar Cantábrico y los Picos de Europa. Posibilidad de avistar los famosos asturcones, caballos salvajes autóctonos de la zona.',
                'ubicacion' => 'Punto de encuentro: Centro de Visitantes Sierra del Sueve',
                'capacidad_maxima' => 15,
                'precio_base' => 12.00,
                'duracion_minutos' => 180,
                'requisitos_especiales' => 'Calzado de montaña, ropa adecuada según temporada, agua y algo de comida.',
                'contacto_telefono' => '985258741',
                'contacto_email' => 'rutas@siero.es',
                'imagen_url' => '../multimedia/images/sierra-sueve-siero.jpg',
                'activo' => true
            ],
            [
                'id_tipo' => 2,
                'nombre' => 'Ruta del Agua y Molinos',
                'descripcion' => 'Recorrido por los antiguos molinos y canalizaciones de agua que abastecían a los pueblos de Siero. Una oportunidad para descubrir la arquitectura tradicional relacionada con el aprovechamiento hídrico.',
                'ubicacion' => 'Punto de encuentro: Plaza Mayor de Pola de Siero',
                'capacidad_maxima' => 20,
                'precio_base' => 8.00,
                'duracion_minutos' => 150,
                'requisitos_especiales' => 'Calzado cómodo, protección solar',
                'contacto_telefono' => '985741236',
                'contacto_email' => 'molinos@siero.es',
                'imagen_url' => '../multimedia/images/mapa-siero.jpg',
                'activo' => true
            ],
            
            // Sidrerías (tipo_id = 3)
            [
                'id_tipo' => 3,
                'nombre' => 'Sidrería El Madreñeru',
                'descripcion' => 'Visita guiada a una sidrería tradicional con más de 100 años de historia. Incluye explicación sobre el proceso de elaboración de la sidra, demostración de escanciado y degustación de sidra acompañada de productos típicos asturianos.',
                'ubicacion' => 'C/ Sidra, 8, 33510 Pola de Siero',
                'capacidad_maxima' => 20,
                'precio_base' => 15.00,
                'duracion_minutos' => 120,
                'requisitos_especiales' => 'Mayores de 18 años para la degustación alcohólica',
                'contacto_telefono' => '985632147',
                'contacto_email' => 'sidra@madreneru.com',
                'imagen_url' => '../multimedia/images/sidreria-tradicional-siero.jpg',
                'activo' => true
            ],
            
            // Experiencias Gastronómicas (tipo_id = 4)
            [
                'id_tipo' => 4,
                'nombre' => 'Taller de Elaboración de Fabada',
                'descripcion' => 'Aprende a elaborar el plato más emblemático de la gastronomía asturiana de la mano de cocineros locales. El taller incluye la preparación de la fabada desde cero, consejos sobre ingredientes y técnicas, y por supuesto, la degustación final.',
                'ubicacion' => 'Centro Gastronómico, 33510 Pola de Siero',
                'capacidad_maxima' => 12,
                'precio_base' => 25.00,
                'duracion_minutos' => 180,
                'requisitos_especiales' => null,
                'contacto_telefono' => '985478965',
                'contacto_email' => 'talleres@gastrosiero.com',
                'imagen_url' => '../multimedia/images/fabada-siero.jpg',
                'activo' => true
            ],
            [
                'id_tipo' => 4,
                'nombre' => 'Elaboración de Cachopo',
                'descripcion' => 'Taller práctico donde aprenderás a preparar un auténtico cachopo asturiano. Desde la selección de la carne y los rellenos hasta las técnicas de empanado y fritura perfecta.',
                'ubicacion' => 'Restaurante El Asturiano, 33510 Pola de Siero',
                'capacidad_maxima' => 10,
                'precio_base' => 30.00,
                'duracion_minutos' => 150,
                'requisitos_especiales' => 'Informar de alergias alimentarias con antelación',
                'contacto_telefono' => '985123789',
                'contacto_email' => 'cachopo@elasturiano.com',
                'imagen_url' => '../multimedia/videos/cachopo-siero.mp4',
                'activo' => true
            ],
            
            // Mercados Locales (tipo_id = 5)
            [
                'id_tipo' => 5,
                'nombre' => 'Visita Guiada al Mercado Semanal',
                'descripcion' => 'Recorrido guiado por el tradicional mercado semanal de Pola de Siero, uno de los más importantes de Asturias. Conoce a productores locales, descubre productos autóctonos y aprende sobre las tradiciones comerciales de la región.',
                'ubicacion' => 'Plaza del Mercado, 33510 Pola de Siero',
                'capacidad_maxima' => 15,
                'precio_base' => 7.00,
                'duracion_minutos' => 90,
                'requisitos_especiales' => null,
                'contacto_telefono' => '985321654',
                'contacto_email' => 'mercado@siero.es',
                'imagen_url' => '../multimedia/images/pola-siero-centro.jpg',
                'activo' => true
            ]
        ];
        
        $stmt = $this->db->prepare("
            INSERT INTO recursos_turisticos (id_tipo, nombre, descripcion, ubicacion, capacidad_maxima, 
                precio_base, duracion_minutos, requisitos_especiales, contacto_telefono, 
                contacto_email, imagen_url, activo)
            VALUES (:id_tipo, :nombre, :descripcion, :ubicacion, :capacidad_maxima, 
                :precio_base, :duracion_minutos, :requisitos_especiales, :contacto_telefono, 
                :contacto_email, :imagen_url, :activo)
        ");
        
        $count = 0;
        foreach ($recursos as $recurso) {
            $stmt->execute($recurso);
            $count++;
        }
        
        return $count;
    }
      /**
     * Inicializa disponibilidades para los recursos, solo para agosto y septiembre
     */
    private function inicializarDisponibilidades(): int {
        // Obtener IDs de recursos
        $stmt = $this->db->query("SELECT id_recurso FROM recursos_turisticos");
        $recursos = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Definir fechas de inicio para agosto y septiembre
        $inicioAgosto = date('Y') . '-08-01'; 
        $inicioSeptiembre = date('Y') . '-09-01';
        
        // Si es año próximo, usar año siguiente
        if (date('m') >= 9) { // Si estamos en septiembre o después
            $year = date('Y') + 1;
            $inicioAgosto = $year . '-08-01';
            $inicioSeptiembre = $year . '-09-01';
        }
        
        // Generar disponibilidades para agosto y septiembre
        $disponibilidades = [];
        foreach ($recursos as $idRecurso) {
            // Disponibilidades para Agosto (31 días)
            for ($dia = 0; $dia < 31; $dia++) {
                $fecha = date('Y-m-d', strtotime("{$inicioAgosto} + {$dia} days"));
                if (date('m', strtotime($fecha)) != 8) continue; // Asegurar que seguimos en agosto
                
                // Primera disponibilidad del día (mañana)
                $disponibilidades[] = [
                    'id_recurso' => $idRecurso,
                    'fecha_inicio' => $fecha,
                    'hora_inicio' => '10:00:00',
                    'fecha_fin' => $fecha,
                    'hora_fin' => '12:00:00',
                    'plazas_disponibles' => rand(5, 20),
                    'precio_especial' => null,
                    'observaciones' => 'Sesión de mañana - Agosto',
                    'activo' => true
                ];
                
                // Segunda disponibilidad del día (tarde)
                $disponibilidades[] = [
                    'id_recurso' => $idRecurso,
                    'fecha_inicio' => $fecha,
                    'hora_inicio' => '16:00:00',
                    'fecha_fin' => $fecha,
                    'hora_fin' => '18:00:00',
                    'plazas_disponibles' => rand(5, 20),
                    'precio_especial' => null,
                    'observaciones' => 'Sesión de tarde - Agosto',
                    'activo' => true
                ];
            }
            
            // Disponibilidades para Septiembre (30 días)
            for ($dia = 0; $dia < 30; $dia++) {
                $fecha = date('Y-m-d', strtotime("{$inicioSeptiembre} + {$dia} days"));
                if (date('m', strtotime($fecha)) != 9) continue; // Asegurar que seguimos en septiembre
                
                // Primera disponibilidad del día (mañana)
                $disponibilidades[] = [
                    'id_recurso' => $idRecurso,
                    'fecha_inicio' => $fecha,
                    'hora_inicio' => '10:00:00',
                    'fecha_fin' => $fecha,
                    'hora_fin' => '12:00:00',
                    'plazas_disponibles' => rand(5, 20),
                    'precio_especial' => null,
                    'observaciones' => 'Sesión de mañana - Septiembre',
                    'activo' => true
                ];
                
                // Segunda disponibilidad del día (tarde)
                $disponibilidades[] = [
                    'id_recurso' => $idRecurso,
                    'fecha_inicio' => $fecha,
                    'hora_inicio' => '16:00:00',
                    'fecha_fin' => $fecha,
                    'hora_fin' => '18:00:00',
                    'plazas_disponibles' => rand(5, 20),
                    'precio_especial' => null,
                    'observaciones' => 'Sesión de tarde - Septiembre',
                    'activo' => true
                ];
            }
        }
        
        $stmt = $this->db->prepare("
            INSERT INTO disponibilidad_recursos (id_recurso, fecha_inicio, hora_inicio, 
                fecha_fin, hora_fin, plazas_disponibles, precio_especial, 
                observaciones, activo)
            VALUES (:id_recurso, :fecha_inicio, :hora_inicio, 
                :fecha_fin, :hora_fin, :plazas_disponibles, :precio_especial, 
                :observaciones, :activo)
        ");
        
        $count = 0;
        foreach ($disponibilidades as $disponibilidad) {
            $stmt->execute($disponibilidad);
            $count++;
        }
        
        return $count;
    }
}

// Únicamente inicializar si este archivo se accede directamente
if (basename($_SERVER['SCRIPT_FILENAME']) === basename(__FILE__)) {
    require_once 'DatabaseConnection.php';
    
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
}
?>
