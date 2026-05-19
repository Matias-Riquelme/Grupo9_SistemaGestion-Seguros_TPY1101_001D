package MicroservicioIncidenteSiniestros.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import MicroservicioIncidenteSiniestros.model.Region;
import MicroservicioIncidenteSiniestros.services.RegionServices;

@RestController
@RequestMapping("/api/region")
@CrossOrigin(origins = "*")
public class RegionController {

    @Autowired
    private RegionServices regionServices;

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/listar")
    public List<Region> listar() {
        return regionServices.listarRegiones();
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/obtener/{id}")
    public Region obtener(@PathVariable Integer id) {
        return regionServices.obtenerRegionPorId(id);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/crear")
    public Region crear(@RequestBody Region region) {
        return regionServices.crearRegion(region);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PutMapping("/actualizar/{id}")
    public Region actualizar(@PathVariable Integer id, @RequestBody Region region) {
        return regionServices.actualizarRegion(id, region);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        regionServices.eliminarRegion(id);
    }
}
