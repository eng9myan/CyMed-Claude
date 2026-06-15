"""Dynamic Reporting Engine — saved reports, scheduled delivery, dashboards."""
import uuid6
from django.db import models

def gen_uuid(): return uuid6.uuid7()


class ReportDefinition(models.Model):
    OUTPUT_FORMATS = [("pdf","PDF"),("excel","Excel"),("csv","CSV"),("json","JSON"),("html","HTML")]
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    name         = models.CharField(max_length=255)
    name_ar      = models.CharField(max_length=255, blank=True)
    description  = models.TextField(blank=True)
    category     = models.CharField(max_length=100, blank=True)
    query_sql    = models.TextField(blank=True, help_text="Safe parameterized SELECT only")
    parameters   = models.JSONField(default=list, help_text="List of {name, type, label, required}")
    output_format= models.CharField(max_length=10, choices=OUTPUT_FORMATS, default="pdf")
    template     = models.TextField(blank=True, help_text="Jinja2 HTML template")
    active       = models.BooleanField(default=True)
    created_by   = models.UUIDField()
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "reporting_definitions"


class ScheduledReport(models.Model):
    FREQUENCY = [("daily","Daily"),("weekly","Weekly"),("monthly","Monthly"),
                 ("quarterly","Quarterly"),("on_demand","On Demand")]
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    report       = models.ForeignKey(ReportDefinition, on_delete=models.CASCADE, related_name="schedules")
    frequency    = models.CharField(max_length=20, choices=FREQUENCY, default="monthly")
    cron_expr    = models.CharField(max_length=50, blank=True)
    recipients   = models.JSONField(default=list, help_text="List of email addresses")
    parameters   = models.JSONField(default=dict)
    active       = models.BooleanField(default=True)
    last_run_at  = models.DateTimeField(null=True, blank=True)
    next_run_at  = models.DateTimeField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reporting_scheduled"


class ReportRun(models.Model):
    STATUS = [("queued","Queued"),("running","Running"),("completed","Completed"),("failed","Failed")]
    id           = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    report       = models.ForeignKey(ReportDefinition, on_delete=models.CASCADE, related_name="runs")
    run_by       = models.UUIDField(null=True, blank=True)
    parameters   = models.JSONField(default=dict)
    status       = models.CharField(max_length=20, choices=STATUS, default="queued")
    output_url   = models.URLField(blank=True)
    row_count    = models.IntegerField(null=True, blank=True)
    duration_ms  = models.IntegerField(null=True, blank=True)
    error        = models.TextField(blank=True)
    started_at   = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "reporting_runs"
