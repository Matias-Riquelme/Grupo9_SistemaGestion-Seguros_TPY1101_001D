package gestion_vehiculos_combustible.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import java.io.IOException;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@Slf4j
public class SecurityConfig {

    private final JwtAuthenticationConverter jwtAuthenticationConverter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CORS: permite preflight OPTIONS y header Authorization desde Swagger/otros orígenes
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Desactiva CSRF para APIs REST
                .csrf(AbstractHttpConfigurer::disable)

                // Respuestas 401/403 en JSON para depuración
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            log.warn("No autenticado: {} - {}", request.getRequestURI(), authException.getMessage());
                            writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized",
                                    authException.getMessage() != null ? authException.getMessage() : "Token inválido o expirado");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            log.warn("Acceso denegado: {} - {}", request.getRequestURI(), accessDeniedException.getMessage());
                            writeJsonError(response, HttpServletResponse.SC_FORBIDDEN, "Forbidden",
                                    accessDeniedException.getMessage() != null ? accessDeniedException.getMessage() : "Sin permisos");
                        }))

                // Define qué endpoints son públicos y cuáles requieren autenticación
                .authorizeHttpRequests(auth -> auth
                        // Preflight CORS: OPTIONS sin auth para que el navegador envíe luego el request con token
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Swagger/OpenAPI público
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Health checks públicos
                        .requestMatchers("/actuator/**").permitAll()
                        // Todas las demás operaciones requieren autenticación
                        .anyRequest().authenticated())

                // Configura el microservicio como Resource Server utilizando JWT
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(jwtAuthenticationConverter))
                        .authenticationEntryPoint((request, response, authException) -> {
                            log.warn("Error JWT en {}: {}", request.getRequestURI(), authException.getMessage());
                            writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized",
                                    authException.getMessage() != null ? authException.getMessage() : "Token inválido o Keycloak no accesible");
                        }))

                // Evita la creación de sesiones (autenticación stateless)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    private static void writeJsonError(HttpServletResponse response, int status, String error, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        Map<String, Object> body = Map.of("error", error, "message", message != null ? message : "");
        new ObjectMapper().writeValue(response.getOutputStream(), body);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        config.setExposedHeaders(List.of("Authorization"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
