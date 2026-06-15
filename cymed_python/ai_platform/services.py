import json
import hashlib
from .models import AiProvider, AiTokenUsage, AiCache, AiIntent, AiTemplate
from datetime import datetime

class MultiProviderAIGateway:
    """
    CyMed Enterprise Multi-Provider AI Gateway.
    Abstracts OpenAI, Gemini, and Local Models to prevent vendor lock-in.
    """
    
    def __init__(self, user_id=None):
        self.user_id = user_id
        # Define fallback chain
        self.provider_chain = ["openai", "gemini", "local"]
        
    def _get_provider_config(self, provider_name):
        return AiProvider.objects.filter(name=provider_name, is_active=True).first()

    def _normalize_query(self, context_data: dict) -> str:
        """Query normalization for consistent caching."""
        # Normalize by sorting keys and converting to lowercase string representation
        normalized = json.dumps(context_data, sort_keys=True).lower()
        return normalized

    def _hash_query(self, normalized_query: str) -> str:
        return hashlib.sha256(normalized_query.encode('utf-8')).hexdigest()

    def _semantic_matching(self, normalized_query: str):
        """Mock semantic matching against vector DB or fast lookup."""
        # Here we would use cosine similarity on embeddings for semantic matches
        return None

    def _rule_engine_first_execution(self, context_data: dict, intent: str):
        """Rule-engine-first execution. Returns deterministic results without LLM."""
        if intent == "RISK_PREDICTION" and context_data.get("age", 0) > 90 and context_data.get("comorbidities", 0) > 3:
            return {"insight": "High risk due to age and comorbidities.", "confidence": 1.0, "source": "rule_engine"}
        return None

    def _get_template(self, intent: str) -> str:
        """Template reuse."""
        template = AiTemplate.objects.filter(intent__name=intent, is_active=True).first() if hasattr(AiTemplate, 'is_active') else AiTemplate.objects.filter(intent__name=intent).first()
        if template:
            return template.prompt_template
        return f"Default prompt for {intent}: {{context}}"

    def generate_clinical_insight(self, context_data: dict, intent: str):
        """
        Generates clinical insights based on context data.
        Enforces 'advisory only' rule by appending disclaimer.
        """
        # 1. Rule-engine-first execution
        rule_result = self._rule_engine_first_execution(context_data, intent)
        if rule_result:
            rule_result['disclaimer'] = "WARNING: AI-generated insight. Requires clinician review. Not for direct diagnostic use."
            return rule_result

        # 2. Query normalization & Database-first retrieval (Caching)
        normalized_query = self._normalize_query(context_data)
        query_hash = f"{intent}_{self._hash_query(normalized_query)}"
        
        cached = AiCache.objects.filter(query_hash=query_hash).first()
        if cached:
            response = json.loads(cached.response_payload)
            response['source'] = 'cache'
            return response
            
        # 3. Semantic matching (fast lookup fallback before LLM)
        semantic_match = self._semantic_matching(normalized_query)
        if semantic_match:
            return semantic_match

        # 4. Template reuse
        prompt_template = self._get_template(intent)
        formatted_prompt = prompt_template.format(context=normalized_query)

        for provider_name in self.provider_chain:
            provider = self._get_provider_config(provider_name)
            if not provider:
                continue
                
            try:
                # 5. Execute call (Simulated)
                response = self._execute_provider_call(provider, formatted_prompt, intent)
                response['source'] = provider_name
                
                # Append mandatory clinical disclaimer
                response['disclaimer'] = "WARNING: AI-generated insight. Requires clinician review. Not for direct diagnostic use."
                
                # 6. Minimal token usage logging
                input_tokens = len(formatted_prompt) // 4 + 10 # heuristic token calc
                output_tokens = len(json.dumps(response)) // 4
                self._log_usage(provider, intent, input_tokens, output_tokens)
                
                # Cache result
                AiCache.objects.create(
                    query_hash=query_hash,
                    response_payload=json.dumps(response),
                    intent=intent
                )
                
                return response
            except Exception as e:
                print(f"Provider {provider_name} failed: {str(e)}. Failing over to next provider.")
                continue
                
        raise Exception("All AI providers in the fallback chain failed.")

    def _execute_provider_call(self, provider, prompt, intent):
        import os
        if provider.name == "openai":
            import openai
            openai.api_key = os.environ.get(provider.api_key_secret_name, "dummy-openai-key")
            try:
                response = openai.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": "You are CyMed AI, an expert clinical assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.0
                )
                content = response.choices[0].message.content
                return {"insight": content, "confidence": 0.95}
            except Exception as e:
                raise Exception(f"OpenAI API Error: {str(e)}")
                
        elif provider.name == "gemini":
            import google.generativeai as genai
            genai.configure(api_key=os.environ.get(provider.api_key_secret_name, "dummy-gemini-key"))
            try:
                model = genai.GenerativeModel('gemini-pro')
                response = model.generate_content(prompt)
                return {"insight": response.text, "confidence": 0.95}
            except Exception as e:
                raise Exception(f"Gemini API Error: {str(e)}")
                
        return {"insight": f"Simulated insight for {intent}", "confidence": 0.85}

    def _log_usage(self, provider, intent, input_tokens, output_tokens):
        AiTokenUsage.objects.create(
            provider=provider,
            user_id=self.user_id,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            task_intent=intent,
            estimated_cost=(input_tokens + output_tokens) * 0.00001
        )
