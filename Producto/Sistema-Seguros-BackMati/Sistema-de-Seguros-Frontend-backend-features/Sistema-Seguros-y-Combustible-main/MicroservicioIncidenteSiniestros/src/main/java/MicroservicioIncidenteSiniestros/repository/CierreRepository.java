package MicroservicioIncidenteSiniestros.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import MicroservicioIncidenteSiniestros.model.Cierre;
import java.util.Optional;

@Repository
public interface CierreRepository extends JpaRepository<Cierre, Integer> {
    Optional<Cierre> findByMotivoCierre(String motivoCierre);
}
