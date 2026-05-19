package gestion_vehiculos_combustible.repository;

import java.util.List;

import org.springframework.lang.NonNull;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import gestion_vehiculos_combustible.model.Operaciones;

@Repository
public interface OperacionesRepository extends JpaRepository<Operaciones, Long> {

    // Listar todas las operaciones
    @Override
    @NonNull
    List<Operaciones> findAll();
    
    java.util.Optional<Operaciones> findByNombre(String nombre);

}
