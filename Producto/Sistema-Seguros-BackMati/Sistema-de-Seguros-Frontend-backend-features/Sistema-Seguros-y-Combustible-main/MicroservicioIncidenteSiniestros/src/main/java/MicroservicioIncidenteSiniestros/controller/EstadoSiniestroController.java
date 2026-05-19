package MicroservicioIncidenteSiniestros.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import MicroservicioIncidenteSiniestros.model.EstadoSiniestro;
import MicroservicioIncidenteSiniestros.services.EstadoSiniestroServices;

@RestController
@RequestMapping("/api/estado-siniestro")
@CrossOrigin(origins = "*")
public class EstadoSiniestroController {

    @Autowired
    private EstadoSiniestroServices estadoSiniestroServices;

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/listar")
    public List<EstadoSiniestro> listar() {
        return estadoSiniestroServices.listarEstadosSiniestro();
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/obtener/{id}")
    public EstadoSiniestro obtener(@PathVariable Integer id) {
        return estadoSiniestroServices.obtenerEstadoSiniestroPorId(id);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/crear")
    public EstadoSiniestro crear(@RequestBody EstadoSiniestro estadoSiniestro) {
        return estadoSiniestroServices.crearEstadoSiniestro(estadoSiniestro);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PutMapping("/actualizar/{id}")
    public EstadoSiniestro actualizar(@PathVariable Integer id, @RequestBody EstadoSiniestro estadoSiniestro) {
        return estadoSiniestroServices.actualizarEstadoSiniestro(id, estadoSiniestro);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        estadoSiniestroServices.eliminarEstadoSiniestro(id);
    }
}
