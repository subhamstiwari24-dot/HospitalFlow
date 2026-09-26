package com.hospitalflow.backend.service;

import com.hospitalflow.backend.entity.OtpVerification;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private final JavaMailSender sender;
    private final String from;
    private final String host;
    private final boolean devMode;

    public MailService(
            ObjectProvider<JavaMailSender> sender,
            @Value("${hospitalflow.mail.from:no-reply@hospitalflow.local}") String from,
            @Value("${spring.mail.host:}") String host,
            @Value("${hospitalflow.otp.dev-mode:false}") boolean devMode
    ) {
        this.sender = sender.getIfAvailable();
        this.from = from;
        this.host = host;
        this.devMode = devMode;
    }

    public void sendOtp(
            String email,
            String otp,
            OtpVerification.Purpose purpose
    ) {

        if (sender == null || host.isBlank()) {
            throw new IllegalStateException(
                    "Email delivery is not configured"
            );
        }

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(from);
        message.setTo(email);
        message.setSubject("HospitalFlow verification code");

        message.setText(
                "Hello,\n\n"
                        + "Your HospitalFlow "
                        + purpose.name()
                        .toLowerCase()
                        .replace('_', ' ')
                        + " verification code is:\n\n"
                        + otp
                        + "\n\n"
                        + "This OTP will expire in 5 minutes.\n\n"
                        + "If you did not request this code, please ignore this email.\n\n"
                        + "Regards,\n"
                        + "HospitalFlow Team"
        );

        sender.send(message);
    }

    public boolean isDevMode() {
        return devMode;
    }
}