package MicroservicioIncidenteSiniestros.services;

import MicroservicioIncidenteSiniestros.model.TipoCobertura;
import MicroservicioIncidenteSiniestros.repository.TipoCoberturaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.util.List;

@Service
@Transactional
public class TipoCoberturaServices {
    @Autowired
    private TipoCoberturaRepository tipoCoberturaRepository;

    public List<TipoCobertura> listarTiposCobertura() {
        return tipoCoberturaRepository.findAll();
    }

    public TipoCobertura obtenerTipoCoberturaPorId(Integer id) {
        return tipoCoberturaRepository.findById(id).orElse(null);
    }

    public TipoCobertura crearTipoCobertura(TipoCobertura tipoCobertura) {
        return tipoCoberturaRepository.save(tipoCobertura);
    }

    public TipoCobertura actualizarTipoCobertura(Integer id, TipoCobertura tipoCobertura) {
        TipoCobertura existente = tipoCoberturaRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setNombre(tipoCobertura.getNombre());
            existente.setDescripcion(tipoCobertura.getDescripcion());
            existente.setActivo(tipoCobertura.getActivo());
            return tipoCoberturaRepository.save(existente);
        }
        return null;
    }

    public void eliminarTipoCobertura(Integer id) {
        tipoCoberturaRepository.deleteById(id);
    }
}
