package MicroservicioIncidenteSiniestros.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import MicroservicioIncidenteSiniestros.model.Contratante;
import MicroservicioIncidenteSiniestros.services.ContratanteServices;

@RestController
@RequestMapping("/api/contratante")
@CrossOrigin(origins = "*")
public class ContratanteController {

    @Autowired
    private ContratanteServices contratanteServices;

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @GetMapping("/listar")
    public List<Contratante> listar() {
        return contratanteServices.listarContratantes();
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @GetMapping("/obtener/{id}")
    public Contratante obtener(@PathVariable Integer id) {
        return contratanteServices.obtenerContratantePorId(id);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/crear")
    public Contratante crear(@RequestBody Contratante contratante) {
        return contratanteServices.crearContratante(contratante);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PutMapping("/actualizar/{id}")
    public Contratante actualizar(@PathVariable Integer id, @RequestBody Contratante contratante) {
        return contratanteServices.actualizarContratante(id, contratante);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        contratanteServices.eliminarContratante(id);
    }
}
