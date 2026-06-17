"""
Surgical Kits & Procedure Templates
====================================
A kit = a bill of materials for a procedure. When the procedure is scheduled,
the kit is auto-allocated. Used + unused items return / charge accordingly.
"""
from odoo import models, fields, api


class SurgicalKit(models.Model):
    _name = 'cymed.surgical.kit'
    _description = 'Surgical Kit Template'
    _rec_name = 'name'

    name = fields.Char(required=True)
    code = fields.Char(required=True)
    category = fields.Selection([
        ('orthopedic', 'Orthopedic'),
        ('cardiac', 'Cardiac'),
        ('neuro', 'Neurosurgical'),
        ('general', 'General Surgery'),
        ('obgyn', 'OB/GYN'),
        ('urology', 'Urology'),
        ('ent', 'ENT'),
        ('ophthalmology', 'Ophthalmology'),
        ('dental', 'Dental'),
        ('emergency', 'Emergency Tray'),
        ('custom', 'Custom Pack'),
    ], required=True)

    line_ids = fields.One2many('cymed.surgical.kit.line', 'kit_id')
    standard_cost = fields.Float(compute='_compute_cost', store=True)
    is_loaner = fields.Boolean(string='Loaner Kit')
    vendor_id = fields.Many2one('res.partner', string='Loaner Vendor',
                                 domain=[('supplier_rank', '>', 0)])

    @api.depends('line_ids.line_subtotal')
    def _compute_cost(self):
        for k in self:
            k.standard_cost = sum(k.line_ids.mapped('line_subtotal'))


class SurgicalKitLine(models.Model):
    _name = 'cymed.surgical.kit.line'
    _description = 'Surgical Kit Bill of Materials'

    kit_id = fields.Many2one('cymed.surgical.kit', required=True, ondelete='cascade')
    product_id = fields.Many2one('product.product', required=True)
    qty = fields.Float(required=True, default=1)
    uom_id = fields.Many2one('uom.uom', related='product_id.uom_id')
    is_critical = fields.Boolean(string='Mission-Critical',
                                   help='Procedure cannot start without this item')
    unit_cost = fields.Float(related='product_id.standard_price', store=True)
    line_subtotal = fields.Float(compute='_compute_subtotal', store=True)
    consumed = fields.Boolean(default=True, help='True if typically consumed during procedure')

    @api.depends('qty', 'unit_cost')
    def _compute_subtotal(self):
        for l in self:
            l.line_subtotal = l.qty * l.unit_cost


class KitAllocation(models.Model):
    """When a procedure is scheduled, kit is allocated from stock."""
    _name = 'cymed.kit.allocation'
    _description = 'Kit Allocation for Procedure'
    _inherit = ['mail.thread']
    _order = 'scheduled_date desc'
    _rec_name = 'reference'

    reference = fields.Char(default='New', readonly=True)
    kit_id = fields.Many2one('cymed.surgical.kit', required=True)
    procedure_id = fields.Many2one('cymed.surgical.procedure', required=True)
    patient_id = fields.Many2one('res.partner', required=True)
    scheduled_date = fields.Datetime(required=True)
    or_room_id = fields.Many2one('stock.location', required=True)
    state = fields.Selection([
        ('draft', 'Draft'),
        ('reserved', 'Reserved'),
        ('picked', 'Picked & Prepared'),
        ('in_use', 'In Use'),
        ('returned', 'Returned'),
        ('billed', 'Billed'),
    ], default='draft', tracking=True)
    pick_id = fields.Many2one('stock.picking', string='Stock Picking')
    consumption_id = fields.Many2one('cymed.procedure.consumption')

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('reference', 'New') == 'New':
                vals['reference'] = self.env['ir.sequence'].next_by_code('cymed.kit.allocation') or 'ALLOC-NEW'
        return super().create(vals_list)
