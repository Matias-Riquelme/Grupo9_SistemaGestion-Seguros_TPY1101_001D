package MicroservicioIncidenteSiniestros.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormularioIncidenteDTO {
    private Integer idForm;
    private UbicacionIncidenteDTO ubicacion;
    private String idUsuario;
    private TipoIncidenteDTO tipoIncidente;
    private Integer idTipoVehiculo;
    private LocalDateTime fechaIngresoForm;
    private LocalDateTime fechaHoraIncidente;
    private String relatoForm;
    private String patente1;
    private String patente2;
    private String nombreConductor;
    private String rutConductor;
    private String base;
    private String operacion;
    private String lugarCarga;
    private LocalDateTime fechaIniTransporteCarga;
    private String destinoCarga;
    private List<Integer> idsSiniestros;
    private String numerosSiniestros;  // String con números separados por coma
    private List<TerceroDTO> terceros;
}
