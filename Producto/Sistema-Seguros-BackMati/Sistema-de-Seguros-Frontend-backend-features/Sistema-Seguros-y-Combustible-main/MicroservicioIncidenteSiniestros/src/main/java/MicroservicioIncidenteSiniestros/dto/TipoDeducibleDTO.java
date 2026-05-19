package MicroservicioIncidenteSiniestros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoDeducibleDTO {
    private Integer idTipoDeducible;
    private String nombre;
    private String descripcion;
    private Boolean activo;
}
