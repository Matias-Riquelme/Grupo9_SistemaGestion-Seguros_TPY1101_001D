package MicroservicioIncidenteSiniestros.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import MicroservicioIncidenteSiniestros.dto.DeducibleDTO;
import MicroservicioIncidenteSiniestros.dto.DTOMapper;
import MicroservicioIncidenteSiniestros.model.Deducible;
import MicroservicioIncidenteSiniestros.model.Poliza;
import MicroservicioIncidenteSiniestros.services.DeducibleServices;
import MicroservicioIncidenteSiniestros.services.PolizaServices;
import MicroservicioIncidenteSiniestros.model.TipoDeducible;
import MicroservicioIncidenteSiniestros.services.TipoDeducibleServices;

@RestController
@RequestMapping("/api/deducible")
@CrossOrigin(origins = "*")
@Transactional(readOnly = true)
public class DeducibleController {

    @Autowired
    private DeducibleServices deducibleServices;

    @Autowired
    private PolizaServices polizaServices;

    @Autowired
    private TipoDeducibleServices tipoDeducibleServices;

    @Autowired
    private DTOMapper dtoMapper;

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/listar")
    public List<DeducibleDTO> listar() {
        return deducibleServices.listarDeducibles().stream().map(dtoMapper::toDTO).collect(java.util.stream.Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/obtener/{id}")
    public ResponseEntity<DeducibleDTO> obtener(@PathVariable Integer id) {
        Deducible deducible = deducibleServices.obtenerDeduciblePorId(id);
        if (deducible == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dtoMapper.toDTO(deducible));
    }


    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PutMapping("/actualizar/{id}")
    @Transactional
    public ResponseEntity<DeducibleDTO> actualizar(@PathVariable Integer id, @RequestBody Deducible deducible) {
        Deducible actualizado = deducibleServices.actualizarDeducible(id, deducible);
        if (actualizado == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dtoMapper.toDTO(actualizado));
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/eliminar/{id}")
    @Transactional
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        deducibleServices.eliminarDeducible(id);
        return ResponseEntity.noContent().build();
    }

    // Endpoint para crear deducible asociado a una póliza por su id
    // POST /api/deducible/poliza/{idPoliza}
    // Body: { "nombreDedu": "Nombre del deducible" }
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/poliza/{idPoliza}")
    @Transactional
    public ResponseEntity<?> crearConPoliza(@PathVariable Integer idPoliza, @RequestBody DeducibleDTO dto) {
        Poliza poliza = polizaServices.obtenerPolizaPorId(idPoliza);
        if (poliza == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Póliza no encontrada con id: " + idPoliza);
            return ResponseEntity.badRequest().body(error);
        }
        TipoDeducible tipoDeducible = tipoDeducibleServices.obtenerTipoDeduciblePorId(dto.getTipoDeducible() != null ? dto.getTipoDeducible().getIdTipoDeducible() : null);
        if (tipoDeducible == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "TipoDeducible no encontrado con id: " + (dto.getTipoDeducible() != null ? dto.getTipoDeducible().getIdTipoDeducible() : null));
            return ResponseEntity.badRequest().body(error);
        }
        Deducible deducible = new Deducible();
        deducible.setNombreDedu(dto.getNombreDedu());
        deducible.setPoliza(poliza);
        deducible.setTipoDeducible(tipoDeducible);
        Deducible nuevoDeducible = deducibleServices.crearDeducible(deducible);
        return ResponseEntity.ok(dtoMapper.toDTO(nuevoDeducible));
    }

    // Endpoint para obtener deducibles asociados a una póliza
    // GET /api/deducible/poliza/{idPoliza}
    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/poliza/{idPoliza}")
    public ResponseEntity<?> obtenerDeduciblesPorPoliza(@PathVariable Integer idPoliza) {
        Poliza poliza = polizaServices.obtenerPolizaPorId(idPoliza);
        if (poliza == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Póliza no encontrada con id: " + idPoliza);
            return ResponseEntity.badRequest().body(error);
        }
        List<DeducibleDTO> deducibles = deducibleServices.listarDeduciblesPorPoliza(idPoliza).stream().map(dtoMapper::toDTO).collect(java.util.stream.Collectors.toList());
        Map<String, Object> response = new HashMap<>();
        response.put("poliza", poliza);
        response.put("deducibles", deducibles);
        return ResponseEntity.ok(response);
    }
}
