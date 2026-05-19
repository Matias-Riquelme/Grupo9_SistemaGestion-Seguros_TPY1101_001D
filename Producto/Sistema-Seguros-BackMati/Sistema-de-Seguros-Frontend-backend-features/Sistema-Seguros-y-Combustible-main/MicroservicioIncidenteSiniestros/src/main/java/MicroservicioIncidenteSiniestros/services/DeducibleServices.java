
package MicroservicioIncidenteSiniestros.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import MicroservicioIncidenteSiniestros.model.Deducible;
import MicroservicioIncidenteSiniestros.repository.DeducibleRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class DeducibleServices {

    @Autowired
    private DeducibleRepository deducibleRepository;

    public List<Deducible> listarDeducibles() {
        return deducibleRepository.findAll();
    }

    public Deducible obtenerDeduciblePorId(Integer id) {
        return deducibleRepository.findById(id).orElse(null);
    }

    public Deducible crearDeducible(Deducible deducible) {
        return deducibleRepository.save(deducible);
    }

    public Deducible actualizarDeducible(Integer id, Deducible deducible) {
        Deducible existente = deducibleRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setNombreDedu(deducible.getNombreDedu());
            // Solo actualizar la póliza si se envía una nueva, de lo contrario mantener la existente
            if (deducible.getPoliza() != null) {
                existente.setPoliza(deducible.getPoliza());
            }
            return deducibleRepository.save(existente);
        }
        return null;
    }

    public void eliminarDeducible(Integer id) {
        deducibleRepository.deleteById(id);
    }

  
    public List<Deducible> listarDeduciblesPorPoliza(Integer idPoliza) {
        return deducibleRepository.findByPoliza_IdPol(idPoliza);
    }
}
