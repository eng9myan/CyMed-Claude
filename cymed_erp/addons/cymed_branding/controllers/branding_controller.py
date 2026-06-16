from odoo import http
from odoo.http import request


class CyMedBranding(http.Controller):

    @http.route('/cymed/health', type='http', auth='public', methods=['GET'], csrf=False)
    def health_check(self):
        return 'CyMed ERP OK'

    @http.route('/cymed/version', type='json', auth='public', methods=['POST'], csrf=False)
    def version(self):
        return {
            'product': 'CyMed ERP',
            'version': '1.0.0',
            'vendor': 'CyMed Healthcare Systems',
        }
