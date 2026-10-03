package com.hospitalflow.backend.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class HospitalSecurityService {

    /**
     * Returns the hospitalId of the currently authenticated user.
     *
     * Hospital Admin:
     * hospitalId comes from the JWT.
     *
     * Other users:
     * returns null if no hospitalId is present.
     */
    public Long getCurrentHospitalId(
            Authentication authentication
    ) {

        if (authentication == null) {
            throw new IllegalArgumentException(
                    "Authentication is required."
            );
        }

        Object details = authentication.getDetails();

        if (!(details instanceof Map<?, ?> detailsMap)) {
            throw new IllegalArgumentException(
                    "Hospital information is not available."
            );
        }

        Object hospitalId = detailsMap.get("hospitalId");

        if (hospitalId == null) {
            throw new IllegalArgumentException(
                    "Hospital ID is not available."
            );
        }

        if (hospitalId instanceof Number number) {
            return number.longValue();
        }

        try {
            return Long.parseLong(
                    hospitalId.toString()
            );
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                    "Invalid hospital ID."
            );
        }
    }


    /**
     * Checks whether the authenticated user belongs
     * to the requested hospital.
     */
    public boolean belongsToHospital(
            Authentication authentication,
            Long hospitalId
    ) {

        if (hospitalId == null) {
            return false;
        }

        Long currentHospitalId =
                getCurrentHospitalId(authentication);

        return currentHospitalId.equals(hospitalId);
    }
}