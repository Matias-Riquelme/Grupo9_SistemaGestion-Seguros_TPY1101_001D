package MicroservicioIncidenteSiniestros.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import MicroservicioIncidenteSiniestros.model.Pais;
import MicroservicioIncidenteSiniestros.services.PaisServices;

@RestController
@RequestMapping("/api/pais")
@CrossOrigin(origins = "*")
public class PaisController {

    @Autowired
    private PaisServices paisServices;
    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/listar")
    public List<Pais> listar() {
        return paisServices.listarPaises();
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/obtener/{id}")
    public Pais obtener(@PathVariable Integer id) {
        return paisServices.obtenerPaisPorId(id);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/crear")
    public Pais crear(@RequestBody Pais pais) {
        return paisServices.crearPais(pais);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PutMapping("/actualizar/{id}")
    public Pais actualizar(@PathVariable Integer id, @RequestBody Pais pais) {
        return paisServices.actualizarPais(id, pais);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        paisServices.eliminarPais(id);
    }
}
