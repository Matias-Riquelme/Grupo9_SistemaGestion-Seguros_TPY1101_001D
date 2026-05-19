
package MicroservicioIncidenteSiniestros.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import MicroservicioIncidenteSiniestros.model.Cobertura;
import MicroservicioIncidenteSiniestros.repository.CoberturaRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class CoberturaServices {

    @Autowired
    private CoberturaRepository coberturaRepository;

    public List<Cobertura> listarCoberturas() {
        return coberturaRepository.findAll();
    }

    public Cobertura obtenerCoberturaPorId(Integer id) {
        return coberturaRepository.findById(id).orElse(null);
    }

    public Cobertura crearCobertura(Cobertura cobertura) {
        return coberturaRepository.save(cobertura);
    }

    public Cobertura actualizarCobertura(Integer id, Cobertura cobertura) {
        Cobertura existente = coberturaRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setDescripcionCob(cobertura.getDescripcionCob());
            // Solo actualizar la póliza si se envía una nueva, de lo contrario mantener la existente
            if (cobertura.getPoliza() != null) {
                existente.setPoliza(cobertura.getPoliza());
            }
            return coberturaRepository.save(existente);
        }
        return null;
    }

    public void eliminarCobertura(Integer id) {
        coberturaRepository.deleteById(id);
    }
    public List<Cobertura> listarCoberturasPorPoliza(Integer idPoliza) {
        return coberturaRepository.findByPoliza_IdPol(idPoliza);
    }
}
