package MicroservicioIncidenteSiniestros.services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import MicroservicioIncidenteSiniestros.model.Poliza;
import MicroservicioIncidenteSiniestros.repository.PolizaRepository;
import MicroservicioIncidenteSiniestros.repository.SiniestroRepository;
import MicroservicioIncidenteSiniestros.repository.CoberturaRepository;
import MicroservicioIncidenteSiniestros.repository.DeducibleRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;

@Service
public class PolizaServices {

    @Autowired
    private PolizaRepository polizaRepository;
    
    @Autowired
    private SiniestroRepository siniestroRepository;
    
    @Autowired
    private CoberturaRepository coberturaRepository;
    
    @Autowired
    private DeducibleRepository deducibleRepository;

    // Listar polizas
    public List<Poliza> listarPolizas() {
        return polizaRepository.findAllWithRelations();
    }

    // Obtener poliza por id
    public Poliza obtenerPolizaPorId(Integer idPol) {
        return polizaRepository.findById(idPol).orElse(null);
    }

    // Crear poliza
    public Poliza crearPoliza(Poliza poliza) {
        return polizaRepository.save(poliza);
    }

    // Actualizar poliza
    public Poliza actualizarPoliza(Integer idPol, Poliza poliza) {
        Poliza polizaExistente = polizaRepository.findById(idPol).orElse(null);
        if (polizaExistente != null) {
            polizaExistente.setNombrePol(poliza.getNombrePol());
            polizaExistente.setNumeroPol(poliza.getNumeroPol());
            polizaExistente.setFechaEmiPol(poliza.getFechaEmiPol());
            polizaExistente.setFechaIniPol(poliza.getFechaIniPol());
            polizaExistente.setFechaFinPol(poliza.getFechaFinPol());
            polizaExistente.setFechaVencPol(poliza.getFechaVencPol());
            polizaExistente.setPrimaPol(poliza.getPrimaPol());
            polizaExistente.setTipoMoneda(poliza.getTipoMoneda());
            polizaExistente.setAseguradosAdi(poliza.getAseguradosAdi());
            polizaExistente.setTipoPoliza(poliza.getTipoPoliza());
            polizaExistente.setAsegurado(poliza.getAsegurado());
            polizaExistente.setContratante(poliza.getContratante());
            return polizaRepository.save(polizaExistente);
        }
        return null;
    }

    // Eliminar poliza
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void eliminarPoliza(Integer idPol) throws RuntimeException {
        System.out.println("=== SERVICE: Iniciando eliminacion de poliza " + idPol + " ===");
        
        // Verificar si la póliza existe
        Poliza poliza = polizaRepository.findById(idPol)
            .orElseThrow(() -> {
                System.out.println("=== SERVICE: Poliza no encontrada ===");
                return new RuntimeException("Poliza no encontrada con ID: " + idPol);
            });
        
        System.out.println("=== SERVICE: Poliza encontrada: " + poliza.getNombrePol() + " ===");
        
        // Verificar si hay siniestros asociados
        long cantidadSiniestros = siniestroRepository.countByPolizaIdPol(idPol);
        System.out.println("=== SERVICE: Cantidad de siniestros: " + cantidadSiniestros + " ===");
        
        if (cantidadSiniestros > 0) {
            String mensaje = "No se puede eliminar la poliza porque tiene " + cantidadSiniestros + 
                " siniestro(s) asociado(s). Asegurese de eliminar primero los siniestros asociados a esta poliza.";
            System.out.println("=== SERVICE: Lanzando excepcion - " + mensaje + " ===");
            throw new RuntimeException(mensaje);
        }
        
        System.out.println("=== SERVICE: Procediendo a eliminar ===");
        
        // Primero eliminar las coberturas asociadas
        var coberturas = coberturaRepository.findByPoliza_IdPol(idPol);
        if (!coberturas.isEmpty()) {
            System.out.println("=== SERVICE: Eliminando " + coberturas.size() + " cobertura(s) ===");
            coberturaRepository.deleteAll(coberturas);
        }
        
        // Luego eliminar los deducibles asociados
        var deducibles = deducibleRepository.findByPoliza_IdPol(idPol);
        if (!deducibles.isEmpty()) {
            System.out.println("=== SERVICE: Eliminando " + deducibles.size() + " deducible(s) ===");
            deducibleRepository.deleteAll(deducibles);
        }
        
        // Finalmente eliminar la póliza
        polizaRepository.delete(poliza);
        polizaRepository.flush();
        System.out.println("=== SERVICE: Poliza eliminada ===");
    }



}
