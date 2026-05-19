
package MicroservicioIncidenteSiniestros.controller;

import java.util.List;
import java.util.stream.Collectors;
import java.util.concurrent.CompletableFuture;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletResponse;
import MicroservicioIncidenteSiniestros.dto.PolizaDTO;
import MicroservicioIncidenteSiniestros.dto.DTOMapper;
import MicroservicioIncidenteSiniestros.model.Poliza;
import MicroservicioIncidenteSiniestros.services.PolizaServices;
import MicroservicioIncidenteSiniestros.services.PolizaImportService;

@RestController
@RequestMapping("/api/poliza")
@CrossOrigin(origins = "*")
@Transactional(readOnly = true)
public class PolizaController {

    @Autowired
    private PolizaServices polizaServices;

    @Autowired
    private DTOMapper dtoMapper;
    
    @Autowired
    private PolizaImportService polizaImportService;

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/listar")
    public List<PolizaDTO> listar() {
        return polizaServices.listarPolizas().stream()
                .map(dtoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/obtener/{id}")
    public ResponseEntity<PolizaDTO> obtener(@PathVariable Integer id) {
        Poliza poliza = polizaServices.obtenerPolizaPorId(id);
        if (poliza == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dtoMapper.toDTO(poliza));
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/crear")
    @Transactional
    public ResponseEntity<PolizaDTO> crear(@RequestBody Poliza poliza) {
        Poliza creada = polizaServices.crearPoliza(poliza);
        return ResponseEntity.ok(dtoMapper.toDTO(creada));
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PutMapping("/actualizar/{id}")
    @Transactional
    public ResponseEntity<PolizaDTO> actualizar(@PathVariable Integer id, @RequestBody Poliza poliza) {
        Poliza actualizada = polizaServices.actualizarPoliza(id, poliza);
        if (actualizada == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dtoMapper.toDTO(actualizada));
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/eliminar/{id}")
    @Transactional(readOnly = false)
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        System.out.println("=== INICIO ELIMINAR POLIZA ID: " + id + " ===");
        try {
            polizaServices.eliminarPoliza(id);
            System.out.println("=== POLIZA ELIMINADA EXITOSAMENTE ===");
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            System.out.println("=== ERROR AL ELIMINAR: " + e.getMessage() + " ===");
            System.out.println("=== TIPO DE EXCEPCION: " + e.getClass().getName() + " ===");
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.out.println("=== ERROR INESPERADO: " + e.getMessage() + " ===");
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error interno: " + e.getMessage());
        }
    }



    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/listar-con-detalle")
    public ResponseEntity<List<PolizaDTO>> listarPolizasConDetalle() {
        List<PolizaDTO> polizas = polizaServices.listarPolizas().stream()
                .map(dtoMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(polizas);
    }
    
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/importar")
    public CompletableFuture<ResponseEntity<String>> importar(@RequestParam("file") MultipartFile file) {
        try {
            return polizaImportService.procesarArchivo(file.getInputStream())
                    .thenApply(ResponseEntity::ok);
        } catch (IOException e) {
            return CompletableFuture.completedFuture(
                    ResponseEntity.badRequest().body("Error al leer el archivo: " + e.getMessage()));
        }
    }
    
    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/exportar")
    public void exportar(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=polizas.xlsx");
        polizaImportService.exportarAExcel(response.getOutputStream());
    }
}
