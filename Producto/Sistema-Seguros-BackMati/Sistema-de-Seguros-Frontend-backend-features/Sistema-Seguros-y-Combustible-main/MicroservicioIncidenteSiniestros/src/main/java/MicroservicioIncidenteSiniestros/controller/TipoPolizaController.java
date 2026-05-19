package MicroservicioIncidenteSiniestros.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import MicroservicioIncidenteSiniestros.model.TipoPoliza;
import MicroservicioIncidenteSiniestros.services.TipoPolizaServices;

@RestController
@RequestMapping("/api/tipo-poliza")
@CrossOrigin(origins = "*")
public class TipoPolizaController {

    @Autowired
    private TipoPolizaServices tipoPolizaServices;

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/listar")
    public List<TipoPoliza> listar() {
        return tipoPolizaServices.listarTiposPoliza();
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/obtener/{id}")
    public TipoPoliza obtener(@PathVariable Integer id) {
        return tipoPolizaServices.obtenerTipoPolizaPorId(id);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/crear")
    public TipoPoliza crear(@RequestBody TipoPoliza tipoPoliza) {
        return tipoPolizaServices.crearTipoPoliza(tipoPoliza);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PutMapping("/actualizar/{id}")
    public TipoPoliza actualizar(@PathVariable Integer id, @RequestBody TipoPoliza tipoPoliza) {
        return tipoPolizaServices.actualizarTipoPoliza(id, tipoPoliza);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        tipoPolizaServices.eliminarTipoPoliza(id);
    }
}
