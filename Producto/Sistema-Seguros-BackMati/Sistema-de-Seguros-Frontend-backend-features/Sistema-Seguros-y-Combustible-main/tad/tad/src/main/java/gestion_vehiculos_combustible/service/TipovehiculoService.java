package gestion_vehiculos_combustible.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import gestion_vehiculos_combustible.model.Tipovehiculo;
import gestion_vehiculos_combustible.repository.TipovehiculoRepository;

@Service
public class TipovehiculoService {

    @Autowired
    private TipovehiculoRepository tipovehiculoRepository;

    public Tipovehiculo guardarTipovehiculo(@NonNull Tipovehiculo tipovehiculo) {
        return tipovehiculoRepository.save(tipovehiculo);
    }

    public List<Tipovehiculo> listarTipovehiculos() {
        return tipovehiculoRepository.findAll();
    }

    public Optional<Tipovehiculo> obtenerTipovehiculoPorId(@NonNull Long id) {
        return tipovehiculoRepository.findById(id);
    }

    public void eliminarTipovehiculo(@NonNull Long id) {
        tipovehiculoRepository.deleteById(id);
    }
}
