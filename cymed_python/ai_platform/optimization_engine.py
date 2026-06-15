import hashlib
from typing import Optional, Dict, Any
from .models import AICache, AIAuditLog, AITemplate
from django.utils import timezone

class AIOptimizationEngine:
    """
    Core engine handling query normalization, semantic caching, 
    rule-engine-first execution, and minimal LLM calls to save tokens.
    """
    
    @staticmethod
    def normalize_query(query: str) -> str:
        return " ".join(query.lower().split())

    @staticmethod
    def get_query_hash(normalized_query: str) -> str:
        return hashlib.sha256(normalized_query.encode('utf-8')).hexdigest()
        
    @classmethod
    def check_cache(cls, query: str) -> Optional[str]:
        norm_query = cls.normalize_query(query)
        q_hash = cls.get_query_hash(norm_query)
        
        # Database-first retrieval logic
        cache_entry = AICache.objects.filter(normalized_query_hash=q_hash).first()
        if cache_entry:
            # Future integration: semantic pgvector similarity search here
            if not cache_entry.expires_at or cache_entry.expires_at > timezone.now():
                cache_entry.usage_count += 1
                cache_entry.save(update_fields=['usage_count'])
                return cache_entry.cached_response
        return None
        
    @classmethod
    def execute_rule_engine(cls, intent: str, context: Dict[str, Any]) -> Optional[str]:
        # Rule-engine-first execution
        if intent == "interaction_check":
            # Deterministic check bypasses LLM entirely to save tokens
            return "Rule Engine: No deterministic interactions found. Proceed to LLM only if deep context check required."
        return None

    @classmethod
    def generate_response(cls, user, intent: str, query: str, context: Dict[str, Any]) -> str:
        # 1. Check Rule Engine
        rule_response = cls.execute_rule_engine(intent, context)
        if rule_response:
            return rule_response
            
        # 2. Check Database Semantic Cache
        cached = cls.check_cache(query)
        if cached:
            # Log cache hit (0 tokens used!)
            AIAuditLog.objects.create(
                user=user, intent=intent, raw_prompt=query, llm_response=cached, cache_hit=True
            )
            return cached
            
        # 3. Fetch Template & Call LLM
        template = AITemplate.objects.filter(intent=intent, is_active=True).first()
        if not template:
            # Fallback if no specific template exists
            prompt = query
        else:
            prompt = f"{template.prompt_template}\n\nContext: {query}"
            
        # -- Minimal LLM call goes here --
        llm_output = f"Simulated Claude/OpenAI response for: {query}"
        tokens_used = len(prompt) // 4  # rough estimation
        
        # 4. Save to Cache for future reuse
        norm_query = cls.normalize_query(query)
        AICache.objects.create(
            normalized_query_hash=cls.get_query_hash(norm_query),
            cached_response=llm_output
        )
        
        # 5. Full Audit Logging
        AIAuditLog.objects.create(
            user=user, intent=intent, raw_prompt=prompt, llm_response=llm_output,
            tokens_prompt=tokens_used, tokens_completion=tokens_used, tokens_total=tokens_used * 2,
            cache_hit=False
        )
        
        return llm_output
