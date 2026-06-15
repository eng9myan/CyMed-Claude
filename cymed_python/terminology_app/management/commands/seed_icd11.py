from django.core.management.base import BaseCommand
from terminology_app.models import TerminologySystem, ClinicalConcept

class Command(BaseCommand):
    help = 'Seed the database with ICD-11 core terminology'

    def handle(self, *args, **kwargs):
        system, _ = TerminologySystem.objects.get_or_create(
            name='ICD-11',
            defaults={'version': '2023-01', 'description': 'International Classification of Diseases 11th Revision'}
        )

        icd_data = [
            {"code": "1A00", "display_name": "Cholera"},
            {"code": "1A01", "display_name": "Intestinal infection due to other Vibrio"},
            {"code": "1A02", "display_name": "Intestinal infections due to Shigella"},
            {"code": "1A03", "display_name": "Intestinal infections due to Escherichia coli"},
            {"code": "1A07", "display_name": "Typhoid fever"},
            {"code": "9A00", "display_name": "Essential hypertension"},
            {"code": "5A11", "display_name": "Type 2 diabetes mellitus"},
            {"code": "11A1", "display_name": "Asthma"},
            {"code": "CB41", "display_name": "Acute respiratory distress syndrome"},
        ]

        for item in icd_data:
            ClinicalConcept.objects.update_or_create(
                system=system,
                code=item["code"],
                defaults={"display_name": item["display_name"]}
            )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(icd_data)} ICD-11 concepts.'))
