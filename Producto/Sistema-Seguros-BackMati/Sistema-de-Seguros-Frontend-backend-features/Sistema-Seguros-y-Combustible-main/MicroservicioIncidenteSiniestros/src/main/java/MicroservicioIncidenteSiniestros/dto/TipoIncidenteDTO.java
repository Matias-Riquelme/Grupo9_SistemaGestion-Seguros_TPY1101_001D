package MicroservicioIncidenteSiniestros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoIncidenteDTO {
    private Integer idTipoIncidente;
    private String nombreTipoIncidente;
    private String categoria;
}
