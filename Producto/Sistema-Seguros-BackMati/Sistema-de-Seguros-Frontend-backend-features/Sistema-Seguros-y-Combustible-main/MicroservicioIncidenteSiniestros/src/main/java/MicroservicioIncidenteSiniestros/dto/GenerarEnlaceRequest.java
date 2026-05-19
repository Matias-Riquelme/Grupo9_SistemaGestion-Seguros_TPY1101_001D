package MicroservicioIncidenteSiniestros.dto;

import lombok.Data;

@Data
public class GenerarEnlaceRequest {
    private Long conductorId;
    private Long vehiculoId;
    private String tipoSiniestro;
}
