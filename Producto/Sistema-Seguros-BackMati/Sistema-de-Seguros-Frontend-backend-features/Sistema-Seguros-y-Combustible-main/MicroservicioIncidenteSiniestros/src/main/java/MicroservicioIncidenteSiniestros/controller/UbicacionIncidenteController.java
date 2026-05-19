package MicroservicioIncidenteSiniestros.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import MicroservicioIncidenteSiniestros.model.UbicacionIncidente;
import MicroservicioIncidenteSiniestros.services.UbicacionIncidenteServices;

@RestController
@RequestMapping("/api/ubicacion-incidente")
@CrossOrigin(origins = "*")
public class UbicacionIncidenteController {

    @Autowired
    private UbicacionIncidenteServices ubicacionIncidenteServices;

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/listar")
    public List<UbicacionIncidente> listar() {
        return ubicacionIncidenteServices.listarUbicaciones();
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/obtener/{id}")
    public UbicacionIncidente obtener(@PathVariable Integer id) {
        return ubicacionIncidenteServices.obtenerUbicacionPorId(id);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/crear")
    public UbicacionIncidente crear(@RequestBody UbicacionIncidente ubicacion) {
        return ubicacionIncidenteServices.crearUbicacion(ubicacion);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PutMapping("/actualizar/{id}")
    public UbicacionIncidente actualizar(@PathVariable Integer id, @RequestBody UbicacionIncidente ubicacion) {
        return ubicacionIncidenteServices.actualizarUbicacion(id, ubicacion);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@PathVariable Integer id) {
        ubicacionIncidenteServices.eliminarUbicacion(id);
    }
}
