package MicroservicioIncidenteSiniestros.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import MicroservicioIncidenteSiniestros.model.UbicacionIncidente;
import MicroservicioIncidenteSiniestros.repository.UbicacionIncidenteRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class UbicacionIncidenteServices {

    @Autowired
    private UbicacionIncidenteRepository ubicacionIncidenteRepository;

    public List<UbicacionIncidente> listarUbicaciones() {
        return ubicacionIncidenteRepository.findAll();
    }

    public UbicacionIncidente obtenerUbicacionPorId(Integer id) {
        return ubicacionIncidenteRepository.findById(id).orElse(null);
    }

    public UbicacionIncidente crearUbicacion(UbicacionIncidente ubicacion) {
        return ubicacionIncidenteRepository.save(ubicacion);
    }

    public UbicacionIncidente actualizarUbicacion(Integer id, UbicacionIncidente ubicacion) {
        UbicacionIncidente existente = ubicacionIncidenteRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setDescripcionUbi(ubicacion.getDescripcionUbi());
            existente.setComuna(ubicacion.getComuna());
            return ubicacionIncidenteRepository.save(existente);
        }
        return null;
    }

    public void eliminarUbicacion(Integer id) {
        ubicacionIncidenteRepository.deleteById(id);
    }
}
