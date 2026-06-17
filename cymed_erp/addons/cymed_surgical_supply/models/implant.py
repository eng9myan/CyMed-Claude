"""
Implant Registry
================
Every implant placed in a patient is tracked here for the life of the
implant — for recalls, MRI compatibility, warranty, and the patient's
permanent record.
"""
from odoo import models, fields, api


class ImplantCategory(models.Model):
    _name = 'cymed.implant.category'
    _description = 'Implant Category'

    name = fields.Char(required=True)
    code = fields.Char(required=True)
    parent_id = fields.Many2one('cymed.implant.category')
    requires_loaner_kit = fields.Boolean(default=False)
    requires_vendor_rep = fields.Boolean(default=False)
    mri_compatibility_classes = fields.Selection([
        ('safe', 'MR Safe'),
        ('conditional', 'MR Conditional'),
        ('unsafe', 'MR Unsafe'),
        ('unknown', 'Unknown'),
    ])


class Implant(models.Model):
    _name = 'cymed.implant'
    _description = 'Implant Master Record'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _rec_name = 'name'

    # ── Identity ───────────────────────────────────────────────────────────
    name = fields.Char(required=True, tracking=True)
    catalog_number = fields.Char(string='Catalog #', required=True, tracking=True)
    udi_di = fields.Char(string='UDI-DI', required=True,
                          help='Device Identifier portion of UDI')
    gs1_gtin = fields.Char(string='GS1 GTIN', help='Pre-fills UDI-DI if scanned')
    product_id = fields.Many2one('product.template', required=True)

    # ── Classification ─────────────────────────────────────────────────────
    category_id = fields.Many2one('cymed.implant.category', required=True, tracking=True)
    manufacturer_id = fields.Many2one('res.partner', string='Manufacturer', required=True)
    fda_approval = fields.Char(string='FDA 510(k) Number')
    sfda_registration = fields.Char(string='SFDA Registration')
    ce_mark = fields.Char(string='CE Mark Number')

    # ── Medical specifications ────────────────────────────────────────────
    sterile = fields.Boolean(default=True)
    single_use = fields.Boolean(default=True)
    shelf_life_months = fields.Integer()
    storage_temp_min = fields.Float()
    storage_temp_max = fields.Float()
    mri_class = fields.Selection(related='category_id.mri_compatibility_classes', store=True)
    radiation_dose = fields.Float(string='Radiation Dose (if radioactive implant)')

    # ── Commercial ─────────────────────────────────────────────────────────
    list_price = fields.Float(string='List Price')
    contract_price = fields.Float(string='Contracted Price')
    consignment = fields.Boolean(string='Consignment Stock',
                                  help='Vendor owns inventory until used in patient')

    # ── Recall flag ────────────────────────────────────────────────────────
    is_recalled = fields.Boolean(default=False, tracking=True)
    recall_id = fields.Many2one('cymed.drug.recall', string='Active Recall')


class ImplantPlacement(models.Model):
    """One row per implant placed in a patient — permanent record."""
    _name = 'cymed.implant.placement'
    _description = 'Implant Placement Record'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'placement_date desc'
    _rec_name = 'reference'

    reference = fields.Char(default='New', readonly=True)
    placement_date = fields.Datetime(required=True, tracking=True)
    implant_id = fields.Many2one('cymed.implant', required=True, tracking=True)
    udi_pi = fields.Char(string='UDI-PI', required=True,
                          help='Production Identifier portion of UDI — lot + serial + expiry')
    lot_id = fields.Many2one('stock.lot', string='Lot/Serial',
                              help='If using stock.lot for traceability')
    expiry_date = fields.Date()

    # ── Patient & encounter ────────────────────────────────────────────────
    patient_id = fields.Many2one('res.partner', required=True, tracking=True)
    encounter_id = fields.Char(string='Encounter ID',
                                help='Links to clinical_app encounter')
    procedure_id = fields.Many2one('cymed.surgical.procedure', string='Procedure')
    surgeon_id = fields.Many2one('res.users', string='Primary Surgeon', required=True)
    or_room_id = fields.Many2one('stock.location', string='OR Room')
    vendor_rep_id = fields.Many2one('res.partner', string='Vendor Representative Present')

    # ── Anatomy ────────────────────────────────────────────────────────────
    anatomic_site = fields.Char()
    laterality = fields.Selection([('left','Left'),('right','Right'),('bilateral','Bilateral'),('na','N/A')])

    # ── Outcome ────────────────────────────────────────────────────────────
    state = fields.Selection([
        ('planned', 'Planned'),
        ('placed', 'Placed'),
        ('explanted', 'Explanted'),
        ('failed', 'Failed'),
        ('revised', 'Revised'),
    ], default='planned', tracking=True)
    explant_date = fields.Datetime()
    explant_reason = fields.Text()

    # ── Cost & billing ─────────────────────────────────────────────────────
    cost = fields.Float()
    billed_amount = fields.Float()
    invoice_line_id = fields.Many2one('account.move.line', string='Billed To')

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('reference', 'New') == 'New':
                vals['reference'] = self.env['ir.sequence'].next_by_code('cymed.implant.placement') or 'IMP-NEW'
        return super().create(vals_list)


class SurgicalProcedure(models.Model):
    _name = 'cymed.surgical.procedure'
    _description = 'Surgical Procedure'
    _rec_name = 'name'

    name = fields.Char(required=True)
    cpt_code = fields.Char(string='CPT Code')
    icd10_pcs = fields.Char(string='ICD-10-PCS')
    typical_kit_id = fields.Many2one('cymed.surgical.kit', string='Typical Kit')
    average_duration_min = fields.Integer(string='Avg Duration (min)')
    avg_implants = fields.Integer(string='Avg Implants Used')
