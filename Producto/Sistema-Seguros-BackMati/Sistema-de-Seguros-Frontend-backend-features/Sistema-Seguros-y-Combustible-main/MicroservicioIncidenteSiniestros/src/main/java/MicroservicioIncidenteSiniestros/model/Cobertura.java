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
@Table(name = "Cobertura")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Cobertura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cobertura")
    private Integer idCobertura;

    @Column(name = "descripcion_cob", length = 200)
    private String descripcionCob;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pol")
    @JsonBackReference
    private Poliza poliza;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_cobertura")
    private TipoCobertura tipoCobertura;

   
}
