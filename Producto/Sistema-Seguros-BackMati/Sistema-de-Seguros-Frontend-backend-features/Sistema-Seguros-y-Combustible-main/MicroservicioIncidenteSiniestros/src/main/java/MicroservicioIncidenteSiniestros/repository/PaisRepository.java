package MicroservicioIncidenteSiniestros.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import MicroservicioIncidenteSiniestros.model.Pais;

@Repository
public interface PaisRepository extends JpaRepository<Pais, Integer> {
}
