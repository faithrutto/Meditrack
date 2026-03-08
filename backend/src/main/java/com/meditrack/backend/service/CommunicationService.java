package com.meditrack.backend.service;

import com.meditrack.backend.model.Communication;
import com.meditrack.backend.repository.CommunicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunicationService {

    private final CommunicationRepository communicationRepository;

    public List<Communication> getInbox(Long userId) {
        return communicationRepository.findByReceiver_Id(userId);
    }

    public List<Communication> getUnreadMessages(Long userId) {
        return communicationRepository.findByReceiver_IdAndIsReadFalse(userId);
    }

    public void markAsRead(Long messageId) {
        Communication comm = communicationRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        comm.setRead(true);
        communicationRepository.save(comm);
    }
}
