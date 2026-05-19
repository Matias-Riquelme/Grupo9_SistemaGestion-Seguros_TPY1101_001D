package MicroservicioIncidenteSiniestros.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import MicroservicioIncidenteSiniestros.model.UbicacionIncidente;
import java.util.Optional;

@Repository
public interface UbicacionIncidenteRepository extends JpaRepository<UbicacionIncidente, Integer> {
    Optional<UbicacionIncidente> findByDescripcionUbi(String descripcionUbi);
}
