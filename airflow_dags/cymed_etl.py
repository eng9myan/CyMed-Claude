from airflow import DAG
from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.providers.google.cloud.transfers.postgres_to_gcs import PostgresToGCSOperator
from airflow.providers.google.cloud.transfers.gcs_to_bigquery import GCSToBigQueryOperator
from airflow.operators.bash import BashOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'cymed_data_team',
    'depends_on_past': False,
    'start_date': datetime(2026, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    'cymed_daily_etl_to_bigquery',
    default_args=default_args,
    description='ETL pipeline from PostgreSQL to BigQuery',
    schedule_interval=timedelta(days=1),
    catchup=False,
) as dag:

    # 1. Extract Patients from Postgres to GCS
    extract_patients = PostgresToGCSOperator(
        task_id='extract_patients',
        postgres_conn_id='cymed_postgres',
        sql='SELECT id, global_patient_id, facility_id FROM patient_app_patient;',
        bucket='cymed-data-lake',
        filename='patients/{{ ds }}/patients.csv',
        export_format='csv'
    )

    # 2. Extract Encounters
    extract_encounters = PostgresToGCSOperator(
        task_id='extract_encounters',
        postgres_conn_id='cymed_postgres',
        sql='SELECT * FROM admission_app_encounter;',
        bucket='cymed-data-lake',
        filename='encounters/{{ ds }}/encounters.csv',
        export_format='csv'
    )

    # 3. Load into BigQuery Raw Layer
    load_patients_bq = GCSToBigQueryOperator(
        task_id='load_patients_bq',
        bucket='cymed-data-lake',
        source_objects=['patients/{{ ds }}/patients.csv'],
        destination_project_dataset_table='cymed-dw.raw.patients',
        write_disposition='WRITE_TRUNCATE',
    )

    load_encounters_bq = GCSToBigQueryOperator(
        task_id='load_encounters_bq',
        bucket='cymed-data-lake',
        source_objects=['encounters/{{ ds }}/encounters.csv'],
        destination_project_dataset_table='cymed-dw.raw.encounters',
        write_disposition='WRITE_TRUNCATE',
    )

    # 4. Trigger dbt transformations
    run_dbt_models = BashOperator(
        task_id='run_dbt_models',
        bash_command='cd /opt/airflow/dbt && dbt run --profiles-dir .',
    )

    # Define Workflow
    [extract_patients, extract_encounters] >> load_patients_bq
    [extract_patients, extract_encounters] >> load_encounters_bq
    [load_patients_bq, load_encounters_bq] >> run_dbt_models
