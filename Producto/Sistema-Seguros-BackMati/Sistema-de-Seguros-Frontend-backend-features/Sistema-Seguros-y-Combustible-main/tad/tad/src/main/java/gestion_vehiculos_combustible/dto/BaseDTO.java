package gestion_vehiculos_combustible.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BaseDTO {
    @JsonProperty("id_base")
    private Long id_base;
    @JsonProperty("nombre")
    private String nombre;
}
