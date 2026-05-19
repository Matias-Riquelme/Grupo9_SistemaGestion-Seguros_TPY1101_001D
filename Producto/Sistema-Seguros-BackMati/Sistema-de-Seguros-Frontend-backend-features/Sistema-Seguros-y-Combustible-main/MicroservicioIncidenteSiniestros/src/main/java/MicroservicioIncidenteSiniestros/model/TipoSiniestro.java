package MicroservicioIncidenteSiniestros.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Tipo_Siniestro")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TipoSiniestro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_sin")
    private Integer idTipoSin;

    @Column(name = "nombre_tipo_sin", length = 100)
    private String nombreTipoSiniestro;

    @Column(name = "desc_tipo_sin", length = 100)
    private String descTipoSiniestro;
}
