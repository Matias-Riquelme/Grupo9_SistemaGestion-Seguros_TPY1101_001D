package MicroservicioIncidenteSiniestros.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import MicroservicioIncidenteSiniestros.model.Comuna;
import MicroservicioIncidenteSiniestros.services.ComunaServices;

@RestController
@RequestMapping("/api/comuna")
@CrossOrigin(origins = "*")
public class ComunaController {

    @Autowired
    private ComunaServices comunaServices;

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/listar")
    public List<Comuna> listar() {
        return comunaServices.listarComunas();
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/obtener/{id}")
    public Comuna obtener(@PathVariable Integer id) {
        return comunaServices.obtenerComunaPorId(id);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/crear")
    public Comuna crear(@RequestBody Comuna comuna) {
        return comunaServices.crearComuna(comuna);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PutMapping("/actualizar/{id}")
    public Comuna actualizar(@PathVariable Integer id, @RequestBody Comuna comuna) {
        return comunaServices.actualizarComuna(id, comuna);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        comunaServices.eliminarComuna(id);
    }
}
