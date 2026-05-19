package MicroservicioIncidenteSiniestros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolizaDTO {
    private Integer idPol;
    private String nombrePol;
    private Integer numeroPol;
    private LocalDateTime fechaEmiPol;
    private LocalDateTime fechaIniPol;
    private LocalDateTime fechaFinPol;
    private LocalDateTime fechaVencPol;
    private BigDecimal primaPol;
    private String tipoMoneda;
    private String aseguradosAdi;
    private TipoPolizaDTO tipoPoliza;
    private AseguradoDTO asegurado;
    private ContratanteDTO contratante;
    private List<DeducibleDTO> deducibles;
    private List<CoberturaDTO> coberturas;
}
