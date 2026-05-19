package tad.MicroservicioDocumentacion.storage;

import org.apache.tika.Tika; // 👈 Importante
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;

import tad.MicroservicioDocumentacion.model.Document;
import tad.MicroservicioDocumentacion.repository.DocumentRepository;
import tad.MicroservicioDocumentacion.service.NotificationService;

import java.io.IOException;
// import java.io.InputStream; // No es estrictamente necesario si usamos file.getInputStream() directo, pero lo dejo por si acaso.
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
// import java.nio.file.StandardCopyOption; // No lo usas con Files.write, pero está bien dejarlo.
import java.time.LocalDateTime;
import java.util.Arrays; // 👈 Nuevo
import java.util.List; // 👈 Nuevo
import java.util.stream.Stream;

@Service
public class FileSystemStorageService implements StorageService {

    private final Path rootLocation;
    private final DocumentRepository documentRepository;
    private final NotificationService notificationService;

    public FileSystemStorageService(StorageProperties properties, DocumentRepository documentRepository,
            NotificationService notificationService) {
        if (properties.getLocation().trim().length() == 0) {
            throw new StorageException("La ubicación de subida de archivos no puede estar vacía.");
        }
        this.rootLocation = Paths.get(properties.getLocation());
        this.documentRepository = documentRepository;
        this.notificationService = notificationService;
    }

    @Override
    public String store(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new StorageException("No se pudo almacenar el archivo vacío.");
            }

            // INICIO DE VALIDACIÓN DE SEGURIDAD (APACHE TIKA)
            Tika tika = new Tika();

            // Detectamos el tipo real leyendo la cabecera del archivo (Magic Numbers)
            String detectedType = tika.detect(file.getInputStream());

            System.out
                    .println("🔍 Tika detectó: " + detectedType + " | Nombre original: " + file.getOriginalFilename());

            // Definimos la lista blanca (Whitelist) de archivos permitidos
            List<String> allowedMimeTypes = Arrays.asList(
                    "application/pdf",
                    "image/jpeg",
                    "image/png",
                    "image/jpg");

            if (!allowedMimeTypes.contains(detectedType)) {
                throw new StorageException("Error de Seguridad: El archivo no es válido. Detectado: " + detectedType);
            }
            // FIN DE VALIDACIÓN

            // 1. Generamos nombre único
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            Path destinationFile = this.rootLocation.resolve(Paths.get(filename))
                    .normalize().toAbsolutePath();

            if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
                throw new StorageException("No se puede almacenar el archivo fuera del directorio actual.");
            }

            // 2. Encriptar y guardar físico
            byte[] encryptedData = EncryptionService.encrypt(file.getBytes());
            Files.write(destinationFile, encryptedData);

            // 3. Guardar metadatos en DB
            Document document = new Document();
            document.setFilename(filename);
            document.setOriginalFilename(file.getOriginalFilename());
            document.setContentType(detectedType); // 👌 Mejor guardamos el tipo real detectado por Tika
            document.setSize(file.getSize());
            document.setUploadDate(LocalDateTime.now());
            document.setUploadedBy("anonymous");

            // --- CORRECCIÓN CLAVE PARA DOCKER ---
            document.setEncryptedPath("upload-dir/" + filename);
            // ------------------------------------

            documentRepository.save(document);

            // 4. Notificar
            if (notificationService != null) {
                notificationService.notifyUpload(file.getOriginalFilename(), document.getUploadedBy());
            }

            // 5. Devolver el nombre final
            return filename;

        } catch (IOException e) {
            throw new StorageException("Error de entrada/salida al procesar el archivo.", e);
        } catch (Exception e) {
            throw new StorageException("No se pudo almacenar el archivo: " + e.getMessage(), e);
        }
    }

    @Override
    public Stream<Path> loadAll() {
        try {
            return Files.walk(this.rootLocation, 1)
                    .filter(path -> !path.equals(this.rootLocation))
                    .map(this.rootLocation::relativize);
        } catch (IOException e) {
            throw new StorageException("No se pudo leer los archivos almacenados", e);
        }

    }

    @Override
    public Path load(String filename) {
        return rootLocation.resolve(filename);
    }

    @Override
    public Resource loadAsResource(String filename) {
        try {
            // 1. Buscamos el archivo FÍSICO directamente
            Path file = rootLocation.resolve(filename).normalize();

            // 2. Verificamos que exista
            if (!Files.exists(file)) {
                throw new StorageFileNotFoundException("Archivo no encontrado en disco: " + filename);
            }

            // 3. Leemos los bytes encriptados
            byte[] encryptedData = Files.readAllBytes(file);

            // 4. Desencriptamos
            byte[] decryptedData = EncryptionService.decrypt(encryptedData);

            // 5. Guardamos el desencriptado en un archivo temporal
            Path tempFile = Files.createTempFile("temp_", filename);
            Files.write(tempFile, decryptedData);

            // 6. Devolvemos el recurso
            Resource resource = new UrlResource(tempFile.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new StorageFileNotFoundException("No se pudo leer el archivo: " + filename);
            }
        } catch (Exception e) {
            throw new StorageFileNotFoundException("Error al procesar el archivo: " + filename, e);
        }
    }

    @Override
    public void deleteAll() {
        FileSystemUtils.deleteRecursively(rootLocation.toFile());
    }

    @Override
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new StorageException("No se pudo inicializar el almacenamiento", e);
        }
    }

    @Override
    public boolean delete(String filename) {
        try {
            Path file = rootLocation.resolve(filename);
            return java.nio.file.Files.deleteIfExists(file);
        } catch (IOException e) {
            throw new RuntimeException("Error al borrar el archivo: " + filename, e);
        }
    }
}