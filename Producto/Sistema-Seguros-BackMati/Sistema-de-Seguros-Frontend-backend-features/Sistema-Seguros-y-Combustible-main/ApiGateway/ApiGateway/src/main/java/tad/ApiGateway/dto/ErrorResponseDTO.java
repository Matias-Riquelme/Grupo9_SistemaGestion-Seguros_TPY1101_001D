package tad.ApiGateway.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para respuestas de error estandarizadas del API Gateway
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponseDTO {
    
    private int status;
    private String error;
    private String message;
    private String path;
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    // Factory methods para errores comunes
    public static ErrorResponseDTO unauthorized(String message, String path) {
        return ErrorResponseDTO.builder()
                .status(401)
                .error("Unauthorized")
                .message(message)
                .path(path)
                .build();
    }
    
    public static ErrorResponseDTO forbidden(String message, String path) {
        return ErrorResponseDTO.builder()
                .status(403)
                .error("Forbidden")
                .message(message)
                .path(path)
                .build();
    }
    
    public static ErrorResponseDTO notFound(String message, String path) {
        return ErrorResponseDTO.builder()
                .status(404)
                .error("Not Found")
                .message(message)
                .path(path)
                .build();
    }
    
    public static ErrorResponseDTO badRequest(String message, String path) {
        return ErrorResponseDTO.builder()
                .status(400)
                .error("Bad Request")
                .message(message)
                .path(path)
                .build();
    }
    
    public static ErrorResponseDTO serviceUnavailable(String message, String path) {
        return ErrorResponseDTO.builder()
                .status(503)
                .error("Service Unavailable")
                .message(message)
                .path(path)
                .build();
    }
}
