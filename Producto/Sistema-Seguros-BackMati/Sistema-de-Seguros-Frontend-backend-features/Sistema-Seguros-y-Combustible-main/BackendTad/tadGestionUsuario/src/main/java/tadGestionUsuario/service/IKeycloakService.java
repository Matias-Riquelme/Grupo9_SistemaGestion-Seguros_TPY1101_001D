package tadGestionUsuario.service;

import tadGestionUsuario.DTO.UserDTO;
import org.keycloak.representations.idm.UserRepresentation;

import java.util.List;

//Esta clase se implementa para gestionar los servicios de Keycloak , solo sabe como buscar y crear usuarios.

public interface IKeycloakService {

    List<UserRepresentation> findAllUsers();

    List<UserRepresentation> searchUserByUsername(String username);

    String createUser(UserDTO userDTO);

    void deleteUser(String userId);

    void updateUser(String userId, UserDTO userDTO);

    List<tadGestionUsuario.DTO.UserResponseDTO> findAllUsersWithRoles();
}
