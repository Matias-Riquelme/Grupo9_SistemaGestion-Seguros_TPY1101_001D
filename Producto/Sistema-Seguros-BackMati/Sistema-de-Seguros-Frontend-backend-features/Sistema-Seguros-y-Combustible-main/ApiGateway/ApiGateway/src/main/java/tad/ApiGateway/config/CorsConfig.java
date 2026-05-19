package tad.ApiGateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuración de CORS para Spring Cloud Gateway (WebFlux/Reactivo)
 * Permite peticiones desde los frontends configurados
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        
        // Orígenes permitidos (frontends)
        corsConfig.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",    // React
                "http://localhost:5173",    // Vite
                "http://localhost:8080"     // Mismo origen
        ));
        
        // Métodos HTTP permitidos
        corsConfig.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // Headers permitidos
        corsConfig.setAllowedHeaders(List.of("*"));
        
        // Headers expuestos al cliente
        corsConfig.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-User-ID",
                "X-User-Email",
                "X-User-Name",
                "X-User-Roles"
        ));
        
        // Permitir cookies/credenciales
        corsConfig.setAllowCredentials(true);
        
        // Tiempo de cache para preflight requests (1 hora)
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
