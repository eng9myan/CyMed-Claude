{
    'name': 'CyMed Supply Chain Dashboards',
    'version': '1.0.0',
    'category': 'Healthcare/Supply Chain',
    'summary': 'Executive supply-chain dashboards: inventory value, expiring stock, vendor scorecards, forecast accuracy',
    'author': 'CyMed Healthcare Systems',
    'website': 'https://cy-com.com',
    'license': 'LGPL-3',
    'depends': ['base', 'web', 'stock', 'purchase', 'cymed_branding', 'cymed_pharmacy_supply', 'cymed_quality'],
    'data': ['security/ir.model.access.csv', 'views/dashboards.xml', 'views/menu.xml'],
    'application': True, 'installable': True,
}
