package MicroservicioIncidenteSiniestros.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import MicroservicioIncidenteSiniestros.model.Siniestro;

@Repository
public interface SiniestroRepository extends JpaRepository<Siniestro, Integer> {

    // Consulta para listar siniestros con todas las relaciones cargadas
    @Query("SELECT DISTINCT s FROM Siniestro s " +
           "LEFT JOIN FETCH s.poliza p " +
           "LEFT JOIN FETCH p.tipoPoliza " +
           "LEFT JOIN FETCH p.asegurado " +
           "LEFT JOIN FETCH p.contratante " +
           "LEFT JOIN FETCH s.estadoSiniestro " +
           "LEFT JOIN FETCH s.tipoSiniestro " +
           "LEFT JOIN FETCH s.cierre " +
           "LEFT JOIN FETCH s.formularioIncidente f " +
           "LEFT JOIN FETCH f.ubicacion u " +
           "LEFT JOIN FETCH u.comuna c " +
           "LEFT JOIN FETCH c.region r " +
           "LEFT JOIN FETCH r.pais " +
           "LEFT JOIN FETCH f.tipoIncidente")
    List<Siniestro> findAllWithRelations();

    // Consulta para ver cuantos siniestros ocurrieron el mes
    @Query("SELECT COUNT(s) FROM Siniestro s WHERE MONTH(s.fechaHoraSin) = :month AND YEAR(s.fechaHoraSin) = :year")
    Long countByMonthAndYear(@Param("month") Integer month, @Param("year") Integer year);

    // Consulta para ver cuantos siniestros ocurrieron el año
    @Query("SELECT COUNT(s) FROM Siniestro s WHERE YEAR(s.fechaHoraSin) = :year")
    Long countByYear(@Param("year") Integer year);

    // Consulta para ver la cantidad de polizas activadas de un siniestro
    Long countByPolizaIdPol(Integer polizaId);

    // Consulta para ver la cantidad de siniestros relacionado a un incidente
    Long countByFormularioIncidenteIdForm(Integer incidenteId);

    // Buscar siniestros por formulario de incidente
    List<Siniestro> findByFormularioIncidente_IdForm(Integer idForm);

}
