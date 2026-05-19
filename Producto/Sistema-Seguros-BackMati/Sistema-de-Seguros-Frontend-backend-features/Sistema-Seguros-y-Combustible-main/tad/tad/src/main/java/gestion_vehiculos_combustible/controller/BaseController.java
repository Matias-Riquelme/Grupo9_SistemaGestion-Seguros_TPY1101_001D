package gestion_vehiculos_combustible.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import gestion_vehiculos_combustible.dto.BaseDTO;
import gestion_vehiculos_combustible.mapper.BaseMapper;
import gestion_vehiculos_combustible.model.Base;
import gestion_vehiculos_combustible.service.BaseService;

@RestController
@RequestMapping("/api/bases")
public class BaseController {

    @Autowired
    private BaseService baseService;

    @Autowired
    private BaseMapper baseMapper;

    /**
     * Crea una nueva base.
     * 
     * @param baseDTO Datos de la base a crear.
     * @return ResponseEntity con la base creada.
     */
    
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping
    public ResponseEntity<BaseDTO> crearBase(@RequestBody @NonNull BaseDTO baseDTO) {
        Base base = baseMapper.toEntity(baseDTO);
        if (base == null)
            return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(baseMapper.toDTO(baseService.guardarBase(base)));
    }

    /**
     * Lista todas las bases registradas.
     * 
     * @return Lista de BaseDTO.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping
    public List<BaseDTO> listarBases() {
        return baseService.listarBases().stream()
                .map(baseMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene una base por su ID.
     * 
     * @param id ID de la base.
     * @return ResponseEntity con la base encontrada o 404.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/{id}")
    public ResponseEntity<BaseDTO> obtenerBase(@PathVariable @NonNull Long id) {
        Optional<Base> base = baseService.obtenerBasePorId(id);
        return base.map(b -> ResponseEntity.ok(baseMapper.toDTO(b)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Elimina una base por su ID.
     * 
     * @param id ID de la base a eliminar.
     * @return ResponseEntity con estado 204.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarBase(@PathVariable @NonNull Long id) {
        baseService.eliminarBase(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Actualiza una base existente.
     * 
     * @param id      ID de la base a actualizar.
     * @param baseDTO Nuevos datos de la base.
     * @return ResponseEntity con la base actualizada.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/actualizar/{id}")
    public ResponseEntity<BaseDTO> actualizarBase(@PathVariable @NonNull Long id,
            @RequestBody @NonNull BaseDTO baseDTO) {
        Optional<Base> baseExistente = baseService.obtenerBasePorId(id);
        if (baseExistente.isPresent()) {
            Base baseActualizado = baseExistente.get();
            baseActualizado.setNombre(baseDTO.getNombre());
            return ResponseEntity.ok(baseMapper.toDTO(baseService.guardarBase(baseActualizado)));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
