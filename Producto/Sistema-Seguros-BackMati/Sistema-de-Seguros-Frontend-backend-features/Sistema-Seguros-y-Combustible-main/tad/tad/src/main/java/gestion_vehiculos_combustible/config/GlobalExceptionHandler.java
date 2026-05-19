package gestion_vehiculos_combustible.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Map;

/**
 * Captura excepciones no controladas y las registra con el stack trace completo.
 * Así se puede ver en los logs la causa real del 500 (conductores, vehiculos, etc.).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(AuthenticationException ex) {
        log.error("Error de autenticación (JWT/Keycloak): {}", ex.getMessage());
        log.debug("Stack trace:", ex);
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Map.of(
                        "error", "Unauthorized",
                        "message", ex.getMessage() != null ? ex.getMessage() : "Token inválido o expirado"
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAnyException(Exception ex) {
        String stackTrace = getStackTrace(ex);
        log.error("Error interno en el microservicio: {} - {}", ex.getClass().getSimpleName(), ex.getMessage());
        log.error("Stack trace:\n{}", stackTrace);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error", "Internal Server Error",
                        "message", ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName(),
                        "type", ex.getClass().getSimpleName()
                ));
    }

    private static String getStackTrace(Exception ex) {
        StringWriter sw = new StringWriter();
        ex.printStackTrace(new PrintWriter(sw));
        return sw.toString();
    }
}
