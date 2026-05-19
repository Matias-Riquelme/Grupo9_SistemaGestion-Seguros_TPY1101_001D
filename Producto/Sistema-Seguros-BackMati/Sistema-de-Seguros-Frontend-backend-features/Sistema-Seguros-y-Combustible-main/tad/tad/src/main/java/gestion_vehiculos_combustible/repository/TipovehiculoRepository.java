package gestion_vehiculos_combustible.repository;

import gestion_vehiculos_combustible.model.Tipovehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TipovehiculoRepository extends JpaRepository<Tipovehiculo, Long> {
    @Query("SELECT t FROM Tipovehiculo t WHERE t.tipo_vehiculo = :tipo_vehiculo")
    Optional<Tipovehiculo> findByTipoVehiculoNombre(@Param("tipo_vehiculo") String tipoVehiculo);
}
