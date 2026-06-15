"""
CyMed AI Gateway
Routes requests: Claude (primary) → Gemini → GPT-4 (fallback)
Handles: streaming, cost tracking, audit logging, prompt caching.
"""
from __future__ import annotations

import logging
import os
import time
from typing import Generator, Iterator, Optional

log = logging.getLogger("ai_gateway")

# Provider priority order
PROVIDER_ORDER = ["claude", "gemini", "openai"]

# Model map per provider
MODELS = {
    "claude": os.environ.get("CLAUDE_MODEL",  "claude-sonnet-4-6"),
    "gemini": os.environ.get("GEMINI_MODEL",  "gemini-2.0-flash"),
    "openai": os.environ.get("OPENAI_MODEL",  "gpt-4o"),
}

COST_PER_1K = {
    "claude": {"input": 0.003, "output": 0.015},
    "gemini": {"input": 0.001, "output": 0.002},
    "openai": {"input": 0.005, "output": 0.015},
}


class AIGatewayResponse:
    def __init__(self, text: str, provider: str, model: str,
                 input_tokens: int, output_tokens: int, latency_ms: int):
        self.text          = text
        self.provider      = provider
        self.model         = model
        self.input_tokens  = input_tokens
        self.output_tokens = output_tokens
        self.latency_ms    = latency_ms
        self.cost_usd      = self._calc_cost()

    def _calc_cost(self) -> float:
        c = COST_PER_1K.get(self.provider, {})
        return (self.input_tokens  / 1000 * c.get("input",  0.003) +
                self.output_tokens / 1000 * c.get("output", 0.015))

    def to_dict(self) -> dict:
        return {
            "text":          self.text,
            "provider":      self.provider,
            "model":         self.model,
            "input_tokens":  self.input_tokens,
            "output_tokens": self.output_tokens,
            "latency_ms":    self.latency_ms,
            "cost_usd":      round(self.cost_usd, 6),
        }


def complete(
    *,
    messages: list[dict],
    system: str = "",
    max_tokens: int = 2048,
    temperature: float = 0.3,
    use_case: str = "general",
    user_id: str = "",
    patient_id: str = "",
) -> AIGatewayResponse:
    """
    Non-streaming completion with automatic provider fallover.
    """
    last_exc = None
    for provider in PROVIDER_ORDER:
        try:
            t0 = time.monotonic()
            result = _call_provider(
                provider=provider,
                messages=messages,
                system=system,
                max_tokens=max_tokens,
                temperature=temperature,
            )
            latency = int((time.monotonic() - t0) * 1000)
            resp = AIGatewayResponse(
                text=result["text"],
                provider=provider,
                model=MODELS[provider],
                input_tokens=result.get("input_tokens", 0),
                output_tokens=result.get("output_tokens", 0),
                latency_ms=latency,
            )
            _log_usage(resp, use_case=use_case, user_id=user_id, patient_id=patient_id)
            return resp
        except Exception as exc:
            log.warning("AI provider %s failed: %s — trying next", provider, exc)
            last_exc = exc

    raise RuntimeError(f"All AI providers failed. Last error: {last_exc}")


def stream(
    *,
    messages: list[dict],
    system: str = "",
    max_tokens: int = 2048,
    temperature: float = 0.3,
    use_case: str = "general",
    user_id: str = "",
) -> Iterator[str]:
    """
    Streaming generator — yields text chunks. Falls over across providers.
    """
    for provider in PROVIDER_ORDER:
        try:
            yield from _stream_provider(
                provider=provider,
                messages=messages,
                system=system,
                max_tokens=max_tokens,
                temperature=temperature,
            )
            return
        except Exception as exc:
            log.warning("AI stream provider %s failed: %s — trying next", provider, exc)

    raise RuntimeError("All AI providers failed for streaming.")


# ── Provider implementations ─────────────────────────────────────────────────

def _call_provider(*, provider: str, messages, system, max_tokens, temperature) -> dict:
    if provider == "claude":
        return _call_claude(messages=messages, system=system, max_tokens=max_tokens, temperature=temperature)
    if provider == "gemini":
        return _call_gemini(messages=messages, system=system, max_tokens=max_tokens, temperature=temperature)
    if provider == "openai":
        return _call_openai(messages=messages, system=system, max_tokens=max_tokens, temperature=temperature)
    raise ValueError(f"Unknown provider: {provider}")


def _call_claude(*, messages, system, max_tokens, temperature) -> dict:
    import anthropic
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    kwargs = dict(
        model      = MODELS["claude"],
        max_tokens = max_tokens,
        messages   = messages,
        temperature= temperature,
    )
    if system:
        kwargs["system"] = system
    msg = client.messages.create(**kwargs)
    return {
        "text":         msg.content[0].text,
        "input_tokens": msg.usage.input_tokens,
        "output_tokens":msg.usage.output_tokens,
    }


def _call_gemini(*, messages, system, max_tokens, temperature) -> dict:
    import google.generativeai as genai
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model     = genai.GenerativeModel(MODELS["gemini"], system_instruction=system or None)
    history   = []
    user_msg  = ""
    for m in messages:
        if m["role"] == "user":
            user_msg = m["content"]
        elif m["role"] == "assistant":
            history.append({"role": "model", "parts": [m["content"]]})

    response = model.generate_content(
        user_msg,
        generation_config=genai.GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=temperature,
        ),
    )
    return {
        "text":         response.text,
        "input_tokens": 0,
        "output_tokens":0,
    }


def _call_openai(*, messages, system, max_tokens, temperature) -> dict:
    from openai import OpenAI
    client   = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    msgs     = []
    if system:
        msgs.append({"role": "system", "content": system})
    msgs.extend(messages)
    resp = client.chat.completions.create(
        model       = MODELS["openai"],
        messages    = msgs,
        max_tokens  = max_tokens,
        temperature = temperature,
    )
    usage = resp.usage
    return {
        "text":         resp.choices[0].message.content,
        "input_tokens": usage.prompt_tokens,
        "output_tokens":usage.completion_tokens,
    }


def _stream_provider(*, provider: str, messages, system, max_tokens, temperature) -> Iterator[str]:
    if provider == "claude":
        import anthropic
        client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
        kwargs = dict(model=MODELS["claude"], max_tokens=max_tokens, messages=messages, temperature=temperature)
        if system:
            kwargs["system"] = system
        with client.messages.stream(**kwargs) as s:
            for text in s.text_stream:
                yield text

    elif provider == "gemini":
        import google.generativeai as genai
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        m     = genai.GenerativeModel(MODELS["gemini"], system_instruction=system or None)
        prompt= messages[-1]["content"] if messages else ""
        for chunk in m.generate_content(prompt, stream=True):
            if chunk.text:
                yield chunk.text

    elif provider == "openai":
        from openai import OpenAI
        client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
        msgs   = ([{"role": "system", "content": system}] if system else []) + messages
        for chunk in client.chat.completions.create(
            model=MODELS["openai"], messages=msgs, max_tokens=max_tokens,
            temperature=temperature, stream=True
        ):
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content


def _log_usage(resp: AIGatewayResponse, *, use_case: str, user_id: str, patient_id: str):
    try:
        from .models import AIUsageLog
        AIUsageLog.objects.create(
            provider     = resp.provider,
            model        = resp.model,
            use_case     = use_case,
            user_id      = user_id or None,
            patient_id   = patient_id or None,
            input_tokens = resp.input_tokens,
            output_tokens= resp.output_tokens,
            cost_usd     = resp.cost_usd,
            latency_ms   = resp.latency_ms,
        )
    except Exception as exc:
        log.warning("Failed to log AI usage: %s", exc)
