"""Reviewable Research Plan contracts. The current plan builder is deterministic, not an AI call."""

from __future__ import annotations

from dataclasses import asdict, dataclass, replace
from hashlib import sha256

from .ai_provider import AIProvider, normalize_plan_annotation


@dataclass(frozen=True)
class ResearchPlan:
    plan_id: str
    objective: str
    asset: str
    data_requirements: tuple[str, ...]
    candidate_method: str
    validation_steps: tuple[str, ...]
    failure_conditions: tuple[str, ...]
    provider_status: str
    notice: str
    ai_annotation: tuple[str, ...]

    def serialize(self) -> dict[str, object]:
        return asdict(self)


def validate_question(question: object) -> str:
    if not isinstance(question, str):
        raise ValueError("Research question must be plain text.")
    normalized = " ".join(question.split())
    if not 5 <= len(normalized) <= 1_000:
        raise ValueError("Research question must contain between 5 and 1,000 non-whitespace characters.")
    return normalized


def build_manual_research_plan(question: object, asset: str) -> ResearchPlan:
    objective = validate_question(question)
    provider = AIProvider().status()
    plan_id = sha256(f"manual-plan-v1:{asset}:{objective}".encode("utf-8")).hexdigest()[:16]
    return ResearchPlan(
        plan_id=f"manual-{plan_id}",
        objective=objective,
        asset=asset,
        data_requirements=(
            "Allowlisted daily historical OHLCV dataset with provider, coverage, retrieval time, version and information cutoff.",
            "Sufficient observations for indicator warm-up, a censored temporal split and next-reference execution.",
        ),
        candidate_method="A versioned SMA crossover DSL candidate with deterministic next-reference-open execution.",
        validation_steps=(
            "Review the question and constrained candidate before execution.",
            "Run data-quality checks before simulation.",
            "Separate in-sample and out-of-sample periods with a censor gap.",
            "Inspect parameter and cost sensitivity, then deterministic trade-order resampling where closed simulated trades exist.",
        ),
        failure_conditions=(
            "Block if dataset provenance or quality checks fail.",
            "Block unsupported assets, frequencies, indicators, event timestamps or strategy instructions.",
            "Treat insufficient closed trades or unstable sensitivity as a limitation, not a positive conclusion.",
        ),
        provider_status=provider.status,
        notice="This is a deterministic review template, not an AI-generated conclusion. No AI provider is active.",
        ai_annotation=(),
    )


def build_manus_review_plan(question: object, asset: str, annotation: dict[str, object]) -> ResearchPlan:
    """Attach a validated AI framing without allowing it to alter execution or plan identity."""
    manual = build_manual_research_plan(question, asset)
    annotation = normalize_plan_annotation(annotation)
    validation = annotation["validation_emphasis"]
    limitations = annotation["limitation_emphasis"]
    if not isinstance(validation, tuple) or not isinstance(limitations, tuple):
        raise ValueError("AI annotation did not pass the approved structured-output boundary.")
    notes = (
        f"AI research framing: {annotation['research_intent']}",
        f"Neutral testable hypothesis: {annotation['testable_hypothesis']}",
        *(f"AI validation emphasis: {item}" for item in validation),
        *(f"AI limitation emphasis: {item}" for item in limitations),
        "Human review remains mandatory; the AI annotation cannot change the dataset, DSL, execution or run controls.",
    )
    return replace(
        manual,
        provider_status="ACTIVE_STRUCTURED_REVIEW",
        notice="A Manus API structured annotation is available for review. It is not a conclusion, forecast, trade recommendation or executable instruction.",
        ai_annotation=notes,
    )
