<?php
/**
 * Servicio para gestionar las reservas
 * Sistema de Reservas Turísticas de Siero
 */

/**
 * Servicio para reservas
 */
class ReservaService {
    /**
     * Obtiene todas las disponibilidades futuras
     */
    public function obtenerDisponibilidadesFuturas(): array {
        $db = DatabaseConnection::getInstance();
        
        $sql = "
            SELECT 
                d.id_disponibilidad,
                d.fecha_inicio,
                d.hora_inicio,
                d.hora_fin,
                d.plazas_disponibles,
                COALESCE(d.precio_especial, r.precio_base) as precio,
                r.id_recurso,
                r.nombre as nombre_recurso,
                r.ubicacion,
                t.nombre as tipo_nombre
            FROM disponibilidad_recursos d
            JOIN recursos_turisticos r ON d.id_recurso = r.id_recurso
            JOIN tipos_recursos t ON r.id_tipo = t.id_tipo
            WHERE 
                d.fecha_inicio >= CURRENT_DATE() 
                AND d.activo = 1 
                AND r.activo = 1
                AND d.plazas_disponibles > 0
            ORDER BY d.fecha_inicio, d.hora_inicio
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute();
        
        return $stmt->fetchAll();
    }
    
    /**
     * Obtiene una disponibilidad por su ID
     */
    public function obtenerDisponibilidad(int $idDisponibilidad) {
        return DisponibilidadRecurso::find($idDisponibilidad);
    }
    
    /**
     * Obtiene información completa de una disponibilidad
     */
    public function obtenerDisponibilidadCompleta(int $idDisponibilidad): ?array {
        $disponibilidad = DisponibilidadRecurso::find($idDisponibilidad);
        
        if (!$disponibilidad) {
            return null;
        }
        
        $recurso = RecursoTuristico::find($disponibilidad->id_recurso);
        if (!$recurso) {
            return null;
        }
        
        $tipo = TipoRecurso::find($recurso->id_tipo);
        if (!$tipo) {
            return null;
        }
        
        return [
            'disponibilidad' => $disponibilidad,
            'recurso' => $recurso,
            'tipo' => $tipo
        ];
    }
    
    /**
     * Crea una reserva
     */
    public function crearReserva(int $idDisponibilidad, int $idUsuario, int $numeroPersonas, ?string $observaciones = null): string {
        // Obtener disponibilidad
        $disponibilidad = $this->obtenerDisponibilidad($idDisponibilidad);
        if (!$disponibilidad) {
            throw new Exception("La disponibilidad seleccionada no existe");
        }
        
        // Verificar plazas disponibles
        if ($disponibilidad->plazas_disponibles < $numeroPersonas) {
            throw new Exception("No hay suficientes plazas disponibles");
        }
          // Calcular precio total
        $recurso = RecursoTuristico::find($disponibilidad->id_recurso);
        $precioUnitario = $disponibilidad->precio_especial ?: $recurso->precio_base;
        $precioTotal = $precioUnitario * $numeroPersonas;
        
        // Iniciar transacción asegurándonos de que no haya otra activa
        $db = DatabaseConnection::getInstance();
        
        // Verificar si hay una transacción activa y cerrarla si es necesario
        try {
            $inTransaction = $db->inTransaction();
        } catch (PDOException $e) {
            $inTransaction = false;
        }
        
        if ($inTransaction) {
            $db->commit(); // Cerrar transacción previa si existe
        }
        
        $db->beginTransaction();
        
        try {
            // Crear la reserva
            $reserva = new Reserva([
                'id_usuario' => $idUsuario,
                'id_disponibilidad' => $idDisponibilidad,
                'numero_personas' => $numeroPersonas,
                'precio_total' => $precioTotal,
                'observaciones_usuario' => $observaciones,
                'estado' => 'confirmada',
                'fecha_confirmacion' => date('Y-m-d H:i:s')
            ]);
            
            if (!$reserva->save()) {
                throw new Exception("Error al guardar la reserva");
            }
            
            // Actualizar plazas disponibles
            $disponibilidad->plazas_disponibles -= $numeroPersonas;
            if (!$disponibilidad->save()) {
                throw new Exception("Error al actualizar plazas disponibles");
            }
            
            // Confirmar transacción
            $db->commit();
            
            return $reserva->numero_reserva;
            
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }
}
