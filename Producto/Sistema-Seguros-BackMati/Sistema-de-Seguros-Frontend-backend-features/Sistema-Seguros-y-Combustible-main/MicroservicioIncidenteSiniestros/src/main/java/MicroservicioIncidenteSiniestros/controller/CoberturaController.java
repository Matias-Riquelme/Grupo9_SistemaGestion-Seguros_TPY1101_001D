package MicroservicioIncidenteSiniestros.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import MicroservicioIncidenteSiniestros.model.Cobertura;
import MicroservicioIncidenteSiniestros.model.Poliza;
import MicroservicioIncidenteSiniestros.model.TipoCobertura;
import MicroservicioIncidenteSiniestros.services.CoberturaServices;
import MicroservicioIncidenteSiniestros.services.PolizaServices;
import MicroservicioIncidenteSiniestros.services.TipoCoberturaServices;
import MicroservicioIncidenteSiniestros.dto.CoberturaDTO;
import MicroservicioIncidenteSiniestros.dto.DTOMapper;

@RestController
@RequestMapping("/api/cobertura")
@CrossOrigin(origins = "*")
@Transactional(readOnly = true)
public class CoberturaController {

    @Autowired
    private CoberturaServices coberturaServices;

    @Autowired
    private PolizaServices polizaServices;

    @Autowired
    private TipoCoberturaServices tipoCoberturaServices;

    @Autowired
    private DTOMapper dtoMapper;


    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @GetMapping("/listar")
    public List<CoberturaDTO> listar() {
        return coberturaServices.listarCoberturas().stream().map(dtoMapper::toDTO).collect(java.util.stream.Collectors.toList());
    }


    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @GetMapping("/obtener/{id}")
    public ResponseEntity<CoberturaDTO> obtener(@PathVariable Integer id) {
        Cobertura cobertura = coberturaServices.obtenerCoberturaPorId(id);
        if (cobertura == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dtoMapper.toDTO(cobertura));
    }


    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PutMapping("/actualizar/{id}")
    @Transactional
    public ResponseEntity<CoberturaDTO> actualizar(@PathVariable Integer id, @RequestBody Cobertura cobertura) {
        Cobertura actualizada = coberturaServices.actualizarCobertura(id, cobertura);
        if (actualizada == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dtoMapper.toDTO(actualizada));
    }


    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/eliminar/{id}")
    @Transactional
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        coberturaServices.eliminarCobertura(id);
        return ResponseEntity.noContent().build();
    }

    // Endpoint para crear cobertura asociada a una póliza por su id
    // POST /api/cobertura/poliza/{idPoliza}
    // Body: { "descripcionCob": "Descripción de la cobertura" }
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/poliza/{idPoliza}")
    @Transactional
    public ResponseEntity<?> crearConPoliza(@PathVariable Integer idPoliza, @RequestBody CoberturaDTO dto) {
        Poliza poliza = polizaServices.obtenerPolizaPorId(idPoliza);
        if (poliza == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Póliza no encontrada con id: " + idPoliza);
            return ResponseEntity.badRequest().body(error);
        }
        TipoCobertura tipoCobertura = tipoCoberturaServices.obtenerTipoCoberturaPorId(dto.getTipoCobertura() != null ? dto.getTipoCobertura().getIdTipoCobertura() : null);
        if (tipoCobertura == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "TipoCobertura no encontrado con id: " + (dto.getTipoCobertura() != null ? dto.getTipoCobertura().getIdTipoCobertura() : null));
            return ResponseEntity.badRequest().body(error);
        }
        Cobertura cobertura = new Cobertura();
        cobertura.setDescripcionCob(dto.getDescripcionCob());
        cobertura.setPoliza(poliza);
        cobertura.setTipoCobertura(tipoCobertura);
        Cobertura nuevaCobertura = coberturaServices.crearCobertura(cobertura);
        return ResponseEntity.ok(dtoMapper.toDTO(nuevaCobertura));
    }

    // Endpoint para obtener coberturas asociadas a una póliza
    // GET /api/cobertura/poliza/{idPoliza}
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @GetMapping("/poliza/{idPoliza}")
    public ResponseEntity<?> obtenerCoberturasPorPoliza(@PathVariable Integer idPoliza) {
        Poliza poliza = polizaServices.obtenerPolizaPorId(idPoliza);
        if (poliza == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Póliza no encontrada con id: " + idPoliza);
            return ResponseEntity.badRequest().body(error);
        }
        List<CoberturaDTO> coberturas = coberturaServices.listarCoberturasPorPoliza(idPoliza).stream().map(dtoMapper::toDTO).collect(java.util.stream.Collectors.toList());
        Map<String, Object> response = new HashMap<>();
        response.put("poliza", poliza);
        response.put("coberturas", coberturas);
        return ResponseEntity.ok(response);
    }
}
