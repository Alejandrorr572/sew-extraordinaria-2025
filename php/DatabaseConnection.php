<?php
/**
 * Clase para manejar la conexión a la base de datos
 * Implementa el patrón Singleton para una única instancia de conexión
 * Configuración según requisitos del proyecto: DBUSER2025 / DBPWD2025
 */
class DatabaseConnection {
    private static $instance = null;
    private $connection;
    
    // Configuración de la base de datos según especificaciones del proyecto
    private $host = 'localhost';
    private $database = 'DBUSER2025';
    private $username = 'DBUSER2025';
    private $password = 'DBPWD2025';
    private $charset = 'utf8mb4';
    
    /**
     * Constructor privado para implementar Singleton
     */
    private function __construct() {
        $this->connect();
    }
    
    /**
     * Obtiene la única instancia de la clase (Singleton)
     */
    public static function getInstance(): DatabaseConnection {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Establece la conexión con la base de datos
     */
    private function connect(): void {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->database};charset={$this->charset}";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$this->charset} COLLATE utf8mb4_unicode_ci"
            ];
            
            $this->connection = new PDO($dsn, $this->username, $this->password, $options);
            
        } catch (PDOException $e) {
            $this->handleConnectionError($e);
        }
    }
    
    /**
     * Obtiene la conexión PDO
     */
    public function getConnection(): PDO {
        if ($this->connection === null) {
            $this->connect();
        }
        return $this->connection;
    }
    
    /**
     * Maneja errores de conexión
     */
    private function handleConnectionError(PDOException $e): void {
        $errorMessage = "Error de conexión a la base de datos: " . $e->getMessage();
        error_log($errorMessage);
        
        // En producción, no mostrar detalles del error
        if (php_sapi_name() === 'cli') {
            throw new Exception($errorMessage);
        } else {
            throw new Exception("Error de conexión a la base de datos. Contacte al administrador.");
        }
    }
    
    /**
     * Verifica si la conexión está activa
     */
    public function isConnected(): bool {
        try {
            return $this->connection && $this->connection->query('SELECT 1') !== false;
        } catch (PDOException $e) {
            return false;
        }
    }
    
    /**
     * Reconecta si la conexión se ha perdido
     */
    public function reconnect(): void {
        $this->connection = null;
        $this->connect();
    }
    
    /**
     * Inicia una transacción
     */
    public function beginTransaction(): bool {
        return $this->getConnection()->beginTransaction();
    }
    
    /**
     * Confirma una transacción
     */
    public function commit(): bool {
        return $this->getConnection()->commit();
    }
    
    /**
     * Comprueba si hay una transacción activa
     */
    public function inTransaction(): bool {
        return $this->getConnection()->inTransaction();
    }
    
    /**
     * Deshace una transacción
     */
    public function rollback(): bool {
        return $this->getConnection()->rollBack();
    }
    
    /**
     * Ejecuta una consulta preparada
     */
    public function prepare(string $query): PDOStatement {
        return $this->getConnection()->prepare($query);
    }
    
    /**
     * Ejecuta una consulta directa
     */
    public function query(string $query): PDOStatement {
        return $this->getConnection()->query($query);
    }
    
    /**
     * Obtiene el último ID insertado
     */
    public function lastInsertId(string $name = null): string {
        return $this->getConnection()->lastInsertId($name);
    }
    
    /**
     * Escapa una cadena para uso seguro en consultas
     */
    public function quote(string $string): string {
        return $this->getConnection()->quote($string);
    }
    
    /**
     * Cierra la conexión
     */
    public function close(): void {
        $this->connection = null;
    }
    
    /**
     * Previene la clonación del objeto (Singleton)
     */
    private function __clone() {}
    
    /**
     * Previene la deserialización del objeto (Singleton)
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
    
    /**
     * Destructor - cierra la conexión automáticamente
     */
    public function __destruct() {
        $this->close();
    }
}

/**
 * Excepción personalizada para errores de base de datos
 */
class DatabaseException extends Exception {
    private $sqlState;
    private $errorInfo;
    
    public function __construct(string $message, string $sqlState = null, array $errorInfo = null, int $code = 0, Throwable $previous = null) {
        parent::__construct($message, $code, $previous);
        $this->sqlState = $sqlState;
        $this->errorInfo = $errorInfo;
    }
    
    public function getSqlState(): ?string {
        return $this->sqlState;
    }
    
    public function getErrorInfo(): ?array {
        return $this->errorInfo;
    }
}

/**
 * Excepción para errores de validación
 */
class ValidationException extends Exception {
    private $validationErrors = [];
    
    public function __construct(string $message, array $errors = [], int $code = 0, Throwable $previous = null) {
        parent::__construct($message, $code, $previous);
        $this->validationErrors = $errors;
    }
    
    public function getValidationErrors(): array {
        return $this->validationErrors;
    }
    
    public function addError(string $field, string $error): void {
        $this->validationErrors[$field] = $error;
    }
}
?>
