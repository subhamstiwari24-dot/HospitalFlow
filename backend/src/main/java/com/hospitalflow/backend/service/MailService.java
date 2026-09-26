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

    public MailService(ObjectProvider<JavaMailSender> sender,
                       @Value("${hospitalflow.mail.from:no-reply@hospitalflow.local}") String from,
                       @Value("${MAIL_HOST:}") String host,
                       @Value("${hospitalflow.otp.dev-mode:true}") boolean devMode) {
        this.sender = sender.getIfAvailable();
        this.from = from;
        this.host = host;
        this.devMode = devMode;
    }

    public void sendOtp(String email, String otp, OtpVerification.Purpose purpose) {
        if (sender == null || host.isBlank()) {
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(email);
        message.setSubject("HospitalFlow verification code");
        message.setText("Your HospitalFlow " + purpose.name().toLowerCase().replace('_', ' ')
                + " code is " + otp + ". It expires in 5 minutes.");
        sender.send(message);
    }

    public boolean isDevMode() {
        return devMode || sender == null;
    }
}