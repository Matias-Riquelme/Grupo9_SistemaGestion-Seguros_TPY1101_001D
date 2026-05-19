package MicroservicioIncidenteSiniestros.dto;

import lombok.Data;
import java.util.List;

@Data
public class EmailRequestDTO {
    private String destinatario;
    private List<String> destinatarios;
    private String asunto;
    private String cuerpo;
}
