package MicroservicioIncidenteSiniestros.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import MicroservicioIncidenteSiniestros.model.TipoSiniestro;
import MicroservicioIncidenteSiniestros.services.TipoSiniestroServices;

@RestController
@RequestMapping("/api/tipo-siniestro")
@CrossOrigin(origins = "*")
public class TipoSiniestroController {

    @Autowired
    private TipoSiniestroServices tipoSiniestroServices;

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/listar")
    public List<TipoSiniestro> listar() {
        return tipoSiniestroServices.listarTiposSiniestro();
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/obtener/{id}")
    public TipoSiniestro obtener(@PathVariable Integer id) {
        return tipoSiniestroServices.obtenerTipoSiniestroPorId(id);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/crear")
    public TipoSiniestro crear(@RequestBody TipoSiniestro tipoSiniestro) {
        return tipoSiniestroServices.crearTipoSiniestro(tipoSiniestro);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PutMapping("/actualizar/{id}")
    public TipoSiniestro actualizar(@PathVariable Integer id, @RequestBody TipoSiniestro tipoSiniestro) {
        return tipoSiniestroServices.actualizarTipoSiniestro(id, tipoSiniestro);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        tipoSiniestroServices.eliminarTipoSiniestro(id);
    }
}
