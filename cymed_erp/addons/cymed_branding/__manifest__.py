{
    'name': 'CyMed Branding',
    'version': '1.0.0',
    'category': 'Hidden',
    'summary': 'CyMed ERP branding, theme, and UI overrides',
    'description': """
CyMed ERP Branding Layer
========================
Applies CyMed dark-neural theme, replaces all default branding with CyMed identity,
and integrates the ERP engine seamlessly with the CyMed Next.js frontend.
""",
    'author': 'CyMed Healthcare Systems',
    'website': 'https://cy-com.com',
    'license': 'LGPL-3',
    'depends': ['base', 'web', 'mail'],
    'data': [
        'data/branding_data.xml',
        'data/menu_data.xml',
        'views/login_templates.xml',
        'views/webclient_templates.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'cymed_branding/static/src/css/cymed_theme.css',
            'cymed_branding/static/src/css/cymed_overrides.css',
        ],
        'web.assets_frontend': [
            'cymed_branding/static/src/css/cymed_theme.css',
        ],
        'web.login': [
            'cymed_branding/static/src/css/cymed_login.css',
        ],
    },
    'auto_install': True,
    'application': False,
    'sequence': -100,
}
