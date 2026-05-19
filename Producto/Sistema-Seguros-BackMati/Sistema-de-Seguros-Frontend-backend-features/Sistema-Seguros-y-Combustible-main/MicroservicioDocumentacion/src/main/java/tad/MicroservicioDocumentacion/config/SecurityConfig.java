package tad.MicroservicioDocumentacion.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationConverter jwtAuthenticationConverter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Desactiva CSRF para APIs REST
                .csrf(AbstractHttpConfigurer::disable)

                // Define qué endpoints son públicos y cuáles requieren autenticación
                .authorizeHttpRequests(auth -> auth
                        // Swagger/OpenAPI público
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Health checks públicos
                        .requestMatchers("/actuator/**").permitAll()
                        // Rutas publicas para recepcion y visionado de documentos (fotos siniestro)
                        .requestMatchers(HttpMethod.POST, "/api/documentos/", "/api/documentos/upload").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/documentos/Archivo/**").permitAll()
                        // Todas las demás operaciones requieren autenticación
                        .anyRequest().authenticated())

                // Configura el microservicio como Resource Server utilizando JWT
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(jwtAuthenticationConverter)))

                // Evita la creación de sesiones (autenticación stateless)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }
}
