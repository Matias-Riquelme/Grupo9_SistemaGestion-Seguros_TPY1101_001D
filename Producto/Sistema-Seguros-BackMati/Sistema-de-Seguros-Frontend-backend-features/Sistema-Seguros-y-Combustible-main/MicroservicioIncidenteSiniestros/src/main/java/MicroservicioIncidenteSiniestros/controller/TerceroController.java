package MicroservicioIncidenteSiniestros.controller;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import MicroservicioIncidenteSiniestros.dto.TerceroDTO;
import MicroservicioIncidenteSiniestros.dto.DTOMapper;
import MicroservicioIncidenteSiniestros.model.Tercero;
import MicroservicioIncidenteSiniestros.services.TerceroServices;

@RestController
@RequestMapping("/api/tercero")
@CrossOrigin(origins = "*")
@Transactional(readOnly = true)
public class TerceroController {

    @Autowired
    private TerceroServices terceroServices;

    @Autowired
    private DTOMapper dtoMapper;

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/listar")
    public List<TerceroDTO> listar() {
        return terceroServices.listarTerceros().stream()
                .map(dtoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/obtener/{id}")
    public ResponseEntity<TerceroDTO> obtener(@PathVariable Integer id) {
        Tercero tercero = terceroServices.obtenerTerceroPorId(id);
        if (tercero == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dtoMapper.toDTO(tercero));
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @PostMapping("/crear")
    @Transactional
    public ResponseEntity<TerceroDTO> crear(@RequestBody Tercero tercero) {
        Tercero creado = terceroServices.crearTercero(tercero);
        return ResponseEntity.ok(dtoMapper.toDTO(creado));
    }

    @PostMapping("/publico/crear")
    @Transactional
    public ResponseEntity<TerceroDTO> crearPublico(@RequestBody Tercero tercero) {
        Tercero creado = terceroServices.crearTercero(tercero);
        return ResponseEntity.ok(dtoMapper.toDTO(creado));
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @PutMapping("/actualizar/{id}")
    @Transactional
    public ResponseEntity<TerceroDTO> actualizar(@PathVariable Integer id, @RequestBody Tercero tercero) {
        Tercero actualizado = terceroServices.actualizarTercero(id, tercero);
        if (actualizado == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dtoMapper.toDTO(actualizado));
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/eliminar/{id}")
    @Transactional
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        terceroServices.eliminarTercero(id);
        return ResponseEntity.noContent().build();
    }
}
