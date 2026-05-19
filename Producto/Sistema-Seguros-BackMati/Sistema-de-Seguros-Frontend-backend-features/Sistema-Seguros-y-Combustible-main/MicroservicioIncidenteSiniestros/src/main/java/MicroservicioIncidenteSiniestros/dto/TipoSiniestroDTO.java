package MicroservicioIncidenteSiniestros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoSiniestroDTO {
    private Integer idTipoSin;
    private String nombreTipoSiniestro;
    private String descTipoSiniestro;
}
