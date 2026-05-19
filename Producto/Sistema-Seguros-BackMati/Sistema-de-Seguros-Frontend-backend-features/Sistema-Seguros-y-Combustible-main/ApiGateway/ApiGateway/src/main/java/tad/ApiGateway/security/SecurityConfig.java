package tad.ApiGateway.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * Configuración de seguridad para Spring Cloud Gateway (WebFlux/Reactivo)
 * 
 * NOTA: La validación de JWT se hace en KeycloakAuthenticationFilter (GlobalFilter)
 * Esta configuración solo define las reglas básicas de seguridad
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                // Desactivar CSRF (APIs REST stateless)
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                
                // Permitir todas las rutas - la autenticación se maneja en KeycloakAuthenticationFilter
                .authorizeExchange(exchanges -> exchanges
                        .anyExchange().permitAll()
                )
                
                // Desactivar el formulario de login por defecto
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                
                // Desactivar HTTP Basic
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                
                .build();
    }
}
