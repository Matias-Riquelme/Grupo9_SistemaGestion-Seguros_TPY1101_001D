package tadGestionUsuario.service.impl;

import tadGestionUsuario.DTO.UserDTO;
import tadGestionUsuario.model.Usuario;
import tadGestionUsuario.repository.UsuarioRepository;
import tadGestionUsuario.service.IKeycloakService;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.lang.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import tadGestionUsuario.DTO.UserResponseDTO;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.ClientRepresentation;

import jakarta.ws.rs.core.Response;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j

public class IKeycloakServiceImpl implements IKeycloakService {

    private final Keycloak keycloak;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.client-id}")
    private String clientId;

    public IKeycloakServiceImpl(Keycloak keycloak) {
        this.keycloak = keycloak;
    }

    private String getClientUuid() {
        RealmResource realmResource = keycloak.realm(realm);
        List<ClientRepresentation> clientRepresentations = realmResource.clients().findByClientId(clientId);
        if (clientRepresentations.isEmpty()) {
            throw new RuntimeException("Client not found: " + clientId);
        }
        return clientRepresentations.get(0).getId();
    }

    /**
     * Metodo para listar todos los usuarios de Keycloak
     * 
     * @return List<UserRepresentation>
     */
    public List<UserRepresentation> findAllUsers() {
        return keycloak.realm(realm)
                .users()
                .list();
    }

    /**
     * Metodo para buscar un usuario por su username
     * 
     * @return List<UserRepresentation>
     */
    public List<UserRepresentation> searchUserByUsername(String username) {
        return keycloak.realm(realm)
                .users()
                .searchByUsername(username, true);
    }

    /**
     * Metodo para crear un usuario en keycloak
     * 
     * @return String
     */

    public String createUser(@NonNull UserDTO userDTO) {
        int status = 0;
        UsersResource usersResource = keycloak.realm(realm).users();

        UserRepresentation userRepresentation = new UserRepresentation();
        userRepresentation.setFirstName(userDTO.getFirstName());
        userRepresentation.setLastName(userDTO.getLastName());
        userRepresentation.setEmail(userDTO.getEmail());
        userRepresentation.setUsername(userDTO.getUsername());
        userRepresentation.setEnabled(true);
        userRepresentation.setEmailVerified(true);

        Response response = usersResource.create(userRepresentation);
        status = response.getStatus();

        if (status == 201) {
            String path = response.getLocation().getPath();
            String userId = path.substring(path.lastIndexOf("/") + 1);

            CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
            credentialRepresentation.setTemporary(false);
            credentialRepresentation.setType(CredentialRepresentation.PASSWORD);
            credentialRepresentation.setValue(userDTO.getPassword());

            usersResource.get(userId).resetPassword(credentialRepresentation);

            RealmResource realmResource = keycloak.realm(realm);
            String clientUuid = getClientUuid();

            if (userDTO.getRoles() == null || userDTO.getRoles().isEmpty()) {
                RoleRepresentation defaultRole = realmResource.clients().get(clientUuid)
                        .roles().get("user_client_role").toRepresentation();
                realmResource.users().get(userId).roles().clientLevel(clientUuid)
                        .add(Collections.singletonList(defaultRole));
            } else {
                List<RoleRepresentation> rolesToAssign = realmResource.clients().get(clientUuid).roles().list()
                        .stream()
                        .filter(role -> userDTO.getRoles().stream()
                                .anyMatch(roleName -> roleName.equalsIgnoreCase(role.getName())))
                        .toList();
                realmResource.users().get(userId).roles().clientLevel(clientUuid).add(rolesToAssign);
            }

            // ============ GUARDAR USUARIO EN BASE DE DATOS LOCAL ============
            Usuario usuario = new Usuario();
            usuario.setId(userId);
            usuario.setUsername(userDTO.getUsername());
            usuario.setEmail(userDTO.getEmail());
            usuario.setFirstName(userDTO.getFirstName());
            usuario.setLastName(userDTO.getLastName());
            usuario.setFechaCreacion(LocalDateTime.now());
            usuarioRepository.save(usuario);
            log.info("Usuario guardado en base de datos local con ID: {}", userId);
            // =================================================================

            return "User created successfully!!";
        } else if (status == 409) {
            log.error("User exist already!");
            return "User exist already!";
        } else {
            log.error("Error creating user, please contact with the administrator.");
            return "Error creating user, please contact with the administrator.";
        }
    }

    /**
     * Metodo para borrar un usuario en keycloak
     * 
     * @return void
     */
    public void deleteUser(String userId) {
        keycloak.realm(realm)
                .users()
                .get(userId)
                .remove();
        
        // ============ ELIMINAR USUARIO DE BASE DE DATOS LOCAL ============
        usuarioRepository.deleteById(userId);
        log.info("Usuario eliminado de base de datos local con ID: {}", userId);
        // =================================================================
    }

    /**
     * Metodo para actualizar un usuario en keycloak
     * 
     * @return void
     */
    public void updateUser(String userId, @NonNull UserDTO userDTO) {

        CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
        credentialRepresentation.setTemporary(false);
        credentialRepresentation.setType(OAuth2Constants.PASSWORD);
        credentialRepresentation.setValue(userDTO.getPassword());

        UserRepresentation user = new UserRepresentation();
        user.setUsername(userDTO.getUsername());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        user.setEnabled(true);
        user.setEmailVerified(true);
        user.setCredentials(Collections.singletonList(credentialRepresentation));

        UserResource usersResource = keycloak.realm(realm).users().get(userId);
        usersResource.update(user);

        // ============ ACTUALIZAR USUARIO EN BASE DE DATOS LOCAL ============
        Usuario usuarioLocal = usuarioRepository.findById(userId).orElse(null);
        if (usuarioLocal != null) {
            usuarioLocal.setUsername(userDTO.getUsername());
            usuarioLocal.setEmail(userDTO.getEmail());
            usuarioLocal.setFirstName(userDTO.getFirstName());
            usuarioLocal.setLastName(userDTO.getLastName());
            usuarioRepository.save(usuarioLocal);
            log.info("Usuario actualizado en base de datos local con ID: {}", userId);
        }
        // ===================================================================
    }

    @Override
    public List<UserResponseDTO> findAllUsersWithRoles() {
        List<UserRepresentation> users = findAllUsers();
        String clientUuid = getClientUuid();

        return users.stream().map(user -> {
            UserResource userResource = keycloak.realm(realm).users().get(user.getId());

            // Obtener roles de cliente
            List<String> clientRoles = userResource.roles().clientLevel(clientUuid).listAll()
                    .stream()
                    .map(RoleRepresentation::getName)
                    .collect(Collectors.toList());

            // Obtener roles de realm
            List<String> realmRoles = userResource.roles().realmLevel().listAll()
                    .stream()
                    .map(RoleRepresentation::getName)
                    .collect(Collectors.toList());

            // Combinar ambos y filtrar roles internos de Keycloak si se desea un listado
            // limpio
            List<String> allRoles = Stream.concat(clientRoles.stream(), realmRoles.stream())
                    .distinct()
                    .filter(role -> !role.startsWith("default-roles-")
                            && !role.equals("offline_access")
                            && !role.equals("uma_authorization"))
                    .collect(Collectors.toList());

            // Si la lista queda vacía (solo tenía roles internos), podrías forzar que se
            // vea "user_client_role"
            // pero lo ideal es que el usuario ya lo tenga asignado físicamente.

            return UserResponseDTO.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .roles(allRoles)
                    .build();
        }).collect(Collectors.toList());
    }
}
