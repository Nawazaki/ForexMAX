export type PrimarySource = {
  id: string;
  name: string;
  organization: string;
  url: string;
  coverage: string;
  access: string;
  jurisdiction: string;
};

export const primarySources: PrimarySource[] = [
  {
    id: "federal-reserve-fred",
    name: "Federal Reserve Data & FRED",
    organization: "Board of Governors of the Federal Reserve System / Federal Reserve Bank of St. Louis",
    url: "https://www.federalreserve.gov/data/data-download-fred-information.htm",
    coverage: "Federal Reserve releases and historical macroeconomic series.",
    access: "Official data pages; FRED supports programmatic retrieval for account holders.",
    jurisdiction: "United States",
  },
  {
    id: "bls-cpi",
    name: "Bureau of Labor Statistics — CPI",
    organization: "U.S. Bureau of Labor Statistics",
    url: "https://www.bls.gov/cpi/",
    coverage: "Consumer prices, labor-market releases, and statistical release calendar links.",
    access: "Official releases, data tables, charts, and subscriptions.",
    jurisdiction: "United States",
  },
  {
    id: "bea",
    name: "Bureau of Economic Analysis",
    organization: "U.S. Bureau of Economic Analysis",
    url: "https://www.bea.gov/",
    coverage: "GDP, income, trade, and national economic accounts releases.",
    access: "Official releases and data tools.",
    jurisdiction: "United States",
  },
];
