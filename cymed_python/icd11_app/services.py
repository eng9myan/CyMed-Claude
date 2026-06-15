"""
ICD-11 WHO API integration.
Uses the WHO ICD-11 Coding Tool API (linearization: mms — Mortality and Morbidity Statistics).
Docs: https://icd.who.int/icdapi
"""
from __future__ import annotations

import logging
import os
from typing import Optional
import requests
from django.core.cache import cache

log = logging.getLogger("icd11")

WHO_API_BASE   = "https://id.who.int/icd/release/11/2024-01/mms"
WHO_AUTH_URL   = "https://icdaccessmanagement.who.int/connect/token"
CLIENT_ID      = os.environ.get("ICD11_CLIENT_ID", "")
CLIENT_SECRET  = os.environ.get("ICD11_CLIENT_SECRET", "")
CACHE_TTL      = 60 * 60 * 24  # 24 hours for code data


def _get_access_token() -> str:
    token = cache.get("icd11:access_token")
    if token:
        return token
    resp = requests.post(WHO_AUTH_URL, data={
        "grant_type": "client_credentials",
        "client_id":     CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "scope":         "icdapi_access",
    }, timeout=15)
    resp.raise_for_status()
    data  = resp.json()
    token = data["access_token"]
    expires_in = int(data.get("expires_in", 3600)) - 60
    cache.set("icd11:access_token", token, expires_in)
    return token


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {_get_access_token()}",
        "Accept":        "application/json",
        "Accept-Language": "en",
        "API-Version":   "v2",
    }


def search(query: str, *, subtree_filter: str = "", max_results: int = 20) -> list[dict]:
    """
    Full-text search against WHO ICD-11 API.
    Falls back to local DB cache if API unavailable.
    """
    cache_key = f"icd11:search:{query}:{subtree_filter}:{max_results}"
    cached    = cache.get(cache_key)
    if cached:
        return cached

    try:
        params = {
            "q":                  query,
            "flatResults":        "true",
            "includeKeywordResult": "true",
            "useFlexisearch":     "false",
            "highlightingEnabled": "false",
        }
        if subtree_filter:
            params["subtreesFilter"] = subtree_filter
        resp = requests.get(
            f"https://id.who.int/icd/release/11/2024-01/mms/search",
            headers=_headers(),
            params=params,
            timeout=10,
        )
        resp.raise_for_status()
        data     = resp.json()
        results  = [_format_search_result(r) for r in data.get("destinationEntities", [])[:max_results]]
        cache.set(cache_key, results, 60 * 30)  # 30 min for search results
        return results
    except Exception as exc:
        log.warning("WHO API search failed, falling back to local DB: %s", exc)
        return _local_search(query, max_results)


def get_code(code: str) -> Optional[dict]:
    """Fetch full code details. Returns None if not found."""
    cache_key = f"icd11:code:{code}"
    cached    = cache.get(cache_key)
    if cached:
        return cached

    # Try local DB first
    from .models import ICD11Code
    try:
        obj    = ICD11Code.objects.get(code=code)
        result = _model_to_dict(obj)
        cache.set(cache_key, result, CACHE_TTL)
        return result
    except ICD11Code.DoesNotExist:
        pass

    # Fallback to WHO API
    try:
        resp = requests.get(
            f"{WHO_API_BASE}/codeinfo/{code}",
            headers=_headers(),
            timeout=10,
        )
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        result = _format_code_info(resp.json())
        cache.set(cache_key, result, CACHE_TTL)
        return result
    except Exception as exc:
        log.error("WHO API get_code failed for %s: %s", code, exc)
        return None


def validate_code(code: str) -> bool:
    return get_code(code) is not None


def icd10_to_icd11(icd10: str) -> list[str]:
    """Map an ICD-10 code to ICD-11 equivalent(s)."""
    from .models import ICD11Code
    codes = ICD11Code.objects.filter(icd10_codes__contains=[icd10]).values_list("code", flat=True)
    return list(codes)


def _local_search(query: str, max_results: int) -> list[dict]:
    from .models import ICD11Code
    from django.db.models import Q
    qs = ICD11Code.objects.filter(
        Q(title__icontains=query) | Q(search_terms__icontains=query) | Q(code__icontains=query)
    ).filter(is_billable=True)[:max_results]
    return [_model_to_dict(obj) for obj in qs]


def _format_search_result(r: dict) -> dict:
    return {
        "code":       r.get("theCode", ""),
        "title":      r.get("title", ""),
        "who_uri":    r.get("id", ""),
        "chapter":    "",
        "is_billable": True,
        "icd10_codes": [],
    }


def _format_code_info(data: dict) -> dict:
    return {
        "code":        data.get("code", ""),
        "title":       _extract_value(data.get("title")),
        "definition":  _extract_value(data.get("definition")),
        "who_uri":     data.get("@id", ""),
        "is_billable": True,
        "icd10_codes": [],
    }


def _extract_value(field) -> str:
    if isinstance(field, dict):
        return field.get("@value", "")
    return field or ""


def _model_to_dict(obj) -> dict:
    return {
        "code":        obj.code,
        "title":       obj.title,
        "title_ar":    obj.title_ar,
        "definition":  obj.definition,
        "chapter":     obj.chapter,
        "block_title": obj.block_title,
        "icd10_codes": obj.icd10_codes,
        "is_billable": obj.is_billable,
        "who_uri":     obj.who_uri,
    }
