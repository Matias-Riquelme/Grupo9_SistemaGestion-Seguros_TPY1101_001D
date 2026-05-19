package MicroservicioIncidenteSiniestros.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import MicroservicioIncidenteSiniestros.model.EstadoSiniestro;
import MicroservicioIncidenteSiniestros.repository.EstadoSiniestroRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class EstadoSiniestroServices {

    @Autowired
    private EstadoSiniestroRepository estadoSiniestroRepository;

    public List<EstadoSiniestro> listarEstadosSiniestro() {
        return estadoSiniestroRepository.findAll();
    }

    public EstadoSiniestro obtenerEstadoSiniestroPorId(Integer id) {
        return estadoSiniestroRepository.findById(id).orElse(null);
    }

    public EstadoSiniestro crearEstadoSiniestro(EstadoSiniestro estadoSiniestro) {
        return estadoSiniestroRepository.save(estadoSiniestro);
    }

    public EstadoSiniestro actualizarEstadoSiniestro(Integer id, EstadoSiniestro estadoSiniestro) {
        EstadoSiniestro existente = estadoSiniestroRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setNombreEstado(estadoSiniestro.getNombreEstado());
            return estadoSiniestroRepository.save(existente);
        }
        return null;
    }

    public void eliminarEstadoSiniestro(Integer id) {
        estadoSiniestroRepository.deleteById(id);
    }
}
