package com.hospitalflow.backend.config;

import com.hospitalflow.backend.security.JwtAuthenticationFilter;
import com.hospitalflow.backend.security.JwtTokenService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtTokenService jwtTokenService
    ) throws Exception {

        http
                // REST APIs ke liye CSRF disable
                .csrf(AbstractHttpConfigurer::disable)

                // JWT based authentication
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // JWT filter
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenService),
                        UsernamePasswordAuthenticationFilter.class
                )

                // Unauthorized request -> 401
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(
                                new HttpStatusEntryPoint(
                                        HttpStatus.UNAUTHORIZED
                                )
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // ==========================================
                        // EXISTING ADMIN AUTH
                        // ==========================================

                        .requestMatchers(
                                "/api/admin/auth/login",
                                "/api/admin/auth/logout"
                        ).permitAll()

                        // Existing Admin APIs
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")


                        // ==========================================
                        // HOSPITAL ADMIN AUTH
                        // ==========================================

                        // First login password setup
                        .requestMatchers(
                                "/api/hospital-admin/auth/setup-password"
                        ).permitAll()

                        // Hospital Admin login
                        .requestMatchers(
                                "/api/hospital-admin/auth/login"
                        ).permitAll()

                        // Future Hospital Admin protected APIs
                        .requestMatchers("/api/hospital-admin/**")
                        .hasRole("HOSPITAL_ADMIN")


                        // ==========================================
                        // CURRENT APPLICATION APIs
                        // ==========================================

                        // Keep existing APIs working for now.
                        // We will secure them gradually after
                        // hospitalId isolation is implemented.
                        .requestMatchers("/api/**")
                        .permitAll()

                        .anyRequest()
                        .permitAll()
                );

        return http.build();
    }
}