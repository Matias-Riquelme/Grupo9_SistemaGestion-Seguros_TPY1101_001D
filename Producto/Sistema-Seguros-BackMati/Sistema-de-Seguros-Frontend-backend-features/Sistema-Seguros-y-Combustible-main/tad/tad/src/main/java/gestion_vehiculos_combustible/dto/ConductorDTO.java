package gestion_vehiculos_combustible.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConductorDTO {
    @JsonProperty("id_conductor")
    private Long id_conductor;
    @JsonProperty("primerNombre")
    private String primerNombre;
    @JsonProperty("segundoNombre")
    private String segundoNombre;
    @JsonProperty("apellidoPaterno")
    private String apellidoPaterno;
    @JsonProperty("apellidoMaterno")
    private String apellidoMaterno;
    @JsonProperty("rut")
    private String rut;
    @JsonProperty("telefono")
    private String telefono;
    @JsonProperty("direccion")
    private String direccion;
}
