package MicroservicioIncidenteSiniestros.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import MicroservicioIncidenteSiniestros.model.TipoIncidente;
import MicroservicioIncidenteSiniestros.services.TipoIncidenteServices;

@RestController
@RequestMapping("/api/tipo-incidente")
@CrossOrigin(origins = "*")
public class TipoIncidenteController {

    @Autowired
    private TipoIncidenteServices tipoIncidenteServices;

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/listar")
    public List<TipoIncidente> listar() {
        return tipoIncidenteServices.listarTiposIncidente();
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/obtener/{id}")
    public TipoIncidente obtener(@PathVariable Integer id) {
        return tipoIncidenteServices.obtenerTipoIncidentePorId(id);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/crear")
    public TipoIncidente crear(@RequestBody TipoIncidente tipoIncidente) {
        return tipoIncidenteServices.crearTipoIncidente(tipoIncidente);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PutMapping("/actualizar/{id}")
    public TipoIncidente actualizar(@PathVariable Integer id, @RequestBody TipoIncidente tipoIncidente) {
        return tipoIncidenteServices.actualizarTipoIncidente(id, tipoIncidente);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        tipoIncidenteServices.eliminarTipoIncidente(id);
    }
}
