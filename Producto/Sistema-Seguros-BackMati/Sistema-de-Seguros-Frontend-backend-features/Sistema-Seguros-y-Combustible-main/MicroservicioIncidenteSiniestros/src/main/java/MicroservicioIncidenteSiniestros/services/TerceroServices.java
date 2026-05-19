package MicroservicioIncidenteSiniestros.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import MicroservicioIncidenteSiniestros.model.Tercero;
import MicroservicioIncidenteSiniestros.repository.TerceroRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class TerceroServices {

    @Autowired
    private TerceroRepository terceroRepository;

    public List<Tercero> listarTerceros() {
        return terceroRepository.findAll();
    }

    public Tercero obtenerTerceroPorId(Integer id) {
        return terceroRepository.findById(id).orElse(null);
    }

    public Tercero crearTercero(Tercero tercero) {
        return terceroRepository.save(tercero);
    }

    public Tercero actualizarTercero(Integer id, Tercero tercero) {
        Tercero existente = terceroRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setRutTer(tercero.getRutTer());
            existente.setNombreTer(tercero.getNombreTer());
            existente.setTelefonoTer(tercero.getTelefonoTer());
            existente.setEmailTer(tercero.getEmailTer());
            existente.setAseguradoraTer(tercero.getAseguradoraTer());
            existente.setNumeroSinTer(tercero.getNumeroSinTer());
            existente.setFormularioIncidente(tercero.getFormularioIncidente());
            return terceroRepository.save(existente);
        }
        return null;
    }

    public void eliminarTercero(Integer id) {
        terceroRepository.deleteById(id);
    }
}
