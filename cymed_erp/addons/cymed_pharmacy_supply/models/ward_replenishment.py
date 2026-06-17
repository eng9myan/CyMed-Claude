"""
Ward Replenishment
==================
Par-level driven automated replenishment of ward medication carts and
crash carts. Triggered nightly (cron) or on-demand.
"""
from odoo import models, fields, api


class WardParLevel(models.Model):
    _name = 'cymed.ward.par.level'
    _description = 'Ward Par-Level Stocking Rule'
    _rec_name = 'display_name'

    ward_location_id = fields.Many2one('stock.location', required=True,
                                        string='Ward / Cart Location')
    drug_id = fields.Many2one('cymed.drug.formulary', required=True)
    par_qty = fields.Float(string='Par Level', required=True,
                           help='Target stock quantity for this ward')
    min_qty = fields.Float(string='Reorder Trigger', required=True,
                           help='Below this triggers replenishment')
    max_qty = fields.Float(string='Max Stock', required=True)
    daily_avg_usage = fields.Float(string='Daily Avg Usage',
                                    help='Computed from last 30 days; used for AI forecast')
    is_crash_cart = fields.Boolean(string='Crash Cart Item',
                                    help='Critical — sealed cart, replenish on tamper')

    display_name = fields.Char(compute='_compute_display_name')

    @api.depends('ward_location_id', 'drug_id')
    def _compute_display_name(self):
        for r in self:
            r.display_name = f"{r.ward_location_id.name} :: {r.drug_id.name}" if r.ward_location_id and r.drug_id else ''


class WardReplenishmentRun(models.Model):
    _name = 'cymed.ward.replenishment.run'
    _description = 'Ward Replenishment Run'
    _inherit = ['mail.thread']
    _order = 'run_date desc'

    name = fields.Char(default='New')
    run_date = fields.Datetime(default=fields.Datetime.now, required=True)
    state = fields.Selection([
        ('draft', 'Draft'),
        ('reviewing', 'Pharmacist Reviewing'),
        ('approved', 'Approved'),
        ('picking', 'In Picking'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ], default='draft', tracking=True)
    pharmacist_id = fields.Many2one('res.users', default=lambda s: s.env.user)
    triggered_by = fields.Selection([
        ('cron', 'Scheduled Cron'),
        ('manual', 'Manual'),
        ('alert', 'Low Stock Alert'),
        ('crash_cart_seal', 'Crash Cart Tamper'),
    ], default='cron')
    line_ids = fields.One2many('cymed.ward.replenishment.line', 'run_id')
    total_lines = fields.Integer(compute='_compute_totals')

    @api.depends('line_ids')
    def _compute_totals(self):
        for r in self:
            r.total_lines = len(r.line_ids)


class WardReplenishmentLine(models.Model):
    _name = 'cymed.ward.replenishment.line'
    _description = 'Ward Replenishment Line'

    run_id = fields.Many2one('cymed.ward.replenishment.run', required=True, ondelete='cascade')
    par_level_id = fields.Many2one('cymed.ward.par.level', required=True)
    drug_id = fields.Many2one(related='par_level_id.drug_id', store=True)
    current_qty = fields.Float()
    suggested_qty = fields.Float(string='Suggested Replenishment')
    approved_qty = fields.Float()
    state = fields.Selection([
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('picked', 'Picked'),
        ('delivered', 'Delivered'),
    ], default='pending')
