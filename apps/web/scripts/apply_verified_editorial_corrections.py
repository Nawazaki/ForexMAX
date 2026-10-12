#!/usr/bin/env python3
"""Apply evidence-based editorial corrections to ForexMax's legacy CMS seed."""
from __future__ import annotations
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src/content/legacy-content.json"
records = json.loads(DATA.read_text())
by_slug = {r["slug"]: r for r in records}


def update(slug: str, title: str, description: str, html: str) -> None:
    record = by_slug[slug]
    record["title"] = title
    record["description"] = description
    record["canonical"] = "https://www.forexmax.com" + record["route"]
    record["contentHtml"] = html.strip()

reviewed = ''

update(
    "post-cftc-prop-firm-era",
    "CFTC v. MyForexFunds: What the Court Did—and Did Not Decide | ForexMax",
    "A document-based review of the CFTC's 2023 allegations, interim rulings, and 2025 dismissal in the Traders Global Group (MyForexFunds) case.",
    f'''<article class="content-container py-12"><p class="eyebrow">REGULATION · CASE REVIEW</p><h2>CFTC v. Traders Global Group: a case-specific procedural history</h2>{reviewed}
<p>In August 2023, the Commodity Futures Trading Commission (CFTC) filed a civil complaint against Traders Global Group Inc., which did business as MyForexFunds, and related defendants. The complaint alleged fraud and violations of the Commodity Exchange Act, including claims about the firm's programs, customer fees, trading activity, and representations. Those statements were allegations by the CFTC, not findings of liability. <a href="https://www.cftc.gov/media/9196/enftradersglobalgroupcomplaint082923/download" rel="noopener noreferrer">Read the CFTC complaint</a>.</p>
<h3>What the November 2023 order decided</h3>
<p>After an evidentiary hearing, the District of New Jersey granted some of the CFTC's request for preliminary relief and denied other parts. Under the preliminary-injunction standard, the court found the CFTC had made a prima facie showing on specified claims. That was an interim ruling on the record then before the court—not a final trial judgment resolving every allegation or a generally binding rule for every simulated-trading business. <a href="https://law.justia.com/cases/federal/district-courts/new-jersey/njdce/3:2023cv11808/523880/134/" rel="noopener noreferrer">Read the November 14, 2023 opinion</a>.</p>
<h3>What happened in 2025</h3>
<p>On May 13, 2025, the court-appointed Special Master recommended granting the defendants' sanctions motion, dismissing the complaint with prejudice, and awarding reasonable fees and costs connected with that motion. The recommendation described the CFTC's handling of evidence and its candor to the court. A recommendation is not itself the district court's order. On May 13, 2025, the district court adopted the report's recommendation, dismissed the complaint with prejudice, denied defendants' separate dismissal motion as moot, and directed defendants to submit an affidavit of fees and costs attributable to the sanctions motion. <a href="https://www.cftc.gov/media/12106/ogc_KazmiReportRecommendationSactions051325/download" rel="noopener noreferrer">Read the Special Master's report and recommendation</a> and <a href="https://complianceconcourse.willkie.com/app/uploads/2025/06/20250513-CFTC-Traders-Global-Order.pdf" rel="noopener noreferrer">the May 13, 2025 court order reproduced as a PDF</a>.</p>
<h3>Legal significance and limits</h3>
<p>The dismissal was a case-specific procedural outcome following sanctions proceedings. It does not convert the complaint's allegations into proven facts, establish that the defendants' business model complied with every applicable law, or decide that all simulated prop-firm programs are lawful or unlawful. The preliminary-injunction findings likewise should not be described as a final merits judgment. The case does not establish a general appellate precedent classifying every evaluation, simulated account, or payout arrangement.</p>
<p>Different businesses may use materially different arrangements: some evaluate simulated trades and pay contractual rewards; others may route or execute customer transactions, handle client assets, or provide services that fall under different legal rules. The legal analysis depends on the actual products, counterparties, conduct, and jurisdiction. This article does not determine the status of any other provider, and readers should consult primary regulators' records and qualified counsel for a specific legal question.</p>
<h3>How to assess a provider</h3>
<p>Check the provider's current legal entity, program terms, customer agreement, payment and refund conditions, and any relevant regulator register or court record. A provider's statement that it is "regulated" or a third party's use of the word "funded" is not, on its own, proof of authorization, segregation of funds, or a live brokerage relationship. Treat unresolved facts as unresolved. For a dated, source-linked review of currently listed program terms, see the <a href="/prop-firm-comparison">prop-firm comparison</a>.</p>
<p><strong>Sources:</strong> <a href="https://www.cftc.gov/media/9196/enftradersglobalgroupcomplaint082923/download" rel="noopener noreferrer">CFTC complaint (August 28, 2023)</a>; <a href="https://law.justia.com/cases/federal/district-courts/new-jersey/njdce/3:2023cv11808/523880/134/" rel="noopener noreferrer">District Court preliminary-injunction opinion (November 14, 2023)</a>; <a href="https://www.cftc.gov/media/12106/ogc_KazmiReportRecommendationSactions051325/download" rel="noopener noreferrer">Special Master report and recommendation (May 13, 2025)</a>; <a href="https://complianceconcourse.willkie.com/app/uploads/2025/06/20250513-CFTC-Traders-Global-Order.pdf" rel="noopener noreferrer">district court order (PDF)</a>.</p></article>'''
)

update(
    "earn2trade-gauntlet-mini",
    "Earn2Trade Gauntlet Mini: Rules Desk Review (Updated October 2026) | ForexMax",
    "A limited desk review of published Gauntlet Mini rules and withdrawal terms. No execution, slippage, payout, or regulatory-compliance test was performed.",
    f'''<article class="content-container py-12"><p class="eyebrow">PROGRAM REVIEW · FUTURES</p><h2>Earn2Trade Gauntlet Mini: published rules desk review</h2>{reviewed}
<p><strong>Scope:</strong> This is a limited review of public Earn2Trade documentation. ForexMax did not open or trade an account, test order routing, measure latency or slippage, verify individual payouts, or conduct a regulatory audit. Earlier statements on this page claiming a comprehensive technical audit, zero slippage, institutional execution, verified weekly payments, or verified regulatory compliance are withdrawn because supporting evidence and a reproducible method were not available.</p>
<h3>Evaluation-day and consistency rules</h3>
<p>Earn2Trade states that, for its Gauntlet Mini and Trader Career Path evaluations, there is no minimum number of trading days to pass. The evaluation still requires meeting its profit target and complying with the loss, drawdown, trading-time, and position-size rules. Its Maintain Consistency rule says no single trading day may account for 30% or more of total evaluation PnL; if a day exceeds that share, the trader must continue until the share falls below 30%. The rule applies during evaluation, not to LiveSim or live accounts. These rules can change, and purchasers should check the terms attached to their account. <a href="https://www.earn2trade.com/blog/earn2trade-evaluation-rules-profit-split-update/" rel="noopener noreferrer">Earn2Trade's July 6, 2026 update</a>; <a href="https://help.earn2trade.com/en/articles/3849975-what-is-the-maintain-consistency-rule" rel="noopener noreferrer">consistency rule</a>; <a href="https://help.earn2trade.com/en/articles/5941958-what-are-the-evaluation-rules" rel="noopener noreferrer">evaluation rules</a>.</p>
<h3>Withdrawal terms published for Gauntlet Mini</h3>
<p>The published withdrawal policy describes profit sharing by the amount of a single withdrawal, not simply by accumulated account profit. For Gauntlet Mini starting funded balances of $50,000, $100,000, $150,000, and $200,000, the stated threshold for the 80% trader share is respectively $2,250, $3,000, $4,000, and $5,000; withdrawals below the relevant threshold use a 50% split. The page also lists a $5,000 LiveSim maximum withdrawal for each of those Gauntlet Mini tiers. Confirm the applicable agreement and purchase date, as terms may depend on program and when the evaluation was purchased. <a href="https://help.earn2trade.com/en/articles/5452472-what-is-the-withdrawal-policy" rel="noopener noreferrer">Official withdrawal policy</a>.</p>
<p>Earn2Trade's policy says withdrawals are processed weekly on Wednesdays, with requests due by 2:00 p.m. Central Time on the preceding Friday, and a $100 minimum net withdrawal. Available payment providers, fees, geographic eligibility, identity checks, and processing details may vary. The policy says the provider may select the payment method and that some methods are region-limited. Check the current official page before relying on a method or schedule.</p>
<h3>Drawdown and other program conditions</h3>
<p>Daily loss, maximum position size, account-balance/drawdown limits, trading hours, and account-size conditions apply. Their exact values depend on the selected account type and current rules. This page does not reproduce every account-level limit; use Earn2Trade's official rules and your customer agreement. A simulated evaluation result is not a guarantee of access to a live account, payout, or future trading profit.</p>
<p>See the <a href="/prop-firm-comparison">current prop-firm comparison</a> for dated program-specific disclosures; it is not an endorsement.</p><h3>What was not tested</h3>
<p>No evidence was collected to support claims of zero slippage, "Tier-1" or institutional execution, specific server latency, Rithmic/NinjaTrader execution quality, flawless payouts, or regulatory compliance. Those claims are therefore not made here. Whether a platform offers a particular connection or instrument does not establish execution quality or regulatory status.</p>
<p><strong>Sources:</strong> <a href="https://help.earn2trade.com/en/articles/5941958-what-are-the-evaluation-rules" rel="noopener noreferrer">Evaluation Rules</a>; <a href="https://help.earn2trade.com/en/articles/3849975-what-is-the-maintain-consistency-rule" rel="noopener noreferrer">Maintain Consistency</a>; <a href="https://help.earn2trade.com/en/articles/5452472-what-is-the-withdrawal-policy" rel="noopener noreferrer">Withdrawal Policy</a>; <a href="https://www.earn2trade.com/blog/earn2trade-evaluation-rules-profit-split-update/" rel="noopener noreferrer">July 2026 rule update</a>.</p></article>'''
)

update(
    "vwap-sd-bands-institutional-secrets",
    "VWAP and Standard-Deviation Bands: Calculation, Uses, and Limits | ForexMax",
    "A practical explanation of VWAP and configurable deviation bands, including calculation choices, cautious interpretation, and strategy limitations.",
    f'''<article class="content-container py-12"><p class="eyebrow">TRADING EDUCATION · INDICATORS</p><h2>VWAP and standard-deviation bands: what they show—and what they do not</h2>{reviewed}
<p>Volume-weighted average price (VWAP) is the cumulative sum of price multiplied by volume divided by cumulative volume over a chosen anchor period. Many charting tools use the bar's typical price, often (high + low + close) / 3, as the price input. The exact source price, volume feed, session, and reset period affect the plotted line. VWAP is a descriptive, lagging average, not a forecast. <a href="https://www.tradingview.com/support/solutions/43000502018-volume-weighted-average-price-vwap/" rel="noopener noreferrer">TradingView's VWAP calculation notes</a>.</p>
<h3>How deviation bands are formed</h3>
<p>Band formulas and settings can differ across platforms. In TradingView’s built-in VWAP, the band mode can use standard deviation or percentage; in standard-deviation mode the tool calculates the standard deviations of VWAP values since the last anchor, and the band multipliers are configurable. Check the platform’s calculation, selected mode, source and anchor before comparing charts. A multiplier such as 0.5, 1 or 2 is a setting—not a universal institutional threshold. <a href="https://www.tradingview.com/support/solutions/43000502018-volume-weighted-average-price-vwap/" rel="noopener noreferrer">TradingView documents these VWAP inputs</a>.</p>
<h3>Possible analytical uses</h3>
<p>Traders may use VWAP as an intraday reference and examine whether price is above, below, or crossing it. Bands can help describe how far prices have moved from that reference under the chosen calculation. In a directional market, price may stay extended; in a range, it may revisit the average. These are possible chart patterns, not dependable rules. A touch of a band does not by itself show that an algorithm entered, that a reversal is due, or that price must return to VWAP.</p>
<h3>Limitations and risk</h3>
<p>VWAP depends on the data source and period, can lag, and may behave differently across instruments or sessions. Spot foreign exchange volume is fragmented and broker-specific tick volume is not a consolidated record of all global trading. Standard-deviation bands do not make returns normally distributed or guarantee that price remains within a particular band. Avoid treating a band as an automatic entry, stop, or profit target; test any rule on the intended instrument with realistic costs and out-of-sample data.</p>
<h3>Conclusion</h3>
<p>VWAP bands are visualization tools whose meaning follows from their inputs and calculation. Use them to describe price relative to a chosen volume-weighted average, document the settings, and combine them with a risk plan. They do not reveal private institutional orders or guarantee support, resistance, reversals, or profitability. For time-zone and session-calendar context, see <a href="/articles/trading_sessions">Forex trading sessions</a>; use the <a href="/tools">risk calculators</a> only as educational aids.</p>
<p><strong>Sources:</strong> <a href="https://www.tradingview.com/support/solutions/43000502018-volume-weighted-average-price-vwap/" rel="noopener noreferrer">TradingView: Volume Weighted Average Price (VWAP)</a>.</p></article>'''
)

update(
    "us-market-opening-range-strategy",
    "US Market Opening Range: A Defined but Untested Framework | ForexMax",
    "An educational 15-minute opening-range framework for U.S. equities. The stated 70–75% win rate and profitability claims were unsupported and have been removed.",
    f'''<article class="content-container py-12"><p class="eyebrow">TRADING EDUCATION · U.S. EQUITIES</p><h2>US market opening range: a framework, not a performance claim</h2>{reviewed}
<p>The opening range is a price interval defined by a trader over a stated period after a market opens. This example uses the first 15 minutes of the NYSE core session: 9:30–9:45 a.m. Eastern Time. NYSE lists its core trading session as 9:30 a.m.–4:00 p.m. ET, subject to its market calendar. Other instruments and venues have different hours. <a href="https://www.nyse.com/trade/hours-calendars" rel="noopener noreferrer">NYSE trading hours and calendar</a>.</p>
<h3>Define the range before considering a trade</h3>
<p>For the selected instrument, data feed, session, and date, record the highest and lowest traded prices during the chosen 15-minute window. Those prices define the opening range for that session. A later close outside the range can be used as a testable signal definition, but it is not proof that a sustained move will follow.</p>
<h3>Specify rules before evaluating results</h3>
<p>A testable plan needs unambiguous entry and exit rules, position sizing, stop logic, treatment of gaps and news, and whether a second signal is allowed. It must also identify the instrument, contract or share data, sample period, session calendar, transaction fees, bid–ask spread, slippage assumptions, and out-of-sample procedure. Different choices can materially change the results.</p>
<h3>No verified win rate or profitability result</h3>
<p>The previous win-rate and related claims that this setup is high-probability, low-risk, or produces quick/consistent gains were not supported by a reproducible backtest, so they are withdrawn. ForexMax has not established a verified win rate or profitability estimate for this example. A win rate alone does not establish profitability: average win and loss sizes, transaction costs, and risk exposure also matter. Do not treat this framework as a recommendation or evidence that an evaluation account can be passed.</p>
<h3>Risk and limitations</h3>
<p>The opening can be volatile, spreads and execution can vary, and a breakout can fail or reverse. Stops do not guarantee a fill at the requested price. News, halts, early closes, and market-specific rules can affect the setup. This educational page is not a substitute for independent testing or a personal trading plan. For exchange hours and daylight-saving context, see <a href="/articles/trading_sessions">the trading-sessions guide</a>; the <a href="/tools">risk calculators</a> do not establish a strategy's profitability.</p>
<p><strong>Sources:</strong> <a href="https://www.nyse.com/trade/hours-calendars" rel="noopener noreferrer">NYSE: Holidays &amp; Trading Hours</a>.</p></article>'''
)

update(
    "trading_sessions",
    "Forex Trading Sessions: Time Zones, Liquidity, and Broker Conditions | ForexMax",
    "A balanced guide to global trading sessions, daylight-saving shifts, changing market activity, and the limits of broker and profitability claims.",
    f'''<article class="content-container py-12"><p class="eyebrow">TRADING EDUCATION · MARKET HOURS</p><h2>Forex trading sessions: timing is context, not a guarantee</h2>{reviewed}
<p>Foreign exchange is a global over-the-counter market rather than a single exchange with one universal opening bell. Traders commonly describe activity by the business hours of major financial centres and the periods when those hours overlap. The clock times vary with daylight-saving changes, local holidays, instrument, and the schedule of a particular venue or provider. A fixed GMT timetable can therefore misstate the local-market overlap at different times of year.</p>
<h3>What session labels can and cannot tell you</h3>
<p>Trading activity and volatility can change around market openings, economic announcements, and overlapping business hours. They are not constant across currency pairs or days, and higher activity does not mean that a trade has a higher chance of profit. Spot FX has no single consolidated volume tape; activity displayed by an individual broker or platform may represent only its own feed.</p>
<p>For exchange-traded instruments, use the relevant exchange's official schedule and holiday calendar. For example, NYSE publishes its core session in Eastern Time and lists early closes and holidays. That schedule describes NYSE-listed markets, not the opening hours or liquidity of every FX pair or broker. <a href="https://www.nyse.com/trade/hours-calendars" rel="noopener noreferrer">NYSE hours and calendar</a>.</p>
<h3>Spreads, execution, and withdrawals</h3>
<p>Spreads, commissions, execution, slippage, leverage, and withdrawal processing depend on the provider, account type, instrument, jurisdiction, market conditions, and current contract terms. They may change during volatile periods or around news. No session guarantees a 0.0-pip spread, better execution, instant withdrawal, or positive result. Verify the provider's official fee schedule, execution policy, account agreement, withdrawal terms, and the entity serving your location before relying on a claim.</p>
<h3>Affiliate disclosure</h3>
<p>The link below is a referral link. ForexMax may receive compensation if you use it. This commercial relationship does not verify the provider's spreads, execution quality, regulatory status, or withdrawals and does not make the provider suitable for you. Review its current terms directly. <a href="/affiliate-disclosure">Read our affiliate disclosure</a>.</p>
<p><a href="https://one.exnessonelink.com/a/8ja3w1gcvj?source=app&amp;platform=mobile&amp;pid=mobile_share" rel="sponsored noopener noreferrer" target="_blank">Visit Exness's official website (referral link)</a></p>
<h3>Use time windows within a risk plan</h3>
<p>Choose a session only when it matches the instrument and a strategy you have independently tested. Record the time zone, daylight-saving rule, entry and exit conditions, spread and slippage assumptions, and the event calendar. Limit risk before entering and remember that no session or chart pattern guarantees a profitable trade. For the U.S. equity opening range, see the <a href="/articles/us-market-opening-range-strategy">separate opening-range framework</a>; position sizing tools are on the <a href="/tools">trading tools page</a>.</p>
<p><strong>Sources:</strong> <a href="https://www.bis.org/publications/triennial-central-bank-survey-foreign-exchange-and-over-the-counter-otc-derivatives-markets-2025" rel="noopener noreferrer">BIS 2025 Triennial Survey: FX and OTC derivatives</a>; <a href="https://www.nyse.com/trade/hours-calendars" rel="noopener noreferrer">NYSE: Holidays &amp; Trading Hours</a>.</p></article>'''
)

# Canonical links in all static fallback records must match the live extensionless route.
for record in records:
    # This historical page duplicates the corrected trading-sessions article; retain its legacy URL for a 301, but do not serve a stale duplicate.
    if record["slug"] == "forexmax_article":
        record["route"] = "/articles/trading_sessions"
    route = record.get("route")
    if route:
        record["canonical"] = "https://www.forexmax.com" + route
    if record["slug"] in {
        "post-cftc-prop-firm-era",
        "earn2trade-gauntlet-mini",
        "vwap-sd-bands-institutional-secrets",
        "us-market-opening-range-strategy",
        "trading_sessions",
    }:
        record["lastReviewedAt"] = "2026-10-12"
    if record["slug"] in {"post-cftc-prop-firm-era", "vwap-sd-bands-institutional-secrets"}:
        # Both existing source articles carried a visible original publication date.
        record["publishedAt"] = "2026-06-15"
    # The Next.js article/page templates already render the single page H1.
    # Retain imported section headings as H2 so legacy HTML cannot add duplicates.
    html = record.get("contentHtml", "")
    html = re.sub(r"<h1(\b[^>]*)>", r"<h2\1>", html, flags=re.IGNORECASE)
    html = re.sub(r"</h1\s*>", "</h2>", html, flags=re.IGNORECASE)
    record["contentHtml"] = html

DATA.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n")
print(f"Updated {len(records)} records; corrected 5 targeted articles/audit and canonicalized route metadata.")
