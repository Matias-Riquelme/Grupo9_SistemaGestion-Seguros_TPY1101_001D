package tadGestionUsuario.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tadGestionUsuario.model.Usuario;

public interface UserRepository extends JpaRepository<Usuario, String> {
    // Puedes agregar métodos personalizados si lo necesitas
}
