package MicroservicioIncidenteSiniestros.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import MicroservicioIncidenteSiniestros.model.Asegurado;
import MicroservicioIncidenteSiniestros.services.AseguradoServices;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/asegurado")
@CrossOrigin(origins = "*")
@Tag(name = "Asegurado", description = "Operaciones relacionadas con asegurados")
public class AseguradoController {

    @Autowired
    private AseguradoServices aseguradoServices;

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Listar asegurados", description = "Obtiene la lista de todos los asegurados")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista obtenida correctamente")
    })
    @GetMapping("/listar")
    public List<Asegurado> listar() {
        return aseguradoServices.listarAsegurados();
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Obtener asegurado por ID", description = "Obtiene un asegurado específico por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Asegurado obtenido correctamente"),
        @ApiResponse(responseCode = "404", description = "Asegurado no encontrado")
    })
    @GetMapping("/obtener/{id}")
    public Asegurado obtener(@Parameter(description = "ID del asegurado") @PathVariable Integer id) {
        return aseguradoServices.obtenerAseguradoPorId(id);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Crear asegurado", description = "Crea un nuevo asegurado")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Asegurado creado correctamente")
    })
    @PostMapping("/crear")
    public Asegurado crear(@Parameter(description = "Datos del asegurado") @RequestBody Asegurado asegurado) {
        return aseguradoServices.crearAsegurado(asegurado);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Actualizar asegurado", description = "Actualiza un asegurado existente por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Asegurado actualizado correctamente"),
        @ApiResponse(responseCode = "404", description = "Asegurado no encontrado")
    })
    @PutMapping("/actualizar/{id}")
    public Asegurado actualizar(
        @Parameter(description = "ID del asegurado") @PathVariable Integer id,
        @Parameter(description = "Datos actualizados del asegurado") @RequestBody Asegurado asegurado) {
        return aseguradoServices.actualizarAsegurado(id, asegurado);
    }

    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @Operation(summary = "Eliminar asegurado", description = "Elimina un asegurado por su ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Asegurado eliminado correctamente"),
        @ApiResponse(responseCode = "404", description = "Asegurado no encontrado")
    })
    @DeleteMapping("/eliminar/{id}")
    public void eliminar(@Parameter(description = "ID del asegurado") @PathVariable Integer id) {
        aseguradoServices.eliminarAsegurado(id);
    }
}
