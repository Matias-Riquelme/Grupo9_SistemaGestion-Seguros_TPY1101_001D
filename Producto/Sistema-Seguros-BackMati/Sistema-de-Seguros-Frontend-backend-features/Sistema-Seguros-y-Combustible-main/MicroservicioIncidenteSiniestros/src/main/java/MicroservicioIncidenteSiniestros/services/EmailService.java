package MicroservicioIncidenteSiniestros.services;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import MicroservicioIncidenteSiniestros.model.FormularioIncidente;
import MicroservicioIncidenteSiniestros.model.TipoIncidente;

import org.springframework.core.io.ClassPathResource;
import java.util.Arrays;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${spring.mail.username:no-reply@seguros.com}")
    private String mailFrom;

    @Async
    public void enviarCorreo(String[] to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("asunto", subject);
            context.setVariable("cuerpo", body);
            // Añadir enlace al frontend por defecto para que el link sea siempre clickable
            String enlaceDefault = (frontendUrl != null ? frontendUrl : "") + "/gestion-incidente";
            context.setVariable("enlaceFormulario", enlaceDefault);

            String htmlContent = templateEngine.process("incidente-template", context);

            helper.setFrom(mailFrom);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            // Agregar el logo de la empresa como recurso inline
            // Archivo ubicado en src/main/resources (copiado a target/classes/logo-tad.png)
            helper.addInline("logoTad", new ClassPathResource("logo-tad.png"), "image/png");

            mailSender.send(message);
            System.out.println("Correo HTML enviado exitosamente a: " + Arrays.toString(to));
        } catch (Exception e) {
            System.err.println("Error al enviar correo HTML a " + Arrays.toString(to) + ": " + e.getMessage());
        }
    }

    @Async
    public void enviarCorreoFormulario(String[] to, FormularioIncidente formulario) {
        if (to == null || to.length == 0) return;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("asunto", formulario.getOperacion() != null ? formulario.getOperacion() : "Notificación de formulario");
            context.setVariable("cuerpo", formulario.getRelatoForm());
            context.setVariable("idIncidente", formulario.getIdForm());
            context.setVariable("fechaIncidente", formulario.getFechaHoraIncidente());
            String tipo = null;
            TipoIncidente t = formulario.getTipoIncidente();
            if (t != null) tipo = t.getNombreTipoIncidente();
            context.setVariable("tipoIncidente", tipo);
            context.setVariable("fechaNotificacion", formulario.getFechaIngresoForm());
            context.setVariable("conductorInvolucrado", formulario.getNombreConductor());
            context.setVariable("rutConductor", formulario.getRutConductor());
            // Combinar patentes si existen
            String patente = formulario.getPatente1();
            if (formulario.getPatente2() != null && !formulario.getPatente2().isBlank()) {
                patente = (patente == null ? "" : patente + "/") + formulario.getPatente2();
            }
            context.setVariable("patenteVehiculo", patente);
            context.setVariable("base", formulario.getBase());
            context.setVariable("operacion", formulario.getOperacion());
            // Construir enlace al frontend (página de gestión de incidentes)
            String enlace = (frontendUrl != null ? frontendUrl : "") + "/gestion-incidente";
            // Si existe id del formulario, incluirlo como query param opcional
            if (formulario.getIdForm() != null) enlace += "?idForm=" + formulario.getIdForm();
            context.setVariable("enlaceFormulario", enlace);

            String htmlContent = templateEngine.process("incidente-template", context);

            helper.setFrom(mailFrom);
            helper.setTo(to);
            helper.setSubject(context.getVariable("asunto") != null ? context.getVariable("asunto").toString() : "Notificación");
            helper.setText(htmlContent, true);

            helper.addInline("logoTad", new ClassPathResource("logo-tad.png"), "image/png");

            mailSender.send(message);
            System.out.println("Correo HTML (formulario) enviado exitosamente a: " + Arrays.toString(to));
        } catch (Exception e) {
            System.err.println("Error al enviar correo HTML de formulario a " + Arrays.toString(to) + ": " + e.getMessage());
        }
    }
}
