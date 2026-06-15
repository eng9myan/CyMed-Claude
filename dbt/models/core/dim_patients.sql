-- Dim Patients Model
WITH raw_patients AS (
    SELECT * FROM {{ source('raw', 'patients') }}
)

SELECT
    id AS patient_surrogate_key,
    global_patient_id,
    facility_id,
    CURRENT_TIMESTAMP() AS loaded_at
FROM raw_patients
