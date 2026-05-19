package MicroservicioIncidenteSiniestros.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import MicroservicioIncidenteSiniestros.model.Region;
import MicroservicioIncidenteSiniestros.repository.RegionRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class RegionServices {

    @Autowired
    private RegionRepository regionRepository;

    public List<Region> listarRegiones() {
        return regionRepository.findAll();
    }

    public Region obtenerRegionPorId(Integer id) {
        return regionRepository.findById(id).orElse(null);
    }

    public Region crearRegion(Region region) {
        return regionRepository.save(region);
    }

    public Region actualizarRegion(Integer id, Region region) {
        Region existente = regionRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setNombreReg(region.getNombreReg());
            existente.setPais(region.getPais());
            return regionRepository.save(existente);
        }
        return null;
    }

    public void eliminarRegion(Integer id) {
        regionRepository.deleteById(id);
    }
}
