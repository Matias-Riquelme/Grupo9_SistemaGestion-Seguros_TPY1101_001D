package MicroservicioIncidenteSiniestros.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Deducible")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Deducible {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dedu")
    private Integer idDedu;

    @Column(name = "nombre_dedu", length = 100)
    private String nombreDedu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pol")
    @JsonBackReference
    private Poliza poliza;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_deducible")
    private TipoDeducible tipoDeducible;

}
