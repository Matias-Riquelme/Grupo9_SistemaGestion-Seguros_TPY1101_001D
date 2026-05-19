package MicroservicioIncidenteSiniestros.controller;

import MicroservicioIncidenteSiniestros.dto.GenerarEnlaceRequest;
import MicroservicioIncidenteSiniestros.entities.TokenFormularioPublico;
import MicroservicioIncidenteSiniestros.services.TokenFormularioService;
import MicroservicioIncidenteSiniestros.services.FormularioIncidenteServices;
import MicroservicioIncidenteSiniestros.model.FormularioIncidente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/formulario-publico")
@CrossOrigin(origins = "*")
public class FormularioPublicoController {

    @Autowired
    private TokenFormularioService tokenService;

    @Autowired
    private FormularioIncidenteServices formularioIncidenteServices;

    @PostMapping("/generar-enlace")
    @PreAuthorize("hasAnyRole('admin_client_role', 'client_role')")
    public ResponseEntity<?> generarEnlace(@RequestBody(required = false) GenerarEnlaceRequest req) {

        String token = UUID.randomUUID().toString();

        TokenFormularioPublico registro = new TokenFormularioPublico();
        registro.setToken(token);
        if (req != null) {
            registro.setConductorId(req.getConductorId());
            registro.setVehiculoId(req.getVehiculoId());
            registro.setTipoSiniestro(req.getTipoSiniestro());
        }
        registro.setCreadoEn(LocalDateTime.now());
        registro.setExpiraEn(LocalDateTime.now().plusHours(24));
        registro.setUtilizado(false);

        tokenService.guardar(registro);

        // La URL base viene de una variable local o del request
        String urlFormulario = "/siniestro/" + token;

        return ResponseEntity.ok(Map.of("urlFormulario", urlFormulario));
    }

    @GetMapping("/validar/{token}")
    public ResponseEntity<?> validarToken(@PathVariable String token) {

        TokenFormularioPublico registro = tokenService.buscarToken(token)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Token no encontrado"));

        if (registro.isUtilizado()) {
            throw new ResponseStatusException(HttpStatus.GONE, "Este enlace ya fue utilizado");
        }

        if (LocalDateTime.now().isAfter(registro.getExpiraEn())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Este enlace expiró");
        }

        Map<String, Object> responseData = new java.util.HashMap<>();
        
        if (registro.getConductorId() != null) {
            responseData.put("conductorId", registro.getConductorId());
        }
        
        if (registro.getVehiculoId() != null) {
            responseData.put("vehiculoId", registro.getVehiculoId());
        }
        
        responseData.put("tipoSiniestro", registro.getTipoSiniestro() != null ? registro.getTipoSiniestro() : "");

        return ResponseEntity.ok(responseData);
    }

    @PostMapping("/enviar/{token}")
    public ResponseEntity<?> recibirFormulario(
            @PathVariable String token,
            @RequestBody FormularioIncidente formulario) {

        TokenFormularioPublico registro = tokenService.buscarToken(token)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Token no encontrado"));

        if (registro.isUtilizado()) {
            throw new ResponseStatusException(HttpStatus.GONE, "Este enlace ya fue utilizado");
        }

        if (LocalDateTime.now().isAfter(registro.getExpiraEn())) {
            throw new ResponseStatusException(HttpStatus.GONE, "Este enlace expiró");
        }

        // Crear el formulario usando el servicio de Formularios
        FormularioIncidente nuevoFormulario = formularioIncidenteServices.crearFormulario(formulario);

        // Marcar el token como utilizado
        registro.setUtilizado(true);
        tokenService.guardar(registro);

        return ResponseEntity.ok(Map.of(
            "mensaje", "Formulario recibido correctamente",
            "idForm", nuevoFormulario.getIdForm()
        ));
    }
}
