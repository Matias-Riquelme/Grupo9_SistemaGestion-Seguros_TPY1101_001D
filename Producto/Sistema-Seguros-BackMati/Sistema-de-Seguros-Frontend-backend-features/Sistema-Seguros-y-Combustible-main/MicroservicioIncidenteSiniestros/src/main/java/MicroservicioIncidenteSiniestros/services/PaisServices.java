package MicroservicioIncidenteSiniestros.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import MicroservicioIncidenteSiniestros.model.Pais;
import MicroservicioIncidenteSiniestros.repository.PaisRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class PaisServices {

    @Autowired
    private PaisRepository paisRepository;

    public List<Pais> listarPaises() {
        return paisRepository.findAll();
    }

    public Pais obtenerPaisPorId(Integer id) {
        return paisRepository.findById(id).orElse(null);
    }

    public Pais crearPais(Pais pais) {
        return paisRepository.save(pais);
    }

    public Pais actualizarPais(Integer id, Pais pais) {
        Pais existente = paisRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setNombrePais(pais.getNombrePais());
            return paisRepository.save(existente);
        }
        return null;
    }

    public void eliminarPais(Integer id) {
        paisRepository.deleteById(id);
    }
}
