package tad.MicroservicioDocumentacion.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor

@Entity
@Data
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String filename;
    private String originalFilename;
    private String contentType;
    private long size;
    @Transient
    private String url; // Campo transitorio para la URL de descarga

    private LocalDateTime uploadDate;
    private String uploadedBy; // Usuario que subió el archivo

    private String encryptedPath; // Ruta del archivo encriptado

    private Long idIncidente;       // ID del incidente al que pertenece
    private Integer idTipoDocumento; // Tipo de documento
    private String categoria;        // Categoría del documento

    @PrePersist
    public void prePersist() {
        if (this.uploadDate == null) {
            this.uploadDate = LocalDateTime.now();
        }
    }
}