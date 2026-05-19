package tad.MicroservicioDocumentacion.controller;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import tad.MicroservicioDocumentacion.model.Document;
import tad.MicroservicioDocumentacion.repository.DocumentRepository;
import tad.MicroservicioDocumentacion.storage.StorageFileNotFoundException;
import tad.MicroservicioDocumentacion.storage.StorageService;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documentos")
public class DocumentController {

    private final StorageService storageService;
    private final DocumentRepository documentRepository;

    public DocumentController(StorageService storageService, DocumentRepository documentRepository) {
        this.storageService = storageService;
        this.documentRepository = documentRepository;
    }

    // ----------------------------------------------------------------
    // 1. GET PRINCIPAL: Lista los documentos DESDE LA BD + Genera URLs
    // ----------------------------------------------------------------
    @GetMapping("/")
    public ResponseEntity<List<Document>> listUploadedFiles() {
        
        // A. Traemos todos los registros de MySQL
        List<Document> docs = documentRepository.findAll();

        // B. Recorremos la lista para "inyectar" la URL de descarga en el campo @Transient
        List<Document> docsConUrls = docs.stream().map(doc -> {
            
            // Construimos la URL mágica: http://localhost:8082/api/documentos/Archivo/nombre.pdf
            String url = MvcUriComponentsBuilder
                    .fromMethodName(DocumentController.class, "serveFile", doc.getFilename())
                    .build().toString();
            
            // La guardamos en el objeto (no se guarda en BD, solo se muestra en el JSON)
            doc.setUrl(url);
            
            return doc;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(docsConUrls);
    }

    // ----------------------------------------------------------------
    // 2. DOWNLOAD: Descarga el archivo físico
    // ----------------------------------------------------------------
    @GetMapping("/Archivo/{nombreArchivo:.+}")
    @ResponseBody
    public ResponseEntity<Resource> serveFile(@PathVariable String nombreArchivo) {

        Resource file = storageService.loadAsResource(nombreArchivo);

        if (file == null)
            return ResponseEntity.notFound().build();

        String contentType = "application/octet-stream";
        try {
            contentType = java.nio.file.Files.probeContentType(file.getFile().toPath());
        } catch (IOException ex) {
            // Error silencioso, usamos default
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }

    // ----------------------------------------------------------------
    // 3. UPLOAD: Sube archivo físico + Guarda metadatos en BD
    // ----------------------------------------------------------------
    @PostMapping(value = "/", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> handleFileUpload(
            @RequestParam("Archivo") MultipartFile file,
            @RequestParam(required = false) Long idIncidente,
            @RequestParam(required = false) Integer idTipoDocumento,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String uploadedBy) {

        // Validaciones
        String nombreOriginal = file.getOriginalFilename();
        if (nombreOriginal == null || nombreOriginal.isEmpty()) return ResponseEntity.badRequest().body("Sin nombre.");

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf") && !contentType.equals("image/jpeg") && !contentType.equals("image/jpg"))) {
            return ResponseEntity.badRequest().body("Solo PDF y JPG.");
        }

        try {
            // A. Guardar físico (Disco)
            String nombreFinal = storageService.store(file);

            // B. Guardar lógico (Base de Datos)
            Document nuevoDoc = new Document();
            nuevoDoc.setFilename(nombreFinal);
            nuevoDoc.setOriginalFilename(nombreOriginal);
            nuevoDoc.setContentType(contentType);
            nuevoDoc.setSize(file.getSize());
            nuevoDoc.setUploadDate(LocalDateTime.now());
            nuevoDoc.setUploadedBy(uploadedBy != null ? uploadedBy : "Sistema");
            nuevoDoc.setIdIncidente(idIncidente);
            nuevoDoc.setIdTipoDocumento(idTipoDocumento);
            nuevoDoc.setCategoria(categoria);

            documentRepository.save(nuevoDoc); // ¡IMPORTANTE! Guardar en MySQL

            // C. Respuesta
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/documentos/Archivo/")
                    .path(nombreFinal)
                    .toUriString();

            return ResponseEntity.ok("Archivo guardado ID: " + nuevoDoc.getId() + ". URL: " + fileDownloadUri);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("No se pudo guardar el archivo: " + e.getMessage());
        }
    }

    // ----------------------------------------------------------------
    // 3b. UPLOAD alternativo por /upload (compatible con frontend)
    // ----------------------------------------------------------------
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> handleFileUploadAlt(
            @RequestParam("Archivo") MultipartFile file,
            @RequestParam(required = false) Long idIncidente,
            @RequestParam(required = false) Integer idTipoDocumento,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String uploadedBy) {
        return handleFileUpload(file, idIncidente, idTipoDocumento, categoria, uploadedBy);
    }

    // ----------------------------------------------------------------
    // 3c. GET por incidente
    // ----------------------------------------------------------------
    @GetMapping("/incidente/{idIncidente}")
    public ResponseEntity<List<Document>> getByIncidente(@PathVariable Long idIncidente) {
        List<Document> docs = documentRepository.findByIdIncidente(idIncidente);
        docs.forEach(doc -> {
            String url = MvcUriComponentsBuilder
                    .fromMethodName(DocumentController.class, "serveFile", doc.getFilename())
                    .build().toString();
            doc.setUrl(url);
        });
        return ResponseEntity.ok(docs);
    }

    // ----------------------------------------------------------------
    // 4. BUSCAR: Filtros en BD
    // ----------------------------------------------------------------
    @GetMapping("/Buscar")
    public ResponseEntity<List<Document>> searchDocuments(
            @RequestParam(required = false) String filename,
            @RequestParam(required = false) String contentType,
            @RequestParam(required = false) String uploadedBy) {
        
        List<Document> documents;
        
        if (filename != null) {
            documents = documentRepository.findByFilenameContainingIgnoreCase(filename);
        } else if (contentType != null) {
            documents = documentRepository.findByContentType(contentType);
        } else if (uploadedBy != null) {
            documents = documentRepository.findByUploadedBy(uploadedBy);
        } else {
            documents = documentRepository.findAll();
        }
        
        // (Opcional) También podrías agregarle las URLs a esta búsqueda si quisieras:
        documents.forEach(doc -> {
             String url = MvcUriComponentsBuilder
                    .fromMethodName(DocumentController.class, "serveFile", doc.getFilename())
                    .build().toString();
             doc.setUrl(url);
        });

        return ResponseEntity.ok(documents);
    }

    // ----------------------------------------------------------------
    // 5. DELETE: Borra de BD y Disco
    // ----------------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFile(@PathVariable Long id) {
        
        var documentOptional = documentRepository.findById(id);
        if (documentOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Document document = documentOptional.get();

        try {
            storageService.delete(document.getFilename());
        } catch (Exception e) {
             return ResponseEntity.internalServerError().body("Error al borrar físico: " + e.getMessage());
        }

        documentRepository.delete(document);

        return ResponseEntity.ok("Eliminado correctamente: " + document.getFilename());
    }

    @ExceptionHandler(StorageFileNotFoundException.class)
    public ResponseEntity<?> handleStorageFileNotFound(StorageFileNotFoundException exc) {
        return ResponseEntity.notFound().build();
    }
}