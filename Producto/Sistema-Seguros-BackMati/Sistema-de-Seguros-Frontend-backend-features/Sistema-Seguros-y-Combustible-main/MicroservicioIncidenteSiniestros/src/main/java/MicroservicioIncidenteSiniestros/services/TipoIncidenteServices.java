package MicroservicioIncidenteSiniestros.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import MicroservicioIncidenteSiniestros.model.TipoIncidente;
import MicroservicioIncidenteSiniestros.repository.TipoIncidenteRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class TipoIncidenteServices {

    @Autowired
    private TipoIncidenteRepository tipoIncidenteRepository;

    public List<TipoIncidente> listarTiposIncidente() {
        return tipoIncidenteRepository.findAll();
    }

    public TipoIncidente obtenerTipoIncidentePorId(Integer id) {
        return tipoIncidenteRepository.findById(id).orElse(null);
    }

    public TipoIncidente crearTipoIncidente(TipoIncidente tipoIncidente) {
        return tipoIncidenteRepository.save(tipoIncidente);
    }

    public TipoIncidente actualizarTipoIncidente(Integer id, TipoIncidente tipoIncidente) {
        TipoIncidente existente = tipoIncidenteRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setNombreTipoIncidente(tipoIncidente.getNombreTipoIncidente());
            return tipoIncidenteRepository.save(existente);
        }
        return null;
    }

    public void eliminarTipoIncidente(Integer id) {
        tipoIncidenteRepository.deleteById(id);
    }
}
