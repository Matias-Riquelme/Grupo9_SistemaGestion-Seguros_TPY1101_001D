package gestion_vehiculos_combustible.mapper;

import gestion_vehiculos_combustible.dto.OperacionesDTO;
import gestion_vehiculos_combustible.model.Base;
import gestion_vehiculos_combustible.model.Operaciones;
import gestion_vehiculos_combustible.repository.BaseRepository;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OperacionesMapper {

    private final BaseRepository baseRepository;

    public OperacionesDTO toDTO(Operaciones operaciones) {
        if (operaciones == null)
            return null;
        OperacionesDTO dto = new OperacionesDTO();
        dto.setId_operacion(operaciones.getId_operacion());
        dto.setNombre(operaciones.getNombre());
        if (operaciones.getBase() != null) {
            dto.setId_base(operaciones.getBase().getId_base());
        }
        return dto;
    }

    public Operaciones toEntity(OperacionesDTO dto) {
        if (dto == null)
            return null;
        Operaciones entity = new Operaciones();
        entity.setId_operacion(dto.getId_operacion());
        entity.setNombre(dto.getNombre());
        if (dto.getId_base() != null) {
            Base base = baseRepository.findById(dto.getId_base()).orElse(null);
            entity.setBase(base);
        }
        return entity;
    }
}
