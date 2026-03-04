package com.meditrack.backend.repository;

import com.meditrack.backend.model.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long> {
    Optional<Provider> findByUser_Id(Long userId);
    Optional<Provider> findBySpecialization(String specialization);
}
