package tadGestionUsuario.controller;

import tadGestionUsuario.DTO.UserDTO;
import tadGestionUsuario.model.Usuario;
import tadGestionUsuario.repository.UsuarioRepository;
import tadGestionUsuario.service.IKeycloakService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping("/api/keycloak/user/")
@PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
public class KeycloakController {

    @Autowired
    private IKeycloakService keycloakService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Listar todos los usuarios

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @GetMapping("/search")
    public ResponseEntity<?> findAllUsers() {
        return ResponseEntity.ok(keycloakService.findAllUsers());
    }
    // Listar todos los usuarios con roles

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @GetMapping("/search-roles")
    public ResponseEntity<?> findAllUsersWithRoles() {
        return ResponseEntity.ok(keycloakService.findAllUsersWithRoles());
    }

    // Listar usuarios almacenados en la base de datos local
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @GetMapping("/db-list")
    public ResponseEntity<List<Usuario>> listUsersFromDatabase() {
        List<Usuario> users = usuarioRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // Buscar un usuario por username
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @GetMapping("/search/{username}")
    public ResponseEntity<?> searchUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(keycloakService.searchUserByUsername(username));
    }

    // Crear un usuario
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody UserDTO userDTO) throws URISyntaxException {
        String response = keycloakService.createUser(userDTO);
        return ResponseEntity.created(new URI("/keycloak/user/create")).body(response);
    }

    // Actualizar un usuario
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PutMapping("/update/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody UserDTO userDTO) {
        keycloakService.updateUser(userId, userDTO);
        return ResponseEntity.ok("Usuario actualizado exitosamente");
    }

    // Eliminar un usuario
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        keycloakService.deleteUser(userId);
        return ResponseEntity.ok("Usuario eliminado exitosamente");
    }
}