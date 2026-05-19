package MicroservicioIncidenteSiniestros.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import MicroservicioIncidenteSiniestros.model.Contratante;
import MicroservicioIncidenteSiniestros.repository.ContratanteRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class ContratanteServices {

    @Autowired
    private ContratanteRepository contratanteRepository;

    public List<Contratante> listarContratantes() {
        return contratanteRepository.findAll();
    }

    public Contratante obtenerContratantePorId(Integer id) {
        return contratanteRepository.findById(id).orElse(null);
    }

    public Contratante crearContratante(Contratante contratante) {
        return contratanteRepository.save(contratante);
    }

    public Contratante actualizarContratante(Integer id, Contratante contratante) {
        Contratante existente = contratanteRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setRazonSocialContra(contratante.getRazonSocialContra());
            existente.setRutContra(contratante.getRutContra());
            return contratanteRepository.save(existente);
        }
        return null;
    }

    public void eliminarContratante(Integer id) {
        contratanteRepository.deleteById(id);
    }
}
