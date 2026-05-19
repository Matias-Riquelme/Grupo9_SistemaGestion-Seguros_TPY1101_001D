package MicroservicioIncidenteSiniestros.repositories;

import MicroservicioIncidenteSiniestros.entities.TokenFormularioPublico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenFormularioPublicoRepository extends JpaRepository<TokenFormularioPublico, String> {
    Optional<TokenFormularioPublico> findByToken(String token);
}
