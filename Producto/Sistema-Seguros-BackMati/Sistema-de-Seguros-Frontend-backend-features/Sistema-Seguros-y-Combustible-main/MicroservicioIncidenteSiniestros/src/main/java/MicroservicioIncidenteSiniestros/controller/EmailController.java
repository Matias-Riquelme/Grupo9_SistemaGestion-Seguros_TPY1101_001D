package MicroservicioIncidenteSiniestros.controller;

import MicroservicioIncidenteSiniestros.dto.EmailRequestDTO;
import MicroservicioIncidenteSiniestros.services.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificacion")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/enviar-correo")
    public ResponseEntity<?> enviarCorreo(@RequestBody EmailRequestDTO request) {
        try {
            List<String> destinatarios = new ArrayList<>();
            if (request.getDestinatario() != null && !request.getDestinatario().trim().isEmpty()) {
                destinatarios.add(request.getDestinatario());
            }
            if (request.getDestinatarios() != null && !request.getDestinatarios().isEmpty()) {
                destinatarios.addAll(request.getDestinatarios());
            }

            if (destinatarios.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Debe especificar al menos un destinatario"));
            }

            String[] toArray = destinatarios.toArray(new String[0]);

            emailService.enviarCorreo(
                    toArray,
                    request.getAsunto(),
                    request.getCuerpo());
            return ResponseEntity
                    .ok(Map.of("message", "Correo encolado para envío a " + destinatarios.size() + " destinatario(s)"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
