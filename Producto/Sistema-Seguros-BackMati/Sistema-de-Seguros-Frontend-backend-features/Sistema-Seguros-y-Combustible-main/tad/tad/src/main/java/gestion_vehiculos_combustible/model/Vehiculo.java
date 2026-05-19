package gestion_vehiculos_combustible.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;



@Entity
@Table(name = "vehiculo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehiculo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_vehiculo")
    private Long id_vehiculo;

    @Column(name = "patente")
    private String patente;

    @Column(name = "marca")
    private String marca;

    @Column(name = "modelo")
    private String modelo;

    @Column(name = "anio")
    private int anio;

    @Column(name = "anio_registro")
    private int anioRegistro;

    @Column(name = "num_motor_veh")
    private String num_motor_veh;

    @Column(name = "num_chasis_veh")
    private String num_chasis_veh;

    @ManyToOne
    @JoinColumn(name = "id_tipo_vehiculo")
    private Tipovehiculo id_tipo_vehiculo;

    @ManyToOne
    @JoinColumn(name = "id_operacion")
    private Operaciones id_operacion;

    @Column(name = "id_poliza")
    private Long idPoliza;
    

}
