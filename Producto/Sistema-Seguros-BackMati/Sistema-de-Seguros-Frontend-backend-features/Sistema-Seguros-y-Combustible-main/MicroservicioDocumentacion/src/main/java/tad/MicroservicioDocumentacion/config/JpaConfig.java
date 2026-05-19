package tad.MicroservicioDocumentacion.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "tad.MicroservicioDocumentacion.repository")
public class JpaConfig {
    // Esta clase solo sirve para activar los repositorios.
    // Al sacarla del Main, el test (@WebMvcTest) ya no la cargará por error.
}