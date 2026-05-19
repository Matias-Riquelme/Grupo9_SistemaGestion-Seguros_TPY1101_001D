package MicroservicioIncidenteSiniestros.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;
//Configuracion para poner la token del usuario por swagger
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Microservicio Incidentes y Siniestros API",
        version = "1.0",
        description = "API para gestión de incidentes, siniestros, pólizas y entidades relacionadas",
        contact = @Contact(name = "TAD", email = "soporte@tad.com")
    ),
    security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "Ingresa tu token JWT de Keycloak (sin el prefijo 'Bearer')"
)
public class OpenApiConfig {
}
