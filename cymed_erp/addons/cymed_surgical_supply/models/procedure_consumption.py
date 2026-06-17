"""
Procedure Consumption
=====================
Captures what was actually used in a procedure (vs. the standard kit BOM).
Drives accurate patient charging and procedure costing.
"""
from odoo import models, fields, api


class ProcedureConsumption(models.Model):
    _name = 'cymed.procedure.consumption'
    _description = 'Procedure Consumption Record'
    _inherit = ['mail.thread']
    _order = 'consumption_date desc'
    _rec_name = 'reference'

    reference = fields.Char(default='New', readonly=True)
    consumption_date = fields.Datetime(required=True, default=fields.Datetime.now)
    patient_id = fields.Many2one('res.partner', required=True)
    procedure_id = fields.Many2one('cymed.surgical.procedure', required=True)
    encounter_id = fields.Char()
    surgeon_id = fields.Many2one('res.users', required=True)
    allocation_id = fields.Many2one('cymed.kit.allocation', string='Kit Allocation')

    line_ids = fields.One2many('cymed.procedure.consumption.line', 'consumption_id')

    total_cost = fields.Float(compute='_compute_totals', store=True)
    total_billed = fields.Float(compute='_compute_totals', store=True)
    margin = fields.Float(compute='_compute_totals', store=True)
    items_count = fields.Integer(compute='_compute_totals', store=True)

    state = fields.Selection([
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('billed', 'Billed'),
    ], default='draft', tracking=True)

    @api.depends('line_ids.cost', 'line_ids.billed_amount')
    def _compute_totals(self):
        for r in self:
            r.total_cost = sum(r.line_ids.mapped('cost'))
            r.total_billed = sum(r.line_ids.mapped('billed_amount'))
            r.margin = r.total_billed - r.total_cost
            r.items_count = len(r.line_ids)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('reference', 'New') == 'New':
                vals['reference'] = self.env['ir.sequence'].next_by_code('cymed.procedure.consumption') or 'CONS-NEW'
        return super().create(vals_list)


class ProcedureConsumptionLine(models.Model):
    _name = 'cymed.procedure.consumption.line'
    _description = 'Consumption Line'

    consumption_id = fields.Many2one('cymed.procedure.consumption', required=True, ondelete='cascade')
    product_id = fields.Many2one('product.product', required=True)
    qty_planned = fields.Float()
    qty_actual = fields.Float(required=True)
    lot_id = fields.Many2one('stock.lot')
    cost = fields.Float()
    billed_amount = fields.Float()
    waste = fields.Boolean(string='Wastage')
    waste_reason = fields.Selection([
        ('opened_unused', 'Opened — Unused'),
        ('contaminated', 'Contaminated'),
        ('damaged', 'Damaged'),
        ('expired', 'Expired'),
    ])
