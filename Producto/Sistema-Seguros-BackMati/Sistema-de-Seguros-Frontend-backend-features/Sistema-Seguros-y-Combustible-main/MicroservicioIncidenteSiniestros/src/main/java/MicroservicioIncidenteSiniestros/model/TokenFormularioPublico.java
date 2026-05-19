package MicroservicioIncidenteSiniestros.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokens_formulario_publico")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TokenFormularioPublico {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, unique = true)
    private String token;           // UUID aleatorio

    @Column(nullable = true)
    private Long conductorId;

    @Column(nullable = true)
    private Long vehiculoId;

    private String tipoSiniestro;   // Opcional

    @Column(nullable = false)
    private LocalDateTime creadoEn;

    @Column(nullable = false)
    private LocalDateTime expiraEn; // creadoEn + 24h

    @Column(nullable = false)
    private boolean utilizado;      // true una vez que el conductor envió el formulario
}
