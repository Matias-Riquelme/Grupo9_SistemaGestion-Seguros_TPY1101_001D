package gestion_vehiculos_combustible.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import gestion_vehiculos_combustible.model.Vehiculo;
import gestion_vehiculos_combustible.repository.VehiculoRepository;

@Service
public class VehiculoService {

    @Autowired
    private VehiculoRepository vehiculoRepository;

    public Vehiculo guardarVehiculo(@NonNull Vehiculo vehiculo) {
        return vehiculoRepository.save(vehiculo);
    }

    public Vehiculo actualizarVehiculo(@NonNull Vehiculo vehiculo) {
        return vehiculoRepository.save(vehiculo);
    }

    public List<Vehiculo> listarVehiculos() {
        return vehiculoRepository.findAll();
    }

    // Modificado para usar ID
    public Optional<Vehiculo> obtenerVehiculoPorId(@NonNull Long id) {
        return vehiculoRepository.findById(id);
    }

    // Modificado para eliminar por ID
    public void eliminarVehiculo(@NonNull Long id) {
        vehiculoRepository.deleteById(id);
    }

    public List<Vehiculo> obtenerVehiculosPorPatente(@NonNull String patente) {
        return vehiculoRepository.findByPatente(patente);
    }
}
