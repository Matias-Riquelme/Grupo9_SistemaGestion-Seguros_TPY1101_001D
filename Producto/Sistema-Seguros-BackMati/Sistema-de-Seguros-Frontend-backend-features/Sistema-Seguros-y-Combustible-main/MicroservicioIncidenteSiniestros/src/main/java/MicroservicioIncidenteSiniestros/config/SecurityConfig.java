package MicroservicioIncidenteSiniestros.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
        // Configuración central de Spring Security: define rutas públicas, protegidas y
        // validación JWT

        private final JwtAuthenticationConverter jwtAuthenticationConverter;

        // Es

        @Bean
        // Define la cadena de filtros de seguridad de la aplicación
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                // Desactiva CSRF para APIs REST
                                .csrf(AbstractHttpConfigurer::disable)

                                // Define qué endpoints son públicos y cuáles requieren autenticación
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                // Health checks públicos
                                                .requestMatchers("/actuator/**").permitAll()
                                                // Swagger UI y OpenAPI
                                                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/swagger-resources/**", "/webjars/**").permitAll()
                                                // Rutas publicas de formulario
                                                .requestMatchers(HttpMethod.GET, "/api/formulario-publico/validar/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/formulario-publico/enviar/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/tercero/publico/crear").permitAll()
                                                // Todas las demás rutas requieren autenticación (roles se validan con @PreAuthorize)
                                                .requestMatchers(HttpMethod.GET, "/api/tipo-incidente/listar", "/api/base/listar", "/api/operacion/listar", "/api/tipo-vehiculo/listar", "/api/comuna/listar", "/api/pais/listar", "/api/region/listar").permitAll()
                                                .anyRequest().authenticated())

                                // Configura el microservicio como Resource Server utilizando JWT
                                .oauth2ResourceServer(oauth2 -> oauth2
                                                .jwt(jwt -> jwt
                                                                .jwtAuthenticationConverter(
                                                                                jwtAuthenticationConverter)))

                                // Evita la creación de sesiones (autenticación stateless)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

                return http.build();
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
