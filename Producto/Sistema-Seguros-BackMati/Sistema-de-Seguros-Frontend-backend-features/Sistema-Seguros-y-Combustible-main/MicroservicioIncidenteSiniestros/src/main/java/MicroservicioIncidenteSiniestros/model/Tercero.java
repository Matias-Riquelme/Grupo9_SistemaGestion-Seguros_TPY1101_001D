package MicroservicioIncidenteSiniestros.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"formularioIncidente"})
@ToString(exclude = {"formularioIncidente"})
@Entity
@Table(name = "Tercero")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Tercero {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tercero")
    private Integer idTercero;

    @Column(name = "rut_ter", length = 20)
    private String rutTer;

    @Column(name = "nombre_ter", length = 100)
    private String nombreTer;

    @Column(name = "telefono_ter", length = 20)
    private String telefonoTer;

    @Column(name = "email_ter", length = 100)
    private String emailTer;

    @Column(name = "aseguradora_ter", length = 100)
    private String aseguradoraTer;

    @Column(name = "numero_sin_ter", length = 50)
    private String numeroSinTer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_form")
    @JsonBackReference("formulario-terceros")
    private FormularioIncidente formularioIncidente;
}
