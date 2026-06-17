{
    'name': 'CyMed Quality Management',
    'version': '1.0.0',
    'category': 'Healthcare/Quality',
    'summary': 'Incoming inspection, batch QC, CAPA, NCR, deviation tracking, JCI compliance',
    'author': 'CyMed Healthcare Systems',
    'website': 'https://cy-com.com',
    'license': 'LGPL-3',
    'depends': ['base', 'mail', 'stock', 'purchase', 'cymed_branding'],
    'data': [
        'security/ir.model.access.csv',
        'views/inspection_views.xml',
        'views/capa_views.xml',
        'views/ncr_views.xml',
        'views/menu.xml',
    ],
    'application': True,
    'installable': True,
}
