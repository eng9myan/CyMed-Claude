from odoo import models, fields, api


class ResCompany(models.Model):
    _inherit = 'res.company'

    @api.model_create_multi
    def create(self, vals_list):
        companies = super().create(vals_list)
        for company in companies:
            if not company.report_header:
                company.report_header = 'CyMed Healthcare Systems'
            if not company.report_footer:
                company.report_footer = 'Powered by CyMed ERP'
        return companies
