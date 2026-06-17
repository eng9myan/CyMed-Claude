{
    'name': 'CyMed Laboratory Supply Chain',
    'version': '1.0.0',
    'category': 'Healthcare/Supply Chain',
    'summary': 'Reagent management, QC materials, calibration materials, analyzer-linked replenishment',
    'author': 'CyMed Healthcare Systems',
    'website': 'https://cy-com.com',
    'license': 'LGPL-3',
    'depends': ['base', 'mail', 'stock', 'maintenance', 'cymed_branding'],
    'data': [
        'security/ir.model.access.csv',
        'views/reagent_views.xml',
        'views/qc_material_views.xml',
        'views/menu.xml',
    ],
    'application': True,
    'installable': True,
}
