"""
Sterilization Cycles
====================
Every sterilization cycle is logged with parameters and biological indicator
results. Mandatory for JCI and CDC accreditation.
"""
from odoo import models, fields, api


class SterilizationCycle(models.Model):
    _name = 'cymed.sterilization.cycle'
    _description = 'Sterilization Cycle'
    _inherit = ['mail.thread']
    _order = 'cycle_date desc'
    _rec_name = 'cycle_number'

    cycle_number = fields.Char(default='New', readonly=True)
    cycle_date = fields.Datetime(required=True, default=fields.Datetime.now, tracking=True)
    autoclave_id = fields.Many2one('cymed.autoclave', required=True, tracking=True)
    operator_id = fields.Many2one('res.users', required=True, tracking=True)

    method = fields.Selection([
        ('steam', 'Steam Autoclave'),
        ('eto', 'Ethylene Oxide'),
        ('hydrogen_peroxide', 'Hydrogen Peroxide Plasma'),
        ('dry_heat', 'Dry Heat'),
        ('chemical', 'Chemical (Cidex/Glutaraldehyde)'),
        ('ozone', 'Ozone'),
    ], required=True)

    temperature_c = fields.Float(string='Temperature °C')
    pressure_kpa = fields.Float(string='Pressure kPa')
    exposure_time_min = fields.Integer(string='Exposure Time (min)')
    dry_time_min = fields.Integer(string='Dry Time (min)')

    # Indicators
    chemical_indicator_pass = fields.Boolean()
    biological_indicator_pass = fields.Boolean(string='Biological Indicator (Spore Test)')
    biological_test_date = fields.Datetime()

    # Items processed
    tray_ids = fields.Many2many('cymed.surgical.tray', string='Trays / Packs Processed')

    state = fields.Selection([
        ('running', 'Running'),
        ('passed', 'Passed'),
        ('failed', 'Failed — Reprocess'),
        ('released', 'Released for Use'),
    ], default='running', tracking=True)

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('cycle_number', 'New') == 'New':
                vals['cycle_number'] = self.env['ir.sequence'].next_by_code('cymed.sterilization.cycle') or 'STERILE-NEW'
        return super().create(vals_list)


class SurgicalTray(models.Model):
    _name = 'cymed.surgical.tray'
    _description = 'Surgical Tray'
    _rec_name = 'name'

    name = fields.Char(required=True)
    barcode = fields.Char()
    contents_kit_id = fields.Many2one('cymed.surgical.kit', string='Standard Contents')
    last_cycle_id = fields.Many2one('cymed.sterilization.cycle', string='Last Sterilization')
    sterilization_expiry = fields.Date(string='Sterilization Expires',
                                        help='If unused, must be re-sterilized after this date')
    state = fields.Selection([
        ('available', 'Available'),
        ('in_use', 'In Use'),
        ('contaminated', 'Used / Contaminated'),
        ('washing', 'Washing'),
        ('inspection', 'Inspection'),
        ('sterilizing', 'Sterilizing'),
        ('maintenance', 'Maintenance'),
    ], default='available')


class Autoclave(models.Model):
    _name = 'cymed.autoclave'
    _description = 'Autoclave / Sterilizer Equipment'

    name = fields.Char(required=True)
    serial = fields.Char()
    asset_id = fields.Many2one('account.asset', string='Linked Asset Record')
    location_id = fields.Many2one('stock.location')
    method = fields.Selection([
        ('steam', 'Steam'), ('eto', 'EtO'), ('hp', 'Hydrogen Peroxide'),
        ('dry', 'Dry Heat'), ('chemical', 'Chemical'),
    ])
    capacity_liters = fields.Float()
    last_validation_date = fields.Date()
    next_validation_due = fields.Date()
    active = fields.Boolean(default=True)
