package MicroservicioIncidenteSiniestros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TerceroDTO {
    private Integer idTercero;
    private String rutTer;
    private String nombreTer;
    private String telefonoTer;
    private String emailTer;
    private String aseguradoraTer;
    private String numeroSinTer;
    private Integer idFormularioIncidente;
}
