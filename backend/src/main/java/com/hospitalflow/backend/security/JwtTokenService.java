package com.hospitalflow.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;

@Service
public class JwtTokenService {

    private final SecretKey signingKey;
    private final Duration tokenLifetime = Duration.ofHours(8);

    public JwtTokenService(
            @Value("${hospitalflow.jwt.secret:HospitalFlow-dev-only-change-this-secret-2026}") String secret
    ) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("hospitalflow.jwt.secret must be at least 32 bytes");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String issueToken(String subject, String role) {
        Date issuedAt = new Date();
        Date expiresAt = new Date(issuedAt.getTime() + tokenLifetime.toMillis());

        return Jwts.builder()
                .subject(subject)
                .claim("role", role)
                .issuedAt(issuedAt)
                .expiration(expiresAt)
                .signWith(signingKey)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token);
    }
}