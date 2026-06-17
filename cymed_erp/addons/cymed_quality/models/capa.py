"""
CAPA — Corrective & Preventive Action
=====================================
Track quality issues end-to-end with root cause analysis.
"""
from odoo import models, fields, api


class CAPA(models.Model):
    _name = 'cymed.quality.capa'
    _description = 'Corrective & Preventive Action'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'create_date desc'
    _rec_name = 'reference'

    reference = fields.Char(default='New', readonly=True)
    title = fields.Char(required=True, tracking=True)
    description = fields.Text(required=True)
    capa_type = fields.Selection([
        ('corrective', 'Corrective'),
        ('preventive', 'Preventive'),
        ('both', 'Both'),
    ], required=True, tracking=True)
    severity = fields.Selection([
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ], required=True, tracking=True)

    # ── Source ─────────────────────────────────────────────────────────────
    source = fields.Selection([
        ('internal_audit', 'Internal Audit'),
        ('external_audit', 'External Audit (JCI/CAP)'),
        ('vendor_complaint', 'Vendor Complaint'),
        ('customer_complaint', 'Customer Complaint'),
        ('inspection_failure', 'Inspection Failure'),
        ('deviation', 'Deviation'),
        ('incident', 'Incident Report'),
        ('management_review', 'Management Review'),
    ], required=True)
    source_ncr_id = fields.Many2one('cymed.quality.ncr', string='Source NCR')
    source_inspection_id = fields.Many2one('cymed.incoming.inspection')

    # ── Investigation ──────────────────────────────────────────────────────
    root_cause_analysis = fields.Text()
    rca_method = fields.Selection([
        ('5_whys', '5 Whys'),
        ('fishbone', 'Fishbone / Ishikawa'),
        ('fault_tree', 'Fault Tree'),
        ('pareto', 'Pareto'),
    ])

    # ── Action plan ────────────────────────────────────────────────────────
    immediate_action = fields.Text(string='Immediate Containment')
    corrective_action = fields.Text(string='Corrective Action Plan')
    preventive_action = fields.Text(string='Preventive Action Plan')
    owner_id = fields.Many2one('res.users', required=True, tracking=True)
    target_date = fields.Date(required=True)
    completion_date = fields.Date()

    # ── Effectiveness ──────────────────────────────────────────────────────
    effectiveness_review_date = fields.Date()
    effectiveness_verified = fields.Boolean()
    effectiveness_notes = fields.Text()

    state = fields.Selection([
        ('draft', 'Draft'),
        ('open', 'Open'),
        ('investigating', 'Under Investigation'),
        ('action_planned', 'Action Planned'),
        ('in_progress', 'Action In Progress'),
        ('verification', 'Verification Phase'),
        ('closed', 'Closed — Verified'),
        ('cancelled', 'Cancelled'),
    ], default='draft', tracking=True)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('reference', 'New') == 'New':
                vals['reference'] = self.env['ir.sequence'].next_by_code('cymed.quality.capa') or 'CAPA-NEW'
        return super().create(vals_list)
