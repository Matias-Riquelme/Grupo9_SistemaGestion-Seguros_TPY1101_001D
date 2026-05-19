package tad.ApiGateway.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO con información del usuario autenticado
 * Se propaga a través de headers a los microservicios
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoDTO {
    
    private String userId;          // sub de Keycloak
    private String username;        // preferred_username
    private String email;
    private String fullName;
    private List<String> roles;
    
    /**
     * Verifica si el usuario tiene un rol específico
     */
    public boolean hasRole(String role) {
        return roles != null && roles.contains(role);
    }
    
    /**
     * Verifica si el usuario tiene alguno de los roles especificados
     */
    public boolean hasAnyRole(String... rolesToCheck) {
        if (roles == null) return false;
        for (String role : rolesToCheck) {
            if (roles.contains(role)) return true;
        }
        return false;
    }
    
    /**
     * Verifica si el usuario es administrador
     */
    public boolean isAdmin() {
        return hasRole("admin_client_role");
    }
}
