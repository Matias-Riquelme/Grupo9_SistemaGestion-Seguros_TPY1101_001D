package MicroservicioIncidenteSiniestros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeducibleDTO {
    private Integer idDedu;
    private String nombreDedu;
    private Integer idPoliza;
    private TipoDeducibleDTO tipoDeducible;
}
