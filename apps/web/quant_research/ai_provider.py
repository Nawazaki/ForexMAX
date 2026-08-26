"""AI provider boundary. No model is active until an approved server-side integration is configured."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class AIProviderStatus:
    status: str
    provider: str | None
    model: str | None
    reason: str
    structured_output_only: bool


class AIProviderUnavailable(RuntimeError):
    pass


class AIProvider:
    """Contract placeholder: implementations may return validated plan JSON, never executable code."""

    def status(self) -> AIProviderStatus:
        return AIProviderStatus(
            status="UNAVAILABLE",
            provider=None,
            model=None,
            reason="No approved server-side AI provider, model selection, rate limit or budget policy is configured for this Preview foundation.",
            structured_output_only=True,
        )

    def create_plan(self, _objective: str, _capabilities: dict[str, object]) -> dict[str, object]:
        raise AIProviderUnavailable("AI plan generation is unavailable until an approved provider is configured.")
