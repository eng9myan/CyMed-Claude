-- Fact Encounters Model
WITH raw_encounters AS (
    SELECT * FROM {{ source('raw', 'encounters') }}
),
patients AS (
    SELECT * FROM {{ ref('dim_patients') }}
)

SELECT
    e.id AS encounter_id,
    p.patient_surrogate_key,
    e.admission_date,
    e.discharge_date,
    e.status,
    e.chief_complaint,
    DATETIME_DIFF(e.discharge_date, e.admission_date, DAY) AS length_of_stay_days
FROM raw_encounters e
LEFT JOIN patients p ON e.patient_id = p.global_patient_id
