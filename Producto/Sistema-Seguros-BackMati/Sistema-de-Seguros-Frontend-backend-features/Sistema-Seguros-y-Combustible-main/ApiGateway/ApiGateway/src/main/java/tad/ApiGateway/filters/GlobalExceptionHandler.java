package tad.ApiGateway.filters;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import tad.ApiGateway.dto.ErrorResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.ConnectException;

/**
 * Manejador global de excepciones para el API Gateway
 * Captura errores de conexión, timeouts y otros problemas
 */
@Slf4j
@Component
@Order(-2) // Mayor prioridad que el handler por defecto
public class GlobalExceptionHandler implements ErrorWebExceptionHandler {

    private final ObjectMapper objectMapper;

    public GlobalExceptionHandler() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        String path = exchange.getRequest().getURI().getPath();
        
        log.error("Error en Gateway para path {}: {}", path, ex.getMessage());
        
        HttpStatus status;
        String message;
        
        // Determinar tipo de error
        if (ex instanceof ConnectException || ex.getCause() instanceof ConnectException) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
            message = "Servicio no disponible. Por favor, intente más tarde.";
            log.error("Microservicio no disponible para: {}", path);
        } else if (ex.getMessage() != null && ex.getMessage().contains("Connection refused")) {
            status = HttpStatus.SERVICE_UNAVAILABLE;
            message = "No se pudo conectar con el servicio solicitado.";
        } else if (ex.getMessage() != null && ex.getMessage().contains("timeout")) {
            status = HttpStatus.GATEWAY_TIMEOUT;
            message = "Tiempo de espera agotado. El servicio no responde.";
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = "Error interno del servidor.";
            log.error("Error inesperado: ", ex);
        }
        
        return writeErrorResponse(exchange, status, message, path);
    }
    
    private Mono<Void> writeErrorResponse(ServerWebExchange exchange, HttpStatus status, String message, String path) {
        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        
        ErrorResponseDTO errorResponse = ErrorResponseDTO.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .build();
        
        String body;
        try {
            body = objectMapper.writeValueAsString(errorResponse);
        } catch (JsonProcessingException e) {
            body = String.format("{\"error\": \"%s\", \"status\": %d}", message, status.value());
        }
        
        return exchange.getResponse().writeWith(
                Mono.just(exchange.getResponse().bufferFactory().wrap(body.getBytes())));
    }
}
