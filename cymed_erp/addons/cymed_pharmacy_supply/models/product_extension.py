"""Extensions to standard product / lot / quant to support healthcare flags."""
from odoo import models, fields


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    is_drug = fields.Boolean(string='Is Drug', default=False)
    is_controlled = fields.Boolean(string='Controlled Substance', default=False)
    is_implant = fields.Boolean(string='Is Implant', default=False)
    requires_lot = fields.Boolean(string='Lot Tracking Required', default=False)
    cold_chain_required = fields.Boolean(string='Cold Chain Required')
    udi_code = fields.Char(string='UDI Code', help='Unique Device Identifier (medical devices)')
    gs1_gtin = fields.Char(string='GS1 GTIN')
    cymed_drug_id = fields.One2many('cymed.drug.formulary', 'product_id',
                                     string='Drug Formulary Entry')


class StockQuant(models.Model):
    _inherit = 'stock.quant'

    cymed_quarantined = fields.Boolean(string='Quarantined', default=False,
                                        help='Set by drug recall — blocks dispensing')
    cymed_quarantine_reason = fields.Char(string='Quarantine Reason')


class StockLot(models.Model):
    _inherit = 'stock.lot'

    cymed_manufacturer_id = fields.Many2one('res.partner', string='Manufacturer')
    cymed_manufacture_date = fields.Date()
    cymed_sterilization_cycle = fields.Char(help='Sterilization batch ID for surgical items')
    cymed_storage_temp_log = fields.Text(string='Cold Chain Temperature Log JSON')
