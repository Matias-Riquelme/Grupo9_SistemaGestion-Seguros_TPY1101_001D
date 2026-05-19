package MicroservicioIncidenteSiniestros.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import MicroservicioIncidenteSiniestros.model.TipoPoliza;
import java.util.Optional;

@Repository
public interface TipoPolizaRepository extends JpaRepository<TipoPoliza, Integer> {
    Optional<TipoPoliza> findByNomTipoPol(String nomTipoPol);
}
