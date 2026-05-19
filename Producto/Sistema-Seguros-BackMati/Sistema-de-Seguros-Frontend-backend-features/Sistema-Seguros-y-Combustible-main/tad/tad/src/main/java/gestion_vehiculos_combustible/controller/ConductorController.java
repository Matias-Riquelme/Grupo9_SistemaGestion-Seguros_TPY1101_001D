package gestion_vehiculos_combustible.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.lang.NonNull;
import java.io.IOException;
import org.springframework.security.access.prepost.PreAuthorize;
import gestion_vehiculos_combustible.dto.ConductorDTO;
import gestion_vehiculos_combustible.mapper.ConductorMapper;
import gestion_vehiculos_combustible.model.Conductor;
import gestion_vehiculos_combustible.service.ConductorService;
import gestion_vehiculos_combustible.service.ConductorImportService;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/conductores")

public class ConductorController {

    @Autowired
    private ConductorService conductorService;
    @Autowired
    private ConductorImportService conductorImportService;
    @Autowired
    private ConductorMapper conductorMapper;

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping
    public ResponseEntity<ConductorDTO> crearConductor(@RequestBody @NonNull ConductorDTO conductorDTO) {
        Conductor conductor = conductorMapper.toEntity(conductorDTO);
        if (conductor == null)
            return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(conductorMapper.toDTO(conductorService.guardarConductor(conductor)));
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping
    public List<ConductorDTO> listarConductores() {
        return conductorService.listarConductores().stream()
                .map(conductorMapper::toDTO)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/{id}")
    public ResponseEntity<ConductorDTO> obtenerConductorPorId(@PathVariable @NonNull Long id) {
        Optional<Conductor> conductorOpt = conductorService.obtenerConductorPorId(id);
        if (conductorOpt.isPresent()) {
            return ResponseEntity.ok(conductorMapper.toDTO(conductorOpt.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarConductor(@PathVariable @NonNull Long id) {
        boolean eliminado = conductorService.eliminarConductor(id);
        if (eliminado) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/actualizar/{id}")
    public ResponseEntity<ConductorDTO> actualizarConductor(@PathVariable @NonNull Long id,
            @RequestBody @NonNull ConductorDTO conductorDTO) {
        Optional<Conductor> conductorExistenteOpt = conductorService.obtenerConductorPorId(id);
        if (conductorExistenteOpt.isPresent()) {
            Conductor conductorExistente = conductorExistenteOpt.get();
            conductorExistente.setPrimerNombre(conductorDTO.getPrimerNombre());
            conductorExistente.setSegundoNombre(conductorDTO.getSegundoNombre());
            conductorExistente.setApellidoPaterno(conductorDTO.getApellidoPaterno());
            conductorExistente.setApellidoMaterno(conductorDTO.getApellidoMaterno());
            conductorExistente.setRut(conductorDTO.getRut());
            conductorExistente.setTelefono(conductorDTO.getTelefono());
            conductorExistente.setDireccion(conductorDTO.getDireccion());
            Conductor actualizado = conductorService.guardarConductor(conductorExistente);
            return ResponseEntity.ok(conductorMapper.toDTO(actualizado));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Importación masiva de conductores vía CSV.
     * 
     * @param file Archivo CSV con los datos de los conductores.
     * @return Mensaje de estado del proceso asíncrono.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping(value = "/importar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CompletableFuture<ResponseEntity<String>> importarConductores(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return CompletableFuture.completedFuture(ResponseEntity.badRequest().body("Archivo vacío"));
        }
        try {
            return conductorImportService.procesarArchivo(file.getInputStream())
                    .thenApply(resultado -> ResponseEntity.ok(resultado));
        } catch (Exception e) {
            return CompletableFuture
                    .completedFuture(ResponseEntity.internalServerError().body("Error: " + e.getMessage()));
        }
    }

    /**
     * Exportación masiva de conductores a Excel.
     * 
     * @param response Objeto HttpServletResponse para enviar el archivo.
     * @throws IOException Si ocurre un error al escribir el archivo.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @GetMapping("/exportar")
    public void exportarConductores(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=conductores.xlsx");
        conductorImportService.exportarAExcel(response.getOutputStream());
    }

}