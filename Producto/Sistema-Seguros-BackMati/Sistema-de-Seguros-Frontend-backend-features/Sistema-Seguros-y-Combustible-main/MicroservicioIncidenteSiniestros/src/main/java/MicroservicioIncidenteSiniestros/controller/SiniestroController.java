package MicroservicioIncidenteSiniestros.controller;

import java.util.List;
import java.util.stream.Collectors;
import java.io.IOException;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import MicroservicioIncidenteSiniestros.dto.SiniestroDTO;
import MicroservicioIncidenteSiniestros.dto.DTOMapper;
import MicroservicioIncidenteSiniestros.model.Siniestro;
import MicroservicioIncidenteSiniestros.services.SiniestroServices;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/siniestro")
@CrossOrigin(origins = "*")
@Tag(name = "Siniestro", description = "Operaciones relacionadas con siniestros")
@Transactional(readOnly = true)
public class SiniestroController {

    @Autowired
    private SiniestroServices siniestroServices;

    @Autowired
    private DTOMapper dtoMapper;
    
    @Autowired
    private MicroservicioIncidenteSiniestros.services.SiniestroImportService siniestroImportService;

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @Operation(summary = "Listar siniestros", description = "Obtiene la lista de todos los siniestros")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente")
    })
    @GetMapping("/listar")
    public List<SiniestroDTO> listar() {
        return siniestroServices.listarSiniestros().stream()
                .map(dtoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @Operation(summary = "Obtener siniestro por ID", description = "Obtiene un siniestro específico por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Siniestro obtenido correctamente"),
        @ApiResponse(responseCode = "404", description = "Siniestro no encontrado")
    })
    @GetMapping("/obtener/{id}")
    public ResponseEntity<SiniestroDTO> obtener(@Parameter(description = "ID del siniestro") @PathVariable Integer id) {
        Siniestro siniestro = siniestroServices.obtenerSiniestroPorId(id);
        if (siniestro == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dtoMapper.toDTO(siniestro));
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Crear siniestro", description = "Crea un nuevo siniestro")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Siniestro creado correctamente")
    })
    @PostMapping("/crear")
    @Transactional
    public ResponseEntity<SiniestroDTO> crear(@Parameter(description = "Datos del siniestro") @RequestBody Siniestro siniestro) {
        Siniestro creado = siniestroServices.crearSiniestro(siniestro);
        return ResponseEntity.ok(dtoMapper.toDTO(creado));
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Actualizar siniestro", description = "Actualiza un siniestro existente por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Siniestro actualizado correctamente"),
        @ApiResponse(responseCode = "404", description = "Siniestro no encontrado")
    })
    @PutMapping("/actualizar/{id}")
    @Transactional
    public ResponseEntity<SiniestroDTO> actualizar(
        @Parameter(description = "ID del siniestro") @PathVariable Integer id,
        @Parameter(description = "Datos actualizados del siniestro") @RequestBody Siniestro siniestro) {
        Siniestro actualizado = siniestroServices.actualizarSiniestro(id, siniestro);
        if (actualizado == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dtoMapper.toDTO(actualizado));
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Eliminar siniestro", description = "Elimina un siniestro por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Siniestro eliminado correctamente"),
        @ApiResponse(responseCode = "404", description = "Siniestro no encontrado")
    })
    @DeleteMapping("/eliminar/{id}")
    @Transactional
    public ResponseEntity<Void> eliminar(@Parameter(description = "ID del siniestro") @PathVariable Integer id) {
        siniestroServices.eliminarSiniestro(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Contar siniestros por mes y año", description = "Devuelve el número de siniestros en un mes y año específicos")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Conteo obtenido correctamente")
    })
    @GetMapping("/contar-mes-ano")
    public Long contarPorMesYAno(
        @Parameter(description = "Mes (1-12)") @RequestParam Integer mes,
        @Parameter(description = "Año") @RequestParam Integer ano) {
        return siniestroServices.countByMonthAndYear(mes, ano);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Contar siniestros por año", description = "Devuelve el número de siniestros en un año específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Conteo obtenido correctamente")
    })
    @GetMapping("/contar-ano/{ano}")
    public Long contarPorAno(@Parameter(description = "Año") @PathVariable Integer ano) {
        return siniestroServices.countByYear(ano);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Contar siniestros por póliza", description = "Devuelve el número de siniestros asociados a una póliza específica")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Conteo obtenido correctamente")
    })
    @GetMapping("/contar-por-poliza/{polizaId}")
    public Long contarPorPoliza(@Parameter(description = "ID de la póliza") @PathVariable Integer polizaId) {
        return siniestroServices.countByPolizaId(polizaId);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Contar siniestros por incidente", description = "Devuelve el número de siniestros asociados a un incidente específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Conteo obtenido correctamente")
    })
    @GetMapping("/contar-por-incidente/{incidenteId}")
    public Long contarPorIncidente(@Parameter(description = "ID del incidente") @PathVariable Integer incidenteId) {
        return siniestroServices.countByIncidenteId(incidenteId);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Actualizar observación", description = "Actualiza la observación de un siniestro y registra la fecha de última modificación")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Observación actualizada correctamente"),
        @ApiResponse(responseCode = "400", description = "Error de validación"),
        @ApiResponse(responseCode = "404", description = "Siniestro no encontrado")
    })
    @PatchMapping("/actualizar-observacion/{id}")
    @Transactional(readOnly = false)
    public ResponseEntity<?> actualizarObservacion(
        @Parameter(description = "ID del siniestro") @PathVariable Integer id,
        @Parameter(description = "Nueva observación") @RequestBody java.util.Map<String, String> body) {
        try {
            String observacion = body.get("observacion");
            if (observacion == null) {
                return ResponseEntity.badRequest().body("El campo 'observacion' es requerido");
            }
            Siniestro actualizado = siniestroServices.actualizarObservacion(id, observacion);
            // Devolver solo los campos relevantes para evitar problemas de lazy loading
            java.util.Map<String, Object> respuesta = new java.util.HashMap<>();
            respuesta.put("idSin", actualizado.getIdSin());
            respuesta.put("observacion", actualizado.getObservacion());
            respuesta.put("fechaUltimaModificacion", actualizado.getFechaUltimaModificacion());
            respuesta.put("mensaje", "Observación actualizada correctamente");
            return ResponseEntity.ok(respuesta);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error interno: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Importar siniestros desde Excel", description = "Carga masiva de siniestros desde archivo XLSX")
    @PostMapping("/importar")
    public ResponseEntity<String> importarDesdeExcel(@RequestParam("file") MultipartFile file) {
        try {
            String resultado = siniestroImportService.procesarArchivo(file.getInputStream()).get();
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al importar: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Exportar siniestros a Excel", description = "Descarga todos los siniestros en formato XLSX")
    @GetMapping("/exportar")
    public void exportarAExcel(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=siniestros.xlsx");
        siniestroImportService.exportarAExcel(response.getOutputStream());
    }
}
