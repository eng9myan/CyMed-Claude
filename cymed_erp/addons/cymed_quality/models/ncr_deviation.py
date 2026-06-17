"""NCR (Non-Conformance Report) and Deviation tracking."""
from odoo import models, fields, api


class NCR(models.Model):
    _name = 'cymed.quality.ncr'
    _description = 'Non-Conformance Report'
    _inherit = ['mail.thread']
    _order = 'create_date desc'
    _rec_name = 'reference'

    reference = fields.Char(default='New', readonly=True)
    title = fields.Char(required=True)
    description = fields.Text(required=True)
    severity = fields.Selection([
        ('minor', 'Minor'),
        ('major', 'Major'),
        ('critical', 'Critical'),
    ], required=True)
    detected_by = fields.Many2one('res.users', required=True, default=lambda s: s.env.user)
    detected_date = fields.Datetime(default=fields.Datetime.now)

    product_id = fields.Many2one('product.product')
    lot_id = fields.Many2one('stock.lot')
    quantity = fields.Float()

    capa_id = fields.Many2one('cymed.quality.capa', string='Linked CAPA')
    disposition = fields.Selection([
        ('use_as_is', 'Use As Is'),
        ('rework', 'Rework'),
        ('return_vendor', 'Return to Vendor'),
        ('destroy', 'Destroy'),
        ('quarantine', 'Quarantine — Investigate'),
    ])

    state = fields.Selection([
        ('open', 'Open'),
        ('investigating', 'Investigating'),
        ('disposition_set', 'Disposition Set'),
        ('closed', 'Closed'),
    ], default='open', tracking=True)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('reference', 'New') == 'New':
                vals['reference'] = self.env['ir.sequence'].next_by_code('cymed.quality.ncr') or 'NCR-NEW'
        return super().create(vals_list)


class Deviation(models.Model):
    _name = 'cymed.quality.deviation'
    _description = 'Quality Deviation'
    _inherit = ['mail.thread']
    _order = 'create_date desc'

    reference = fields.Char(default='New', readonly=True)
    title = fields.Char(required=True)
    deviation_type = fields.Selection([
        ('procedural', 'Procedural'),
        ('temperature', 'Temperature Excursion'),
        ('process', 'Process Parameter'),
        ('documentation', 'Documentation'),
        ('cleaning', 'Cleaning / Sanitation'),
        ('training', 'Training'),
    ], required=True)
    description = fields.Text(required=True)
    impact_assessment = fields.Text()
    capa_id = fields.Many2one('cymed.quality.capa')
    state = fields.Selection([
        ('open', 'Open'),
        ('investigation', 'Investigation'),
        ('closed', 'Closed'),
    ], default='open')
