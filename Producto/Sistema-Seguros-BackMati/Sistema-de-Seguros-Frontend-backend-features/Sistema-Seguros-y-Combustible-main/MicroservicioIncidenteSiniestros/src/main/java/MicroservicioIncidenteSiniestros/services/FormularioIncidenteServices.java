package MicroservicioIncidenteSiniestros.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import MicroservicioIncidenteSiniestros.model.FormularioIncidente;
import MicroservicioIncidenteSiniestros.repository.FormularioIncidenteRepository;
import MicroservicioIncidenteSiniestros.repository.TerceroRepository;
import MicroservicioIncidenteSiniestros.repository.SiniestroRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

@Service
public class FormularioIncidenteServices {

    @Autowired
    private FormularioIncidenteRepository formularioIncidenteRepository;

    @Autowired
    private TerceroRepository terceroRepository;

    @Autowired
    private SiniestroRepository siniestroRepository;

    public List<FormularioIncidente> listarFormularios() {
        return formularioIncidenteRepository.findAllWithRelations();
    }

    public FormularioIncidente obtenerFormularioPorId(Integer id) {
        return formularioIncidenteRepository.findById(id).orElse(null);
    }

    public FormularioIncidente crearFormulario(FormularioIncidente formulario) {
        return formularioIncidenteRepository.save(formulario);
    }

    public FormularioIncidente actualizarFormulario(Integer id, FormularioIncidente formulario) {
        FormularioIncidente existente = formularioIncidenteRepository.findById(id).orElse(null);
        if (existente != null) {
            existente.setUbicacion(formulario.getUbicacion());
            existente.setIdUsuario(formulario.getIdUsuario());
            existente.setTipoIncidente(formulario.getTipoIncidente());
            existente.setFechaIngresoForm(formulario.getFechaIngresoForm());
            existente.setFechaHoraIncidente(formulario.getFechaHoraIncidente());
            existente.setRelatoForm(formulario.getRelatoForm());
            existente.setPatente1(formulario.getPatente1());
            existente.setPatente2(formulario.getPatente2());
            existente.setNombreConductor(formulario.getNombreConductor());
            existente.setRutConductor(formulario.getRutConductor());
            existente.setBase(formulario.getBase());
            existente.setOperacion(formulario.getOperacion());
            existente.setLugarCarga(formulario.getLugarCarga());
            existente.setFechaIniTransporteCarga(formulario.getFechaIniTransporteCarga());
            existente.setDestinoCarga(formulario.getDestinoCarga());
            return formularioIncidenteRepository.save(existente);
        }
        return null;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void eliminarFormulario(Integer id) throws RuntimeException {
        // Verificar que el formulario existe
        FormularioIncidente formulario = formularioIncidenteRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Formulario de incidente no encontrado con ID: " + id));

        // Verificar si hay siniestros asociados
        long cantidadSiniestros = siniestroRepository.countByFormularioIncidenteIdForm(id);
        if (cantidadSiniestros > 0) {
            throw new RuntimeException("No se puede eliminar el incidente porque tiene " + cantidadSiniestros +
                " siniestro(s) asociado(s). Asegurese de eliminar primero los siniestros asociados a este incidente.");
        }

        // Eliminar terceros asociados
        var terceros = terceroRepository.findByFormularioIncidente_IdForm(id);
        if (!terceros.isEmpty()) {
            terceroRepository.deleteAll(terceros);
        }

        // Eliminar el formulario
        formularioIncidenteRepository.delete(formulario);
        formularioIncidenteRepository.flush();
    }

    // Metodo para contar todos los registros asociados a un siniestro
    public List<FormularioIncidente> findBySiniestroId(Integer siniestroId) {
        return formularioIncidenteRepository.findBySiniestroIdSin(siniestroId);
    }

    // Metodo para contar todos los registros asociados a un siniestro
    public Long countBySiniestroId(Integer siniestroId) {
        return formularioIncidenteRepository.countBySiniestroIdSin(siniestroId);
    }

}
