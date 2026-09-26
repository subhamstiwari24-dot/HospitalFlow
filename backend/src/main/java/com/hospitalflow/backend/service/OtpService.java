package com.hospitalflow.backend.service;

import com.hospitalflow.backend.entity.OtpVerification;
import com.hospitalflow.backend.repository.OtpVerificationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class OtpService {
    private static final int MAX_ATTEMPTS = 5;
    private static final int COOLDOWN_SECONDS = 60;
    private final OtpVerificationRepository repository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();
    private final MailService mailService;

    public OtpService(OtpVerificationRepository repository, MailService mailService) {
        this.repository = repository;
        this.mailService = mailService;
    }

    @Transactional
    public String issue(String identifier, OtpVerification.Purpose purpose) {
        String normalized = identifier.trim().toLowerCase();
        OtpVerification previous = repository
                .findTopByIdentifierAndPurposeOrderByCreatedAtDesc(normalized, purpose).orElse(null);
        LocalDateTime now = LocalDateTime.now();
        if (previous != null && previous.getCreatedAt().isAfter(now.minusSeconds(COOLDOWN_SECONDS))) {
            throw new IllegalArgumentException("Please wait before requesting another OTP");
        }
        if (previous != null) {
            previous.setVerified(true);
            repository.save(previous);
        }
        String otp = String.format("%06d", random.nextInt(1_000_000));
        OtpVerification verification = new OtpVerification();
        verification.setIdentifier(normalized);
        verification.setOtpHash(passwordEncoder.encode(otp));
        verification.setPurpose(purpose);
        verification.setExpiresAt(now.plusMinutes(5));
        verification.setCreatedAt(now);
        repository.save(verification);
        mailService.sendOtp(normalized, otp, purpose);
        return mailService.isDevMode() ? otp : null;
    }

    @Transactional
    public String verify(String identifier, OtpVerification.Purpose purpose, String otp) {
        OtpVerification verification = repository
                .findTopByIdentifierAndPurposeOrderByCreatedAtDesc(identifier.trim().toLowerCase(), purpose)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired OTP"));
        if (verification.isVerified() || verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }
        if (verification.getAttempts() >= MAX_ATTEMPTS) {
            throw new IllegalArgumentException("Maximum OTP attempts exceeded");
        }
        verification.setAttempts(verification.getAttempts() + 1);
        if (!otp.matches("\\d{6}") || !passwordEncoder.matches(otp, verification.getOtpHash())) {
            repository.save(verification);
            throw new IllegalArgumentException("Invalid OTP");
        }
        verification.setVerified(true);
        if (purpose == OtpVerification.Purpose.FORGOT_PASSWORD) {
            verification.setResetToken(UUID.randomUUID().toString());
        }
        repository.save(verification);
        return verification.getResetToken();
    }

    public boolean isValidResetToken(String email, String token) {
        return repository.findTopByIdentifierAndPurposeOrderByCreatedAtDesc(
                        email.trim().toLowerCase(), OtpVerification.Purpose.FORGOT_PASSWORD)
                .filter(value -> value.isVerified()
                        && token != null && token.equals(value.getResetToken())
                        && value.getExpiresAt().isAfter(LocalDateTime.now()))
                .isPresent();
    }

    @Transactional
    public void consumeResetToken(String email, String token) {
        repository.findTopByIdentifierAndPurposeOrderByCreatedAtDesc(
                        email.trim().toLowerCase(), OtpVerification.Purpose.FORGOT_PASSWORD)
                .filter(value -> value.isVerified() && token != null && token.equals(value.getResetToken()))
                .ifPresent(value -> {
                    value.setResetToken(null);
                    repository.save(value);
                });
    }
}