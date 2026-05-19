package MicroservicioIncidenteSiniestros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AseguradoDTO {
    private Integer idAsegurado;
    private String razonSocialAse;
    private String rutAse;
}
