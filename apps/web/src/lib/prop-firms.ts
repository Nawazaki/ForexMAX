export type PropFirmRecord = {
  name: string;
  slug: string;
  country?: string;
  challengeFee: string;
  profitSplit: string;
  dailyDrawdown: string;
  maximumDrawdown: string;
  payout: string;
  newsTrading: string;
  weekendHolding: string;
  expertAdvisor: string;
  consistency: string;
  scaling: string;
  platform: string;
  evaluationType: string;
  assessment: string;
  lastReviewed: string;
  source: string;
};

export const legacyPropFirms: PropFirmRecord[] = [
  { name: "Earn2Trade", slug: "earn2trade", challengeFee: "From $150/month", profitSplit: "80%", dailyDrawdown: "See rules", maximumDrawdown: "End-of-Day", payout: "See provider terms", newsTrading: "Verify current terms", weekendHolding: "Verify current terms", expertAdvisor: "Verify current terms", consistency: "Evaluation rules apply", scaling: "Program-dependent", platform: "NinjaTrader; Tradovate", evaluationType: "Evaluation", assessment: "Pending evidence", lastReviewed: "2026-06", source: "/audits/earn2trade-gauntlet-mini" },
  { name: "Funded Trading Plus", slug: "funded-trading-plus", challengeFee: "From $199", profitSplit: "80%", dailyDrawdown: "Verify current terms", maximumDrawdown: "Scaling / program-dependent", payout: "Verify current terms", newsTrading: "Verify current terms", weekendHolding: "Verify current terms", expertAdvisor: "Verify current terms", consistency: "Verify current terms", scaling: "Available by plan", platform: "MT4/5; cTrader", evaluationType: "Challenge", assessment: "Pending evidence", lastReviewed: "2026-06", source: "/prop-firm-comparison" },
  { name: "Topstep", slug: "topstep", challengeFee: "From $165/month", profitSplit: "90%", dailyDrawdown: "Verify current terms", maximumDrawdown: "Trailing", payout: "Verify current terms", newsTrading: "Verify current terms", weekendHolding: "Verify current terms", expertAdvisor: "Verify current terms", consistency: "Verify current terms", scaling: "Program-dependent", platform: "NinjaTrader; Tradovate", evaluationType: "Evaluation / funding", assessment: "Pending evidence", lastReviewed: "2026-06", source: "/prop-firm-comparison" },
  { name: "FTMO", slug: "ftmo", challengeFee: "From €155", profitSplit: "90%", dailyDrawdown: "Verify current terms", maximumDrawdown: "Relative / plan-dependent", payout: "Verify current terms", newsTrading: "Verify current terms", weekendHolding: "Verify current terms", expertAdvisor: "Verify current terms", consistency: "Verify current terms", scaling: "Available by plan", platform: "MT4/5; cTrader", evaluationType: "Challenge", assessment: "Pending evidence", lastReviewed: "2026-06", source: "/prop-firm-comparison" },
  { name: "The Funded Trader", slug: "the-funded-trader", challengeFee: "From $129", profitSplit: "90%", dailyDrawdown: "Verify current terms", maximumDrawdown: "Absolute / plan-dependent", payout: "Verify current terms", newsTrading: "Verify current terms", weekendHolding: "Verify current terms", expertAdvisor: "Verify current terms", consistency: "Verify current terms", scaling: "Available by plan", platform: "MT4/5; DXtrade", evaluationType: "Challenge", assessment: "Pending evidence", lastReviewed: "2026-06", source: "/prop-firm-comparison" },
  { name: "MyForexFunds", slug: "myforexfunds", challengeFee: "From $49", profitSplit: "80%", dailyDrawdown: "Verify current terms", maximumDrawdown: "Scaling / plan-dependent", payout: "Verify current terms", newsTrading: "Verify current terms", weekendHolding: "Verify current terms", expertAdvisor: "Verify current terms", consistency: "Verify current terms", scaling: "Available by plan", platform: "MT4/5; cTrader", evaluationType: "Evaluation", assessment: "Requires current verification", lastReviewed: "2026-06", source: "/prop-firm-comparison" },
];
