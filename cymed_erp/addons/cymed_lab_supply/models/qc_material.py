"""QC Material — control samples and calibrators."""
from odoo import models, fields, api


class QCMaterial(models.Model):
    _name = 'cymed.lab.qc.material'
    _description = 'QC / Calibrator Material'
    _rec_name = 'name'

    name = fields.Char(required=True)
    qc_type = fields.Selection([
        ('control_normal', 'Control — Normal'),
        ('control_abnormal_low', 'Control — Abnormal Low'),
        ('control_abnormal_high', 'Control — Abnormal High'),
        ('calibrator', 'Calibrator'),
        ('linearity', 'Linearity Material'),
        ('proficiency', 'Proficiency / EQA Sample'),
    ], required=True)
    catalog_number = fields.Char()
    manufacturer_id = fields.Many2one('res.partner')
    product_id = fields.Many2one('product.template')
    analyte_id = fields.Many2one('cymed.lab.test.code', string='Analyte')
    target_value = fields.Float()
    sd = fields.Float(string='Target SD')
    target_unit = fields.Char()


class QCRun(models.Model):
    """One QC run on an analyzer — Levey-Jennings input."""
    _name = 'cymed.lab.qc.run'
    _description = 'QC Run'
    _order = 'run_datetime desc'

    qc_material_id = fields.Many2one('cymed.lab.qc.material', required=True)
    analyzer_id = fields.Many2one('cymed.lab.analyzer', required=True)
    run_datetime = fields.Datetime(default=fields.Datetime.now, required=True)
    operator_id = fields.Many2one('res.users', required=True)

    measured_value = fields.Float(required=True)
    target_value = fields.Float(related='qc_material_id.target_value', store=True)
    deviation_sd = fields.Float(compute='_compute_deviation', store=True)
    westgard_violation = fields.Selection([
        ('none', 'No Violation'),
        ('1_2s', '1-2s Warning'),
        ('1_3s', '1-3s Reject'),
        ('2_2s', '2-2s Reject'),
        ('r_4s', 'R-4s Reject'),
        ('4_1s', '4-1s Reject'),
        ('10_x', '10x Reject'),
    ], default='none')

    @api.depends('measured_value', 'qc_material_id.target_value', 'qc_material_id.sd')
    def _compute_deviation(self):
        for r in self:
            if r.qc_material_id.sd:
                r.deviation_sd = (r.measured_value - r.qc_material_id.target_value) / r.qc_material_id.sd
            else:
                r.deviation_sd = 0
