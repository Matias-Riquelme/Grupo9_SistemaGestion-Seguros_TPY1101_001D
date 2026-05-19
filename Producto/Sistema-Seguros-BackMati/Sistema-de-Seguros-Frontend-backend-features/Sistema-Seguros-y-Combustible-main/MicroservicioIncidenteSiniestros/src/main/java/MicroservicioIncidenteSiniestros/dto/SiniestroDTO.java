package MicroservicioIncidenteSiniestros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SiniestroDTO {
    private Integer idSin;
    private LocalDateTime fechaHoraSin;
    private BigDecimal deducibleApliSin;
    private BigDecimal indemnizacionSin;
    private String numeroSin;
    private BigDecimal costoSin;
    private String observacion;
    private LocalDateTime fechaUltimaModificacion;
    private PolizaDTO poliza;
    private EstadoSiniestroDTO estadoSiniestro;
    private TipoSiniestroDTO tipoSiniestro;
    private CierreDTO cierre;
    private FormularioIncidenteDTO formularioIncidente;
}
