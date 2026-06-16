from odoo import http
from odoo.http import request


class CyMedLanding(http.Controller):

    @http.route('/', type='http', auth='public', website=True, sitemap=True)
    def landing(self, **kw):
        """Serve the CyMed landing page to unauthenticated visitors."""
        if request.session.uid:
            return request.redirect('/web')
        return request.render('cymed_landing.landing_page', {
            'page_title': 'CyMed — Enterprise Healthcare ERP',
        })

    @http.route('/request-demo', type='http', auth='public', website=True, methods=['GET'])
    def demo_form(self, **kw):
        """Demo request form."""
        return request.render('cymed_landing.demo_request_form', {})

    @http.route('/submit-demo-request', type='http', auth='public', website=True, methods=['POST'], csrf=True)
    def demo_submit(self, **post):
        """Handle demo request submission."""
        request.env['mail.mail'].sudo().create({
            'subject': 'CyMed Demo Request from %s' % post.get('name', 'Visitor'),
            'body_html': '<p>Organization: %s</p><p>Email: %s</p><p>Phone: %s</p><p>Notes: %s</p>' % (
                post.get('organization', ''),
                post.get('email', ''),
                post.get('phone', ''),
                post.get('notes', ''),
            ),
            'email_to': 'sales@cy-com.com',
        }).send()
        return request.render('cymed_landing.demo_request_thanks', {})
