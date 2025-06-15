<?php
/**
 * Modelos del Sistema de Reservas Turísticas
 * Implementa las clases principales para las entidades de datos
 * Utiliza patrón OOP estricto
 */

/**
 * Clase abstracta base para todos los modelos
 */
abstract class Model {
    protected $attributes = [];
    protected static $db;
    protected static $table = '';
    protected static $primaryKey = 'id';
    
    /**
     * Constructor para inicializar el modelo con atributos
     */
    public function __construct(array $attributes = []) {
        $this->fill($attributes);
        if (self::$db === null) {
            self::$db = DatabaseConnection::getInstance();
        }
    }
    
    /**
     * Llena el modelo con atributos
     */
    public function fill(array $attributes): self {
        foreach ($attributes as $key => $value) {
            $this->attributes[$key] = $value;
        }
        return $this;
    }
    
    /**
     * Obtiene un atributo
     */
    public function __get(string $key) {
        return $this->attributes[$key] ?? null;
    }
    
    /**
     * Establece un atributo
     */
    public function __set(string $key, $value): void {
        $this->attributes[$key] = $value;
    }
    
    /**
     * Verifica si un atributo existe
     */
    public function __isset(string $key): bool {
        return isset($this->attributes[$key]);
    }
    
    /**
     * Obtiene todos los atributos
     */
    public function getAttributes(): array {
        return $this->attributes;
    }
    
    /**
     * Método abstracto para validar los atributos del modelo
     */
    abstract public function validate(): array;
    
    /**
     * Método abstracto para guardar un nuevo registro o actualizar existente
     */
    abstract public function save(): bool;
    
    /**
     * Método estático para encontrar un modelo por su ID
     */
    public static function find($id) {
        $db = DatabaseConnection::getInstance();
        $stmt = $db->prepare("SELECT * FROM " . static::$table . " WHERE " . static::$primaryKey . " = :id");
        $stmt->execute(['id' => $id]);
        
        $data = $stmt->fetch();
        if (!$data) {
            return null;
        }
        
        $className = get_called_class();
        return new $className($data);
    }
    
    /**
     * Método estático para buscar registros con condiciones
     */
    public static function where(string $column, $value, string $operator = '=') {
        $db = DatabaseConnection::getInstance();
        $stmt = $db->prepare("SELECT * FROM " . static::$table . " WHERE {$column} {$operator} :value");
        $stmt->execute(['value' => $value]);
        
        $results = [];
        $className = get_called_class();
        
        while ($data = $stmt->fetch()) {
            $results[] = new $className($data);
        }
        
        return $results;
    }
    
    /**
     * Método estático para obtener todos los registros
     */
    public static function all(string $orderBy = null, string $orderDirection = 'ASC') {
        $query = "SELECT * FROM " . static::$table;
        
        if ($orderBy) {
            $query .= " ORDER BY {$orderBy} {$orderDirection}";
        }
        
        $db = DatabaseConnection::getInstance();
        $stmt = $db->query($query);
        
        $results = [];
        $className = get_called_class();
        
        while ($data = $stmt->fetch()) {
            $results[] = new $className($data);
        }
        
        return $results;
    }
}

/**
 * Modelo de Usuario para gestionar registros y autenticación
 */
class Usuario extends Model {
    protected static $table = 'usuarios';
    protected static $primaryKey = 'id_usuario';
    
    /**
     * Validación de datos del usuario
     */
    public function validate(): array {
        $errors = [];
        
        if (empty($this->nombre)) {
            $errors['nombre'] = 'El nombre es obligatorio';
        }
        
        if (empty($this->apellidos)) {
            $errors['apellidos'] = 'Los apellidos son obligatorios';
        }
        
        if (empty($this->email)) {
            $errors['email'] = 'El email es obligatorio';
        } elseif (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'El email no es válido';
        }
        
        if (empty($this->attributes['password']) && !isset($this->password_hash)) {
            $errors['password'] = 'La contraseña es obligatoria';
        }
        
        return $errors;
    }
    
    /**
     * Guarda o actualiza un usuario en la base de datos
     */
    public function save(): bool {
        $errors = $this->validate();
        if (!empty($errors)) {
            throw new ValidationException('Error de validación en Usuario', $errors);
        }
        
        // Hash de la contraseña si está presente
        if (isset($this->attributes['password'])) {
            $this->attributes['password_hash'] = password_hash($this->attributes['password'], PASSWORD_DEFAULT);
            unset($this->attributes['password']);
        }
        
        $db = DatabaseConnection::getInstance();
        
        // Si tiene ID es una actualización, sino es una inserción
        if (isset($this->id_usuario)) {
            $fields = [];
            $values = [];
            
            foreach ($this->attributes as $field => $value) {
                if ($field !== 'id_usuario' && $field !== 'fecha_registro') {
                    $fields[] = "{$field} = :{$field}";
                    $values[$field] = $value;
                }
            }
            
            $values['id_usuario'] = $this->id_usuario;
            
            $sql = "UPDATE " . static::$table . " SET " . implode(', ', $fields) . " WHERE id_usuario = :id_usuario";
            $stmt = $db->prepare($sql);
            return $stmt->execute($values);
        } else {
            // Es un nuevo registro
            $fields = array_keys($this->attributes);
            $placeholders = array_map(function($field) {
                return ":{$field}";
            }, $fields);
            
            $sql = "INSERT INTO " . static::$table . " (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
            $stmt = $db->prepare($sql);
            
            $success = $stmt->execute($this->attributes);
            if ($success) {
                $this->attributes['id_usuario'] = $db->lastInsertId();
            }
            return $success;
        }
    }
    
    /**
     * Método estático para autenticar un usuario
     */
    public static function authenticate(string $email, string $password): ?Usuario {
        $users = self::where('email', $email);
        
        if (empty($users)) {
            return null;
        }
        
        $user = $users[0];
        
        if (password_verify($password, $user->password_hash)) {
            // Actualizar último acceso
            $db = DatabaseConnection::getInstance();
            $stmt = $db->prepare("UPDATE usuarios SET ultimo_acceso = NOW() WHERE id_usuario = :id");
            $stmt->execute(['id' => $user->id_usuario]);
            
            return $user;
        }
        
        return null;
    }
}

/**
 * Modelo de TipoRecurso para categorías de recursos turísticos
 */
class TipoRecurso extends Model {
    protected static $table = 'tipos_recursos';
    protected static $primaryKey = 'id_tipo';
    
    /**
     * Validación de datos del tipo de recurso
     */
    public function validate(): array {
        $errors = [];
        
        if (empty($this->nombre)) {
            $errors['nombre'] = 'El nombre del tipo es obligatorio';
        }
        
        return $errors;
    }
    
    /**
     * Guarda o actualiza un tipo de recurso
     */
    public function save(): bool {
        $errors = $this->validate();
        if (!empty($errors)) {
            throw new ValidationException('Error de validación en Tipo de Recurso', $errors);
        }
        
        $db = DatabaseConnection::getInstance();
        
        // Actualización o inserción
        if (isset($this->id_tipo)) {
            $fields = [];
            $values = [];
            
            foreach ($this->attributes as $field => $value) {
                if ($field !== 'id_tipo') {
                    $fields[] = "{$field} = :{$field}";
                    $values[$field] = $value;
                }
            }
            
            $values['id_tipo'] = $this->id_tipo;
            
            $sql = "UPDATE " . static::$table . " SET " . implode(', ', $fields) . " WHERE id_tipo = :id_tipo";
            $stmt = $db->prepare($sql);
            return $stmt->execute($values);
        } else {
            // Es un nuevo registro
            $fields = array_keys($this->attributes);
            $placeholders = array_map(function($field) {
                return ":{$field}";
            }, $fields);
            
            $sql = "INSERT INTO " . static::$table . " (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
            $stmt = $db->prepare($sql);
            
            $success = $stmt->execute($this->attributes);
            if ($success) {
                $this->attributes['id_tipo'] = $db->lastInsertId();
            }
            return $success;
        }
    }
}

/**
 * Modelo de RecursoTuristico para los recursos disponibles
 */
class RecursoTuristico extends Model {
    protected static $table = 'recursos_turisticos';
    protected static $primaryKey = 'id_recurso';
    
    /**
     * Validación de datos del recurso turístico
     */
    public function validate(): array {
        $errors = [];
        
        if (empty($this->id_tipo)) {
            $errors['id_tipo'] = 'El tipo de recurso es obligatorio';
        }
        
        if (empty($this->nombre)) {
            $errors['nombre'] = 'El nombre es obligatorio';
        }
        
        if (empty($this->descripcion)) {
            $errors['descripcion'] = 'La descripción es obligatoria';
        }
        
        if (empty($this->ubicacion)) {
            $errors['ubicacion'] = 'La ubicación es obligatoria';
        }
        
        if (empty($this->capacidad_maxima) || $this->capacidad_maxima <= 0) {
            $errors['capacidad_maxima'] = 'La capacidad máxima debe ser mayor a 0';
        }
        
        if (!isset($this->precio_base) || $this->precio_base < 0) {
            $errors['precio_base'] = 'El precio base no puede ser negativo';
        }
        
        if (empty($this->duracion_minutos) || $this->duracion_minutos <= 0) {
            $errors['duracion_minutos'] = 'La duración debe ser mayor a 0 minutos';
        }
        
        return $errors;
    }
    
    /**
     * Guarda o actualiza un recurso turístico
     */
    public function save(): bool {
        $errors = $this->validate();
        if (!empty($errors)) {
            throw new ValidationException('Error de validación en Recurso Turístico', $errors);
        }
        
        $db = DatabaseConnection::getInstance();
        
        // Actualización o inserción
        if (isset($this->id_recurso)) {
            $fields = [];
            $values = [];
            
            foreach ($this->attributes as $field => $value) {
                if ($field !== 'id_recurso' && $field !== 'fecha_creacion') {
                    $fields[] = "{$field} = :{$field}";
                    $values[$field] = $value;
                }
            }
            
            $values['id_recurso'] = $this->id_recurso;
            
            $sql = "UPDATE " . static::$table . " SET " . implode(', ', $fields) . " WHERE id_recurso = :id_recurso";
            $stmt = $db->prepare($sql);
            return $stmt->execute($values);
        } else {
            // Es un nuevo registro
            $fields = array_keys($this->attributes);
            $placeholders = array_map(function($field) {
                return ":{$field}";
            }, $fields);
            
            $sql = "INSERT INTO " . static::$table . " (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
            $stmt = $db->prepare($sql);
            
            $success = $stmt->execute($this->attributes);
            if ($success) {
                $this->attributes['id_recurso'] = $db->lastInsertId();
            }
            return $success;
        }
    }
    
    /**
     * Obtiene el tipo de recurso asociado
     */
    public function getTipo(): ?TipoRecurso {
        return TipoRecurso::find($this->id_tipo);
    }
    
    /**
     * Obtiene las disponibilidades asociadas a este recurso
     */
    public function getDisponibilidades(bool $soloActivas = true): array {
        $sql = "SELECT * FROM disponibilidad_recursos WHERE id_recurso = :id_recurso";
        
        if ($soloActivas) {
            $sql .= " AND activo = 1 AND fecha_inicio >= CURDATE()";
        }
        
        $sql .= " ORDER BY fecha_inicio, hora_inicio";
        
        $db = DatabaseConnection::getInstance();
        $stmt = $db->prepare($sql);
        $stmt->execute(['id_recurso' => $this->id_recurso]);
        
        $results = [];
        while ($data = $stmt->fetch()) {
            $results[] = new DisponibilidadRecurso($data);
        }
        
        return $results;
    }
    
    /**
     * Busca recursos por texto en nombre o descripción
     */
    public static function buscar(string $texto, ?int $tipoId = null): array {
        $sql = "SELECT * FROM recursos_turisticos WHERE (nombre LIKE :texto OR descripcion LIKE :texto)";
        
        $params = ['texto' => "%{$texto}%"];
        
        if ($tipoId !== null) {
            $sql .= " AND id_tipo = :tipo_id";
            $params['tipo_id'] = $tipoId;
        }
        
        $sql .= " AND activo = 1 ORDER BY nombre";
        
        $db = DatabaseConnection::getInstance();
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        $results = [];
        while ($data = $stmt->fetch()) {
            $results[] = new RecursoTuristico($data);
        }
        
        return $results;
    }
}

/**
 * Modelo de DisponibilidadRecurso para horarios y plazas disponibles
 */
class DisponibilidadRecurso extends Model {
    protected static $table = 'disponibilidad_recursos';
    protected static $primaryKey = 'id_disponibilidad';
    
    /**
     * Validación de datos de disponibilidad
     */
    public function validate(): array {
        $errors = [];
        
        if (empty($this->id_recurso)) {
            $errors['id_recurso'] = 'El recurso asociado es obligatorio';
        }
        
        if (empty($this->fecha_inicio)) {
            $errors['fecha_inicio'] = 'La fecha de inicio es obligatoria';
        }
        
        if (empty($this->hora_inicio)) {
            $errors['hora_inicio'] = 'La hora de inicio es obligatoria';
        }
        
        if (empty($this->fecha_fin)) {
            $errors['fecha_fin'] = 'La fecha de fin es obligatoria';
        }
        
        if (empty($this->hora_fin)) {
            $errors['hora_fin'] = 'La hora de fin es obligatoria';
        }
        
        // Validar que fecha_fin > fecha_inicio o (fecha_fin = fecha_inicio y hora_fin > hora_inicio)
        $inicio = strtotime($this->fecha_inicio . ' ' . $this->hora_inicio);
        $fin = strtotime($this->fecha_fin . ' ' . $this->hora_fin);
        
        if ($fin <= $inicio) {
            $errors['fecha_hora'] = 'La fecha y hora de fin deben ser posteriores a la fecha y hora de inicio';
        }
        
        if (!isset($this->plazas_disponibles) || $this->plazas_disponibles < 0) {
            $errors['plazas_disponibles'] = 'Las plazas disponibles no pueden ser negativas';
        }
        
        if (isset($this->precio_especial) && $this->precio_especial < 0) {
            $errors['precio_especial'] = 'El precio especial no puede ser negativo';
        }
        
        return $errors;
    }
    
    /**
     * Guarda o actualiza una disponibilidad
     */
    public function save(): bool {
        $errors = $this->validate();
        if (!empty($errors)) {
            throw new ValidationException('Error de validación en Disponibilidad', $errors);
        }
        
        $db = DatabaseConnection::getInstance();
        
        // Actualización o inserción
        if (isset($this->id_disponibilidad)) {
            $fields = [];
            $values = [];
            
            foreach ($this->attributes as $field => $value) {
                if ($field !== 'id_disponibilidad' && $field !== 'fecha_creacion') {
                    $fields[] = "{$field} = :{$field}";
                    $values[$field] = $value;
                }
            }
            
            $values['id_disponibilidad'] = $this->id_disponibilidad;
            
            $sql = "UPDATE " . static::$table . " SET " . implode(', ', $fields) . " WHERE id_disponibilidad = :id_disponibilidad";
            $stmt = $db->prepare($sql);
            return $stmt->execute($values);
        } else {
            // Es un nuevo registro
            $fields = array_keys($this->attributes);
            $placeholders = array_map(function($field) {
                return ":{$field}";
            }, $fields);
            
            $sql = "INSERT INTO " . static::$table . " (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
            $stmt = $db->prepare($sql);
            
            $success = $stmt->execute($this->attributes);
            if ($success) {
                $this->attributes['id_disponibilidad'] = $db->lastInsertId();
            }
            return $success;
        }
    }
    
    /**
     * Obtiene el recurso asociado
     */
    public function getRecurso(): ?RecursoTuristico {
        return RecursoTuristico::find($this->id_recurso);
    }
    
    /**
     * Verifica si hay suficientes plazas disponibles
     */
    public function tienePlazas(int $plazasSolicitadas): bool {
        return $this->plazas_disponibles >= $plazasSolicitadas;
    }
    
    /**
     * Calcula el precio para una cantidad de personas
     */
    public function calcularPrecio(int $numeroPersonas): float {
        $db = DatabaseConnection::getInstance();
        
        // Usar la función de MySQL para calcular el precio
        $stmt = $db->prepare("SELECT fn_calcular_precio_total(:id_disponibilidad, :numero_personas) as precio_total");
        $stmt->execute([
            'id_disponibilidad' => $this->id_disponibilidad,
            'numero_personas' => $numeroPersonas
        ]);
        
        $result = $stmt->fetch();
        return floatval($result['precio_total']);
    }
}

/**
 * Modelo de Reserva para las reservas de recursos
 */
class Reserva extends Model {
    protected static $table = 'reservas';
    protected static $primaryKey = 'id_reserva';
    
    /**
     * Validación de datos de la reserva
     */
    public function validate(): array {
        $errors = [];
        
        if (empty($this->id_usuario)) {
            $errors['id_usuario'] = 'El usuario es obligatorio';
        }
        
        if (empty($this->id_disponibilidad)) {
            $errors['id_disponibilidad'] = 'La disponibilidad es obligatoria';
        }
        
        if (empty($this->numero_personas) || $this->numero_personas <= 0) {
            $errors['numero_personas'] = 'El número de personas debe ser mayor a 0';
        }
        
        if (!isset($this->precio_total) || $this->precio_total < 0) {
            $errors['precio_total'] = 'El precio total no puede ser negativo';
        }
        
        return $errors;
    }
    
    /**
     * Guarda o actualiza una reserva
     */
    public function save(): bool {
        $errors = $this->validate();
        if (!empty($errors)) {
            throw new ValidationException('Error de validación en Reserva', $errors);
        }
        
        $db = DatabaseConnection::getInstance();
        
        // Verificar disponibilidad de plazas
        if (!isset($this->id_reserva)) {
            $disponibilidad = DisponibilidadRecurso::find($this->id_disponibilidad);
            if (!$disponibilidad || !$disponibilidad->tienePlazas($this->numero_personas)) {
                throw new ValidationException('No hay suficientes plazas disponibles', ['plazas' => 'No hay suficientes plazas para esta reserva']);
            }
        }
          // Iniciar transacción solo si no hay una activa
        try {
            $inTransaction = $db->inTransaction();
            if (!$inTransaction) {
                $db->beginTransaction();
            }
        } catch (PDOException $e) {
            $db->beginTransaction();
        }
        
        try {
            // Actualización o inserción
            if (isset($this->id_reserva)) {
                $fields = [];
                $values = [];
                
                foreach ($this->attributes as $field => $value) {
                    if ($field !== 'id_reserva' && $field !== 'numero_reserva' && $field !== 'fecha_reserva') {
                        $fields[] = "{$field} = :{$field}";
                        $values[$field] = $value;
                    }
                }
                
                $values['id_reserva'] = $this->id_reserva;
                
                $sql = "UPDATE " . static::$table . " SET " . implode(', ', $fields) . " WHERE id_reserva = :id_reserva";
                $stmt = $db->prepare($sql);
                $stmt->execute($values);
            } else {
                // Es un nuevo registro, pero sin incluir numero_reserva (se genera con trigger)
                $fields = [];
                $values = [];
                
                foreach ($this->attributes as $field => $value) {
                    if ($field !== 'numero_reserva') {
                        $fields[] = $field;
                        $values[':' . $field] = $value;
                    }
                }
                
                $sql = "INSERT INTO " . static::$table . " (" . implode(', ', $fields) . ") VALUES (" . implode(', ', array_keys($values)) . ")";
                $stmt = $db->prepare($sql);
                $stmt->execute($values);
                
                $this->attributes['id_reserva'] = $db->lastInsertId();
                
                // Recuperar el número de reserva generado
                $stmt = $db->prepare("SELECT numero_reserva FROM reservas WHERE id_reserva = :id");
                $stmt->execute(['id' => $this->attributes['id_reserva']]);
                $result = $stmt->fetch();
                $this->attributes['numero_reserva'] = $result['numero_reserva'];            }
            
            // Solo hacer commit si nosotros iniciamos la transacción
            if (isset($inTransaction) && !$inTransaction) {
                $db->commit();
            }
            return true;
        } catch (Exception $e) {
            if (isset($inTransaction) && !$inTransaction) {
                $db->rollback();
            }
            throw $e;
        }
    }
    
    /**
     * Obtiene el usuario asociado
     */
    public function getUsuario(): ?Usuario {
        return Usuario::find($this->id_usuario);
    }
    
    /**
     * Obtiene la disponibilidad asociada
     */
    public function getDisponibilidad(): ?DisponibilidadRecurso {
        return DisponibilidadRecurso::find($this->id_disponibilidad);
    }
    
    /**
     * Cancela una reserva
     */
    public function cancelar(string $motivo): bool {
        $db = DatabaseConnection::getInstance();
        
        try {
            // Usar el procedimiento almacenado para cancelar
            $stmt = $db->prepare("CALL sp_cancelar_reserva(:numero_reserva, :motivo)");
            $stmt->execute([
                'numero_reserva' => $this->numero_reserva,
                'motivo' => $motivo
            ]);
            
            // Actualizamos el estado y motivo en el modelo
            $this->estado = 'cancelada';
            $this->fecha_cancelacion = date('Y-m-d H:i:s');
            $this->motivo_cancelacion = $motivo;
            
            return true;
        } catch (PDOException $e) {
            throw new DatabaseException('Error al cancelar la reserva: ' . $e->getMessage(), $e->getCode());
        }
    }
    
    /**
     * Obtiene las reservas de un usuario
     */
    public static function getReservasUsuario(int $idUsuario, string $estado = null): array {
        $sql = "SELECT r.* FROM reservas r
                WHERE r.id_usuario = :id_usuario";
                
        $params = ['id_usuario' => $idUsuario];
        
        if ($estado !== null) {
            $sql .= " AND r.estado = :estado";
            $params['estado'] = $estado;
        }
        
        $sql .= " ORDER BY r.fecha_reserva DESC";
        
        $db = DatabaseConnection::getInstance();
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        $results = [];
        while ($data = $stmt->fetch()) {
            $results[] = new Reserva($data);
        }
        
        return $results;
    }
    
    /**
     * Obtiene reservas con información completa (para listados)
     */
    public static function getReservasCompletas(?int $idUsuario = null): array {
        $sql = "SELECT 
                    res.*, 
                    u.nombre as usuario_nombre,
                    u.apellidos as usuario_apellidos,
                    rt.nombre as recurso_nombre,
                    rt.ubicacion as recurso_ubicacion,
                    tr.nombre as tipo_nombre,
                    d.fecha_inicio,
                    d.hora_inicio,
                    d.fecha_fin,
                    d.hora_fin
                FROM reservas res
                JOIN usuarios u ON res.id_usuario = u.id_usuario
                JOIN disponibilidad_recursos d ON res.id_disponibilidad = d.id_disponibilidad
                JOIN recursos_turisticos rt ON d.id_recurso = rt.id_recurso
                JOIN tipos_recursos tr ON rt.id_tipo = tr.id_tipo";
                
        $params = [];
        
        if ($idUsuario !== null) {
            $sql .= " WHERE res.id_usuario = :id_usuario";
            $params['id_usuario'] = $idUsuario;
        }
        
        $sql .= " ORDER BY res.fecha_reserva DESC";
        
        $db = DatabaseConnection::getInstance();
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll();
    }
}
?>
