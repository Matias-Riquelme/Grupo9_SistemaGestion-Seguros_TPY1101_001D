package MicroservicioIncidenteSiniestros.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import MicroservicioIncidenteSiniestros.model.Contratante;
import java.util.Optional;

@Repository
public interface ContratanteRepository extends JpaRepository<Contratante, Integer> {
    Optional<Contratante> findByRazonSocialContra(String razonSocialContra);
}
