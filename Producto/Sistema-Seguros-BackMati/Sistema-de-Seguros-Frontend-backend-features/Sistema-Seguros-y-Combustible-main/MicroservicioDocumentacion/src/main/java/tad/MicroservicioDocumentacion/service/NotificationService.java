package tad.MicroservicioDocumentacion.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class NotificationService {

    private final RestTemplate restTemplate = new RestTemplate();

    public void notifyUpload(String filename, String uploadedBy) {
        // Ejemplo: Notificar a otro microservicio (ajustar URL según el sistema)
        String notificationUrl = "http://localhost:8081/api/notifications"; // Cambiar por URL real, ej. ApiGateway
        String message = "Documento subido: " + filename + " por " + uploadedBy;

        try {
            restTemplate.postForObject(notificationUrl, message, String.class);
        } catch (Exception e) {
            // Log error, pero no fallar la subida
            System.err.println("Error notificando subida: " + e.getMessage());
        }
    }
}