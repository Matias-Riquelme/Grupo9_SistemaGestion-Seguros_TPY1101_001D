package MicroservicioIncidenteSiniestros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContratanteDTO {
    private Integer idContratante;
    private String razonSocialContra;
    private String rutContra;
}
