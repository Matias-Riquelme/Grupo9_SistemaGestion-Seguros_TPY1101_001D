package MicroservicioIncidenteSiniestros.controller;

import MicroservicioIncidenteSiniestros.model.TipoDeducible;
import MicroservicioIncidenteSiniestros.services.TipoDeducibleServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tipo-deducible")
@CrossOrigin(origins = "*")
public class TipoDeducibleController {

    @Autowired
    private TipoDeducibleServices tipoDeducibleServices;

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/listar")
    public List<TipoDeducible> listar() {
        return tipoDeducibleServices.listarTiposDeducible();
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/obtener/{id}")
    public TipoDeducible obtener(@PathVariable Integer id) {
        return tipoDeducibleServices.obtenerTipoDeduciblePorId(id);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/crear")
    public TipoDeducible crear(@RequestBody TipoDeducible tipoDeducible) {
        return tipoDeducibleServices.crearTipoDeducible(tipoDeducible);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PutMapping("/actualizar/{id}")
    public TipoDeducible actualizar(@PathVariable Integer id, @RequestBody TipoDeducible tipoDeducible) {
        return tipoDeducibleServices.actualizarTipoDeducible(id, tipoDeducible);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        tipoDeducibleServices.eliminarTipoDeducible(id);
    }
}
