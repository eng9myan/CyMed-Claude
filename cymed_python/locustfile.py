from locust import HttpUser, task, between

class CyMedHospitalUser(HttpUser):
    wait_time = between(1, 5)

    def on_start(self):
        """
        Login simulation on startup.
        """
        response = self.client.post("/api/v1/auth/token/", json={
            "username": "admin@cymed.com",
            "password": "password123"
        })
        if response.status_code == 200:
            self.token = response.json().get("access")
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            self.headers = {}

    @task(3)
    def view_command_center_beds(self):
        """
        Simulate a user hitting the live beds API for the command center.
        """
        self.client.get("/api/v1/beds/", headers=self.headers)

    @task(1)
    def view_patient_roster(self):
        """
        Simulate a user hitting the patient roster list.
        """
        self.client.get("/api/v1/patients/globalpatients/", headers=self.headers)

    @task(2)
    def request_ai_insight(self):
        """
        Simulate an AI Copilot request for a common ICD-11 code.
        """
        self.client.post("/api/v1/ai/soap", json={
            "raw_notes": "Patient presents with chest pain, BP 140/90, HR 110."
        }, headers=self.headers)
