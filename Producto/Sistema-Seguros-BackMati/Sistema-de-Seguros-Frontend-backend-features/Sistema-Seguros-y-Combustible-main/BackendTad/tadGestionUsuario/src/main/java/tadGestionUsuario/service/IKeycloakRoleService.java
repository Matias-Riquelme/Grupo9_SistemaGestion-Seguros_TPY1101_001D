package tadGestionUsuario.service;

import org.keycloak.representations.idm.RoleRepresentation;

import java.util.List;

public interface IKeycloakRoleService {

    void createRole(String roleName);

    List<RoleRepresentation> findAllRoles();

    void assignRoleToUser(String username, String roleName);

    void removeRoleFromUser(String username, String roleName);

    List<RoleRepresentation> getUserRoles(String username);
}
