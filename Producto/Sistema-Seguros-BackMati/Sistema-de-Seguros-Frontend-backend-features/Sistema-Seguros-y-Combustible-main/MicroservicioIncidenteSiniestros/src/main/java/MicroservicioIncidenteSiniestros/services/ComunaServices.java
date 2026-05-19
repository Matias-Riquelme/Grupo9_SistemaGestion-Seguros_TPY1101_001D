package MicroservicioIncidenteSiniestros.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import MicroservicioIncidenteSiniestros.model.Comuna;
import MicroservicioIncidenteSiniestros.repository.ComunaRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class ComunaServices {

    @Autowired
    private ComunaRepository comunaRepository;

    public List<Comuna> listarComunas() {
        return comunaRepository.findAll();
    }

    public Comuna obtenerComunaPorId(Integer id) {
        return comunaRepository.findById(id).orElse(null);
    }

    public Comuna crearComuna(Comuna comuna) {
        return comunaRepository.save(comuna);
    }

    public Comuna actualizarComuna(Integer id, Comuna comuna) {
        Comuna existente = comunaRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setNombreComuna(comuna.getNombreComuna());
            existente.setRegion(comuna.getRegion());
            return comunaRepository.save(existente);
        }
        return null;
    }

    public void eliminarComuna(Integer id) {
        comunaRepository.deleteById(id);
    }
}
