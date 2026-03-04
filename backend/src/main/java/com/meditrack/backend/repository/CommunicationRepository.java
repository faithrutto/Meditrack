package com.meditrack.backend.repository;

import com.meditrack.backend.model.Communication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunicationRepository extends JpaRepository<Communication, Long> {
    List<Communication> findBySender_Id(Long senderId);
    List<Communication> findByReceiver_Id(Long receiverId);
    List<Communication> findByReceiver_IdAndIsReadFalse(Long receiverId);
}
