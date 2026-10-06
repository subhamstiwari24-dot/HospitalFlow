package com.hospitalflow.backend.config;

import com.hospitalflow.backend.security.JwtAuthenticationFilter;
import com.hospitalflow.backend.security.JwtTokenService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtTokenService jwtTokenService
    ) throws Exception {

        http

                // ==========================================
                // CSRF
                // ==========================================
                // REST APIs + JWT authentication
                .csrf(AbstractHttpConfigurer::disable)


                // ==========================================
                // SESSION
                // ==========================================
                // JWT based authentication, no server session
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // ==========================================
                // JWT FILTER
                // ==========================================
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtTokenService),
                        UsernamePasswordAuthenticationFilter.class
                )


                // ==========================================
                // UNAUTHORIZED HANDLING
                // ==========================================
                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint(
                                new HttpStatusEntryPoint(
                                        HttpStatus.UNAUTHORIZED
                                )
                        )
                )


                // ==========================================
                // AUTHORIZATION
                // ==========================================
                .authorizeHttpRequests(auth -> auth


                        // ==========================================
                        // ADMIN / SUPER ADMIN AUTH
                        // ==========================================

                        // Login and logout must remain public
                        .requestMatchers(
                                "/api/admin/auth/login",
                                "/api/admin/auth/logout"
                        )
                        .permitAll()


                        // Existing Admin APIs
                        //
                        // ADMIN       -> allowed
                        // SUPER_ADMIN -> allowed
                        //
                        // This keeps the existing Admin dashboard
                        // working while also allowing Super Admin
                        // to use platform-level Admin APIs.
                        .requestMatchers("/api/admin/**")
                        .hasAnyRole(
                                "ADMIN",
                                "SUPER_ADMIN"
                        )


                        // ==========================================
                        // HOSPITAL ADMIN AUTH
                        // ==========================================

                        // First-login password setup
                        .requestMatchers(
                                "/api/hospital-admin/auth/setup-password"
                        )
                        .permitAll()


                        // Hospital Admin login
                        .requestMatchers(
                                "/api/hospital-admin/auth/login"
                        )
                        .permitAll()


                        // Hospital Admin protected APIs
                        .requestMatchers("/api/hospital-admin/**")
                        .hasRole("HOSPITAL_ADMIN")


                        // ==========================================
                        // HOSPITAL REGISTRATION
                        // ==========================================

                        // Anyone can submit a new hospital
                        // registration.
                        //
                        // Example:
                        // Hospital Registration Page
                        // -> POST /api/hospital-registrations
                        //
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/hospital-registrations"
                        )
                        .permitAll()


                        // All other hospital registration APIs
                        // are SUPER_ADMIN only.
                        //
                        // Includes:
                        // GET registrations
                        // GET registration by ID
                        // GET registrations by status
                        // POST approve
                        // PATCH status
                        // DELETE registration
                        //
                        .requestMatchers(
                                "/api/hospital-registrations/**"
                        )
                        .hasRole("SUPER_ADMIN")


                        // ==========================================
                        // CURRENT APPLICATION APIs
                        // ==========================================

                        // Existing APIs are kept working for now.
                        // We will secure sensitive APIs separately.
                        .requestMatchers("/api/**")
                        .permitAll()


                        // ==========================================
                        // OTHER REQUESTS
                        // ==========================================

                        .anyRequest()
                        .permitAll()
                );

        return http.build();
    }
}