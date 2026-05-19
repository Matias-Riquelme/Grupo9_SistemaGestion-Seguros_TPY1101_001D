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
import MicroservicioIncidenteSiniestros.dto.FormularioIncidenteDTO;
import MicroservicioIncidenteSiniestros.dto.DTOMapper;
import MicroservicioIncidenteSiniestros.model.FormularioIncidente;
import MicroservicioIncidenteSiniestros.services.FormularioIncidenteServices;
import MicroservicioIncidenteSiniestros.services.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/formulario-incidente")
@CrossOrigin(origins = "*")
@Tag(name = "FormularioIncidente", description = "Operaciones relacionadas con formularios de incidentes")
@Transactional(readOnly = true) // para evitar problemas de Lazy Loading, Lazy Loading es cuando se cargan datos relacionados solo cuando se accede a ellos
public class FormularioIncidenteController {

    @Autowired
    private FormularioIncidenteServices formularioIncidenteServices;

    @Autowired
    private DTOMapper dtoMapper;

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private MicroservicioIncidenteSiniestros.services.FormularioIncidenteImportService formularioIncidenteImportService;

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @Operation(summary = "Listar formularios de incidentes", description = "Obtiene la lista de todos los formularios de incidentes")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente")
    })
    @GetMapping("/listar")
    public List<FormularioIncidenteDTO> listar() {
        return formularioIncidenteServices.listarFormularios().stream()
                .map(dtoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @Operation(summary = "Obtener formulario de incidente por ID", description = "Obtiene un formulario de incidente específico por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Formulario obtenido correctamente"),
        @ApiResponse(responseCode = "404", description = "Formulario no encontrado")
    })
    @GetMapping("/obtener/{id}")
    public ResponseEntity<FormularioIncidenteDTO> obtener(@Parameter(description = "ID del formulario de incidente") @PathVariable Integer id) {
        FormularioIncidente formulario = formularioIncidenteServices.obtenerFormularioPorId(id);
        if (formulario == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dtoMapper.toDTO(formulario));
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @Operation(summary = "Crear formulario de incidente", description = "Crea un nuevo formulario de incidente")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Formulario creado correctamente")
    })
    @PostMapping("/crear")
    @Transactional
    public ResponseEntity<FormularioIncidenteDTO> crear(
            @Parameter(description = "Datos del formulario de incidente") @RequestBody FormularioIncidente formulario,
            @RequestParam(value = "recipients", required = false) String recipients
    ) {
        FormularioIncidente creado = formularioIncidenteServices.crearFormulario(formulario);
        // Recargar desde DB para inicializar relaciones lazy (ubicacion, tipoIncidente, terceros)
        FormularioIncidente recargado = formularioIncidenteServices.obtenerFormularioPorId(creado.getIdForm());

        // Enviar correo si se proporcionan destinatarios en parametro 'recipients' (comma-separated)
        if (recipients != null && !recipients.isBlank()) {
            String[] to = recipients.split(",");
            emailService.enviarCorreoFormulario(to, recargado != null ? recargado : creado);
        }

        return ResponseEntity.ok(dtoMapper.toDTO(recargado != null ? recargado : creado));
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @Operation(summary = "Actualizar formulario de incidente", description = "Actualiza un formulario de incidente existente por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Formulario actualizado correctamente"),
        @ApiResponse(responseCode = "404", description = "Formulario no encontrado")
    })
    @PutMapping("/actualizar/{id}")
    @Transactional
    public ResponseEntity<FormularioIncidenteDTO> actualizar(
        @Parameter(description = "ID del formulario de incidente") @PathVariable Integer id,
        @Parameter(description = "Datos actualizados del formulario de incidente") @RequestBody FormularioIncidente formulario) {
        FormularioIncidente actualizado = formularioIncidenteServices.actualizarFormulario(id, formulario);
        if (actualizado == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dtoMapper.toDTO(actualizado));
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Eliminar formulario de incidente", description = "Elimina un formulario de incidente por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Formulario eliminado correctamente"),
        @ApiResponse(responseCode = "404", description = "Formulario no encontrado")
    })
    @DeleteMapping("/eliminar/{id}")
    @Transactional(readOnly = false)
    public ResponseEntity<?> eliminar(@Parameter(description = "ID del formulario de incidente") @PathVariable Integer id) {
        try {
            formularioIncidenteServices.eliminarFormulario(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error interno: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @Operation(summary = "Listar formularios por siniestro", description = "Obtiene la lista de formularios de incidentes asociados a un siniestro específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente")
    })
    @GetMapping("/por-siniestro/{siniestroId}")
    public List<FormularioIncidenteDTO> listarPorSiniestro(@Parameter(description = "ID del siniestro") @PathVariable Integer siniestroId) {
        return formularioIncidenteServices.findBySiniestroId(siniestroId).stream()
                .map(dtoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @Operation(summary = "Contar formularios por siniestro", description = "Devuelve el número de formularios de incidentes asociados a un siniestro específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Conteo obtenido correctamente")
    })
    @GetMapping("/contar-por-siniestro/{siniestroId}")
    public Long contarPorSiniestro(@Parameter(description = "ID del siniestro") @PathVariable Integer siniestroId) {
        return formularioIncidenteServices.countBySiniestroId(siniestroId);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Importar formularios de incidente desde Excel", description = "Carga masiva de formularios de incidentes desde archivo XLSX")
    @PostMapping("/importar")
    public ResponseEntity<String> importarDesdeExcel(@RequestParam("file") MultipartFile file) {
        try {
            String resultado = formularioIncidenteImportService.procesarArchivo(file.getInputStream()).get();
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al importar: " + e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Exportar formularios de incidente a Excel", description = "Descarga todos los formularios de incidentes en formato XLSX")
    @GetMapping("/exportar")
    public void exportarAExcel(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=formularios_incidente.xlsx");
        formularioIncidenteImportService.exportarAExcel(response.getOutputStream());
    }
}
