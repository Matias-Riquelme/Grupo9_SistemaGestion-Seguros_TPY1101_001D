package MicroservicioIncidenteSiniestros.repository;

import MicroservicioIncidenteSiniestros.model.TipoDeducible;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoDeducibleRepository extends JpaRepository<TipoDeducible, Integer> {
    boolean existsByNombre(String nombre);
}
