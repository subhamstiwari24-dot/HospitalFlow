CREATE SEQUENCE IF NOT EXISTS patient_id_seq;

ALTER TABLE patients ADD COLUMN IF NOT EXISTS patient_id VARCHAR(32);
ALTER TABLE patients ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS active BOOLEAN;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS email_verified BOOLEAN;

UPDATE patients SET age = 1 WHERE age IS NULL;
UPDATE patients SET active = TRUE WHERE active IS NULL;
UPDATE patients SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE patients SET email_verified = TRUE WHERE email_verified IS NULL;

SELECT setval(
    'patient_id_seq',
    GREATEST(
        COALESCE((SELECT MAX(id) FROM patients), 0),
        COALESCE((SELECT MAX(CAST(SUBSTRING(patient_id FROM 9) AS BIGINT))
                  FROM patients
                  WHERE patient_id ~ '^HF-PAT-[0-9]+$'), 0),
        1
    ),
    true
);

UPDATE patients
SET patient_id = 'HF-PAT-' || LPAD(nextval('patient_id_seq')::TEXT, 6, '0')
WHERE patient_id IS NULL;

ALTER TABLE patients ALTER COLUMN patient_id SET NOT NULL;
ALTER TABLE patients ALTER COLUMN age SET NOT NULL;
ALTER TABLE patients ALTER COLUMN active SET NOT NULL;
ALTER TABLE patients ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE patients ALTER COLUMN email_verified SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_patients_patient_id ON patients(patient_id);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS email VARCHAR(320);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS ux_doctors_email ON doctors(email) WHERE email IS NOT NULL;
CREATE TABLE IF NOT EXISTS otp_verifications (
    id BIGSERIAL PRIMARY KEY,
    identifier VARCHAR(320) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(32) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    reset_token VARCHAR(64),
    created_at TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_otp_identifier_purpose
    ON otp_verifications(identifier, purpose, created_at);
CREATE TABLE IF NOT EXISTS pending_registrations (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(320) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_pending_registration_email ON pending_registrations(email);
CREATE UNIQUE INDEX IF NOT EXISTS ux_pending_registration_phone ON pending_registrations(phone);