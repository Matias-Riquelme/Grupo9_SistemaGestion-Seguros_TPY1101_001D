package MicroservicioIncidenteSiniestros.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import MicroservicioIncidenteSiniestros.model.FormularioIncidente;

@Repository
public interface FormularioIncidenteRepository extends JpaRepository<FormularioIncidente, Integer> {

    // Consulta para obtener todos los formularios con sus relaciones eagerly loaded
    @Query("SELECT DISTINCT f FROM FormularioIncidente f " +
           "LEFT JOIN FETCH f.ubicacion u " +
           "LEFT JOIN FETCH u.comuna c " +
           "LEFT JOIN FETCH c.region r " +
           "LEFT JOIN FETCH r.pais " +
           "LEFT JOIN FETCH f.tipoIncidente " +
           "LEFT JOIN FETCH f.terceros " +
           "LEFT JOIN FETCH f.siniestros")
    public List<FormularioIncidente> findAllWithRelations();

    // Consulta para contar todos los formularios asociados a un siniestro específico
    @Query("SELECT COUNT(DISTINCT f) FROM FormularioIncidente f JOIN f.siniestros s WHERE s.idSin = :siniestroId")
    public Long countBySiniestroIdSin(@Param("siniestroId") Integer siniestroId);

    // Consulta para obtener todos los formularios asociados a un siniestro específico
    @Query("SELECT DISTINCT f FROM FormularioIncidente f JOIN f.siniestros s WHERE s.idSin = :siniestroId")
    public List<FormularioIncidente> findBySiniestroIdSin(@Param("siniestroId") Integer siniestroId);

}
