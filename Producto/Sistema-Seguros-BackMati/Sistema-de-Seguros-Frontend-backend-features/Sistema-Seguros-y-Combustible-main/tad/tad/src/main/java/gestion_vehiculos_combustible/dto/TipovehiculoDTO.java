package gestion_vehiculos_combustible.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipovehiculoDTO {
    @JsonProperty("id_tipo_vehiculo")
    private Long id_tipo_vehiculo;
    @JsonProperty("tipo_vehiculo")
    private String tipo_vehiculo;
}
