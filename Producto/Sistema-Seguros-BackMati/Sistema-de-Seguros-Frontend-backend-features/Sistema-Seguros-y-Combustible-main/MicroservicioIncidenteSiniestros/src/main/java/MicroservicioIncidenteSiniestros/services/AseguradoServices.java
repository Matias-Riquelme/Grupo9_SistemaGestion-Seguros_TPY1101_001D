package MicroservicioIncidenteSiniestros.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import MicroservicioIncidenteSiniestros.model.Asegurado;
import MicroservicioIncidenteSiniestros.repository.AseguradoRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class AseguradoServices {

    @Autowired
    private AseguradoRepository aseguradoRepository;

    public List<Asegurado> listarAsegurados() {
        return aseguradoRepository.findAll();
    }

    public Asegurado obtenerAseguradoPorId(Integer id) {
        return aseguradoRepository.findById(id).orElse(null);
    }

    public Asegurado crearAsegurado(Asegurado asegurado) {
        return aseguradoRepository.save(asegurado);
    }

    public Asegurado actualizarAsegurado(Integer id, Asegurado asegurado) {
        Asegurado existente = aseguradoRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setRazonSocialAse(asegurado.getRazonSocialAse());
            existente.setRutAse(asegurado.getRutAse());
            return aseguradoRepository.save(existente);
        }
        return null;
    }

    public void eliminarAsegurado(Integer id) {
        aseguradoRepository.deleteById(id);
    }
}
