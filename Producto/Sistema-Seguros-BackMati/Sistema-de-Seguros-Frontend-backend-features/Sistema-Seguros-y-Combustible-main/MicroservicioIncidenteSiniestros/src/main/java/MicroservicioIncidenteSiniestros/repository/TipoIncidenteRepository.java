package MicroservicioIncidenteSiniestros.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import MicroservicioIncidenteSiniestros.model.TipoIncidente;
import java.util.Optional;

@Repository
public interface TipoIncidenteRepository extends JpaRepository<TipoIncidente, Integer> {
    Optional<TipoIncidente> findByNombreTipoIncidente(String nombreTipoIncidente);
}
