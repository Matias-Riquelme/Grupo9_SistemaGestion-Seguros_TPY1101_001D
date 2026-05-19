package MicroservicioIncidenteSiniestros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoCoberturaDTO {
    private Integer idTipoCobertura;
    private String nombre;
    private String descripcion;
    private Boolean activo;
}
