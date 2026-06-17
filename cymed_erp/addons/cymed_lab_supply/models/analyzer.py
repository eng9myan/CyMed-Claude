"""Lab Analyzer — links to maintenance + reagent consumption."""
from odoo import models, fields


class LabAnalyzer(models.Model):
    _name = 'cymed.lab.analyzer'
    _description = 'Laboratory Analyzer'
    _rec_name = 'name'

    name = fields.Char(required=True)
    serial = fields.Char()
    manufacturer = fields.Char()
    model = fields.Char()
    location_id = fields.Many2one('stock.location')
    equipment_id = fields.Many2one('maintenance.equipment', string='Maintenance Asset')

    category = fields.Selection([
        ('chemistry', 'Chemistry'),
        ('hematology', 'Hematology'),
        ('coagulation', 'Coagulation'),
        ('immunoassay', 'Immunoassay'),
        ('microbiology', 'Microbiology'),
        ('molecular', 'Molecular'),
        ('urinalysis', 'Urinalysis'),
        ('blood_gas', 'Blood Gas'),
    ], required=True)

    # ── Integration ────────────────────────────────────────────────────────
    integration_protocol = fields.Selection([
        ('astm', 'ASTM 1394'),
        ('hl7', 'HL7 v2.5.1'),
        ('lis2a2', 'LIS2-A2'),
        ('proprietary', 'Proprietary'),
        ('none', 'Standalone (manual entry)'),
    ], default='hl7')
    middleware_endpoint = fields.Char(string='Middleware Endpoint')

    # ── Calibration & QC schedule ──────────────────────────────────────────
    calibration_frequency_days = fields.Integer(default=180)
    last_calibration = fields.Date()
    next_calibration_due = fields.Date()
    qc_frequency = fields.Selection([
        ('per_shift', 'Per Shift'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('per_run', 'Per Run'),
    ], default='daily')

    state = fields.Selection([
        ('operational', 'Operational'),
        ('qc_pending', 'QC Pending'),
        ('out_of_service', 'Out of Service'),
        ('maintenance', 'Under Maintenance'),
    ], default='operational')
