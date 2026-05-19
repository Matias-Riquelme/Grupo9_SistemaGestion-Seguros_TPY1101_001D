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
@Table(name = "Tipo_Incidente")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TipoIncidente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_incidente")
    private Integer idTipoIncidente;

    @Column(name = "nombre_tipo_incidente", nullable = false, length = 100)
    private String nombreTipoIncidente;

    @Column(name = "categoria", nullable = false, length = 50)
    private String categoria;
}
