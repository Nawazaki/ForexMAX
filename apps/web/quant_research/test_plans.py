"""Research plan safety tests."""

from __future__ import annotations

import unittest

from .plans import build_manual_research_plan, validate_question


class ResearchPlanTest(unittest.TestCase):
    def test_plan_is_explicitly_not_ai_generated(self) -> None:
        plan = build_manual_research_plan("Test a daily S&P 500 SMA research method.", "SP500")
        self.assertEqual(plan.provider_status, "UNAVAILABLE")
        self.assertIn("not an AI-generated", plan.notice)

    def test_question_is_plain_bounded_text(self) -> None:
        with self.assertRaises(ValueError):
            validate_question("   ")
        self.assertEqual(validate_question("  Does this daily method remain stable?  "), "Does this daily method remain stable?")


if __name__ == "__main__":
    unittest.main()
