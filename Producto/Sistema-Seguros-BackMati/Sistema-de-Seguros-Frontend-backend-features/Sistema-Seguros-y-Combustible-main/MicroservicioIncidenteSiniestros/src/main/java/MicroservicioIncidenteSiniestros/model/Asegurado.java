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
@Table(name = "Asegurado")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Asegurado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_asegurado")
    private Integer idAsegurado;

    @Column(name = "razon_social_ase", length = 150)
    private String razonSocialAse;

    @Column(name = "rut_ase", length = 20)
    private String rutAse;
}
