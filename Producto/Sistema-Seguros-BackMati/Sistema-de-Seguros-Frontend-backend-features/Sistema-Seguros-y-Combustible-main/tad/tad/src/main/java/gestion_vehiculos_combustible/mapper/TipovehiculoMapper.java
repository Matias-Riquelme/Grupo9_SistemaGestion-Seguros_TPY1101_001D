package gestion_vehiculos_combustible.mapper;

import gestion_vehiculos_combustible.dto.TipovehiculoDTO;
import gestion_vehiculos_combustible.model.Tipovehiculo;
import org.springframework.stereotype.Component;

@Component
public class TipovehiculoMapper {

    public TipovehiculoDTO toDTO(Tipovehiculo entity) {
        if (entity == null)
            return null;
        TipovehiculoDTO dto = new TipovehiculoDTO();
        dto.setId_tipo_vehiculo(entity.getId_tipo_vehiculo());
        dto.setTipo_vehiculo(entity.getTipo_vehiculo());
        return dto;
    }

    public Tipovehiculo toEntity(TipovehiculoDTO dto) {
        if (dto == null)
            return null;
        Tipovehiculo entity = new Tipovehiculo();
        entity.setId_tipo_vehiculo(dto.getId_tipo_vehiculo());
        entity.setTipo_vehiculo(dto.getTipo_vehiculo());
        return entity;
    }
}
