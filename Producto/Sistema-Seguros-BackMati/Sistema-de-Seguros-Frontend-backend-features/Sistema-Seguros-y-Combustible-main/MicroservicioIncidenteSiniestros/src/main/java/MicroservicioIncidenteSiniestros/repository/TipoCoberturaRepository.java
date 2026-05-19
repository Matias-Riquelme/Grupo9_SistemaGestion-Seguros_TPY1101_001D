package MicroservicioIncidenteSiniestros.repository;

import MicroservicioIncidenteSiniestros.model.TipoCobertura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TipoCoberturaRepository extends JpaRepository<TipoCobertura, Integer> {
    boolean existsByNombre(String nombre);
}
