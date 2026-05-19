package MicroservicioIncidenteSiniestros.services;

import MicroservicioIncidenteSiniestros.model.TipoDeducible;
import MicroservicioIncidenteSiniestros.repository.TipoDeducibleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.util.List;

@Service
@Transactional
public class TipoDeducibleServices {
    @Autowired
    private TipoDeducibleRepository tipoDeducibleRepository;

    public List<TipoDeducible> listarTiposDeducible() {
        return tipoDeducibleRepository.findAll();
    }

    public TipoDeducible obtenerTipoDeduciblePorId(Integer id) {
        return tipoDeducibleRepository.findById(id).orElse(null);
    }

    public TipoDeducible crearTipoDeducible(TipoDeducible tipoDeducible) {
        return tipoDeducibleRepository.save(tipoDeducible);
    }

    public TipoDeducible actualizarTipoDeducible(Integer id, TipoDeducible tipoDeducible) {
        TipoDeducible existente = tipoDeducibleRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setNombre(tipoDeducible.getNombre());
            existente.setDescripcion(tipoDeducible.getDescripcion());
            existente.setActivo(tipoDeducible.getActivo());
            return tipoDeducibleRepository.save(existente);
        }
        return null;
    }

    public void eliminarTipoDeducible(Integer id) {
        tipoDeducibleRepository.deleteById(id);
    }
}
