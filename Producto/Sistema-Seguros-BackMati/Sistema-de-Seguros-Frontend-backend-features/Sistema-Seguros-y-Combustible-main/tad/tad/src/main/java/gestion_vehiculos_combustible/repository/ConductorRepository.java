package gestion_vehiculos_combustible.repository;

import java.util.List;

import org.springframework.lang.NonNull;

import org.springframework.data.jpa.repository.JpaRepository;


import gestion_vehiculos_combustible.model.Conductor;

public interface ConductorRepository extends JpaRepository<Conductor, Long> {

    // Listar todos los conductores
    @Override
    @NonNull
    List<Conductor> findAll();

}
