package tadGestionUsuario.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.RolesResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.ClientRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tadGestionUsuario.service.IKeycloakRoleService;

import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class KeycloakRoleServiceImpl implements IKeycloakRoleService {

    private final Keycloak keycloak;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.client-id}")
    private String clientId;

    private RolesResource getClientRolesResource() {
        RealmResource realmResource = keycloak.realm(realm);
        List<ClientRepresentation> clientRepresentations = realmResource.clients().findByClientId(clientId);
        if (clientRepresentations.isEmpty()) {
            throw new RuntimeException("Client not found: " + clientId);
        }
        // Get internal ID (UUID) of the client
        String clientUuid = clientRepresentations.get(0).getId();
        return realmResource.clients().get(clientUuid).roles();
    }

    private String getClientUuid() {
        RealmResource realmResource = keycloak.realm(realm);
        List<ClientRepresentation> clientRepresentations = realmResource.clients().findByClientId(clientId);
        if (clientRepresentations.isEmpty()) {
            throw new RuntimeException("Client not found: " + clientId);
        }
        return clientRepresentations.get(0).getId();
    }

    @Override
    public void createRole(String roleName) {
        RoleRepresentation rolePromise = new RoleRepresentation();
        rolePromise.setName(roleName);
        rolePromise.setDescription("Role created via API");
        rolePromise.setClientRole(true);

        getClientRolesResource().create(rolePromise);
        log.info("Role created successfully: {}", roleName);
    }

    @Override
    public List<RoleRepresentation> findAllRoles() {
        return getClientRolesResource().list();
    }

    @Override
    public void assignRoleToUser(String username, String roleName) {
        RealmResource realmResource = keycloak.realm(realm);

        List<org.keycloak.representations.idm.UserRepresentation> users = realmResource.users()
                .searchByUsername(username, true);
        if (users.isEmpty()) {
            throw new RuntimeException("User not found: " + username);
        }
        String userId = users.get(0).getId();
        UserResource userResource = realmResource.users().get(userId);

        // Find the role in the client
        RoleRepresentation roleToAdd = getClientRolesResource().get(roleName).toRepresentation();

        // Assign client level role
        userResource.roles().clientLevel(getClientUuid()).add(Collections.singletonList(roleToAdd));
        log.info("Role {} assigned to user {} (ID: {})", roleName, username, userId);
    }

    @Override
    public void removeRoleFromUser(String username, String roleName) {
        RealmResource realmResource = keycloak.realm(realm);
        List<org.keycloak.representations.idm.UserRepresentation> users = realmResource.users()
                .searchByUsername(username, true);
        if (users.isEmpty()) {
            throw new RuntimeException("User not found: " + username);
        }
        String userId = users.get(0).getId();
        UserResource userResource = realmResource.users().get(userId);

        RoleRepresentation roleToRemove = getClientRolesResource().get(roleName).toRepresentation();

        userResource.roles().clientLevel(getClientUuid()).remove(Collections.singletonList(roleToRemove));
        log.info("Role {} removed from user {} (ID: {})", roleName, username, userId);
    }

    @Override
    public List<RoleRepresentation> getUserRoles(String username) {
        RealmResource realmResource = keycloak.realm(realm);
        List<org.keycloak.representations.idm.UserRepresentation> users = realmResource.users()
                .searchByUsername(username, true);
        if (users.isEmpty()) {
            throw new RuntimeException("User not found: " + username);
        }
        String userId = users.get(0).getId();
        UserResource userResource = realmResource.users().get(userId);

        // Roles de cliente
        List<RoleRepresentation> clientRoles = userResource.roles().clientLevel(getClientUuid()).listAll();

        // Roles de realm
        List<RoleRepresentation> realmRoles = userResource.roles().realmLevel().listAll();

        // Combinar ambos
        clientRoles.addAll(realmRoles);
        return clientRoles;
    }
}
