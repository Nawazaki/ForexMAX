"""Research plan safety tests."""

from __future__ import annotations

import unittest

from .plans import build_manual_research_plan, build_manus_review_plan, validate_question


class ResearchPlanTest(unittest.TestCase):
    def test_plan_is_explicitly_not_ai_generated(self) -> None:
        plan = build_manual_research_plan("Test a daily S&P 500 SMA research method.", "SP500")
        self.assertEqual(plan.provider_status, "UNAVAILABLE")
        self.assertIn("not an AI-generated", plan.notice)

    def test_question_is_plain_bounded_text(self) -> None:
        with self.assertRaises(ValueError):
            validate_question("   ")
        self.assertEqual(validate_question("  Does this daily method remain stable?  "), "Does this daily method remain stable?")

    def test_manus_annotation_cannot_change_the_reviewed_plan_identity(self) -> None:
        question = "Test a daily S&P 500 SMA research method."
        plan = build_manus_review_plan(question, "SP500", {
            "research_intent": "Evaluate a bounded historical daily method.",
            "testable_hypothesis": "The method can be assessed through historical diagnostics.",
            "validation_emphasis": ["Separate OOS data."],
            "limitation_emphasis": ["Historical results are not forecasts."],
            "requires_human_review": True,
        })
        self.assertEqual(plan.plan_id, build_manual_research_plan(question, "SP500").plan_id)
        self.assertEqual(plan.provider_status, "ACTIVE_STRUCTURED_REVIEW")
        self.assertTrue(plan.ai_annotation)


if __name__ == "__main__":
    unittest.main()
