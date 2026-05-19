package MicroservicioIncidenteSiniestros.controller;

import MicroservicioIncidenteSiniestros.model.TipoCobertura;
import MicroservicioIncidenteSiniestros.services.TipoCoberturaServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tipo-cobertura")
@CrossOrigin(origins = "*")
public class TipoCoberturaController {

    @Autowired
    private TipoCoberturaServices tipoCoberturaServices;

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/listar")
    public List<TipoCobertura> listar() {
        return tipoCoberturaServices.listarTiposCobertura();
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/obtener/{id}")
    public TipoCobertura obtener(@PathVariable Integer id) {
        return tipoCoberturaServices.obtenerTipoCoberturaPorId(id);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/crear")
    public TipoCobertura crear(@RequestBody TipoCobertura tipoCobertura) {
        return tipoCoberturaServices.crearTipoCobertura(tipoCobertura);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PutMapping("/actualizar/{id}")
    public TipoCobertura actualizar(@PathVariable Integer id, @RequestBody TipoCobertura tipoCobertura) {
        return tipoCoberturaServices.actualizarTipoCobertura(id, tipoCobertura);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        tipoCoberturaServices.eliminarTipoCobertura(id);
    }
}
