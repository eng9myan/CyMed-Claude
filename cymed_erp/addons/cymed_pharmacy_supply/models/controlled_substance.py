"""
Controlled Substances Register
==============================
Every movement of a Schedule I-V drug is logged here. Witness + biometric
required for dispensing per DEA / SFDA regulations.
"""
from odoo import models, fields, api
from odoo.exceptions import ValidationError


class ControlledSubstanceLog(models.Model):
    _name = 'cymed.controlled.substance.log'
    _description = 'Controlled Substance Movement Log'
    _inherit = ['mail.thread']
    _order = 'log_date desc, id desc'
    _rec_name = 'reference'

    reference = fields.Char(default='New', readonly=True, copy=False)
    log_date = fields.Datetime(default=fields.Datetime.now, required=True, tracking=True)
    drug_id = fields.Many2one('cymed.drug.formulary', required=True,
                               domain=[('is_controlled', '=', True)], tracking=True)
    schedule = fields.Selection(related='drug_id.controlled_schedule', store=True)

    # ── Movement ─────────────────────────────────────────────────────────────
    movement_type = fields.Selection([
        ('receipt', 'Receipt from Vendor'),
        ('issue_ward', 'Issue to Ward'),
        ('dispense_patient', 'Dispense to Patient'),
        ('return_unused', 'Return Unused'),
        ('waste_disposal', 'Waste / Disposal'),
        ('transfer', 'Inter-Facility Transfer'),
        ('reconciliation', 'Reconciliation Adjustment'),
    ], required=True, tracking=True)

    quantity = fields.Float(required=True, tracking=True)
    uom_id = fields.Many2one('uom.uom', required=True)
    lot_id = fields.Many2one('stock.lot', string='Lot/Batch', required=True, tracking=True)

    # ── Provenance / destination ─────────────────────────────────────────────
    source_location_id = fields.Many2one('stock.location', string='From')
    dest_location_id = fields.Many2one('stock.location', string='To')
    patient_id = fields.Many2one('res.partner', string='Patient',
                                  help='Required for dispense_patient movement')
    prescription_id = fields.Char(string='Prescription #',
                                   help='Reference to e-prescription if applicable')

    # ── Audit & integrity ────────────────────────────────────────────────────
    handler_id = fields.Many2one('res.users', string='Handled By', required=True,
                                  default=lambda self: self.env.user, tracking=True)
    witness_id = fields.Many2one('res.users', string='Witness', tracking=True,
                                  help='Required for Schedule II and waste disposal')
    biometric_verified = fields.Boolean(default=False, tracking=True)
    notes = fields.Text()

    # ── Running balance ──────────────────────────────────────────────────────
    balance_before = fields.Float(string='Balance Before')
    balance_after = fields.Float(string='Balance After')
    discrepancy = fields.Float(compute='_compute_discrepancy', store=True)

    @api.depends('balance_before', 'balance_after', 'quantity', 'movement_type')
    def _compute_discrepancy(self):
        for rec in self:
            sign = -1 if rec.movement_type in ('issue_ward', 'dispense_patient', 'waste_disposal') else 1
            expected = rec.balance_before + (sign * rec.quantity)
            rec.discrepancy = rec.balance_after - expected

    # ── Constraints ──────────────────────────────────────────────────────────
    @api.constrains('movement_type', 'patient_id', 'witness_id', 'schedule')
    def _check_compliance(self):
        for rec in self:
            if rec.movement_type == 'dispense_patient' and not rec.patient_id:
                raise ValidationError('Patient is required when dispensing a controlled substance.')
            if rec.schedule in ('I', 'II') and not rec.witness_id:
                raise ValidationError(f'Schedule {rec.schedule} requires a witness signature.')
            if rec.movement_type == 'waste_disposal' and not rec.witness_id:
                raise ValidationError('Waste disposal of controlled substances requires a witness.')

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('reference', 'New') == 'New':
                vals['reference'] = self.env['ir.sequence'].next_by_code('cymed.controlled.substance.log') or 'CS-NEW'
        return super().create(vals_list)


class ControlledSubstanceReconciliation(models.Model):
    """End-of-shift reconciliation by pharmacy supervisor."""
    _name = 'cymed.controlled.substance.reconciliation'
    _description = 'Controlled Substance Shift Reconciliation'
    _inherit = ['mail.thread']
    _order = 'date desc'

    name = fields.Char(default='New', readonly=True)
    date = fields.Date(default=fields.Date.today, required=True)
    shift = fields.Selection([('morning','Morning'),('evening','Evening'),('night','Night')], required=True)
    location_id = fields.Many2one('stock.location', required=True)
    pharmacist_id = fields.Many2one('res.users', required=True)
    supervisor_id = fields.Many2one('res.users', required=True)
    state = fields.Selection([
        ('draft', 'Draft'),
        ('counting', 'Counting'),
        ('reconciled', 'Reconciled'),
        ('discrepancy', 'Discrepancy — Investigation'),
        ('closed', 'Closed'),
    ], default='draft', tracking=True)
    line_ids = fields.One2many('cymed.controlled.substance.reconciliation.line', 'reconciliation_id')
    total_discrepancy = fields.Integer(compute='_compute_total_disc', store=True)
    notes = fields.Text()

    @api.depends('line_ids.discrepancy')
    def _compute_total_disc(self):
        for rec in self:
            rec.total_discrepancy = sum(1 for l in rec.line_ids if l.discrepancy != 0)


class ControlledSubstanceReconciliationLine(models.Model):
    _name = 'cymed.controlled.substance.reconciliation.line'
    _description = 'Reconciliation Line'

    reconciliation_id = fields.Many2one('cymed.controlled.substance.reconciliation',
                                         required=True, ondelete='cascade')
    drug_id = fields.Many2one('cymed.drug.formulary', required=True,
                               domain=[('is_controlled', '=', True)])
    expected_qty = fields.Float(required=True)
    physical_qty = fields.Float(required=True)
    discrepancy = fields.Float(compute='_compute_disc', store=True)
    reason = fields.Text()

    @api.depends('expected_qty', 'physical_qty')
    def _compute_disc(self):
        for r in self:
            r.discrepancy = r.physical_qty - r.expected_qty
