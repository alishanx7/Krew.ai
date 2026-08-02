"""Modular LLM client — Fireworks AI with fallback mock mode."""

import json
from abc import ABC, abstractmethod
from typing import AsyncGenerator

import httpx

from app.config import settings


class LLMClient(ABC):
    @abstractmethod
    async def complete(self, system: str, user: str, api_key: str | None = None) -> str:
        pass

    @abstractmethod
    async def stream(self, system: str, user: str, api_key: str | None = None) -> AsyncGenerator[str, None]:
        pass


class FireworksClient(LLMClient):
    def __init__(self, model: str | None = None):
        self.model = model or settings.default_model
        self.base_url = settings.fireworks_base_url

    def _resolve_key(self, api_key: str | None) -> str | None:
        return api_key or settings.fireworks_api_key or None

    async def complete(self, system: str, user: str, api_key: str | None = None) -> str:
        key = self._resolve_key(api_key)
        if not key:
            return self._mock_response(system, user)

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    "max_tokens": 4096,
                    "temperature": 0.7,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def stream(self, system: str, user: str, api_key: str | None = None) -> AsyncGenerator[str, None]:
        key = self._resolve_key(api_key)
        if not key:
            text = self._mock_response(system, user)
            chunk_size = 40
            for i in range(0, len(text), chunk_size):
                yield text[i : i + chunk_size]
            return

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    "max_tokens": 4096,
                    "temperature": 0.7,
                    "stream": True,
                },
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    payload = line[6:]
                    if payload.strip() == "[DONE]":
                        break
                    try:
                        chunk = json.loads(payload)
                        delta = chunk["choices"][0].get("delta", {})
                        content = delta.get("content")
                        if content:
                            yield content
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue

    def _mock_response(self, system: str, user: str) -> str:
        """Demo mode when no API key is configured."""
        if "orchestrator" in system.lower() or "synthesize" in system.lower():
            return json.dumps(
                {
                    "executive_summary": "Krew AI analysis indicates strong market opportunity with manageable risks. "
                    "The proposed venture aligns with current industry trends and has clear differentiation potential.",
                    "market_analysis": "The target market is experiencing 12-18% annual growth driven by digital "
                    "transformation. Key segments include SMBs seeking AI-powered consulting and enterprise teams "
                    "needing rapid strategy validation.",
                    "competitor_analysis": "Primary competitors include traditional consultancies (McKinsey, BCG) "
                    "and AI-native platforms (Jasper, Copy.ai). Krew AI differentiates through multi-agent orchestration "
                    "and end-to-end strategy generation.",
                    "business_strategy": "Focus on product-led growth targeting founders and product teams. "
                    "Freemium tier for single projects, Pro for unlimited agents, Enterprise for custom integrations.",
                    "marketing_plan": "Content marketing, founder community partnerships, Product Hunt launch, "
                    "LinkedIn thought leadership, and targeted Google Ads on strategy keywords.",
                    "financial_projection": "Year 1: $500K ARR with 2,000 users. Year 2: $2.5M ARR. "
                    "Year 3: $8M ARR. Gross margin ~75%. Break-even at month 14.",
                    "technical_architecture": "React frontend, FastAPI backend, PostgreSQL, Fireworks AI for LLM, "
                    "SSE for real-time updates, Docker deployment on AWS/GCP.",
                    "roadmap": "Q1: MVP launch. Q2: Team collaboration. Q3: Custom agents. Q4: Enterprise SSO.",
                    "risks": "AI API costs, market saturation, data privacy concerns, model hallucination in financial projections.",
                    "recommendations": "Validate pricing with 20 beta users. Build agent quality benchmarks. "
                    "Implement human-in-the-loop review for financial outputs.",
                    "next_steps": "1. Complete beta signup page. 2. Run 5 pilot projects. 3. Iterate on agent prompts. "
                    "4. Launch on Product Hunt.",
                    "scores": {"business": 78, "risk": 35, "opportunity": 82},
                    "chart_data": {
                        "revenue": [
                            {"year": "Y1", "value": 500},
                            {"year": "Y2", "value": 2500},
                            {"year": "Y3", "value": 8000},
                        ],
                        "market_share": [
                            {"name": "Incumbents", "value": 45},
                            {"name": "AI Tools", "value": 30},
                            {"name": "Your Target", "value": 15},
                            {"name": "Other", "value": 10},
                        ],
                    },
                    "timeline": [
                        {"phase": "Discovery", "start": "Month 1", "end": "Month 2", "status": "completed"},
                        {"phase": "MVP Build", "start": "Month 2", "end": "Month 4", "status": "in_progress"},
                        {"phase": "Beta Launch", "start": "Month 4", "end": "Month 6", "status": "pending"},
                        {"phase": "Scale", "start": "Month 6", "end": "Month 12", "status": "pending"},
                    ],
                },
                indent=2,
            )

        agent_hint = "specialist analyst"
        for name in ["Research", "Finance", "Marketing", "Software Architecture", "Business Strategy", "Quality Assurance"]:
            if name.lower() in system.lower():
                agent_hint = name
                break

        return (
            f"## {agent_hint} Analysis\n\n"
            f"Based on the business context provided, here is my detailed assessment:\n\n"
            f"### Key Findings\n"
            f"- Strong alignment between stated goals and market opportunity\n"
            f"- Budget of the specified range supports a phased rollout approach\n"
            f"- Timeline is aggressive but achievable with focused execution\n\n"
            f"### Detailed Analysis\n"
            f"The {agent_hint.lower()} perspective reveals several critical insights. "
            f"Market dynamics favor early movers who can demonstrate measurable ROI. "
            f"Competitive positioning should emphasize speed-to-insight and multi-disciplinary coverage "
            f"that traditional single-domain consultants cannot match.\n\n"
            f"### Recommendations\n"
            f"1. Prioritize quick wins in the first 90 days\n"
            f"2. Establish KPIs aligned with stated business goals\n"
            f"3. Build feedback loops for continuous strategy refinement\n\n"
            f"### Risk Considerations\n"
            f"Monitor execution capacity, market timing, and resource allocation closely."
        )


def get_llm_client(provider: str = "fireworks") -> LLMClient:
    if provider == "fireworks":
        return FireworksClient()
    return FireworksClient()
