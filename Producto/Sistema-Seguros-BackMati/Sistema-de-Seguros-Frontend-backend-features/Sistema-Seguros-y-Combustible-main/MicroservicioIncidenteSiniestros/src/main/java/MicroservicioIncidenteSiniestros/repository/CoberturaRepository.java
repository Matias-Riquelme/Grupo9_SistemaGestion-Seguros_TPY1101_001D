package MicroservicioIncidenteSiniestros.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import MicroservicioIncidenteSiniestros.model.Cobertura;
import java.util.List;

@Repository

public interface CoberturaRepository extends JpaRepository<Cobertura, Integer> {
	List<Cobertura> findByPoliza_IdPol(Integer idPol);
}
