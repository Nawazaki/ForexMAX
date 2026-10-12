export type OfficialSource = { url: string; label: string };

export type PropFirmRecord = {
  name: string;
  slug: string;
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
  sources: OfficialSource[];
};

const notVerified = "Not verified from current official terms";
const reviewed = "Official sources checked 2026-10-12";

export const legacyPropFirms: PropFirmRecord[] = [
  {
    name: "Earn2Trade", slug: "earn2trade", challengeFee: "Current entry price not verified; check selected tier at checkout",
    profitSplit: "Gauntlet Mini (from 2026-07-06): 50/50 below; 80/20 at/above single-withdrawal threshold: $2,250 (50K), $3,000 (100K), $4,000 (150K), $5,000 (200K).",
    dailyDrawdown: "Account-specific; see official rules", maximumDrawdown: "EOD drawdown; value depends on account tier",
    payout: "Weekly Wednesday; request by preceding Friday 2 p.m. CT; $100 minimum net. Methods/fees vary by region/provider.",
    newsTrading: "Check selected account terms", weekendHolding: "Check selected account terms", expertAdvisor: notVerified,
    consistency: "Evaluation only: no day may be 30% or more of total PnL (purchases from 2026-07-06 onward).",
    scaling: "Tier/account specific; check official rules",
    platform: "NinjaTrader, Tradovate, Rithmic and others; licence/compatibility caveats apply",
    evaluationType: "Gauntlet Mini futures evaluation; partner may offer LiveSim® or Live after passing",
    assessment: "Evaluation and withdrawal rules verified; price and other account terms vary",
    lastReviewed: reviewed,
    sources: [
      { url: "https://www.earn2trade.com/blog/earn2trade-evaluation-rules-profit-split-update/", label: "July 2026 rule and split update" },
      { url: "https://help.earn2trade.com/en/articles/5941958-what-are-the-evaluation-rules", label: "Evaluation rules" },
      { url: "https://help.earn2trade.com/en/articles/3849975-what-is-the-maintain-consistency-rule", label: "Consistency rule" },
      { url: "https://help.earn2trade.com/en/articles/5452472-what-is-the-withdrawal-policy", label: "Withdrawal policy" },
      { url: "https://help.earn2trade.com/en/articles/2090521-what-platforms-can-i-use-for-the-gauntlet-mini-trader-career-path", label: "Supported platforms" },
      { url: "https://help.earn2trade.com/en/articles/6877364-what-happens-when-i-complete-my-evaluation", label: "What happens after passing" },
    ],
  },
  {
    name: "Funded Trading Plus", slug: "funded-trading-plus", challengeFee: "Current numeric fees not verified in official material reviewed; see selected checkout",
    profitSplit: "80% published for listed plans; reward conditions are program-specific",
    dailyDrawdown: "Plan-specific: 4% on Express/Classic and the Pass Now Pay Later challenge; 6% on Instant; Pass Now Pay Later funded stage is 3%.",
    maximumDrawdown: "Plan-specific: Instant 6% relative; Express 6% trailing; Classic 8% fixed; Pass Now Pay Later 6% fixed.",
    payout: "Varies by plan: Instant/Express every 7 days; Classic every 10 calendar days; Pass Now Pay Later every 10 trading days, with a minimum withdrawal of 3% of starting balance and 25% consistency rule.",
    newsTrading: "Plan-specific; check the selected program", weekendHolding: "Instant: no; other plans differ",
    expertAdvisor: notVerified, consistency: "Classic: 35% in evaluation/50% funded. Pass Now Pay Later: 25%. Rules are plan-specific, not universal.",
    scaling: "Plan-specific; not verified across all programs",
    platform: "MT5 and Match-Trader listed; availability varies by plan/region",
    evaluationType: "Separate programs: Instant, 1-Step Express, 2-Step Classic, Pass Now Pay Later; do not combine their rules",
    assessment: "Official program rules partially verified; fees and some account-level conditions unresolved",
    lastReviewed: reviewed,
    sources: [
      { url: "https://help.fundedtradingplus.com/instant-program-information/", label: "Instant rules" },
      { url: "https://help.fundedtradingplus.com/1-step-express-program-information/", label: "1-Step Express rules" },
      { url: "https://help.fundedtradingplus.com/2-step-classic-program-information/", label: "2-Step Classic rules" },
      { url: "https://help.fundedtradingplus.com/pass-now-pay-later-program-information/", label: "Pass Now Pay Later rules" },
      { url: "https://help.fundedtradingplus.com/activation-accounts-payouts-and-withdrawals/", label: "Activations and withdrawals" },
      { url: "https://help.fundedtradingplus.com/payout-methods-offered/", label: "Payout methods" },
      { url: "https://help.fundedtradingplus.com/which-platforms-do-you-offer/", label: "Platforms" },
    ],
  },
  {
    name: "Topstep", slug: "topstep", challengeFee: "Trading Combine monthly: 50K $49/$95; 100K $99/$149; 150K $199/$229 (Standard / No Activation Fee). Add-ons, taxes and reset fees separate.",
    profitSplit: "90/10 published; exception: eligible legacy-dashboard members keep their first $10,000 under the stated rules",
    dailyDrawdown: "Combine / funded stage and selected path matter; check current parameter sheet",
    maximumDrawdown: "Maximum Loss Limit (MLL); amount and operation are account/program-specific",
    payout: "XFA Standard: generally five qualifying $150 net-profit days; Consistency: at least three days with its own consistency cap. Published XFA withdrawal caps (subject also to 50% of balance): Standard $2K/$3K/$5K and Consistency $3K/$4K/$6K for 50K/100K/150K. LFA rules differ; fees/methods vary by country.",
    newsTrading: "Product/session rules apply; verify current policy", weekendHolding: "Positions must follow official product/session rules",
    expertAdvisor: "Prohibited conduct and API/VPS restrictions apply; check current policy",
    consistency: "Combine: best day must be below 55% of target; funded XFA Consistency path has a separate 40% condition",
    scaling: "Program/phase-specific; see official program overview", platform: "TopstepX (officially listed platform)",
    evaluationType: "Futures Trading Combine → Express Funded Account (XFA) → possible Live Funded Account (LFA)",
    assessment: "Pricing and main rules verified; promotions and account eligibility remain conditional",
    lastReviewed: reviewed,
    sources: [
      { url: "https://help.topstep.com/en/articles/14289835-topstep-pricing-and-payment-questions", label: "Current pricing and billing" },
      { url: "https://help.topstep.com/en/articles/8284197-trading-combine-parameters", label: "Trading Combine rules" },
      { url: "https://help.topstep.com/en/articles/8284215-express-funded-account-parameters", label: "XFA rules" },
      { url: "https://help.topstep.com/en/articles/8284233-topstep-payout-policy", label: "Payout policy" },
      { url: "https://help.topstep.com/en/articles/8284116-am-i-eligible-to-trade-with-topstep", label: "Eligibility" },
      { url: "https://help.topstep.com/en/articles/10296582-prohibited-conduct", label: "Prohibited conduct" },
    ],
  },
  {
    name: "FTMO", slug: "ftmo", challengeFee: "One-off fee; amount depends on selected plan/account and location. Verify current checkout; no universal amount shown here.",
    profitSplit: "2-Step: 80% initially, potentially 90% under stated scaling conditions. 1-Step: 90%. Plan-specific.",
    dailyDrawdown: "2-Step: 5% daily maximum loss; 1-Step differs",
    maximumDrawdown: "2-Step: 10% maximum loss; 1-Step differs",
    payout: "Eligible reward request on day 14 or later, subject to closing positions/orders and review; method, timing and minimums vary",
    newsTrading: "Rules depend on account/plan; see official Trading Objectives", weekendHolding: "Standard restrictions apply to funded account; Swing account differs",
    expertAdvisor: notVerified, consistency: "Plan-specific; consult current objectives",
    scaling: "Possible under published scaling-plan criteria; not guaranteed",
    platform: "MT4, MT5, cTrader, TradingView (selected during setup)",
    evaluationType: "FTMO Challenge 1-Step or 2-Step → simulated FTMO Account (listed loss limits here describe 2-Step only)",
    assessment: "Core objectives and reward conditions verified; exact fee and 1-Step details require plan selection",
    lastReviewed: reviewed,
    sources: [
      { url: "https://ftmo.com/en/how-it-works/", label: "How it works and 2-Step objectives" },
      { url: "https://ftmo.com/en/trading-objectives/", label: "Trading objectives" },
      { url: "https://ftmo.com/en/faq/what-fees-do-you-charge-and-are-they-recurrent/", label: "Fees and recurrence" },
      { url: "https://ftmo.com/en/faq/how-do-i-withdraw-my-profits/", label: "Reward withdrawals" },
      { url: "https://ftmo.com/en/faq/which-platforms-can-i-use-for-trading/", label: "Platforms" },
      { url: "https://ftmo.com/en/faq/do-i-have-to-close-my-positions-overnight-or-before-the-weekend/", label: "Overnight/weekend rules" },
    ],
  },
  {
    name: "The Funded Trader", slug: "the-funded-trader", challengeFee: notVerified,
    profitSplit: notVerified, dailyDrawdown: notVerified, maximumDrawdown: notVerified, payout: notVerified,
    newsTrading: notVerified, weekendHolding: notVerified, expertAdvisor: notVerified, consistency: notVerified,
    scaling: notVerified, platform: notVerified,
    evaluationType: "No plan could be verified while the official site showed a temporary deployment pause",
    assessment: "Current operation, payments and plan terms could not be verified",
    lastReviewed: reviewed,
    sources: [{ url: "https://thefundedtraderprogram.com/", label: "Official site (temporarily paused when checked)" }],
  },
];

export const excludedComparisonProviders = [
  {
    name: "MyForexFunds",
    reason: "Not currently offering programs or accounts according to its official FAQ; it announces a planned November 23, 2026 relaunch. Current fees, evaluation rules, split, payouts and platforms are not yet published/verified, so historic terms are excluded.",
    lastReviewed: reviewed,
    sources: [
      { url: "https://myforexfunds.com/", label: "Official homepage: announced relaunch" },
      { url: "https://myforexfunds.com/faq/", label: "Official FAQ (redirects to homepage when checked)" },
      { url: "https://myforexfunds.com/myforexfunds-returns/", label: "Announced relaunch (planned date only)" },
      { url: "https://myforexfunds.com/terms-of-use/", label: "Current website terms and operator identity" },
    ],
  },
];
