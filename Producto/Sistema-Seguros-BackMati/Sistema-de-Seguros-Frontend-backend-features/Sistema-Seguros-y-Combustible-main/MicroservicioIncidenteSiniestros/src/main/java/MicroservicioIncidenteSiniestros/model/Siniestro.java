
package MicroservicioIncidenteSiniestros.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"formularioIncidente"})
@ToString(exclude = {"formularioIncidente"})
@Entity
@Table(name = "Siniestro")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Siniestro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sin")
    private Integer idSin;

    @Column(name = "fecha_hora_sin")
    private LocalDateTime fechaHoraSin;

    @Column(name = "deducible_apli_sin", precision = 12, scale = 2)
    private BigDecimal deducibleApliSin;

    @Column(name = "indemnizacion_sin", precision = 12, scale = 2)
    private BigDecimal indemnizacionSin;

    @Column(name = "numero_sin", length = 50)
    private String numeroSin;

    @Column(name = "costo_sin", precision = 12, scale = 2)
    private BigDecimal costoSin;

    @Column(name = "observacion", columnDefinition = "TEXT")
    private String observacion;

    @Column(name = "fecha_ultima_modificacion")
    private LocalDateTime fechaUltimaModificacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pol")
    private Poliza poliza;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estado")
    private EstadoSiniestro estadoSiniestro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_sin")
    private TipoSiniestro tipoSiniestro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cierre")
    private Cierre cierre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_form")
    private FormularioIncidente formularioIncidente;
}
