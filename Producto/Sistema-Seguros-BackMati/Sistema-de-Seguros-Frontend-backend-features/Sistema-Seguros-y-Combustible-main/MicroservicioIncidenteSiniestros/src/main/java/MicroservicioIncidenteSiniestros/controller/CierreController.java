package MicroservicioIncidenteSiniestros.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import MicroservicioIncidenteSiniestros.model.Cierre;
import MicroservicioIncidenteSiniestros.services.CierreServices;

@RestController
@RequestMapping("/api/cierre")
@CrossOrigin(origins = "*")
public class CierreController {

    @Autowired
    private CierreServices cierreServices;

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @GetMapping("/listar")
    public List<Cierre> listar() {
        return cierreServices.listarCierres();
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @GetMapping("/obtener/{id}")
    public Cierre obtener(@PathVariable Integer id) {
        return cierreServices.obtenerCierrePorId(id);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/crear")
    public Cierre crear(@RequestBody Cierre cierre) {
        return cierreServices.crearCierre(cierre);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PutMapping("/actualizar/{id}")
    public Cierre actualizar(@PathVariable Integer id, @RequestBody Cierre cierre) {
        return cierreServices.actualizarCierre(id, cierre);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        cierreServices.eliminarCierre(id);
    }
}
