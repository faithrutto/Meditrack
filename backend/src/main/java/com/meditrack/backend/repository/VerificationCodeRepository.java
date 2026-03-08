package com.meditrack.backend.repository;

import com.meditrack.backend.model.VerificationCode;
import com.meditrack.backend.model.VerificationCode.VerificationCodeType;
import com.meditrack.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    Optional<VerificationCode> findByUserAndCodeAndType(User user, String code, VerificationCodeType type);

    Optional<VerificationCode> findByUserAndType(User user, VerificationCodeType type);

    void deleteByUserAndType(User user, VerificationCodeType type);
}
