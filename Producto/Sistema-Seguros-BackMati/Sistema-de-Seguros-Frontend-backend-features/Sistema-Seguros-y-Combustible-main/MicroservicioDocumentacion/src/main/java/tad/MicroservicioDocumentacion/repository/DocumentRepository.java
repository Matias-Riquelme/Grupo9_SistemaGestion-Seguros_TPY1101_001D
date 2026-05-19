package tad.MicroservicioDocumentacion.repository;

import tad.MicroservicioDocumentacion.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByFilenameContainingIgnoreCase(String filename);

    List<Document> findByContentType(String contentType);

    List<Document> findByUploadedBy(String uploadedBy);

    @Query("SELECT d FROM Document d WHERE d.uploadDate BETWEEN :startDate AND :endDate")
    List<Document> findByUploadDateBetween(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    List<Document> findByOriginalFilename(String originalFilename);

    List<Document> findByIdIncidente(Long idIncidente);
}