package MicroservicioIncidenteSiniestros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UbicacionIncidenteDTO {
    private Integer idUbicacion;
    private String descripcionUbi;
    private ComunaDTO comuna;
}
