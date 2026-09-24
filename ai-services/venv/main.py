from fastapi import FastAPI
from pydantic import BaseModel


# =========================================================
# HOSPITALFLOW AI SERVICE
# =========================================================

app = FastAPI(
    title="HospitalFlow AI Service",
    description="AI-based OPD waiting-time prediction service",
    version="1.0.0"
)


# =========================================================
# REQUEST MODEL
# =========================================================

class WaitingTimeRequest(BaseModel):
    patients_ahead: int
    average_consultation_minutes: float = 10
    emergency_patients: int = 0
    doctor_delay_minutes: int = 0


# =========================================================
# ROOT / HEALTH CHECK
# =========================================================

@app.get("/")
def root():
    return {
        "service": "HospitalFlow AI Service",
        "status": "running",
        "version": "1.0.0"
    }


# =========================================================
# AI WAITING-TIME PREDICTION
# =========================================================

@app.post("/predict")
def predict_waiting_time(
    request: WaitingTimeRequest
):

    # -----------------------------------------------------
    # CLEAN INPUT DATA
    # -----------------------------------------------------

    patients_ahead = max(
        request.patients_ahead,
        0
    )

    consultation_time = max(
        request.average_consultation_minutes,
        1
    )

    emergency_patients = max(
        request.emergency_patients,
        0
    )

    doctor_delay = max(
        request.doctor_delay_minutes,
        0
    )

    # -----------------------------------------------------
    # BASE WAITING TIME
    # -----------------------------------------------------

    base_wait = (
        patients_ahead * consultation_time
    )

    # -----------------------------------------------------
    # EMERGENCY IMPACT
    #
    # Emergency cases can temporarily increase
    # waiting time for normal patients.
    # -----------------------------------------------------

    emergency_impact = (
        emergency_patients * 5
    )

    # -----------------------------------------------------
    # TOTAL MINIMUM ESTIMATE
    # -----------------------------------------------------

    estimated_min = int(
        base_wait
        + doctor_delay
        + emergency_impact
    )

    # -----------------------------------------------------
    # MAXIMUM ESTIMATE
    #
    # Adds one consultation period plus
    # a small uncertainty buffer.
    # -----------------------------------------------------

    estimated_max = int(
        estimated_min
        + consultation_time
        + 5
    )

    # -----------------------------------------------------
    # CONFIDENCE
    # -----------------------------------------------------

    confidence = 90

    if emergency_patients > 0:
        confidence -= 5

    if doctor_delay > 15:
        confidence -= 5

    confidence = max(
        min(confidence, 95),
        60
    )

    # -----------------------------------------------------
    # HUMAN-READABLE MESSAGE
    # -----------------------------------------------------

    message = (
        "Waiting time predicted using current "
        "OPD queue conditions."
    )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "estimated_min_minutes": estimated_min,
        "estimated_max_minutes": estimated_max,
        "confidence": confidence,
        "patients_ahead": patients_ahead,
        "emergency_patients": emergency_patients,
        "doctor_delay_minutes": doctor_delay,
        "average_consultation_minutes": consultation_time,
        "message": message
    }