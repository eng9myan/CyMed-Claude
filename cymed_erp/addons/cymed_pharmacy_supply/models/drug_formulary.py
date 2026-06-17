"""
CyMed Drug Formulary
====================
Master data for all drugs handled by the facility. Hospital P&T committee
approves what enters the formulary; everything else needs an exception
request.
"""
from odoo import models, fields, api


class FormularyStatus(models.Model):
    _name = 'cymed.formulary.status'
    _description = 'Drug Formulary Status'
    _order = 'sequence'

    name = fields.Char(required=True)
    code = fields.Char(required=True)
    sequence = fields.Integer(default=10)
    allow_dispensing = fields.Boolean(default=True)
    requires_approval = fields.Boolean(default=False)


class DrugFormulary(models.Model):
    _name = 'cymed.drug.formulary'
    _description = 'Drug Formulary Entry'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'atc_code, name'
    _rec_name = 'name'

    # ── Identity ─────────────────────────────────────────────────────────────
    name = fields.Char(string='Drug Name', required=True, tracking=True)
    generic_name = fields.Char(required=True, tracking=True)
    brand_name = fields.Char(tracking=True)
    manufacturer_id = fields.Many2one('res.partner', string='Manufacturer', tracking=True)

    # ── Classification ───────────────────────────────────────────────────────
    atc_code = fields.Char(string='ATC Code', help='WHO Anatomical Therapeutic Chemical classification')
    therapeutic_class = fields.Selection([
        ('antiinfectives', 'Anti-infectives'),
        ('cardiovascular', 'Cardiovascular'),
        ('cns', 'Central Nervous System'),
        ('endocrine', 'Endocrine'),
        ('gi', 'Gastrointestinal'),
        ('hematology', 'Hematology'),
        ('immunology', 'Immunology'),
        ('musculoskeletal', 'Musculoskeletal'),
        ('oncology', 'Oncology'),
        ('respiratory', 'Respiratory'),
        ('vaccines', 'Vaccines'),
        ('other', 'Other'),
    ], tracking=True)

    # ── Pharmaceutical form ──────────────────────────────────────────────────
    dose_form = fields.Selection([
        ('tablet', 'Tablet'), ('capsule', 'Capsule'),
        ('liquid', 'Liquid'), ('suspension', 'Suspension'),
        ('injection_iv', 'Injection IV'), ('injection_im', 'Injection IM'),
        ('injection_sc', 'Injection SC'), ('inhaler', 'Inhaler'),
        ('cream', 'Cream'), ('ointment', 'Ointment'), ('drops', 'Drops'),
        ('patch', 'Transdermal Patch'), ('suppository', 'Suppository'),
        ('powder', 'Powder'),
    ], required=True, tracking=True)
    strength = fields.Char(string='Strength', help='e.g. 500mg, 5mg/ml')
    route_of_admin = fields.Selection([
        ('oral', 'Oral'), ('iv', 'IV'), ('im', 'IM'), ('sc', 'Subcutaneous'),
        ('inhalation', 'Inhalation'), ('topical', 'Topical'), ('rectal', 'Rectal'),
        ('intranasal', 'Intranasal'), ('intrathecal', 'Intrathecal'),
        ('ophthalmic', 'Ophthalmic'), ('otic', 'Otic'),
    ])

    # ── Regulatory ───────────────────────────────────────────────────────────
    sfda_code = fields.Char(string='SFDA Code', help='Saudi FDA registration')
    fda_ndc = fields.Char(string='FDA NDC')
    ema_code = fields.Char(string='EMA Code')
    is_controlled = fields.Boolean(string='Controlled Substance', tracking=True)
    controlled_schedule = fields.Selection([
        ('I', 'Schedule I'), ('II', 'Schedule II'), ('III', 'Schedule III'),
        ('IV', 'Schedule IV'), ('V', 'Schedule V'),
    ], string='Controlled Schedule', tracking=True)
    requires_witness = fields.Boolean(string='Dispensing Requires Witness')
    requires_prescription = fields.Boolean(default=True)
    high_alert = fields.Boolean(string='High-Alert Medication',
                                help='Per ISMP — heparin, insulin, opioids, etc.')
    look_alike_sound_alike = fields.Boolean(string='LASA Drug',
                                            help='Look-alike / sound-alike requires special handling')

    # ── Formulary status ─────────────────────────────────────────────────────
    formulary_status_id = fields.Many2one('cymed.formulary.status', required=True, tracking=True)
    formulary_review_date = fields.Date()
    formulary_notes = fields.Text()

    # ── Storage requirements ────────────────────────────────────────────────
    storage_temp_min = fields.Float(string='Min Storage Temp (°C)')
    storage_temp_max = fields.Float(string='Max Storage Temp (°C)')
    requires_cold_chain = fields.Boolean(compute='_compute_cold_chain', store=True)
    light_sensitive = fields.Boolean()
    moisture_sensitive = fields.Boolean()

    # ── Pricing & procurement ────────────────────────────────────────────────
    product_id = fields.Many2one('product.template', string='Product', required=True,
                                  help='Links to the inventory product master')
    preferred_vendor_id = fields.Many2one('res.partner', string='Preferred Vendor',
                                           domain=[('supplier_rank', '>', 0)])
    contract_price = fields.Float(string='Contracted Price')

    @api.depends('storage_temp_max')
    def _compute_cold_chain(self):
        for rec in self:
            rec.requires_cold_chain = rec.storage_temp_max < 15 if rec.storage_temp_max else False

    # ── Active ingredients / formulation ────────────────────────────────────
    active_ingredient_ids = fields.One2many(
        'cymed.drug.active.ingredient', 'drug_id', string='Active Ingredients')
    interaction_ids = fields.Many2many(
        'cymed.drug.formulary', 'cymed_drug_interaction_rel', 'drug_a', 'drug_b',
        string='Known Interactions')
    contraindication_ids = fields.Text(string='Contraindications')
    allergen_class = fields.Char(string='Allergen Class',
                                  help='e.g. Penicillins, Sulfa, NSAIDs')


class DrugActiveIngredient(models.Model):
    _name = 'cymed.drug.active.ingredient'
    _description = 'Drug Active Ingredient'

    drug_id = fields.Many2one('cymed.drug.formulary', required=True, ondelete='cascade')
    ingredient = fields.Char(required=True)
    quantity = fields.Float(required=True)
    uom_id = fields.Many2one('uom.uom', required=True)
