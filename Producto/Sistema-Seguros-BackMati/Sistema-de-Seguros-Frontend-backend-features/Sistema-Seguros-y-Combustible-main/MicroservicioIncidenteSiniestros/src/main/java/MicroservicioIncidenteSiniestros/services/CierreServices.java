package MicroservicioIncidenteSiniestros.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import MicroservicioIncidenteSiniestros.model.Cierre;
import MicroservicioIncidenteSiniestros.repository.CierreRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class CierreServices {

    @Autowired
    private CierreRepository cierreRepository;

    public List<Cierre> listarCierres() {
        return cierreRepository.findAll();
    }

    public Cierre obtenerCierrePorId(Integer id) {
        return cierreRepository.findById(id).orElse(null);
    }

    public Cierre crearCierre(Cierre cierre) {
        return cierreRepository.save(cierre);
    }

    public Cierre actualizarCierre(Integer id, Cierre cierre) {
        Cierre existente = cierreRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setFechaCierre(cierre.getFechaCierre());
            existente.setMotivoCierre(cierre.getMotivoCierre());
            return cierreRepository.save(existente);
        }
        return null;
    }

    public void eliminarCierre(Integer id) {
        cierreRepository.deleteById(id);
    }
}
