package gestion_vehiculos_combustible.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.security.access.prepost.PreAuthorize;
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

import gestion_vehiculos_combustible.dto.VehiculoDTO;
import gestion_vehiculos_combustible.mapper.VehiculoMapper;
import gestion_vehiculos_combustible.model.Operaciones;
import gestion_vehiculos_combustible.model.Tipovehiculo;
import gestion_vehiculos_combustible.model.Vehiculo;
import gestion_vehiculos_combustible.service.VehiculoService;
import gestion_vehiculos_combustible.service.VehiculoImportService;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/vehiculos")
public class VehiculoController {

    @Autowired
    private VehiculoService vehiculoService;

    @Autowired
    private VehiculoImportService vehiculoImportService;

    @Autowired
    private VehiculoMapper vehiculoMapper;

    /**
     * Crea un nuevo vehículo.
     * 
     * @param vehiculoDTO Datos del vehículo a crear.
     * @return ResponseEntity con el vehículo creado.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping
    public ResponseEntity<VehiculoDTO> crearVehiculo(@RequestBody @NonNull VehiculoDTO vehiculoDTO) {
        Vehiculo vehiculo = vehiculoMapper.toEntity(vehiculoDTO);
        if (vehiculo == null) {
            return ResponseEntity.badRequest().build();
        }
        Vehiculo guardado = vehiculoService.guardarVehiculo(vehiculo);
        return ResponseEntity.ok(vehiculoMapper.toDTO(guardado));
    }

    /**
     * Lista todos los vehículos registrados.
     * 
     * @return Lista de VehiculoDTO.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping
    public List<VehiculoDTO> listarVehiculos() {
        return vehiculoService.listarVehiculos()
                .stream()
                .map(vehiculoMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un vehículo por su ID o patente (vía service).
     * 
     * @param id ID del vehículo.
     * @return ResponseEntity con el vehículo encontrado o 404.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/{id}")
    public ResponseEntity<VehiculoDTO> obtenerVehiculo(@PathVariable @NonNull Long id) {
        Optional<Vehiculo> vehiculo = vehiculoService.obtenerVehiculoPorId(id);
        return vehiculo.map(v -> ResponseEntity.ok(vehiculoMapper.toDTO(v)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Elimina un vehículo por su ID.
     * 
     * @param id ID del vehículo a eliminar.
     * @return ResponseEntity con estado 204.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarVehiculo(@PathVariable @NonNull Long id) {
        vehiculoService.eliminarVehiculo(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Actualiza la información de un vehículo existente.
     * Incluye datos técnicos como número de motor y chasis.
     * 
     * @param id          ID del vehículo a actualizar.
     * @param vehiculoDTO Nuevos datos del vehículo.
     * @return ResponseEntity con el vehículo actualizado.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/actualizar/{id}")
    public ResponseEntity<VehiculoDTO> actualizarVehiculo(@PathVariable @NonNull Long id,
            @RequestBody @NonNull VehiculoDTO vehiculoDTO) {
        Optional<Vehiculo> vehiculoExistente = vehiculoService.obtenerVehiculoPorId(id);
        if (vehiculoExistente.isPresent()) {
            Vehiculo vehiculoActualizado = vehiculoExistente.get();
            vehiculoActualizado.setMarca(vehiculoDTO.getMarca());
            vehiculoActualizado.setModelo(vehiculoDTO.getModelo());
            vehiculoActualizado.setId_tipo_vehiculo(
                    vehiculoDTO.getId_tipo_vehiculo() != null
                            ? new Tipovehiculo(vehiculoDTO.getId_tipo_vehiculo(), null)
                            : null);
            vehiculoActualizado.setId_operacion(
                    vehiculoDTO.getId_operacion() != null ? new Operaciones(vehiculoDTO.getId_operacion(), null, null) : null);
            vehiculoActualizado.setAnio(vehiculoDTO.getAnio());
            vehiculoActualizado.setAnioRegistro(vehiculoDTO.getAnioRegistro());
            vehiculoActualizado.setNum_motor_veh(vehiculoDTO.getNum_motor_veh());
            vehiculoActualizado.setNum_chasis_veh(vehiculoDTO.getNum_chasis_veh());

            Vehiculo guardado = vehiculoService.guardarVehiculo(vehiculoActualizado);
            return ResponseEntity.ok(vehiculoMapper.toDTO(guardado));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Importación masiva de vehículos vía CSV.
     * 
     * @param file Archivo CSV con los datos de los vehículos.
     * @return Mensaje de estado del proceso asíncrono.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping(value = "/importar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CompletableFuture<ResponseEntity<String>> importarVehiculos(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return CompletableFuture.completedFuture(ResponseEntity.badRequest().body("Archivo vacío"));
        }
        try {
            return vehiculoImportService.procesarArchivo(file.getInputStream())
                    .thenApply(resultado -> ResponseEntity.ok(resultado));
        } catch (Exception e) {
            return CompletableFuture
                    .completedFuture(ResponseEntity.internalServerError().body("Error: " + e.getMessage()));
        }
    }

    /**
     * Exportación masiva de vehículos a Excel.
     * 
     * @param response Objeto HttpServletResponse para enviar el archivo.
     * @throws IOException Si ocurre un error al escribir el archivo.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @GetMapping("/exportar")
    public void exportarVehiculos(HttpServletResponse response) throws IOException {
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=vehiculos.xlsx");
        vehiculoImportService.exportarAExcel(response.getOutputStream());
    }

}
