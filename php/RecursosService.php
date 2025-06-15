<?php
/**
 * Servicio para gestionar los recursos turísticos
 * Sistema de Reservas Turísticas de Siero
 */

/**
 * Servicio para gestionar los recursos turísticos
 * Encapsula la lógica de negocio y acceso a datos
 */
class RecursosService {
    /**
     * Obtiene todos los tipos de recursos
     */
    public function obtenerTiposRecursos(): array {
        return TipoRecurso::all('nombre', 'ASC');
    }
    
    /**
     * Obtiene todos los recursos activos sin filtros
     */
    public function obtenerTodosLosRecursos(): array {
        $db = DatabaseConnection::getInstance();
        
        $sql = "
            SELECT DISTINCT 
                rt.id_recurso,
                rt.nombre,
                rt.descripcion,
                rt.ubicacion,
                rt.capacidad_maxima,
                rt.precio_base,
                rt.duracion_minutos,
                tr.nombre as tipo_nombre,
                tr.icono as tipo_icono,
                COUNT(DISTINCT d.id_disponibilidad) as disponibilidades_futuras
            FROM recursos_turisticos rt
            JOIN tipos_recursos tr ON rt.id_tipo = tr.id_tipo
            LEFT JOIN disponibilidad_recursos d ON rt.id_recurso = d.id_recurso
                AND d.fecha_inicio >= CURRENT_DATE()
                AND d.activo = 1
                AND d.plazas_disponibles > 0
            WHERE rt.activo = 1
            GROUP BY rt.id_recurso
            ORDER BY disponibilidades_futuras DESC, rt.nombre ASC
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
    
    /**
     * Busca recursos según filtros
     */
    public function buscarRecursos(RecursosFiltro $filtros): array {
        $db = DatabaseConnection::getInstance();
        
        $sql = "
            SELECT DISTINCT 
                rt.id_recurso,
                rt.nombre,
                rt.descripcion,
                rt.ubicacion,
                rt.capacidad_maxima,
                rt.precio_base,
                rt.duracion_minutos,
                tr.nombre as tipo_nombre,
                tr.icono as tipo_icono,
                COUNT(DISTINCT d.id_disponibilidad) as disponibilidades_futuras
            FROM recursos_turisticos rt
            JOIN tipos_recursos tr ON rt.id_tipo = tr.id_tipo
            LEFT JOIN disponibilidad_recursos d ON rt.id_recurso = d.id_recurso
                AND d.fecha_inicio >= CURRENT_DATE()
                AND d.activo = 1
                AND d.plazas_disponibles > 0
        ";
        
        $where = ["rt.activo = 1"];
        $params = [];
        
        // Filtro por búsqueda
        if ($filtros->getBusqueda()) {
            $where[] = "(rt.nombre LIKE :busqueda OR rt.descripcion LIKE :busqueda OR rt.ubicacion LIKE :busqueda)";
            $params['busqueda'] = "%" . $filtros->getBusqueda() . "%";
        }
        
        // Filtro por tipo
        if ($filtros->getTipoId()) {
            $where[] = "rt.id_tipo = :tipo_id";
            $params['tipo_id'] = $filtros->getTipoId();
        }
        
        // Filtro por fecha
        if ($filtros->getFecha()) {
            $where[] = "EXISTS (
                SELECT 1 FROM disponibilidad_recursos d2 
                WHERE d2.id_recurso = rt.id_recurso 
                AND d2.fecha_inicio = :fecha 
                AND d2.activo = 1 
                AND d2.plazas_disponibles > 0
            )";
            $params['fecha'] = $filtros->getFecha();
        }
        
        // Filtro por precio mínimo
        if ($filtros->getPrecioMin() !== null) {
            $where[] = "rt.precio_base >= :precio_min";
            $params['precio_min'] = $filtros->getPrecioMin();
        }
        
        // Filtro por precio máximo
        if ($filtros->getPrecioMax() !== null) {
            $where[] = "rt.precio_base <= :precio_max";
            $params['precio_max'] = $filtros->getPrecioMax();
        }
        
        // Añadir cláusulas WHERE
        if (!empty($where)) {
            $sql .= " WHERE " . implode(" AND ", $where);
        }
        
        // Agrupar por recurso
        $sql .= " GROUP BY rt.id_recurso";
        
        // Si hay filtro de fecha, mostrar solo recursos con disponibilidad en esa fecha
        if ($filtros->getFecha()) {
            $sql .= " HAVING disponibilidades_futuras > 0";
        }
        
        // Ordenar resultados
        $sql .= " ORDER BY disponibilidades_futuras DESC, rt.nombre ASC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll();
    }
    
    /**
     * Obtiene un recurso por su ID con todas sus disponibilidades
     */
    public function obtenerRecursoConDisponibilidades(int $idRecurso): ?array {
        $recurso = RecursoTuristico::find($idRecurso);
        
        if (!$recurso) {
            return null;
        }
        
        $disponibilidades = $recurso->getDisponibilidades(true);
        
        return [
            'recurso' => $recurso,
            'disponibilidades' => $disponibilidades,
            'tipo' => $recurso->getTipo()
        ];
    }
}
