from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = 'ir.http'

    def session_info(self):
        """Override session info to inject CyMed branding."""
        info = super().session_info()
        info['server_version'] = 'CyMed ERP 1.0'
        info['server_version_info'] = [1, 0, 0, 'final', 0, '']
        info['support_url'] = 'https://cy-com.com/support'
        return info
