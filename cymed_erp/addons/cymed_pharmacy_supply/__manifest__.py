{
    'name': 'CyMed Pharmacy Supply Chain',
    'version': '1.0.0',
    'category': 'Healthcare/Supply Chain',
    'summary': 'Drug formulary, controlled substances register, recall engine, ward replenishment',
    'description': """
CyMed Pharmacy Supply Chain
===========================
* Drug formulary management (ATC classification, generic/brand, dose forms)
* Controlled substances register (Schedule I-V tracking with audit trail)
* Drug recall engine (manufacturer + lot-level recall propagation)
* Ward replenishment workflows (par-level stocking, auto-replenishment)
* Drug expiry monitoring with FEFO enforcement
* Cold chain monitoring integration
* SFDA / FDA / EMA registration tracking
* Drug interaction database hooks
""",
    'author': 'CyMed Healthcare Systems',
    'website': 'https://cy-com.com',
    'license': 'LGPL-3',
    'depends': [
        'base', 'mail', 'web',
        'stock', 'stock_account',
        'product', 'purchase', 'uom',
        'cymed_branding',
    ],
    'data': [
        'security/cymed_pharmacy_security.xml',
        'security/ir.model.access.csv',
        'data/atc_codes_data.xml',
        'data/controlled_schedules_data.xml',
        'views/drug_views.xml',
        'views/controlled_substance_views.xml',
        'views/recall_views.xml',
        'views/ward_replenishment_views.xml',
        'views/menu.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'cymed_pharmacy_supply/static/src/css/pharmacy.css',
        ],
    },
    'application': True,
    'installable': True,
}
