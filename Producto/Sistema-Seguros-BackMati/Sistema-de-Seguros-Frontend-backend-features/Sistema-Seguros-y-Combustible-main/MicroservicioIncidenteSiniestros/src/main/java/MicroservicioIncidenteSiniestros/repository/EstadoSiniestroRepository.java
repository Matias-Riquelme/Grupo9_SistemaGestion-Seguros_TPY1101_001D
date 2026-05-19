package MicroservicioIncidenteSiniestros.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import MicroservicioIncidenteSiniestros.model.EstadoSiniestro;
import java.util.Optional;

@Repository
public interface EstadoSiniestroRepository extends JpaRepository<EstadoSiniestro, Integer> {
    Optional<EstadoSiniestro> findByNombreEstado(String nombreEstado);
}
