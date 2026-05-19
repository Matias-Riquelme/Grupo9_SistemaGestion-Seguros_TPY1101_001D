package gestion_vehiculos_combustible.mapper;

import gestion_vehiculos_combustible.dto.VehiculoDTO;
import gestion_vehiculos_combustible.model.Operaciones;
import gestion_vehiculos_combustible.model.Tipovehiculo;
import gestion_vehiculos_combustible.model.Vehiculo;
import org.springframework.stereotype.Component;

@Component
public class VehiculoMapper {

    public VehiculoDTO toDTO(Vehiculo vehiculo) {
        if (vehiculo == null)
            return null;

        VehiculoDTO dto = new VehiculoDTO();
        dto.setId_vehiculo(vehiculo.getId_vehiculo());
        dto.setPatente(vehiculo.getPatente());
        dto.setMarca(vehiculo.getMarca());
        dto.setModelo(vehiculo.getModelo());
        // Cambio: Se añade validación de nulos para evitar NullPointerException si los
        // campos están vacíos en la DB
        dto.setId_tipo_vehiculo(
                vehiculo.getId_tipo_vehiculo() != null ? vehiculo.getId_tipo_vehiculo().getId_tipo_vehiculo() : null);
        dto.setId_operacion(vehiculo.getId_operacion() != null ? vehiculo.getId_operacion().getId_operacion() : null);
        dto.setAnio(vehiculo.getAnio());
        dto.setAnioRegistro(vehiculo.getAnioRegistro());
        dto.setNum_motor_veh(vehiculo.getNum_motor_veh());
        dto.setNum_chasis_veh(vehiculo.getNum_chasis_veh());
        dto.setIdPoliza(vehiculo.getIdPoliza());
        return dto;
    }

    public Vehiculo toEntity(VehiculoDTO dto) {
        if (dto == null)
            return null;

        Vehiculo entity = new Vehiculo();
        entity.setId_vehiculo(dto.getId_vehiculo());
        entity.setPatente(dto.getPatente());
        entity.setMarca(dto.getMarca());
        entity.setModelo(dto.getModelo());
        entity.setId_tipo_vehiculo(
                dto.getId_tipo_vehiculo() != null ? new Tipovehiculo(dto.getId_tipo_vehiculo(), null) : null);
        entity.setId_operacion(
                dto.getId_operacion() != null ? new Operaciones(dto.getId_operacion(), null, null) : null);
        entity.setAnio(dto.getAnio());
        entity.setAnioRegistro(dto.getAnioRegistro());
        entity.setNum_motor_veh(dto.getNum_motor_veh());
        entity.setNum_chasis_veh(dto.getNum_chasis_veh());
        entity.setIdPoliza(dto.getIdPoliza());
        return entity;
    }
}