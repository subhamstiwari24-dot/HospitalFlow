package com.hospitalflow.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenService tokenService;

    public JwtAuthenticationFilter(JwtTokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorization = request.getHeader("Authorization");

        if (authorization != null
                && authorization.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            try {

                String token = authorization.substring(7);

                Jws<Claims> parsed = tokenService.parse(token);

                Claims claims = parsed.getPayload();

                String role = claims.get("role", String.class);
                String subject = claims.getSubject();

                Long userId = null;
                Long hospitalId = null;

                Object userIdClaim = claims.get("userId");

                if (userIdClaim != null) {
                    userId = Long.valueOf(userIdClaim.toString());
                }

                Object hospitalIdClaim = claims.get("hospitalId");

                if (hospitalIdClaim != null) {
                    hospitalId = Long.valueOf(
                            hospitalIdClaim.toString()
                    );
                }

                if (subject != null && role != null) {

                    UsernamePasswordAuthenticationToken authentication =
                            UsernamePasswordAuthenticationToken.authenticated(
                                    subject,
                                    null,
                                    List.of(
                                            new SimpleGrantedAuthority(
                                                    "ROLE_" + role
                                            )
                                    )
                            );

                    Map<String, Object> jwtDetails =
                            new HashMap<>();

                    jwtDetails.put("userId", userId);
                    jwtDetails.put("hospitalId", hospitalId);
                    jwtDetails.put("role", role);
                    jwtDetails.put("email", subject);

                    authentication.setDetails(jwtDetails);

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);
                }

            } catch (RuntimeException ignored) {

                // Invalid or expired bearer tokens remain unauthenticated.
            }
        }

        filterChain.doFilter(request, response);
    }
}