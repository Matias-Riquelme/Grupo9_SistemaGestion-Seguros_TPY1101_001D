package MicroservicioIncidenteSiniestros.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import MicroservicioIncidenteSiniestros.model.Deducible;

import java.util.List;


@Repository

public interface DeducibleRepository extends JpaRepository<Deducible, Integer> {
	List<Deducible> findByPoliza_IdPol(Integer idPol);
}
