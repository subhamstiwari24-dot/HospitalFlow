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

    private final Duration tokenLifetime =
            Duration.ofHours(8);

    public JwtTokenService(
            @Value("${hospitalflow.jwt.secret:HospitalFlow-dev-only-change-this-secret-2026}")
            String secret
    ) {

        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException(
                    "hospitalflow.jwt.secret must be at least 32 bytes"
            );
        }

        this.signingKey =
                Keys.hmacShaKeyFor(
                        secret.getBytes(StandardCharsets.UTF_8)
                );
    }

    /*
     * Existing token method.
     *
     * Keep this method because existing Admin authentication
     * may already be using it.
     */
    public String issueToken(
            String subject,
            String role
    ) {

        Date issuedAt = new Date();

        Date expiresAt =
                new Date(
                        issuedAt.getTime()
                                + tokenLifetime.toMillis()
                );

        return Jwts.builder()
                .subject(subject)
                .claim("role", role)
                .issuedAt(issuedAt)
                .expiration(expiresAt)
                .signWith(signingKey)
                .compact();
    }

    /*
     * New token method for HospitalFlow users.
     *
     * Stores:
     * - userId
     * - role
     * - hospitalId
     *
     * hospitalId is important for Hospital Admin
     * data isolation.
     */
    public String issueToken(
            Long userId,
            String subject,
            String role,
            Long hospitalId
    ) {

        Date issuedAt = new Date();

        Date expiresAt =
                new Date(
                        issuedAt.getTime()
                                + tokenLifetime.toMillis()
                );

        return Jwts.builder()
                .subject(subject)
                .claim("userId", userId)
                .claim("role", role)
                .claim("hospitalId", hospitalId)
                .issuedAt(issuedAt)
                .expiration(expiresAt)
                .signWith(signingKey)
                .compact();
    }

    /*
     * Parse and verify JWT.
     */
    public Jws<Claims> parse(String token) {

        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token);
    }

    /*
     * Extract email / username.
     */
    public String extractSubject(String token) {

        return parse(token)
                .getPayload()
                .getSubject();
    }

    /*
     * Extract role.
     */
    public String extractRole(String token) {

        return parse(token)
                .getPayload()
                .get("role", String.class);
    }

    /*
     * Extract user ID.
     */
    public Long extractUserId(String token) {

        Number userId =
                parse(token)
                        .getPayload()
                        .get("userId", Number.class);

        return userId != null
                ? userId.longValue()
                : null;
    }

    /*
     * Extract hospital ID.
     */
    public Long extractHospitalId(String token) {

        Number hospitalId =
                parse(token)
                        .getPayload()
                        .get("hospitalId", Number.class);

        return hospitalId != null
                ? hospitalId.longValue()
                : null;
    }
}