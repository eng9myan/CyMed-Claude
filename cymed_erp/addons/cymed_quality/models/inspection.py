"""
Incoming Inspection & Batch QC
==============================
Every GRN of a medical item triggers an inspection. Released items become
available stock; rejected items go to quarantine.
"""
from odoo import models, fields, api


class IncomingInspection(models.Model):
    _name = 'cymed.incoming.inspection'
    _description = 'Incoming Goods Inspection'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'inspection_date desc'
    _rec_name = 'reference'

    reference = fields.Char(default='New', readonly=True)
    inspection_date = fields.Datetime(default=fields.Datetime.now, required=True)
    picking_id = fields.Many2one('stock.picking', string='Goods Receipt', required=True,
                                  domain=[('picking_type_code', '=', 'incoming')])
    vendor_id = fields.Many2one('res.partner', related='picking_id.partner_id', store=True)
    inspector_id = fields.Many2one('res.users', required=True, default=lambda s: s.env.user)
    qa_supervisor_id = fields.Many2one('res.users', string='QA Supervisor (sign-off)')

    line_ids = fields.One2many('cymed.incoming.inspection.line', 'inspection_id')

    state = fields.Selection([
        ('draft', 'Draft'),
        ('in_progress', 'Inspecting'),
        ('passed', 'Passed — Released'),
        ('partial', 'Partial — Mixed Outcome'),
        ('rejected', 'Rejected — Returned'),
        ('quarantine', 'Quarantined'),
    ], default='draft', tracking=True)

    total_qty_inspected = fields.Float(compute='_compute_totals', store=True)
    total_qty_passed = fields.Float(compute='_compute_totals', store=True)
    total_qty_rejected = fields.Float(compute='_compute_totals', store=True)
    pass_rate_pct = fields.Float(compute='_compute_totals', store=True)

    notes = fields.Text()
    coa_attached = fields.Boolean(string='Certificate of Analysis Attached')

    @api.depends('line_ids.qty_inspected', 'line_ids.qty_passed', 'line_ids.qty_rejected')
    def _compute_totals(self):
        for r in self:
            r.total_qty_inspected = sum(r.line_ids.mapped('qty_inspected'))
            r.total_qty_passed = sum(r.line_ids.mapped('qty_passed'))
            r.total_qty_rejected = sum(r.line_ids.mapped('qty_rejected'))
            r.pass_rate_pct = (r.total_qty_passed / r.total_qty_inspected * 100) if r.total_qty_inspected else 0

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('reference', 'New') == 'New':
                vals['reference'] = self.env['ir.sequence'].next_by_code('cymed.incoming.inspection') or 'QC-IN-NEW'
        return super().create(vals_list)


class IncomingInspectionLine(models.Model):
    _name = 'cymed.incoming.inspection.line'
    _description = 'Inspection Line'

    inspection_id = fields.Many2one('cymed.incoming.inspection', required=True, ondelete='cascade')
    product_id = fields.Many2one('product.product', required=True)
    lot_id = fields.Many2one('stock.lot')
    qty_received = fields.Float()
    qty_inspected = fields.Float()
    qty_passed = fields.Float()
    qty_rejected = fields.Float()

    # Inspection criteria
    visual_check_pass = fields.Boolean(string='Visual Inspection')
    packaging_integrity_pass = fields.Boolean(string='Packaging Integrity')
    label_match_pass = fields.Boolean(string='Label Matches PO')
    expiry_acceptable = fields.Boolean(string='Expiry > 6 months')
    temperature_log_ok = fields.Boolean(string='Cold-Chain Log OK',
                                         help='For cold-chain items')
    documentation_complete = fields.Boolean(string='CoA / Documentation Complete')

    rejection_reason = fields.Selection([
        ('damaged', 'Damaged'),
        ('expired', 'Expired / Near-Expiry'),
        ('wrong_item', 'Wrong Item'),
        ('wrong_qty', 'Wrong Quantity'),
        ('label_mismatch', 'Label Mismatch'),
        ('contamination', 'Suspected Contamination'),
        ('temperature_excursion', 'Temperature Excursion'),
        ('missing_documentation', 'Missing CoA / Documentation'),
        ('other', 'Other'),
    ])
    rejection_note = fields.Text()
