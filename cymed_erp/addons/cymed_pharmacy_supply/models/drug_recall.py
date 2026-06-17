"""
Drug Recall Engine
==================
When the manufacturer (or FDA / SFDA) issues a recall, this engine:
  1. Locates every lot of the affected drug across all facilities
  2. Freezes those lots (prevents dispensing)
  3. Notifies pharmacies / wards / patients who received the drug
  4. Tracks return-to-vendor or destruction
  5. Generates audit-ready compliance reports
"""
from odoo import models, fields, api
from odoo.exceptions import UserError


class DrugRecall(models.Model):
    _name = 'cymed.drug.recall'
    _description = 'Drug Recall Notice'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'recall_date desc'
    _rec_name = 'recall_number'

    # ── Notice ──────────────────────────────────────────────────────────────
    recall_number = fields.Char(required=True, tracking=True)
    recall_date = fields.Date(required=True, default=fields.Date.today, tracking=True)
    notified_by = fields.Selection([
        ('manufacturer', 'Manufacturer'),
        ('sfda', 'SFDA Saudi Arabia'),
        ('fda', 'US FDA'),
        ('ema', 'European EMA'),
        ('mhra', 'UK MHRA'),
        ('internal', 'Internal QA'),
    ], required=True, tracking=True)
    classification = fields.Selection([
        ('class_1', 'Class I — life-threatening'),
        ('class_2', 'Class II — temporary or reversible adverse'),
        ('class_3', 'Class III — unlikely adverse'),
        ('market_withdrawal', 'Market Withdrawal'),
    ], required=True, tracking=True)

    # ── Subject ─────────────────────────────────────────────────────────────
    drug_id = fields.Many2one('cymed.drug.formulary', required=True, tracking=True)
    manufacturer_id = fields.Many2one('res.partner', related='drug_id.manufacturer_id', store=True)
    affected_lot_numbers = fields.Text(string='Affected Lot Numbers (comma or newline-separated)',
                                        required=True, help='Will be parsed to find matching stock.lot records')
    affected_expiry_from = fields.Date()
    affected_expiry_to = fields.Date()
    affected_lot_ids = fields.Many2many('stock.lot', compute='_compute_affected_lots',
                                         store=True, string='Affected Stock Lots')

    # ── Reason / instructions ──────────────────────────────────────────────
    reason = fields.Text(required=True)
    health_risk = fields.Text(string='Patient Health Risk Description')
    action_instructions = fields.Text(string='Action Required',
                                       help='What facilities should do — return, destroy, hold')
    deadline_action = fields.Date(string='Action Deadline')

    # ── State ──────────────────────────────────────────────────────────────
    state = fields.Selection([
        ('draft', 'Draft'),
        ('issued', 'Issued — Locating Stock'),
        ('quarantined', 'Stock Quarantined'),
        ('notifying', 'Notifying Patients'),
        ('returning', 'Return / Destruction In Progress'),
        ('closed', 'Closed'),
    ], default='draft', tracking=True)

    # ── Impact ─────────────────────────────────────────────────────────────
    total_qty_affected = fields.Float(compute='_compute_impact', store=True)
    facilities_affected = fields.Integer(compute='_compute_impact', store=True)
    patients_notified = fields.Integer(default=0)

    @api.depends('affected_lot_numbers', 'drug_id')
    def _compute_affected_lots(self):
        Lot = self.env['stock.lot']
        for rec in self:
            if not rec.affected_lot_numbers or not rec.drug_id.product_id:
                rec.affected_lot_ids = [(5, 0, 0)]
                continue
            lot_names = [
                ln.strip() for ln in rec.affected_lot_numbers.replace(',', '\n').split('\n')
                if ln.strip()
            ]
            product_variants = rec.drug_id.product_id.product_variant_ids
            lots = Lot.search([
                ('product_id', 'in', product_variants.ids),
                ('name', 'in', lot_names),
            ])
            rec.affected_lot_ids = [(6, 0, lots.ids)]

    @api.depends('affected_lot_ids')
    def _compute_impact(self):
        for rec in self:
            rec.total_qty_affected = sum(rec.affected_lot_ids.mapped('product_qty'))
            rec.facilities_affected = len({l.company_id.id for l in rec.affected_lot_ids if l.company_id})

    # ── Workflow ────────────────────────────────────────────────────────────
    def action_quarantine_stock(self):
        """Freeze all affected lots so no dispensing happens."""
        self.ensure_one()
        if not self.affected_lot_ids:
            raise UserError('No stock lots match the affected lot numbers.')
        # In Odoo 19 we use lot.product_qty + a custom quarantine flag on stock.quant
        Quant = self.env['stock.quant']
        for lot in self.affected_lot_ids:
            quants = Quant.search([('lot_id', '=', lot.id), ('quantity', '>', 0)])
            quants.write({'cymed_quarantined': True, 'cymed_quarantine_reason': self.recall_number})
        self.state = 'quarantined'
        return True

    def action_notify_patients(self):
        """Identify patients who received affected lots and queue notifications."""
        self.ensure_one()
        # Trace via cymed.controlled.substance.log + stock.move dispense_patient
        Log = self.env['cymed.controlled.substance.log']
        affected_patients = Log.search([
            ('lot_id', 'in', self.affected_lot_ids.ids),
            ('movement_type', '=', 'dispense_patient'),
            ('patient_id', '!=', False),
        ]).mapped('patient_id')
        self.patients_notified = len(affected_patients)
        self.state = 'notifying'
        # Hook for SMS / email gateway
        for partner in affected_patients:
            self.env['mail.message'].create({
                'subject': f'Drug Recall Notification: {self.drug_id.name}',
                'body': self._format_patient_notification(),
                'partner_ids': [(6, 0, [partner.id])],
                'model': 'cymed.drug.recall',
                'res_id': self.id,
            })
        return True

    def _format_patient_notification(self):
        return f"""
            <p>Important safety notice regarding {self.drug_id.name}.</p>
            <p>Reason: {self.reason}</p>
            <p>Please {self.action_instructions or 'contact your pharmacist'}.</p>
        """

    def action_close(self):
        self.state = 'closed'
