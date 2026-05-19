package MicroservicioIncidenteSiniestros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoberturaDTO {
    private Integer idCobertura;
    private String descripcionCob;
    private Integer idPoliza;
    private TipoCoberturaDTO tipoCobertura;
}
