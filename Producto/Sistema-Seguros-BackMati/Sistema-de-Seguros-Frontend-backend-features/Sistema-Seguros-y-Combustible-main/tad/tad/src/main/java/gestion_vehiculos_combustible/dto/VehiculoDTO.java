package gestion_vehiculos_combustible.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehiculoDTO {
    @JsonProperty("id_vehiculo")
    private Long id_vehiculo;

    @JsonProperty("patente")
    private String patente;

    @JsonProperty("marca")
    private String marca;

    @JsonProperty("modelo")
    private String modelo;

    @JsonProperty("id_tipo_vehiculo")
    private Long id_tipo_vehiculo;

    @JsonProperty("anio")
    private int anio;

    @JsonProperty("anioRegistro")
    private int anioRegistro;

    @JsonProperty("num_motor_veh")
    private String num_motor_veh;

    @JsonProperty("num_chasis_veh")
    private String num_chasis_veh;

    @JsonProperty("idPoliza")
    private Long idPoliza;

    @JsonProperty("id_operacion")
    private Long id_operacion;
}
