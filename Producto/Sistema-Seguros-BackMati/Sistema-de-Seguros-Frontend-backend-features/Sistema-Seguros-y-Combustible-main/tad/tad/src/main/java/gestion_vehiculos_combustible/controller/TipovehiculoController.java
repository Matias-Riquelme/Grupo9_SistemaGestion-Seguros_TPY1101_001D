package gestion_vehiculos_combustible.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gestion_vehiculos_combustible.dto.TipovehiculoDTO;
import gestion_vehiculos_combustible.mapper.TipovehiculoMapper;
import gestion_vehiculos_combustible.model.Tipovehiculo;
import gestion_vehiculos_combustible.service.TipovehiculoService;

@RestController
@RequestMapping("/api/tipo-vehiculo")
public class TipovehiculoController {

    @Autowired
    private TipovehiculoService tipovehiculoService;

    @Autowired
    private TipovehiculoMapper tipovehiculoMapper;

    /**
     * Crea un nuevo tipo de vehículo.
     * 
     * @param tipovehiculoDTO Datos del tipo de vehículo a crear.
     * @return ResponseEntity con el tipo de vehículo creado.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping
    public ResponseEntity<TipovehiculoDTO> crearTipovehiculo(@RequestBody @NonNull TipovehiculoDTO tipovehiculoDTO) {
        Tipovehiculo tipovehiculo = tipovehiculoMapper.toEntity(tipovehiculoDTO);
        if (tipovehiculo == null)
            return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(tipovehiculoMapper.toDTO(tipovehiculoService.guardarTipovehiculo(tipovehiculo)));
    }

    /**
     * Lista todos los tipos de vehículo.
     * 
     * @return Lista de TipovehiculoDTO.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping
    public List<TipovehiculoDTO> listarTipovehiculos() {
        return tipovehiculoService.listarTipovehiculos().stream()
                .map(tipovehiculoMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene un tipo de vehículo por su ID.
     * 
     * @param id ID del tipo de vehículo.
     * @return ResponseEntity con el tipo de vehículo encontrado o 404.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role', 'user_client_role')")
    @GetMapping("/{id}")
    public ResponseEntity<TipovehiculoDTO> obtenerTipovehiculo(@PathVariable @NonNull Long id) {
        Optional<Tipovehiculo> tipovehiculo = tipovehiculoService.obtenerTipovehiculoPorId(id);
        return tipovehiculo.map(t -> ResponseEntity.ok(tipovehiculoMapper.toDTO(t)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Elimina un tipo de vehículo por su ID.
     * 
     * @param id ID del tipo de vehículo a eliminar.
     * @return ResponseEntity con estado 204.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTipovehiculo(@PathVariable @NonNull Long id) {
        tipovehiculoService.eliminarTipovehiculo(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Actualiza un tipo de vehículo existente.
     * 
     * @param id              ID del tipo de vehículo a actualizar.
     * @param tipovehiculoDTO Nuevos datos del tipo de vehículo.
     * @return ResponseEntity con el tipo de vehículo actualizado.
     */
    @PreAuthorize("hasAnyRole('admin_client_role', 'admin')")
    @PostMapping("/actualizar/{id}")
    public ResponseEntity<TipovehiculoDTO> actualizarTipovehiculo(@PathVariable @NonNull Long id,
            @RequestBody @NonNull TipovehiculoDTO tipovehiculoDTO) {
        Optional<Tipovehiculo> tipovehiculoExistente = tipovehiculoService.obtenerTipovehiculoPorId(id);
        if (tipovehiculoExistente.isPresent()) {
            Tipovehiculo tipovehiculoActualizado = tipovehiculoExistente.get();
            tipovehiculoActualizado.setTipo_vehiculo(tipovehiculoDTO.getTipo_vehiculo());
            return ResponseEntity
                    .ok(tipovehiculoMapper.toDTO(tipovehiculoService.guardarTipovehiculo(tipovehiculoActualizado)));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
