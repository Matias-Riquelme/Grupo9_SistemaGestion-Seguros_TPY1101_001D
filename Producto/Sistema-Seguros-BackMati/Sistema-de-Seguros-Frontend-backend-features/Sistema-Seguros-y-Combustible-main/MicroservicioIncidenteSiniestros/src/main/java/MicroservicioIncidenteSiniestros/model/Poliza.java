
package MicroservicioIncidenteSiniestros.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Poliza")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Poliza {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pol")
    private Integer idPol;

    @Column(name = "nombre_pol", length = 100)
    private String nombrePol;

    @Column(name = "numero_pol")
    private Integer numeroPol;

    @Column(name = "fecha_emi_pol")
    private LocalDateTime fechaEmiPol;

    @Column(name = "fecha_ini_pol")
    private LocalDateTime fechaIniPol;

    @Column(name = "fecha_fin_pol")
    private LocalDateTime fechaFinPol;

    @Column(name = "fecha_venc_pol")
    private LocalDateTime fechaVencPol;

    @Column(name = "prima_pol", precision = 12, scale = 2)
    private BigDecimal primaPol;

    @Column(name = "tipo_moneda", length = 10)
    private String tipoMoneda;

    @Column(name = "asegurados_adi", length = 200)
    private String aseguradosAdi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_pol")
    private TipoPoliza tipoPoliza;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_asegurado")
    private Asegurado asegurado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_contratante")
    private Contratante contratante;

    @OneToMany(mappedBy = "poliza", fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Deducible> deducibles;

    @OneToMany(mappedBy = "poliza", fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Cobertura> coberturas;
}
