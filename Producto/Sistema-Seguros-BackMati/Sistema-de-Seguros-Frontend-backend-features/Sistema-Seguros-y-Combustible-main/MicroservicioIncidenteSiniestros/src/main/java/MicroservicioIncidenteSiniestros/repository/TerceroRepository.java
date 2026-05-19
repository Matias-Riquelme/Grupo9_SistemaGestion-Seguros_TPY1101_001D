package MicroservicioIncidenteSiniestros.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import MicroservicioIncidenteSiniestros.model.Tercero;

@Repository
public interface TerceroRepository extends JpaRepository<Tercero, Integer> {
    List<Tercero> findByFormularioIncidente_IdForm(Integer idForm);
}
