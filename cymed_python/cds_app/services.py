import json
from typing import List
from .models import ClinicalRule
from asteval import Interpreter

class CDSEngine:
    """
    Clinical Decision Support (CDS) Rule Execution Engine
    Evaluates patient contexts against active clinical rules.
    """
    
    @classmethod
    def evaluate_context(cls, patient_id: str, context_data: dict, domain: str = None) -> List[dict]:
        """
        Executes active CDS rules against the provided context (e.g., new vitals, new labs).
        If domain is provided, evaluates only rules for that domain.
        """
        query = {'is_active': True}
        if domain:
            query['domain'] = domain
            
        active_rules = ClinicalRule.objects.filter(**query)
        triggered_alerts = []
        
        # Initialize safe evaluator
        aeval = Interpreter()
        for key, val in context_data.items():
            aeval.symtable[key] = val
            
        for rule in active_rules:
            try:
                condition = rule.condition_expression
                
                # Evaluate safely
                result = aeval(condition)
                
                if result is True:
                    triggered_alerts.append({
                        "rule_id": str(rule.id),
                        "domain": rule.domain,
                        "alert_level": rule.alert_level,
                        "message": rule.action_message,
                        "payload": rule.action_payload,
                        "action_type": rule.action_type
                    })
            except Exception as e:
                # Log rule failure silently to prevent CDS from crashing the clinical workflow
                print(f"CDS Rule Error ({rule.name}): {e}")
                continue
                
        return triggered_alerts

