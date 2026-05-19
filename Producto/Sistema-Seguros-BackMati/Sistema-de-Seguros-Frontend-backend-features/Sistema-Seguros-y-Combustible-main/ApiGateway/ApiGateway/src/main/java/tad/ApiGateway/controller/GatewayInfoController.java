package tad.ApiGateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller para información y estado del API Gateway
 * NO maneja lógica de negocio - solo información del sistema
 */
@RestController
@RequestMapping("/api/gateway")
public class GatewayInfoController {

    @Value("${spring.application.name}")
    private String applicationName;

    /**
     * Información básica del Gateway
     */
    @GetMapping("/info")
    public Mono<ResponseEntity<Map<String, Object>>> getInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("application", applicationName);
        info.put("status", "UP");
        info.put("timestamp", LocalDateTime.now().toString());
        info.put("version", "1.0.0");
        
        return Mono.just(ResponseEntity.ok(info));
    }

    /**
     * Lista de rutas disponibles
     */
    @GetMapping("/routes-info")
    public Mono<ResponseEntity<Map<String, Object>>> getRoutesInfo() {
        Map<String, Object> routes = new HashMap<>();
        
        routes.put("usuarios", Map.of(
                "service", "usuario-service:8081",
                "endpoints", new String[]{"/keycloak/user/**", "/keycloak/roles/**"}
        ));
        
        routes.put("vehiculos-combustible", Map.of(
                "service", "vehiculo-combustible-service:8083",
                "endpoints", new String[]{
                        "/api/vehiculos/**", "/api/combustible/**",
                        "/api/conductores/**", "/api/maquinas/**",
                        "/api/operaciones/**", "/api/bases/**"
                }
        ));
        
        routes.put("incidentes-polizas", Map.of(
                "service", "incidentes-service:8082",
                "endpoints", new String[]{
                        "/api/poliza/**", "/api/siniestro/**",
                        "/api/cobertura/**", "/api/incidente/**"
                }
        ));
        
        routes.put("documentacion", Map.of(
                "service", "documentacion-service:8084",
                "endpoints", new String[]{"/api/documentos/**", "/api/archivos/**", "/api/storage/**"}
        ));
        
        return Mono.just(ResponseEntity.ok(routes));
    }
}
