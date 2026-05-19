package MicroservicioIncidenteSiniestros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadoSiniestroDTO {
    private Integer idEstado;
    private String nombreEstado;
}
