"""
Lab Reagent Master & Consumption
================================
Tracks reagent lots tied to specific analyzers. Consumption is auto-decremented
when tests run on the analyzer (via LIS integration).
"""
from odoo import models, fields, api


class LabReagent(models.Model):
    _name = 'cymed.lab.reagent'
    _description = 'Laboratory Reagent'
    _inherit = ['mail.thread']
    _rec_name = 'name'

    name = fields.Char(required=True, tracking=True)
    catalog_number = fields.Char(required=True)
    manufacturer_id = fields.Many2one('res.partner', required=True)
    product_id = fields.Many2one('product.template', required=True)

    test_category = fields.Selection([
        ('chemistry', 'Clinical Chemistry'),
        ('hematology', 'Hematology'),
        ('coagulation', 'Coagulation'),
        ('immunoassay', 'Immunoassay'),
        ('microbiology', 'Microbiology'),
        ('molecular', 'Molecular Diagnostics'),
        ('blood_bank', 'Blood Bank'),
        ('urinalysis', 'Urinalysis'),
        ('histology', 'Histology / Pathology'),
        ('cytology', 'Cytology'),
        ('toxicology', 'Toxicology'),
    ], required=True, tracking=True)

    analyzer_ids = fields.Many2many('cymed.lab.analyzer', string='Compatible Analyzers')
    tests_supported = fields.Many2many('cymed.lab.test.code', string='Tests Supported')

    # ── Lot economics ──────────────────────────────────────────────────────
    tests_per_lot = fields.Integer(string='Tests per Lot',
                                    help='Number of tests one lot can run before exhaustion')
    cost_per_test = fields.Float(compute='_compute_cost_per_test', store=True)
    lot_cost = fields.Float(string='Lot Cost')

    # ── Storage ────────────────────────────────────────────────────────────
    storage_temp_min = fields.Float()
    storage_temp_max = fields.Float()
    requires_cold_chain = fields.Boolean()
    shelf_life_after_open_days = fields.Integer(string='Shelf Life Once Opened (days)')

    # ── Regulatory ─────────────────────────────────────────────────────────
    ivdr_class = fields.Selection([
        ('a', 'Class A — low risk'),
        ('b', 'Class B'),
        ('c', 'Class C'),
        ('d', 'Class D — high risk'),
    ], string='IVDR Class', help='In Vitro Diagnostic Regulation class')

    @api.depends('lot_cost', 'tests_per_lot')
    def _compute_cost_per_test(self):
        for r in self:
            r.cost_per_test = (r.lot_cost / r.tests_per_lot) if r.tests_per_lot else 0


class ReagentLotInUse(models.Model):
    """Reagent lot loaded into an analyzer with running count of tests performed."""
    _name = 'cymed.lab.reagent.lot.inuse'
    _description = 'Reagent Lot Loaded in Analyzer'
    _order = 'loaded_date desc'

    reagent_id = fields.Many2one('cymed.lab.reagent', required=True)
    analyzer_id = fields.Many2one('cymed.lab.analyzer', required=True)
    lot_id = fields.Many2one('stock.lot', required=True)
    loaded_date = fields.Datetime(default=fields.Datetime.now, required=True)
    loaded_by = fields.Many2one('res.users', default=lambda s: s.env.user)

    tests_remaining = fields.Integer()
    tests_consumed = fields.Integer()
    open_expiry_date = fields.Date(compute='_compute_open_expiry', store=True)
    state = fields.Selection([
        ('in_use', 'In Use'),
        ('exhausted', 'Exhausted'),
        ('expired', 'Expired — Discarded'),
        ('replaced', 'Replaced'),
    ], default='in_use')

    @api.depends('loaded_date', 'reagent_id.shelf_life_after_open_days')
    def _compute_open_expiry(self):
        from datetime import timedelta
        for r in self:
            if r.loaded_date and r.reagent_id.shelf_life_after_open_days:
                r.open_expiry_date = r.loaded_date.date() + timedelta(days=r.reagent_id.shelf_life_after_open_days)


class LabTestCode(models.Model):
    """Master list of test codes (LOINC where applicable)."""
    _name = 'cymed.lab.test.code'
    _description = 'Lab Test Code'

    name = fields.Char(required=True)
    code = fields.Char(required=True)
    loinc = fields.Char(string='LOINC Code')
    category = fields.Char()
