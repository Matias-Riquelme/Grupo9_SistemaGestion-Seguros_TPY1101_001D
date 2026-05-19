package MicroservicioIncidenteSiniestros.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import MicroservicioIncidenteSiniestros.model.TipoSiniestro;
import MicroservicioIncidenteSiniestros.repository.TipoSiniestroRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class TipoSiniestroServices {

    @Autowired
    private TipoSiniestroRepository tipoSiniestroRepository;

    public List<TipoSiniestro> listarTiposSiniestro() {
        return tipoSiniestroRepository.findAll();
    }

    public TipoSiniestro obtenerTipoSiniestroPorId(Integer id) {
        return tipoSiniestroRepository.findById(id).orElse(null);
    }

    public TipoSiniestro crearTipoSiniestro(TipoSiniestro tipoSiniestro) {
        return tipoSiniestroRepository.save(tipoSiniestro);
    }

    public TipoSiniestro actualizarTipoSiniestro(Integer id, TipoSiniestro tipoSiniestro) {
        TipoSiniestro existente = tipoSiniestroRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setNombreTipoSiniestro(tipoSiniestro.getNombreTipoSiniestro());
            existente.setDescTipoSiniestro(tipoSiniestro.getDescTipoSiniestro());
            return tipoSiniestroRepository.save(existente);
        }
        return null;
    }

    public void eliminarTipoSiniestro(Integer id) {
        tipoSiniestroRepository.deleteById(id);
    }
}
