package gestion_vehiculos_combustible.service;

import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Optional;

import gestion_vehiculos_combustible.model.Conductor;
import gestion_vehiculos_combustible.repository.ConductorRepository;
@Service


public class ConductorService {
    @Autowired
    private ConductorRepository conductorRepository;

    public Conductor guardarConductor(@NonNull Conductor conductor) {
        return conductorRepository.save(conductor);
    }

    public Optional<Conductor> obtenerConductorPorId(@NonNull Long id) {
        return conductorRepository.findById(id);
    }

    public boolean eliminarConductor(@NonNull Long id) {
        if (conductorRepository.existsById(id)) {
            conductorRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Conductor> listarConductores() {
        return conductorRepository.findAll();
    }

    
}
