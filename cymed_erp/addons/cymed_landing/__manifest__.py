{
    'name': 'CyMed Landing',
    'version': '1.0.0',
    'category': 'Website',
    'summary': 'CyMed enterprise healthcare landing page with Cybercom design',
    'description': """
CyMed Landing Page
==================
Powerful, modern landing page showcasing CyMed's healthcare ERP capabilities
before login. Built with the Cybercom design system, fully responsive,
accessible (WCAG 2.1 AA), and zero vendor branding.
""",
    'author': 'CyMed Healthcare Systems',
    'website': 'https://cy-com.com',
    'license': 'LGPL-3',
    'depends': ['base', 'web', 'website', 'cymed_branding'],
    'data': [
        'views/landing_template.xml',
        'views/website_menu.xml',
        'data/website_data.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'cymed_landing/static/src/css/cybercom.css',
            'cymed_landing/static/src/css/landing.css',
            'cymed_landing/static/src/js/landing.js',
        ],
    },
    'auto_install': False,
    'application': False,
    'installable': True,
}
