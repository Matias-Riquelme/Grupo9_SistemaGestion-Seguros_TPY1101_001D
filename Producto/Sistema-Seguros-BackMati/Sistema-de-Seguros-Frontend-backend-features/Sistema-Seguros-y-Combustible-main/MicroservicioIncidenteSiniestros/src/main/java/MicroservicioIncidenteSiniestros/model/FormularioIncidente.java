package MicroservicioIncidenteSiniestros.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"siniestros", "terceros"})
@ToString(exclude = {"siniestros", "terceros"})
@Entity
@Table(name = "Formulario_Incidente")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FormularioIncidente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_form")
    private Integer idForm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ubicacion")
    private UbicacionIncidente ubicacion;

    @Column(name = "id_usuario") // ID de Keycloak (id_user en tabla Usuario)
    private String idUsuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_incidente")
    private TipoIncidente tipoIncidente;

    @Column(name = "id_tipo_vehiculo") // ID del tipo de vehículo (viene de otro microservicio)
    private Integer idTipoVehiculo;

    @Column(name = "fecha_ingreso_form")
    private LocalDateTime fechaIngresoForm;

    @Column(name = "fecha_hora_incidente")
    private LocalDateTime fechaHoraIncidente;

    @Column(name = "relato_form", length = 500)
    private String relatoForm;

    @Column(name = "patente_1", length = 20)
    private String patente1;

    @Column(name = "patente_2", length = 20)
    private String patente2;

    @Column(name = "nombre_conductor", length = 100)
    private String nombreConductor;

    @Column(name = "rut_conductor", length = 20)
    private String rutConductor;

    @Column(name = "base", length = 100)
    private String base;

    @Column(name = "operacion", length = 100)
    private String operacion;

    @Column(name = "lugar_carga", length = 100)
    private String lugarCarga;

    @Column(name = "fecha_ini_transporte_carga")
    private LocalDateTime fechaIniTransporteCarga;

    @Column(name = "destino_carga", length = 100)
    private String destinoCarga;


    // Relación inversa con Siniestro (un formulario puede estar asociado a múltiples siniestros)
    @OneToMany(mappedBy = "formularioIncidente", fetch = FetchType.LAZY)
    @JsonIgnore  // Evita ciclo infinito en serialización JSON
    private Set<Siniestro> siniestros;

    // Relación con terceros involucrados (un formulario puede tener múltiples terceros)
    @OneToMany(mappedBy = "formularioIncidente", fetch = FetchType.LAZY)
    @JsonManagedReference("formulario-terceros")
    private Set<Tercero> terceros;

}
