package MicroservicioIncidenteSiniestros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CierreDTO {
    private Integer idCierre;
    private LocalDateTime fechaCierre;
    private String motivoCierre;
}
