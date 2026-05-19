package gestion_vehiculos_combustible.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolizaDTO {

    @JsonProperty("id_pol")
    private Integer id_pol;

    @JsonProperty("numero_pol")
    private Integer numero_pol;

    @JsonProperty("nombre_pol")
    private String nombre_pol;
}

