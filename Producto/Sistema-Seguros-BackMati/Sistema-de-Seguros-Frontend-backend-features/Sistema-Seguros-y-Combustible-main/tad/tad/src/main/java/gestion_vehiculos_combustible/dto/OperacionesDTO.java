package gestion_vehiculos_combustible.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OperacionesDTO {
    @JsonProperty("id_operacion")
    private Long id_operacion;
    
    @JsonProperty("nombre")
    private String nombre;
    
    @JsonProperty("id_base")
    private Long id_base;
}
