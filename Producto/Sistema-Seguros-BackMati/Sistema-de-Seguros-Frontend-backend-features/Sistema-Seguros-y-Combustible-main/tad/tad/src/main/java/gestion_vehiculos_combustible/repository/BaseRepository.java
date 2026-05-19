package gestion_vehiculos_combustible.repository;

import java.util.List;

import org.springframework.lang.NonNull;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import gestion_vehiculos_combustible.model.Base;

@Repository
public interface BaseRepository extends JpaRepository<Base, Long> {

    // Listar todas las bases
    @Override
    @NonNull
    List<Base> findAll();

}
