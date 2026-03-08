package com.meditrack.backend.controller;

import com.meditrack.backend.model.Communication;
import com.meditrack.backend.service.CommunicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communications")
@RequiredArgsConstructor
public class CommunicationController {

    private final CommunicationService communicationService;

    @GetMapping("/inbox/{userId}")
    public ResponseEntity<List<Communication>> getInbox(@PathVariable Long userId) {
        return ResponseEntity.ok(communicationService.getInbox(userId));
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long messageId) {
        communicationService.markAsRead(messageId);
        return ResponseEntity.ok().build();
    }
}
