package MicroservicioIncidenteSiniestros.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import MicroservicioIncidenteSiniestros.model.TipoPoliza;
import MicroservicioIncidenteSiniestros.repository.TipoPolizaRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class TipoPolizaServices {

    @Autowired
    private TipoPolizaRepository tipoPolizaRepository;

    public List<TipoPoliza> listarTiposPoliza() {
        return tipoPolizaRepository.findAll();
    }

    public TipoPoliza obtenerTipoPolizaPorId(Integer id) {
        return tipoPolizaRepository.findById(id).orElse(null);
    }

    public TipoPoliza crearTipoPoliza(TipoPoliza tipoPoliza) {
        return tipoPolizaRepository.save(tipoPoliza);
    }

    public TipoPoliza actualizarTipoPoliza(Integer id, TipoPoliza tipoPoliza) {
        TipoPoliza existente = tipoPolizaRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setNomTipoPol(tipoPoliza.getNomTipoPol());
            return tipoPolizaRepository.save(existente);
        }
        return null;
    }

    public void eliminarTipoPoliza(Integer id) {
        tipoPolizaRepository.deleteById(id);
    }
}
