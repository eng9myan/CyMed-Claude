{
    'name': 'CyMed Surgical Supply Chain',
    'version': '1.0.0',
    'category': 'Healthcare/Supply Chain',
    'summary': 'Implant tracking, surgical kits, UDI, sterilization, procedure consumption',
    'description': """
CyMed Surgical Supply Chain
===========================
* Surgical kits and procedure templates
* Implant registry with UDI (Unique Device Identifier) and patient-level traceability
* Surgical tray and instrument tracking with sterilization cycles
* Procedure consumption tracking → patient cost allocation
* Loaner kit management
* Vendor representative tracking (case coverage)
""",
    'author': 'CyMed Healthcare Systems',
    'website': 'https://cy-com.com',
    'license': 'LGPL-3',
    'depends': [
        'base', 'mail', 'stock', 'mrp', 'sale', 'purchase',
        'cymed_branding', 'cymed_pharmacy_supply',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/implant_views.xml',
        'views/surgical_kit_views.xml',
        'views/sterilization_views.xml',
        'views/menu.xml',
    ],
    'application': True,
    'installable': True,
}
